const CACHE_NAME = 'gountain-cache-v11';
const OFFLINE_URLS = ['/', '/index.html', '/styles.css', '/dist/app.bundle.js', '/assets/GountainTime-192.png', '/assets/GountainTime-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)));
    const c = await caches.open(CACHE_NAME);
    const reqs = await c.keys();
    await Promise.all(reqs.filter((r) => new URL(r.url).pathname === '/manifest.json').map((r) => c.delete(r)));
  })());
  self.clients.claim();
});

const isBypassed = (url) => {
  if (url.origin !== self.location.origin) return true;      // externals (Mapbox/CDNs)
  if (url.pathname === '/manifest.json') return true;        // manifest
  if (url.pathname.startsWith('/_vercel')) return true;      // vercel internals
  if (url.pathname.includes('vercel-insights')) return true; // vercel insights
  return false;
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (isBypassed(url)) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(() => {
      if (event.request.mode === 'navigate') return caches.match('/index.html');
      return Promise.reject();
    }));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const res = await fetch(event.request);
      if (res && res.ok) {
        const clone = res.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, clone);
      }
      return res;
    } catch (err) {
      if (event.request.mode === 'navigate') {
        const offline = await caches.match('/index.html');
        if (offline) return offline;
      }
      throw err;
    }
  })());
});

