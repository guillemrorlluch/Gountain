// sw-v9.js — v9
const VERSION = 'v9';
const STATIC_CACHE = `static-${VERSION}`;
const DATA_CACHE   = `data-${VERSION}`;

// Extrae solo el número para usarlo en los parámetros de caché
const VER_PARAM = VERSION.replace(/^v/, '');

const STATIC_ASSETS = [
   '/',                                // raíz
  '/index.html',                      // HTML principal
  `/styles.css?v=${VER_PARAM}`,       // con query para bustear caché
  `/app.js?v=${VER_PARAM}`,
  `/manifest.json?v=${VER_PARAM}`,
  '/assets/GountainTime-192.png',
  '/assets/GountainTime-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting(); // activar al instante
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Stale-while-revalidate for data requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  const assetKey = url.pathname + url.search;

  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async cache => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then(res => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        }).catch(() => cached);
        if (cached) {
          event.waitUntil(fetchPromise);
          return cached;
        }
        return fetchPromise;
      })
    );
    return;
  }

  if (STATIC_ASSETS.includes(assetKey)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});

self.addEventListener('message', evt => {
  if (evt.data && evt.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (evt.data && evt.data.type === 'SYNC_DATA') {
    if (self.registration.sync) {
      self.registration.sync.register('sync-destinos');
    }
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-destinos') {
    event.waitUntil(
      fetch('/data/destinos.json')
        .then(res => caches.open(DATA_CACHE).then(cache => cache.put('/data/destinos.json', res)))
        .catch(err => console.error('Sync failed', err))
    );
  }
});
