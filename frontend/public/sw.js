// D13 PWA Service Worker — cache leve para offline básico
const CACHE = "oneverso-v1";
const ASSETS = ["/", "/dashboard", "/marketplaces", "/manifest.json"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => null)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // network-first para API/tRPC; cache-first para assets
  if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/webhooks/")) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res && res.status === 200 && u.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => null);
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
