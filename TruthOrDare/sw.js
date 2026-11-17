const CACHE_PREFIX = "tod-shell-";
const CACHE_NAME = "tod-shell-v3";
const APP_FILES = ["./","./index.html","./styles.css","./app.js","./storage.js","./manifest.webmanifest","./icon.svg"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_FILES.map(async path => {
      try {
        const absoluteUrl = new URL(path, self.registration.scope).href;
        const response = await fetch(absoluteUrl, { cache: "reload" });
        if (response && response.ok) await cache.put(absoluteUrl, response);
      } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        await cache.put(request, response.clone());
        if (request.mode === "navigate") {
          const indexUrl = new URL("./index.html", self.registration.scope).href;
          await cache.put(indexUrl, response.clone());
        }
      }
      return response;
    } catch (_) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        const indexUrl = new URL("./index.html", self.registration.scope).href;
        const rootUrl = new URL("./", self.registration.scope).href;
        return (await cache.match(indexUrl)) || (await cache.match(rootUrl));
      }
      return Response.error();
    }
  })());
});
