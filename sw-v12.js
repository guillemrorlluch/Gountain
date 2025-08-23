const CACHE_NAME = "gountain-cache-v12";
const OFFLINE_URLS = [
  "/", "/index.html", "/styles.css",
  "/map.js",
  "/assets/GountainTime-192.png",
  "/assets/GountainTime-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignore non-http(s) requests (e.g., chrome-extension://, about:, data:)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Don’t cache-bust or intercept the manifest/icons (avoid stale)
  if (url.pathname === "/manifest.json" || url.pathname.startsWith("/assets/")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          // Do not cache opaque or error responses
          if (!res || res.status !== 200 || res.type === "opaque") return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
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

