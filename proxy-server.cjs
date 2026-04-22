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
  keepAlive: true, maxSockets: 6, maxFreeSockets: 2,
  timeout: 10000, scheduling: 'lifo',
});
const httpsAgent = new https.Agent({
  keepAlive: true, maxSockets: 6, maxFreeSockets: 2,
  timeout: 10000, scheduling: 'lifo',
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. LRU SEGMENT CACHE
//    TS segments are immutable — once fetched, serve instantly from RAM.
//    200 slots × ~500 KB avg = ~100 MB RAM max.
// ─────────────────────────────────────────────────────────────────────────────
const LRU_MAX = 60;
const SEG_TTL = 60_000; // 60 s
const SEG_MAX_BYTES = 2 * 1024 * 1024; // skip caching segments > 2 MB

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
const PLAYLIST_TTL = 10_000; // 10 s
const playlistCache = new Map(); // url → { rewritten, body, finalUrl, ts }

// Purge stale playlist entries every 60s to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of playlistCache) {
    if (now - v.ts > PLAYLIST_TTL * 2) playlistCache.delete(k);
  }
}, 60_000);

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITER — max 120 requests/min per IP to prevent abuse
// ─────────────────────────────────────────────────────────────────────────────
const rateMap = new Map(); // ip → { count, resetAt }
setInterval(() => rateMap.clear(), 60_000);
function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  const now = Date.now();
  let entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 60_000 };
    rateMap.set(ip, entry);
  }
  entry.count++;
  if (entry.count > 300) return res.status(429).send('Too Many Requests');
  next();
}

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
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
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
  // index.html — never cache so updates are instant
  app.get('/', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(distDir, 'index.html'));
  });
  // Hashed JS/CSS assets — cache 1 year (filename changes on every build)
  app.use(express.static(distDir, { maxAge: '1y', etag: true }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PROXY ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
app.get('/stream', rateLimit, async (req, res) => {
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
          if (data.length <= SEG_MAX_BYTES) segCache.set(targetUrl, data, ct);
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
// Short download page — accessible at /get
app.get('/get', (_, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>IBK TV — Download</title>
<style>
  body{margin:0;background:#0a0a0f;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#fff;}
  .card{text-align:center;padding:40px 60px;background:#16161f;border-radius:20px;box-shadow:0 8px 40px #0006;}
  .logo{font-size:3rem;font-weight:900;letter-spacing:-1px;}
  .logo span{color:#e63}
  p{color:#aaa;margin:8px 0 32px;}
  a.btn{display:inline-block;background:#e63;color:#fff;text-decoration:none;padding:18px 48px;border-radius:12px;font-size:1.3rem;font-weight:700;letter-spacing:.5px;}
  a.btn:hover{background:#ff5544;}
  .code{margin-top:28px;color:#555;font-size:.85rem;}
  .code span{color:#888;font-family:monospace;font-size:1rem;}
</style>
</head>
<body>
<div class="card">
  <div class="logo"><span>IBK</span>TV</div>
  <p>Android TV App — v1.3</p>
  <a class="btn" href="/IBK-TV.apk">⬇ Download APK</a>
  <div class="code">Short link: <span>is.gd/IBKtv2024</span></div>
</div>
</body>
</html>`);
});

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
  console.log(`   Keep-alive: ON | LRU cache: ${LRU_MAX} slots | Seg TTL: 60s | Playlist TTL: 10s\n`);
});
