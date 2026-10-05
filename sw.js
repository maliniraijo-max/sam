const CACHE_NAME = "sam-learning-shell-v56";
const APP_SHELL = [
  "./",
  "./index.html",
  "./games.html",
  "./games.css?v=20261005-001",
  "./games.js?v=20261005-001",
  "./chat.html",
  "./chat.js?v=20260925-001",
  "./style.css",
  "./script.js?v=20261001-001",
  "./mousetronaut.html",
  "./mousetronaut.js?v=20261001-002",
  "./flowering-fruiting.html",
  "./flowering-fruiting.js?v=20261001-002",
  "./fractions.html",
  "./fractions.js?v=20261001-002",
  "./fractions-learning.html",
  "./fractions-learning.css?v=20261001-001",
  "./fractions-learning.js?v=20261001-001",
  "./catechism.html",
  "./catechism-quiz.html",
  "./catechism.css?v=20261004-001",
  "./catechism.js?v=20261004-001",
  "./catechism-learning.html",
  "./catechism-ppt.css?v=20261004-001",
  "./catechism-ppt.js?v=20261004-001",
  "./catechism-chapter1.html",
  "./catechism-chapter2.html",
  "./catechism-chapter3.html",
  "./catechism-chapter4.html",
  "./catechism-chapter5.html",
  "./daily-world.html",
  "./daily-world.css?v=20261004-002",
  "./daily-world.js?v=20261004-002",
  "./daily-world-quiz.html",
  "./daily-world-quiz.js?v=20261004-001",
  "./daily-world.json",
  "./quiz.html",
  "./quiz.js?v=20261005-001",
  "./quiz-play.html",
  "./quiz-play.js?v=20261004-002",
  "./quiz.css?v=20261004-001",
  "./daily-quiz.json",
  "./communicate.html",
  "./communicate.js?v=20261005-001",
  "./communicate-level.html",
  "./communicate-level.js?v=20261005-001",
  "./communicate.css?v=20261005-001",
  "./german.html",
  "./german.js?v=20261005-001",
  "./german.css?v=20261005-001",
  "./german-level.html",
  "./german-level.js?v=20261005-001",
  "./results.js?v=20261001-001",
  "./video.js?v=20260925-001",
  "./manifest.json",
  "./icon.svg",
  "./heaven-bg.svg",
  "./call.html",
  "./call.js?v=20260925-002",
  "./call-home.js?v=20260925-001",
  "./explore.html",
  "./site-viewer.html",
  "./site-viewer.js?v=20260925-001",
  "./explore.js?v=20260925-013",
  "./api/family-chat.js",
  "./api/whatsapp-webhook.js"
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