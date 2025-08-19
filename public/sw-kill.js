// sw-kill.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try { await self.registration.unregister(); } catch {}
    const cs = await self.clients.matchAll({ type:'window', includeUncontrolled:true });
    for (const c of cs) { try { c.navigate(c.url); } catch {} }
  })());
});
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request)));