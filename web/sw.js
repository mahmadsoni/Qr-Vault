/* QR Vault — sw.js
   Offline-first service worker. Caches the app shell on install so the
   app keeps working with no network after the first successful load.
   No QR data is ever cached or transmitted — this only caches static
   assets needed to render the UI.
*/

const CACHE_NAME = "qrvault-cache-v3";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/responsive.css",
  "./js/i18n.js",
  "./js/utils.js",
  "./js/storage.js",
  "./js/qr-generator.js",
  "./js/qr-scanner.js",
  "./js/lib-loader.js",
  "./js/vendor/qrcode-generator.js",
  "./js/vendor/qrcode-shim.js",
  "./js/ui.js",
  "./js/vault.js",
  "./js/app.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(CORE_ASSETS).catch(() => {
        // Third-party CDN assets may fail during install on flaky
        // connections; the rest of the shell still gets cached and the
        // CDN scripts will be cached lazily on first successful fetch.
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached || caches.match("./index.html"));
      // Cache-first for speed and offline reliability; refresh in the background.
      return cached || networkFetch;
    })
  );
});
