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
