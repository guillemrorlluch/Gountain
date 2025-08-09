const CACHE_NAME = "pwa-cache-v4-" + new Date().getTime();
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/data/destinos.json",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

// Instalación: cachea los archivos
self.addEventListener("install", (event) => {
  self.skipWaiting(); // fuerza la activación inmediata
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación: limpia caches antiguos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("pwa-cache-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim()) // toma control de las pestañas abiertas
  );
});

// Fetch: red online primero, fallback al cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
