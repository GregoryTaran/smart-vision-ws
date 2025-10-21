const CACHE_NAME = "smartvision-cache-v2";
const URLS_TO_CACHE = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(URLS_TO_CACHE);
        console.log("✅ Cached successfully");
      } catch (err) {
        console.warn("⚠️ Cache failed, continuing anyway:", err);
      }
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => new Response("Offline", { status: 503 }))
      );
    })
  );
});
