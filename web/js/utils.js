/* QR Vault — utils.js
   Small dependency-free helpers shared across modules.
*/

const Utils = (() => {
  function uid() {
    return "qr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function formatDate(iso, lang) {
    try {
      const d = new Date(iso);
      const locale = lang === "ru" ? "ru-RU" : lang === "tj" ? "tg-TJ" : "en-US";
      return d.toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  // Escapes text before it is ever placed via innerHTML. Used everywhere
  // decoded / user-supplied QR content is rendered.
  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

  function isSafeURL(value) {
    try {
      const url = new URL(value, window.location.href);
      return SAFE_PROTOCOLS.includes(url.protocol);
    } catch (e) {
      return false;
    }
  }

  function looksLikeURL(value) {
    return /^https?:\/\/.+/i.test(value.trim());
  }

  function isValidURL(value) {
    if (!looksLikeURL(value)) return false;
    try {
      new URL(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Safely open a link: only ever navigates for whitelisted protocols.
  function safeOpen(value) {
    if (isSafeURL(value)) {
      window.open(value, "_blank", "noopener,noreferrer");
      return true;
    }
    return false;
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older / non-secure contexts.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    if (!ok) throw new Error("clipboard-unavailable");
    return true;
  }

  function downloadDataURL(dataURL, filename) {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function shareContent({ title, text, url, dataURL, filename }) {
    if (navigator.share) {
      try {
        if (dataURL && navigator.canShare) {
          const blob = await (await fetch(dataURL)).blob();
          const file = new File([blob], filename || "qrcode.png", { type: blob.type });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ title, text, files: [file] });
            return true;
          }
        }
        await navigator.share({ title, text, url });
        return true;
      } catch (e) {
        if (e.name === "AbortError") return false;
        throw e;
      }
    }
    return false;
  }

  function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function escapeWifiValue(v) {
    // Per Wi-Fi QR spec: escape backslash, semicolon, comma, colon, quote.
    return String(v).replace(/([\\;,":])/g, "\\$1");
  }

  function vcardEscape(v) {
    return String(v).replace(/([,;\\])/g, "\\$1");
  }

  return {
    uid,
    nowISO,
    formatDate,
    escapeHTML,
    isSafeURL,
    isValidURL,
    looksLikeURL,
    safeOpen,
    copyToClipboard,
    downloadDataURL,
    shareContent,
    debounce,
    escapeWifiValue,
    vcardEscape,
  };
})();
