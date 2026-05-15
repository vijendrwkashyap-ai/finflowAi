// Minimal service worker — required for PWA installability on Chrome/Android.
// No caching: always fetch from network so deploys are never stale.
self.addEventListener("install", (e) => {
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  // Pass-through fetch handler (presence required for install criteria).
  event.respondWith(fetch(event.request).catch(() => new Response("", { status: 504 })));
});
