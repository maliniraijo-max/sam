const CACHE_NAME = "sam-learning-shell-v23";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js?v=20260924-106",
  "./manifest.json",
  "./icon.svg",
  "./logos-data.js?v=20260924-106",
  "./quiz.html",
  "./quiz.js?v=20260925-001",
  "./logos-400-data.js?v=20260925-001",
  "./call.html",
  "./call.js?v=20260925-002",
  "./call-home.js?v=20260925-001",
  "./explore.html",
  "./site-viewer.html",
  "./site-viewer.js?v=20260925-001",
  "./explore.js?v=20260925-006"
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