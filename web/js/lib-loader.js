/* QR Vault — lib-loader.js
   Loads jsQR (with CDN mirror fallback) for browsers that don't support
   the native BarcodeDetector API. QR generation no longer needs this —
   see js/vendor/qrcode-generator.js, which is fully self-hosted.
*/

const LibLoader = (() => {
  const SOURCES = {
    jsqr: [
      "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
      "https://unpkg.com/jsqr@1.4.0/dist/jsQR.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.js",
    ],
  };

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = url;
      s.async = false;
      s.onload = () => resolve(url);
      s.onerror = () => reject(new Error("load-failed:" + url));
      document.head.appendChild(s);
    });
  }

  async function loadWithFallback(urls, checkGlobal) {
    for (const url of urls) {
      try {
        await loadScript(url);
        if (checkGlobal()) return true;
      } catch (e) {
        // try next mirror
      }
    }
    return false;
  }

  async function loadJsQR() {
    if (typeof window.jsQR !== "undefined") return true;
    return loadWithFallback(SOURCES.jsqr, () => typeof window.jsQR !== "undefined");
  }

  return { loadJsQR };
})();
