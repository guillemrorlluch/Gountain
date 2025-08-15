// sw-v10.js — Safari-safe, fail-open

self.addEventListener('install', () => { try { self.skipWaiting(); } catch {} });
self.addEventListener('activate', (e) => { e.waitUntil((async()=>{})()); try { self.clients.claim(); } catch {} });

const TILE_HOSTS = ['api.mapbox.com', 'tiles.mapbox.com'];
function isTile(u){ try { return TILE_HOSTS.some(h => new URL(u).hostname.includes(h)); } catch { return false; } }

self.addEventListener('fetch', (event) => {
  try {
    const req = event.request;

    // 1) Never intercept navigations (HTML) → network only (prevents stale/blank)
    if (req.mode === 'navigate') { event.respondWith(fetch(req)); return; }

    // 2) Never cache Mapbox tiles in SW (avoid token/CORS issues)
    if (isTile(req.url)) { event.respondWith(fetch(req)); return; }

    // 3) Optional caching for static assets (safe network-first)
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  } catch {
    // Absolute fail-open for odd Safari cases
    event.respondWith(fetch(event.request));
  }
});

self.addEventListener('message', (ev) => {
  if (ev?.data?.type === 'SKIP_WAITING') { try { self.skipWaiting(); } catch {} }
});
