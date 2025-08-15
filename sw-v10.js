const STATIC_CACHE = 'static-v10';
const DATA_CACHE = 'data-v10';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => { e.waitUntil((async()=>{})()); self.clients.claim(); });

const TILE_HOSTS = ['api.mapbox.com','tiles.mapbox.com'];
function isTile(u){ try{return TILE_HOSTS.some(h=>new URL(u).hostname.includes(h));}catch{return false;} }

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') { event.respondWith(fetch(req)); return; }
  if (isTile(req.url))        { event.respondWith(fetch(req)); return; }

  if (req.url.startsWith(self.location.origin + '/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async cache => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then(res => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        if (cached) { event.waitUntil(fetchPromise); return cached; }
        return fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    caches.open(STATIC_CACHE).then(cache =>
      cache.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        });
      })
    )
  );
});
