const CACHE_NAME = "gountain-cache-v12";
const OFFLINE_URLS = [
  "/", "/index.html", "/styles.css",
  "/dist/app.bundle.js",
  "/assets/GountainTime-192.png",
  "/assets/GountainTime-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always hit network for manifest and /assets/ to avoid stale icons.
  if (url.pathname === "/manifest.json" || url.pathname.startsWith("/assets/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first with network fallback for everything else
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
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
