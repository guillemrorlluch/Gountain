// sw-v10.js
const CACHE_NAME = "gountain-cache-v10";
const OFFLINE_URLS = [
  "/", 
  "/index.html",
  "/styles.css",
  "/dist/app.bundle.js",
  "/assets/GountainTime-192.png",
  "/assets/GountainTime-512.png"
];

// Install: precache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fetch handler con bypass para manifest.json y /assets/
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🔹 Bypass: siempre pedir a red manifest.json y assets
  if (url.pathname === "/manifest.json" || url.pathname.startsWith("/assets/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 🔹 Estrategia cache-first con fallback a red
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
