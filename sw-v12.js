// sw-v12.js
const CACHE_NAME = "gountain-cache-v12";
const CORE = [
  "/", "/index.html",
  "/styles.css",
  "/dist/app.bundle.js",
  "/assets/GountainTime-192.png",
  "/assets/GountainTime-512.png"
];

// Normalize versioned requests (?v=12) to canonical keys for CSS/JS
function normalizeRequest(req) {
  try {
    const u = new URL(req.url);
    const canonical = ["/styles.css", "/dist/app.bundle.js"];
    if (canonical.includes(u.pathname) && u.search) {
      return new Request(u.origin + u.pathname, {
        headers: req.headers, method: req.method, mode: req.mode,
        credentials: req.credentials, redirect: req.redirect,
        referrer: req.referrer, referrerPolicy: req.referrerPolicy, integrity: req.integrity
      });
    }
  } catch {}
  return req;
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)));
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

  // Don't intercept the service worker file itself
  if (url.pathname.startsWith("/sw-")) return;

  // Always hit network for manifest and /assets/ to avoid stale icons/401
  if (url.pathname === "/manifest.json" || url.pathname.startsWith("/assets/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML/navigation -> network-first with fallback to cache
  if (event.request.mode === "navigate" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/") || caches.match("/index.html"))
    );
    return;
  }

  // CSS/JS/images -> stale-while-revalidate
  const request = normalizeRequest(event.request);
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(event.request).then((res) => {
        if (res && res.status === 200 && res.type !== "opaque") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
