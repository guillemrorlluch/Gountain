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
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  } catch {
    event.respondWith(fetch(req));
  }
});

self.addEventListener('message', (ev) => {
  if (ev?.data?.type === 'SKIP_WAITING') { try { self.skipWaiting(); } catch {} }
});
