const CACHE_NAME = "todo-pro-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./firebase.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Install
self.addEventListener("install", (event) => {
  console.log("Service Worker Installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          return caches.match("./index.html");
        })
      );
    })
  );
});
