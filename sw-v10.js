// sw-v10.js
const CACHE_NAME = 'gountain-cache-v10';

const OFFLINE_URLS = [
  '/', 
  '/index.html',
  '/styles.css',
  '/dist/app.bundle.js',
  '/assets/GountainTime-192.png',
  '/assets/GountainTime-512.png'
];

// --- Install: precache offline essentials ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// --- Activate: purge old caches y entradas problemáticas ---
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // elimina caches antiguos
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)));

    // elimina posibles manifest.json cacheados por error
    const c = await caches.open(CACHE_NAME);
    const reqs = await c.keys();
    await Promise.all(
      reqs
        .filter((r) => new URL(r.url).pathname === '/manifest.json')
        .map((r) => c.delete(r))
    );
  })());
  self.clients.claim();
});

// --- Helpers ---
const isBypassed = (url) => {
  // rutas que NO debe tocar el SW
  if (url.origin !== self.location.origin) return true;                      // externos (Mapbox, etc.)
  if (url.pathname === '/manifest.json') return true;                        // manifest
  if (url.pathname.startsWith('/_vercel')) return true;                      // vercel internals
  if (url.pathname.includes('vercel-insights')) return true;                 // vercel insights
  return false;
};

// --- Fetch: cache-first salvo bypass ---
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass duro: deja que el navegador vaya a red y NO caches
  if (isBypassed(url)) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(() => {
      // si falla la red y es navegación, intenta devolver index para no “romper” la app
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      // si no, deja que falle
      return Promise.reject();
    }));
    return;
  }

  // Cache-first con fill de fondo
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    try {
      const res = await fetch(event.request);
      // cachea sólo exitosos (no 4xx/5xx)
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
