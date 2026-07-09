const CACHE_NAME = "flipple-v0.3.2-cubed-audio-palette";

const APP_SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/config.js",
  "/manifest.webmanifest",
  "/assets/favicon.svg",
  "/assets/icon-180.png",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/casual-unsuspecting-maintenance.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Leave ads, analytics, fonts, and other third-party requests alone.
  if (url.origin !== self.location.origin) return;

  // Do not cache daily API responses, or the daily puzzle could get stale.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });

          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
