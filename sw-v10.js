// sw-v10.js — Safari-safe, fail-open

self.addEventListener('install', () => {
  try { self.skipWaiting(); } catch {}
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => { try { await self.clients.claim(); } catch {} })());
});

const TILE_HOSTS = ['api.mapbox.com', 'tiles.mapbox.com'];
function isMapbox(u) { try { return TILE_HOSTS.some(h => new URL(u).hostname.includes(h)); } catch { return false; } }

self.addEventListener('fetch', (event) => {
  const req = event.request;
  try {
    if (req.mode === 'navigate') {
      event.respondWith(fetch(req));
      return;
    }
    if (isMapbox(req.url)) {
      event.respondWith(fetch(req));
      return;
    }
    if (req.destination === 'style' || req.destination === 'script' || req.url.endsWith('.css') || req.url.endsWith('.js')) {
      event.respondWith((async () => {
        try {
          const res = await fetch(req);
          try { (await caches.open('v10')).put(req, res.clone()); } catch {}
          return res;
        } catch {
          const cache = await caches.open('v10');
          const cached = await cache.match(req);
          if (cached) return cached;
          throw new Error('Network and cache both failed');
        }
      })());
      return;
    }
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  } catch {
    event.respondWith(fetch(req));
  }
});

self.addEventListener('message', (ev) => {
  if (ev?.data?.type === 'SKIP_WAITING') { try { self.skipWaiting(); } catch {} }
});
