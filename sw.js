const CACHE_NAME = "memory-snap-v20260715-01";
const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css?v=20260715-01",
  "/app.js?v=20260715-01",
  "/manifest.webmanifest",
  "/privacy.html",
  "/assets/room-bg.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/objects/book.png",
  "/assets/objects/camera.png",
  "/assets/objects/clock.png",
  "/assets/objects/headphones.png",
  "/assets/objects/key.png",
  "/assets/objects/mug.png",
  "/assets/objects/phone.png",
  "/assets/objects/trophy.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin.includes("execute-api")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (request.method === "GET" && response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
