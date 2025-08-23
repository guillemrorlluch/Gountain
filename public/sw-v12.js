const CACHE_NAME = 'gountain-cache-v12';
const CORE = [
  '/',
  '/index.html',
  '/styles.css',
  '/dist/app.bundle.js',
  '/map.js',
  '/assets/GountainTime-192.png',
  '/assets/GountainTime-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

function normalize(req){
  try {
    const url = new URL(req.url);
    const canon = ['/styles.css','/map.js','/dist/app.bundle.js'];
    if (url.origin === self.location.origin && canon.includes(url.pathname) && url.search){
      return new Request(url.origin + url.pathname, {
        method: req.method,
        headers: req.headers,
        mode: req.mode,
        credentials: req.credentials,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        integrity: req.integrity
      });
    }
  } catch {}
  return req;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin !== self.location.origin) return;

  if (url.pathname === '/manifest.json' || url.pathname.startsWith('/assets/')) {
    event.respondWith(fetch(req));
    return;
  }

  const normalized = normalize(req);
  event.respondWith(
    caches.match(normalized).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.status === 200){
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(normalized, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
