// sw.js — v9
const VERSION = 'v9';
const STATIC_CACHE = `static-${VERSION}`;
const DATA_CACHE   = `data-${VERSION}`;

const STATIC_ASSETS = [
  '/',                 // raíz
  '/index.html',       // HTML principal
  '/styles.css?v=6',   // con query para bustear caché
  '/app.js?v=6',
  '/manifest.json?v=6',
  '/assets/icons/GountainTime-192.png',
  '/assets/icons/GountainTime-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting(); // activar al instante
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DATA_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // tomar control sin recarga manual
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // JSON: network-first
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(DATA_CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Resto: stale-while-revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req).then(res => {
        caches.open(STATIC_CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
