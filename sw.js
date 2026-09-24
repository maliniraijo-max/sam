const CACHE_NAME = "sam-learning-shell-v11";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js?v=20260924-101",
  "./manifest.json",
  "./icon.svg",
  "./logos-data.js?v=20260924-101"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  // Keep AI/API requests live; only use the service worker for the app shell.
  if (new URL(request.url).origin !== self.location.origin) return;
  if (request.url.includes("/api/")) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
  );
});