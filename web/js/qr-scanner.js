/* QR Vault — qr-scanner.js
   Real camera QR scanner. The camera is only ever requested when the
   user explicitly opens the scanner view, and is fully stopped when the
   view is closed or the app is hidden.

   Decoding prefers the browser's native BarcodeDetector API (built in,
   no network needed). If that's unavailable, it falls back to jsQR,
   loaded from a CDN (see lib-loader.js) only at that point.
*/

const QRScanner = (() => {
  let stream = null;
  let videoEl = null;
  let canvasEl = null;
  let canvasCtx = null;
  let rafId = null;
  let onResult = null;
  let scanning = false;
  let detector = null; // native BarcodeDetector instance, if available
  let useJsQR = false;

  async function pickDecoder() {
    if ("BarcodeDetector" in window) {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        if (formats.includes("qr_code")) {
          detector = new window.BarcodeDetector({ formats: ["qr_code"] });
          return "native";
        }
      } catch (e) {
        // fall through to jsQR
      }
    }
    const ok = await LibLoader.loadJsQR();
    if (ok) {
      useJsQR = true;
      return "jsqr";
    }
    return null;
  }

  async function start({ video, canvas, onDetect, onError }) {
    videoEl = video;
    canvasEl = canvas;
    canvasCtx = canvas.getContext("2d", { willReadFrequently: true });
    onResult = onDetect;
    detector = null;
    useJsQR = false;

    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      onError({ code: "unsupported" });
      return;
    }

    const decoder = await pickDecoder();
    if (!decoder) {
      onError({ code: "unsupported" });
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        onError({ code: "denied" });
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        onError({ code: "unavailable" });
      } else {
        onError({ code: "unavailable", detail: err.message });
      }
      return;
    }

    videoEl.srcObject = stream;
    videoEl.setAttribute("playsinline", "true");
    await videoEl.play();
    scanning = true;
    tick();
  }

  async function tick() {
    if (!scanning) return;
    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      canvasCtx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

      try {
        if (detector) {
          const codes = await detector.detect(canvasEl);
          if (codes && codes.length && codes[0].rawValue) {
            onResult(codes[0].rawValue);
          }
        } else if (useJsQR && typeof jsQR === "function") {
          const imageData = canvasCtx.getImageData(0, 0, canvasEl.width, canvasEl.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code && code.data) onResult(code.data);
        }
      } catch (e) {
        // Transient decode errors are ignored; scanning continues.
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    scanning = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    if (videoEl) {
      videoEl.pause();
      videoEl.srcObject = null;
    }
  }

  return { start, stop };
})();

// Defensive: never let the camera stay on if the tab is hidden.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) QRScanner.stop();
});
