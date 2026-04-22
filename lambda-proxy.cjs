'use strict';
const https  = require('https');
const http   = require('http');
const { URL } = require('url');

// ── Keep-alive agents ─────────────────────────────────────────────────────────
const httpAgent  = new http.Agent ({ keepAlive: true, maxSockets: 12, maxFreeSockets: 4, timeout: 12000 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 12, maxFreeSockets: 4, timeout: 12000 });


// ── LRU Segment Cache ─────────────────────────────────────────────────────────
const LRU_MAX       = 60;
const SEG_TTL       = 60_000;
const SEG_MAX_BYTES = 2 * 1024 * 1024;

class LRUCache {
  constructor(max) { this.max = max; this.map = new Map(); }
  get(url) {
    const item = this.map.get(url);
    if (!item) return null;
    if (Date.now() - item.ts > SEG_TTL) { this.map.delete(url); return null; }
    this.map.delete(url); this.map.set(url, item);
    return item;
  }
  set(url, data, ct) {
    if (this.map.has(url)) this.map.delete(url);
    if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value);
    this.map.set(url, { data, ct, ts: Date.now() });
  }
}
const segCache = new LRUCache(LRU_MAX);

// ── In-flight deduplication — if two requests arrive for the same segment
//    simultaneously, only one upstream fetch is made ─────────────────────────
const inFlight = new Map(); // url → Promise<{data,ct}>

// ── Playlist Cache ────────────────────────────────────────────────────────────
const PLAYLIST_TTL  = 8_000;
const PLAYLIST_MAX  = 100;
const playlistCache = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of playlistCache) {
    if (now - v.ts > PLAYLIST_TTL * 3) playlistCache.delete(k);
  }
  if (playlistCache.size > PLAYLIST_MAX) {
    const oldest = [...playlistCache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    oldest.slice(0, playlistCache.size - PLAYLIST_MAX).forEach(([k]) => playlistCache.delete(k));
  }
}, 60_000);

// ── Helpers ───────────────────────────────────────────────────────────────────
function rawFetch(targetUrl, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(targetUrl); } catch { return reject(new Error('Invalid URL')); }
    const isHttps = parsed.protocol === 'https:';
    const mod = isHttps ? https : http;
    const req = mod.get({
      hostname: parsed.hostname,
      port:     parsed.port || (isHttps ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      agent:    isHttps ? httpsAgent : httpAgent,
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':          '*/*',
        'Accept-Encoding': 'identity',
        'Connection':      'keep-alive',
        ...extraHeaders,
      },
    }, resolve);
    req.on('error', reject);
    req.setTimeout(12000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function fetch(url, headers = {}, hops = 6) {
  return new Promise((resolve, reject) => {
    const go = (u, left) => {
      rawFetch(u, headers).then(res => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          if (!left) return reject(new Error('Too many redirects'));
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, u).href;
          res.resume(); go(next, left - 1);
        } else { resolve({ res, finalUrl: u }); }
      }).catch(reject);
    };
    go(url, hops);
  });
}

function slurp(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', c => chunks.push(c));
    stream.on('end',  () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}


function rewriteM3U8(content, baseUrl, referer) {
  const ref = referer ? `&referer=${encodeURIComponent(referer)}` : '';
  let out = content.replace(/^(?!#)(\S+)$/gm, match => {
    if (!match.trim()) return match;
    try { return `/stream?url=${encodeURIComponent(new URL(match, baseUrl).href)}${ref}`; }
    catch { return match; }
  });
  out = out.replace(/URI="([^"]+)"/g, (_, uri) => {
    try { return `URI="/stream?url=${encodeURIComponent(new URL(uri, baseUrl).href)}${ref}"`; }
    catch { return _; }
  });
  return out;
}

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
  // Prefetch next 2 segments without blocking
  segUrls.slice(0, 2).forEach(url => {
    if (segCache.get(url) || inFlight.has(url)) return;
    const p = fetch(url).then(({ res }) => slurp(res)).then(data => {
      if (data.length <= SEG_MAX_BYTES) segCache.set(url, data, 'video/mp2t');
      return { data, ct: 'video/mp2t' };
    }).catch(() => null).finally(() => inFlight.delete(url));
    inFlight.set(url, p);
  });
}

// ── CORS headers ──────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

// ── Lambda Handler ────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.source === 'warmer') return { statusCode: 200, body: 'warm' };

  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  if (method === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const params    = event.queryStringParameters || {};
  const targetUrl = decodeURIComponent(params.url || '');

  if (!targetUrl) {
    return { statusCode: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
             body: JSON.stringify({ error: 'Missing ?url=' }) };
  }

  const extraHeaders = {};
  if (params.referer) extraHeaders['Referer'] = decodeURIComponent(params.referer);
  if (params.origin)  extraHeaders['Origin']  = decodeURIComponent(params.origin);

  const isSegment = /\.(ts|aac|mp4|m4s|fmp4|key)(\?|$)/i.test(targetUrl);

  try {
    // ── Segment ──────────────────────────────────────────────────────────────
    if (isSegment) {
      // 1. LRU cache hit
      const hit = segCache.get(targetUrl);
      if (hit) {
        return { statusCode: 200,
                 headers: { ...CORS, 'Content-Type': hit.ct, 'Cache-Control': 'max-age=45', 'X-Cache': 'HIT' },
                 body: hit.data.toString('base64'), isBase64Encoded: true };
      }

      // 2. In-flight dedup — join existing fetch instead of making a new one
      if (inFlight.has(targetUrl)) {
        const result = await inFlight.get(targetUrl);
        if (result) {
          return { statusCode: 200,
                   headers: { ...CORS, 'Content-Type': result.ct, 'Cache-Control': 'max-age=45', 'X-Cache': 'DEDUP' },
                   body: result.data.toString('base64'), isBase64Encoded: true };
        }
      }

      // 3. Fetch and cache
      const p = fetch(targetUrl, extraHeaders)
        .then(({ res }) => {
          const ct = res.headers['content-type'] || 'video/mp2t';
          return slurp(res).then(data => ({ data, ct }));
        })
        .then(result => {
          if (result.data.length <= SEG_MAX_BYTES) segCache.set(targetUrl, result.data, result.ct);
          return result;
        })
        .catch(err => { throw err; })
        .finally(() => inFlight.delete(targetUrl));

      inFlight.set(targetUrl, p);
      const { data, ct } = await p;
      return { statusCode: 200,
               headers: { ...CORS, 'Content-Type': ct, 'Cache-Control': 'max-age=45', 'X-Cache': 'MISS' },
               body: data.toString('base64'), isBase64Encoded: true };
    }

    // ── Playlist ─────────────────────────────────────────────────────────────
    const pc = playlistCache.get(targetUrl);
    if (pc && Date.now() - pc.ts < PLAYLIST_TTL) {
      return { statusCode: 200,
               headers: { ...CORS, 'Content-Type': 'application/vnd.apple.mpegurl',
                          'Cache-Control': 'no-cache', 'X-Cache': 'PLAYLIST-HIT' },
               body: pc.rewritten };
    }

    const { res: upstream, finalUrl } = await fetch(targetUrl, extraHeaders);
    if (upstream.statusCode >= 400) {
      upstream.resume();
      return { statusCode: upstream.statusCode, headers: CORS, body: `Upstream ${upstream.statusCode}` };
    }

    const ct = upstream.headers['content-type'] || '';
    const isPlaylist =
      ct.includes('mpegurl') || ct.includes('x-mpegURL') || ct.includes('m3u') ||
      /\.(m3u8?|m3u)(\?|$)/i.test(finalUrl) ||
      finalUrl.includes('playlist') || finalUrl.includes('manifest');

    if (isPlaylist) {
      let body = '';
      upstream.setEncoding('utf8');
      await new Promise((resolve, reject) => {
        upstream.on('data', c => body += c);
        upstream.on('end', resolve);
        upstream.on('error', reject);
      });
      if (!body.trim().startsWith('#EXTM3U')) {
        return { statusCode: 502, headers: CORS, body: 'Non-M3U8 content from upstream' };
      }
      const referer = params.referer ? decodeURIComponent(params.referer) : undefined;
      const rewritten = rewriteM3U8(body, finalUrl, referer);
      playlistCache.set(targetUrl, { rewritten, ts: Date.now() });
      prefetch(body, finalUrl);

      // Master playlists (quality renditions) rarely change — cache 15s
      // Media playlists (live segments) update every ~6s — cache 3s so
      // CloudFront absorbs burst traffic without going stale
      const isMaster = body.includes('#EXT-X-STREAM-INF') || body.includes('#EXT-X-MEDIA:');
      const playlistCC = isMaster ? 'max-age=15, public' : 'max-age=3, public';

      return { statusCode: 200,
               headers: { ...CORS, 'Content-Type': 'application/vnd.apple.mpegurl',
                          'Cache-Control': playlistCC },
               body: rewritten };
    }

    // ── Binary pass-through (keys, etc.) ─────────────────────────────────────
    const data = await slurp(upstream);
    return { statusCode: 200,
             headers: { ...CORS, 'Content-Type': ct || 'application/octet-stream', 'Cache-Control': 'max-age=60' },
             body: data.toString('base64'), isBase64Encoded: true };

  } catch (err) {
    console.error('[proxy]', err.message, targetUrl.slice(0, 80));
    return { statusCode: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
             body: JSON.stringify({ error: err.message }) };
  }
};
