// Connect AI PWA Service Worker
// version: pwa_v1 — auto-generated
const CACHE = "my-app-v1";
const ASSETS = ["/", "/manifest.json", "/icon-192.svg", "/icon-512.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{/* offline OK */})));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{/* ignore */});
      return res;
    }).catch(() => caches.match("/") || new Response("offline", { status: 503 })))
  );
});
