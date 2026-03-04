const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS headers ──────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Serve built frontend ───────────────────────────────────────
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// ── HTTP fetch helper ─────────────────────────────────────────
function fetchUrl(targetUrl, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(targetUrl); } catch (e) { return reject(new Error('Invalid URL')); }

    const client = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Connection': 'keep-alive',
        ...extraHeaders,
      },
    };

    const req = client.get(options, resolve);
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

// ── Resolve redirects ─────────────────────────────────────────
function fetchWithRedirects(url, headers = {}, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const attempt = (currentUrl, redirectsLeft) => {
      fetchUrl(currentUrl, headers).then((res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          if (redirectsLeft === 0) return reject(new Error('Too many redirects'));
          const next = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, currentUrl).href;
          res.resume();
          attempt(next, redirectsLeft - 1);
        } else {
          resolve({ res, finalUrl: currentUrl });
        }
      }).catch(reject);
    };
    attempt(url, maxRedirects);
  });
}

// ── M3U8 URL rewriter ─────────────────────────────────────────
function rewriteM3U8(content, originalUrl) {
  const base = originalUrl.substring(0, originalUrl.lastIndexOf('/') + 1);

  return content.replace(/^(?!#)(\S+)$/gm, (match) => {
    if (!match.trim()) return match;
    let absolute;
    if (match.startsWith('http://') || match.startsWith('https://')) {
      absolute = match;
    } else if (match.startsWith('//')) {
      const parsed = new URL(originalUrl);
      absolute = parsed.protocol + match;
    } else if (match.startsWith('/')) {
      const parsed = new URL(originalUrl);
      absolute = `${parsed.protocol}//${parsed.host}${match}`;
    } else {
      absolute = base + match;
    }
    return `/stream?url=${encodeURIComponent(absolute)}`;
  });
}

// ── Proxy endpoint ────────────────────────────────────────────
app.get('/stream', async (req, res) => {
  const targetUrl = decodeURIComponent(req.query.url || '');
  if (!targetUrl) return res.status(400).json({ error: 'Missing ?url= parameter' });

  const extraHeaders = {};
  if (req.query.referer) extraHeaders['Referer'] = req.query.referer;
  if (req.query.origin) extraHeaders['Origin'] = req.query.origin;

  try {
    const { res: proxyRes, finalUrl } = await fetchWithRedirects(targetUrl, extraHeaders);

    if (proxyRes.statusCode >= 400) {
      return res.status(proxyRes.statusCode).send(`Upstream error: ${proxyRes.statusCode}`);
    }

    const ct = proxyRes.headers['content-type'] || '';
    const isPlaylist =
      ct.includes('mpegurl') ||
      ct.includes('x-mpegURL') ||
      ct.includes('m3u') ||
      finalUrl.match(/\.(m3u8?|m3u)(\?|$)/i) ||
      finalUrl.includes('manifest') ||
      finalUrl.includes('playlist');

    if (isPlaylist) {
      let body = '';
      proxyRes.setEncoding('utf8');
      proxyRes.on('data', (chunk) => (body += chunk));
      proxyRes.on('end', () => {
        const rewritten = rewriteM3U8(body, finalUrl);
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache, no-store');
        res.send(rewritten);
      });
    } else {
      // Binary pass-through (TS segments, AAC, etc.)
      res.setHeader('Content-Type', ct || 'application/octet-stream');
      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      }
      res.setHeader('Cache-Control', 'max-age=30');
      proxyRes.pipe(res);
    }
  } catch (err) {
    console.error(`[proxy] Error for ${targetUrl}:`, err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', port: PORT }));

// ── SPA fallback (serve index.html for any unmatched route) ───
app.get(/(.*)/, (_, res) => {
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend not built. Run: npm run build');
  }
});

app.listen(PORT, () => {
  console.log(`\n🔁  IBK-TV Proxy  →  http://localhost:${PORT}`);
  console.log(`   Stream any HLS via /stream?url=ENCODED_URL\n`);
});
