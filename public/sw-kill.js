// sw-kill.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  const regs = await self.registration.getRegistrations?.() || [];
  await Promise.all(regs.map(r => r.unregister()));
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  self.clients.matchAll({ includeUncontrolled: true }).then(clients =>
    clients.forEach(c => c.navigate(c.url)));
});
