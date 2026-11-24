const CACHE_PREFIX = "sobra-ai-admin-";
const CACHE_NAME = CACHE_PREFIX + "static-v2";
const MAX_ENTRIES = 128;
const STATIC_ASSETS = [
  "/brand/sobra-ai-admin-favicon.png",
  "/brand/sobra-ai-admin-icon-192.png",
  "/brand/sobra-ai-admin-icon-512.png",
  "/brand/sobra-ai-admin-apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key))))
    .catch(() => {})
    .then(() => self.clients.claim()));
});

// HTML, API, RSC e HMR sempre seguem a rede; apenas assets estáticos entram no cache.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || request.mode === "navigate" || request.cache === "no-store" ||
      url.origin !== self.location.origin ||
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      (!url.pathname.startsWith("/_next/static/") && !STATIC_ASSETS.includes(url.pathname))) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME).catch(() => null);
    const cached = cache ? await cache.match(request).catch(() => null) : null;
    if (cached) return cached;
    const response = await fetch(request);
    if (cache && response.ok && response.type === "basic" && !response.redirected) {
      const copy = response.clone();
      event.waitUntil((async () => {
        await cache.put(request, copy);
        const keys = await cache.keys();
        await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES)).map((key) => cache.delete(key)));
      })().catch(() => {}));
    }
    return response;
  })());
});
