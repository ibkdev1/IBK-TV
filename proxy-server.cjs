const express = require('express');
const https   = require('https');
const http    = require('http');
const zlib    = require('zlib');
const path    = require('path');
const fs      = require('fs');
const { URL } = require('url');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────────────────────
// 1. KEEP-ALIVE CONNECTION POOLS
//    Reuse TCP sockets to upstream servers → removes 50-150 ms handshake
//    per segment.  maxSockets=50 so many segments can download in parallel.
// ─────────────────────────────────────────────────────────────────────────────
const httpAgent  = new http.Agent ({
  keepAlive: true, maxSockets: 50, maxFreeSockets: 20,
  timeout: 25000, scheduling: 'lifo',
});
const httpsAgent = new https.Agent({
  keepAlive: true, maxSockets: 50, maxFreeSockets: 20,
  timeout: 25000, scheduling: 'lifo',
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. LRU SEGMENT CACHE
//    TS segments are immutable — once fetched, serve instantly from RAM.
//    200 slots × ~500 KB avg = ~100 MB, stays within Railway free tier limits.
// ─────────────────────────────────────────────────────────────────────────────
const LRU_MAX = 500;
const SEG_TTL = 45_000; // 45 s (segments expire from playlist after ~30 s)

class LRUCache {
  constructor(max) {
    this.max   = max;
    this.map   = new Map(); // url → { data, ct, ts }
  }
  get(url) {
    const item = this.map.get(url);
    if (!item) return null;
    if (Date.now() - item.ts > SEG_TTL) { this.map.delete(url); return null; }
    // Move to end (most-recently-used)
    this.map.delete(url);
    this.map.set(url, item);
    return item;
  }
  set(url, data, ct) {
    if (this.map.has(url)) this.map.delete(url);
    if (this.map.size >= this.max) {
      // Delete least-recently-used (first entry)
      this.map.delete(this.map.keys().next().value);
    }
    this.map.set(url, { data, ct, ts: Date.now() });
  }
  get size() { return this.map.size; }
}
const segCache = new LRUCache(LRU_MAX);

// ─────────────────────────────────────────────────────────────────────────────
// 2b. PLAYLIST CACHE (short TTL — HLS players poll every 2–8 s)
//     Second poll hits cache instantly instead of making a round-trip upstream.
// ─────────────────────────────────────────────────────────────────────────────
const PLAYLIST_TTL = 6_000; // 6 s
const playlistCache = new Map(); // url → { rewritten, body, finalUrl, ts }

function gzipSend(req, res, text) {
  const ae = req.headers['accept-encoding'] || '';
  if (ae.includes('gzip')) {
    zlib.gzip(Buffer.from(text), (err, buf) => {
      if (err) { res.send(text); return; }
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', buf.length);
      res.end(buf);
    });
  } else {
    res.send(text);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. IN-FLIGHT DEDUPLICATION
//    If browser requests segment X while we're already fetching it,
//    queue the second request instead of making a duplicate upstream call.
// ─────────────────────────────────────────────────────────────────────────────
const inFlight = new Map(); // url → Promise<{data:Buffer,ct:string}>

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — low-level HTTP GET with keep-alive agent
// ─────────────────────────────────────────────────────────────────────────────
function rawFetch(targetUrl, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(targetUrl); } catch { return reject(new Error('Invalid URL')); }

    const isHttps = parsed.protocol === 'https:';
    const mod = isHttps ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port:     parsed.port || (isHttps ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      agent:    isHttps ? httpsAgent : httpAgent,
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':          '*/*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Accept-Encoding': 'identity',
        'Connection':      'keep-alive',
        ...extraHeaders,
      },
    };
    const req = mod.get(opts, resolve);
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Follow redirects
function fetch(url, headers = {}, hops = 6) {
  return new Promise((resolve, reject) => {
    const go = (u, left) => {
      rawFetch(u, headers).then(res => {
        if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
          if (!left) return reject(new Error('Too many redirects'));
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, u).href;
          res.resume();
          go(next, left - 1);
        } else {
          resolve({ res, finalUrl: u });
        }
      }).catch(reject);
    };
    go(url, hops);
  });
}

// Buffer a readable stream into a Buffer
function slurp(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', c => chunks.push(c));
    stream.on('end',  () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SEGMENT FETCHER — cache + dedup aware
// ─────────────────────────────────────────────────────────────────────────────
async function fetchSegment(url, extraHeaders = {}) {
  // Cache hit
  const hit = segCache.get(url);
  if (hit) return hit;

  // In-flight dedup
  if (inFlight.has(url)) return inFlight.get(url);

  const promise = (async () => {
    const { res } = await fetch(url, extraHeaders);
    const ct   = res.headers['content-type'] || 'video/mp2t';
    const data  = await slurp(res);
    segCache.set(url, data, ct);
    inFlight.delete(url);
    return { data, ct };
  })();

  promise.catch(() => inFlight.delete(url));
  inFlight.set(url, promise);
  return promise;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. M3U8 REWRITER
// ─────────────────────────────────────────────────────────────────────────────
function rewriteM3U8(content, baseUrl) {
  let out = content.replace(/^(?!#)(\S+)$/gm, match => {
    if (!match.trim()) return match;
    try { return `/stream?url=${encodeURIComponent(new URL(match, baseUrl).href)}`; }
    catch { return match; }
  });
  out = out.replace(/URI="([^"]+)"/g, (_, uri) => {
    try { return `URI="/stream?url=${encodeURIComponent(new URL(uri, baseUrl).href)}"`; }
    catch { return _; }
  });
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. BACKGROUND PREFETCHER
//    After serving a playlist, silently pre-download the next 8 segments so
//    they are already in cache when the player asks for them.
//    For master playlists, also proactively fetch the best child playlist
//    and its segments — removes one full round-trip delay on slow sources.
// ─────────────────────────────────────────────────────────────────────────────
function prefetch(m3u8Body, baseUrl) {
  const segUrls = [];
  for (const line of m3u8Body.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    try {
      const abs = new URL(t, baseUrl).href;
      if (/\.(ts|aac|mp4|m4s|fmp4)(\?|$)/i.test(abs)) segUrls.push(abs);
    } catch { /* skip */ }
  }
  // Fetch next 12 segments in background (fire-and-forget)
  segUrls.slice(0, 12).forEach(url => {
    if (!segCache.get(url) && !inFlight.has(url)) {
      fetchSegment(url).catch(() => {});
    }
  });
}

// Proactively fetch child variant playlists found in a master playlist,
// then prefetch their segments. This removes one round-trip on slow origins.
function prefetchChildPlaylists(masterBody, baseUrl, extraHeaders = {}) {
  const variantUrls = [];
  for (const line of masterBody.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    try {
      const abs = new URL(t, baseUrl).href;
      if (/\.m3u8?(\?|$)/i.test(abs) || abs.includes('manifest') || abs.includes('playlist')) {
        variantUrls.push(abs);
      }
    } catch { /* skip */ }
  }
  // Fetch up to 3 variant playlists (covers multi-bitrate masters)
  variantUrls.slice(0, 3).forEach(variantUrl => {
    const pc = playlistCache.get(variantUrl);
    if (pc && Date.now() - pc.ts < PLAYLIST_TTL) {
      prefetch(pc._body || '', variantUrl);
      return;
    }
    fetch(variantUrl, extraHeaders).then(({ res: upstream, finalUrl }) => {
      if (upstream.statusCode >= 400) { upstream.resume(); return; }
      let body = '';
      upstream.setEncoding('utf8');
      upstream.on('data', c => (body += c));
      upstream.on('end', () => {
        if (!body.trim().startsWith('#EXTM3U')) return;
        const rewritten = rewriteM3U8(body, finalUrl);
        playlistCache.set(variantUrl, { rewritten, _body: body, ts: Date.now() });
        prefetch(body, finalUrl);
      });
    }).catch(() => {});
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: '1d', etag: true }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PROXY ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
app.get('/stream', async (req, res) => {
  const targetUrl = decodeURIComponent(req.query.url || '');
  if (!targetUrl) return res.status(400).json({ error: 'Missing ?url=' });

  const extraHeaders = {};
  if (req.query.referer) extraHeaders['Referer'] = decodeURIComponent(req.query.referer);
  if (req.query.origin)  extraHeaders['Origin']  = decodeURIComponent(req.query.origin);

  const isSegment = /\.(ts|aac|mp4|m4s|fmp4|key)(\?|$)/i.test(targetUrl);

  try {
    if (isSegment) {
      // ── Cache hit: instant response ───────────────────────────────────────
      const hit = segCache.get(targetUrl);
      if (hit) {
        res.setHeader('Content-Type',   hit.ct);
        res.setHeader('Content-Length', hit.data.length);
        res.setHeader('Cache-Control',  'max-age=45');
        res.setHeader('X-Cache', 'HIT');
        return res.end(hit.data);
      }

      // ── In-flight dedup: wait for ongoing fetch then send ─────────────────
      if (inFlight.has(targetUrl)) {
        res.setHeader('X-Cache', 'DEDUP');
        const { data, ct } = await inFlight.get(targetUrl);
        res.setHeader('Content-Type',   ct);
        res.setHeader('Content-Length', data.length);
        res.setHeader('Cache-Control',  'max-age=45');
        return res.end(data);
      }

      // ── Cache miss: stream bytes to client WHILE downloading ──────────────
      //    This cuts TTFB from full-segment-duration to near-zero on slow CDNs.
      const { res: upstream } = await fetch(targetUrl, extraHeaders);
      const ct = upstream.headers['content-type'] || 'video/mp2t';
      res.setHeader('Content-Type',  ct);
      res.setHeader('Cache-Control', 'max-age=45');
      res.setHeader('X-Cache', 'MISS');
      if (upstream.headers['content-length']) {
        res.setHeader('Content-Length', upstream.headers['content-length']);
      }

      const chunks = [];
      const done = new Promise((resolve, reject) => {
        upstream.on('data', chunk => { chunks.push(chunk); res.write(chunk); });
        upstream.on('end', () => {
          res.end();
          const data = Buffer.concat(chunks);
          segCache.set(targetUrl, data, ct);
          resolve({ data, ct });
        });
        upstream.on('error', err => {
          if (!res.headersSent) res.status(502).json({ error: err.message });
          else res.destroy();
          reject(err);
        });
      });
      inFlight.set(targetUrl, done);
      done.catch(() => {}).finally(() => inFlight.delete(targetUrl));
      return;
    }

    // ── Playlist or other ─────────────────────────────────────────────────
    // Serve from playlist cache if fresh (HLS players poll every few seconds)
    const pc = playlistCache.get(targetUrl);
    if (pc && Date.now() - pc.ts < PLAYLIST_TTL) {
      res.setHeader('Content-Type',  'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache, no-store');
      res.setHeader('X-Cache', 'PLAYLIST-HIT');
      return gzipSend(req, res, pc.rewritten);
    }

    const { res: upstream, finalUrl } = await fetch(targetUrl, extraHeaders);

    if (upstream.statusCode >= 400) {
      upstream.resume();
      return res.status(upstream.statusCode).send(`Upstream ${upstream.statusCode}`);
    }

    const ct = upstream.headers['content-type'] || '';
    const isPlaylist =
      ct.includes('mpegurl') || ct.includes('x-mpegURL') || ct.includes('m3u') ||
      /\.(m3u8?|m3u)(\?|$)/i.test(finalUrl) ||
      finalUrl.includes('playlist') || finalUrl.includes('manifest');

    if (isPlaylist) {
      let body = '';
      upstream.setEncoding('utf8');
      upstream.on('data', c => (body += c));
      upstream.on('end', () => {
        if (!body.trim().startsWith('#EXTM3U')) {
          console.error(`[proxy] Non-M3U8 from ${targetUrl}`);
          return res.status(502).send('Upstream returned non-M3U8 content');
        }
        // Rewrite URLs and respond immediately
        const rewritten = rewriteM3U8(body, finalUrl);
        playlistCache.set(targetUrl, { rewritten, ts: Date.now() });
        res.setHeader('Content-Type',  'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache, no-store');
        gzipSend(req, res, rewritten);
        // If master playlist, proactively fetch child quality playlists + their segments
        if (body.includes('#EXT-X-STREAM-INF')) {
          prefetchChildPlaylists(body, finalUrl, extraHeaders);
        }
        // Then silently pre-fetch next segments
        prefetch(body, finalUrl);
      });
    } else {
      // Binary pass-through (images, keys, etc.)
      res.setHeader('Content-Type',  ct || 'application/octet-stream');
      res.setHeader('Cache-Control', 'max-age=60');
      if (upstream.headers['content-length']) {
        res.setHeader('Content-Length', upstream.headers['content-length']);
      }
      upstream.pipe(res);
    }

  } catch (err) {
    console.error(`[proxy] ${err.message} — ${targetUrl.slice(0, 80)}`);
    if (!res.headersSent) res.status(502).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH + STATS
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status:   'ok',
  port:     PORT,
  cache:    { size: segCache.size, max: LRU_MAX },
  inFlight: inFlight.size,
}));

app.get(/(.*)/, (_, res) => {
  const idx = path.join(distDir, 'index.html');
  fs.existsSync(idx) ? res.sendFile(idx) : res.status(404).send('Run: npm run build');
});

app.listen(PORT, () => {
  console.log(`\n🔁  IBK-TV Proxy  →  http://localhost:${PORT}`);
  console.log(`   Keep-alive: ON | LRU cache: ${LRU_MAX} slots | Prefetch: 8 segments ahead\n`);
});
