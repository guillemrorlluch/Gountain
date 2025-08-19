const CACHE = 'gountain-cache-v11';
const PRECACHE = [
  '/', '/index.html', '/styles.css', '/dist/app.bundle.js',
  '/assets/GountainTime-192.png', '/assets/GountainTime-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k !== CACHE ? caches.delete(k) : undefined))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Always network for manifest & assets (avoid 401 & stale icons)
  if (url.pathname === '/manifest.json' || url.pathname.startsWith('/assets/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first with network fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('/index.html');
      });
    })
  );
});
