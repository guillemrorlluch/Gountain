// sw-v10.js — v10
const VERSION = 'v10';
const STATIC_CACHE = `static-${VERSION}`;
const DATA_CACHE   = `data-${VERSION}`;
const TILE_CACHE   = `tiles-${VERSION}`;

// ─── toggles ───────────────────────────────────────────────────────────────────
const BYPASS_CACHE = false; // set true to debug with network-only mode (like sw-v9)
const TILE_HOSTS = ['api.mapbox.com']; // external tile hosts to bypass caching
function isTileHost(url) { try { return TILE_HOSTS.some(h => new URL(url).hostname.includes(h)); } catch { return false; } }
// ───────────────────────────────────────────────────────────────────────────────

// Tile cache limits
const TILE_TTL   = 7 * 24 * 60 * 60 * 1000; // 7 días en ms
const TILE_LIMIT = 50 * 1024 * 1024;        // ~50 MB

// Extrae solo el número para usarlo en los parámetros de caché
const VER_PARAM = VERSION.replace(/^v/, '');

const STATIC_ASSETS = [
   '/',                                // raíz
  '/index.html',                      // HTML principal
  `/styles.css?v=${VER_PARAM}`,       // con query para bustear caché
  `/app.js?v=${VER_PARAM}`,
  `/manifest.json?v=${VER_PARAM}`,
  '/assets/GountainTime-192.png',
  '/assets/GountainTime-512.png',
  'https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css',
  'https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js',
];

async function cachePutWithMeta(cache, request, response) {
  const now = Date.now();
  const buf = await response.clone().arrayBuffer();
  const headers = new Headers(response.headers);
  headers.set('sw-cache-time', String(now));
  headers.set('sw-cache-size', String(buf.byteLength));
  const body = new Response(buf, { status: response.status, statusText: response.statusText, headers });
  await cache.put(request, body);
  await enforceTileLimits(cache);
}

async function enforceTileLimits(cache) {
  const now = Date.now();
  const keys = await cache.keys();
  let entries = [];
  let total = 0;
  for (const req of keys) {
    const res = await cache.match(req);
    if (!res) continue;
    const time = parseInt(res.headers.get('sw-cache-time') || '0', 10);
    const size = parseInt(res.headers.get('sw-cache-size') || '0', 10);
    if (now - time > TILE_TTL) {
      await cache.delete(req);
      continue;
    }
    total += size;
    entries.push({ request: req, time, size });
  }
  entries.sort((a, b) => a.time - b.time);
  while (total > TILE_LIMIT && entries.length) {
    const entry = entries.shift();
    await cache.delete(entry.request);
    total -= entry.size;
  }
}

async function handleTileRequest(event) {
  const { request } = event;
  const cache = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(async res => {
    if (res.ok) {
      await cachePutWithMeta(cache, request, res.clone());
    }
    return res;
  }).catch(() => cached);

  if (cached) {
    event.waitUntil(fetchPromise);
    return cached;
  }
  return fetchPromise;
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting(); // activar al instante
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (![STATIC_CACHE, DATA_CACHE, TILE_CACHE].includes(key)) {
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

  // 0) Full bypass mode (like sw-v9) for debugging
  if (BYPASS_CACHE) {
    event.respondWith(fetch(request));
    return;
  }

  // 1) Never cache non-GET requests or external tile requests
  if (request.method !== 'GET' || (url.origin !== location.origin && isTileHost(url))) {
    event.respondWith(fetch(request));
    return;
  }

  const assetKey = url.origin === location.origin ? url.pathname + url.search : url.href;

  if (url.origin === location.origin && url.pathname.startsWith('/data/')) {
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
    return;
  }

  if (isTileHost(url)) {
    event.respondWith(handleTileRequest(event));
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
