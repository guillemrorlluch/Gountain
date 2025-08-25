// sw-v13.js
const CACHE_NAME = "gountain-cache-v13";
const OFFLINE_URLS = [
  "/", "/index.html", "/styles.css",
  "/map.js",
  "/dist/app.bundle.js",
  "/assets/Gountain-192.png",
  "/assets/Gountain-512.png"
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

  // Ignore non-http(s) protocols (prevents chrome-extension errors)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Fetch manifest and assets from network first to avoid stale icons
  if (url.pathname === "/manifest.json" || url.pathname.startsWith("/assets/")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Cache-first for the rest (cache only successful GET responses)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          if (
            event.request.method === "GET" &&
            res &&
            res.status === 200 &&
            res.type !== "opaque"
          ) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          }
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
