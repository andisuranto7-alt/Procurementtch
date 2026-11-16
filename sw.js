/* Abnormality TCH — service worker (cache app shell saja, data live selalu dari jaringan) */
const CACHE = "abnormality-tch-v1";
const ASSETS = ["abnormality.html", "manifest.json", "icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Data Google Sheet: selalu jaringan (live), jangan cache
  if (url.hostname.includes("docs.google.com") || url.hostname.includes("googleapis.com")) {
    return;
  }
  // File app sendiri: cache dulu, fallback jaringan
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match("abnormality.html")))
    );
  }
});
