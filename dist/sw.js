// IBK-TV Service Worker — cache-first for app shell, network-only for streams
const CACHE = 'ibktv-shell-v6';
const SHELL = ['/', '/index.html', '/icon-192.png', '/icon-512.png', '/manifest.json'];

// On install: cache the app shell immediately
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// On activate: delete old caches and take control right away
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Never cache stream proxy requests — always hit the network
  if (url.pathname.startsWith('/stream')) return;

  // For JS/CSS/font assets Vite fingerprints — cache forever once fetched
  if (url.pathname.match(/\/assets\/.+\.(js|css|woff2?)$/)) {
    e.respondWith(
      caches.match(e.request).then((hit) => {
        if (hit) return hit;
        return fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // For HTML / navigation — network-first with 4s timeout, fall back to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      Promise.race([
        fetch(e.request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
      ]).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Everything else — stale-while-revalidate
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(e.request);
      const networkFetch = fetch(e.request).then((res) => {
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
