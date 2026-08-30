/* QR Vault — qr-generator.js
   Builds the correct payload string for each QR type and renders it to a
   <canvas> using the "qrcode" library (window.QRCode), with optional
   customization (size, margin, colors, error correction, center logo).
*/

const QRGenerator = (() => {
  function buildPayload(type, data) {
    switch (type) {
      case "text":
        return data.text || "";

      case "url": {
        let url = (data.url || "").trim();
        if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
        return url;
      }

      case "wifi": {
        const ssid = Utils.escapeWifiValue(data.ssid || "");
        const pass = Utils.escapeWifiValue(data.password || "");
        const sec = data.security === "none" ? "nopass" : (data.security || "WPA").toUpperCase();
        const hidden = data.hidden ? "true" : "false";
        const passPart = sec === "nopass" ? "" : `P:${pass};`;
        return `WIFI:T:${sec};S:${ssid};${passPart}H:${hidden};;`;
      }

      case "contact": {
        const n = Utils.vcardEscape(data.name || "");
        const phone = Utils.vcardEscape(data.phone || "");
        const email = Utils.vcardEscape(data.email || "");
        const org = Utils.vcardEscape(data.org || "");
        const site = Utils.vcardEscape(data.site || "");
        let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
        vcard += `N:${n}\nFN:${n}\n`;
        if (org) vcard += `ORG:${org}\n`;
        if (phone) vcard += `TEL;TYPE=CELL:${phone}\n`;
        if (email) vcard += `EMAIL:${email}\n`;
        if (site) vcard += `URL:${site}\n`;
        vcard += "END:VCARD";
        return vcard;
      }

      case "email": {
        const to = encodeURIComponent(data.to || "");
        const subject = encodeURIComponent(data.subject || "");
        const body = encodeURIComponent(data.body || "");
        return `mailto:${to}?subject=${subject}&body=${body}`;
      }

      case "phone":
        return `tel:${(data.phone || "").replace(/\s+/g, "")}`;

      case "sms": {
        const phone = (data.phone || "").replace(/\s+/g, "");
        const msg = encodeURIComponent(data.message || "");
        return `SMSTO:${phone}:${decodeURIComponent(msg)}`;
      }

      case "location": {
        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        return `geo:${isFinite(lat) ? lat : 0},${isFinite(lng) ? lng : 0}`;
      }

      case "whatsapp": {
        const phone = (data.phone || "").replace(/[^\d]/g, "");
        const msg = encodeURIComponent(data.message || "");
        return `https://wa.me/${phone}${msg ? `?text=${msg}` : ""}`;
      }

      case "telegram": {
        const username = (data.username || "").replace(/^@/, "");
        return `https://t.me/${username}`;
      }

      default:
        return "";
    }
  }

  function eccToLevel(ecc) {
    // Map friendly names to the "qrcode" library's expected values.
    const map = { L: "low", M: "medium", Q: "quartile", H: "high" };
    return map[ecc] || "medium";
  }

  /**
   * Renders a QR code onto the given canvas element.
   * options: { size, margin, fg, bg, ecc, logoImage }
   */
  function renderToCanvas(canvas, payload, options = {}) {
    return new Promise((resolve, reject) => {
      if (!payload) {
        reject(new Error("empty-payload"));
        return;
      }
      if (typeof QRCode === "undefined") {
        reject(new Error("qrcode-lib-missing"));
        return;
      }
      const size = options.size || 320;
      const margin = options.margin ?? 4;
      const fg = options.fg || "#00e5ff";
      const bg = options.bg || "#0a0e17";
      const ecLevel = eccToLevel(options.ecc || "M");

      QRCode.toCanvas(
        canvas,
        payload,
        {
          width: size,
          margin,
          errorCorrectionLevel: ecLevel,
          color: { dark: fg, light: bg },
        },
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          if (options.logoImage) {
            drawLogo(canvas, options.logoImage, size);
          }
          resolve(canvas);
        }
      );
    });
  }

  function drawLogo(canvas, imgSrc, size) {
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const logoSize = Math.round(size * 0.22);
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      const pad = Math.round(logoSize * 0.12);
      // White rounded backing plate so the logo stays readable/scannable.
      ctx.save();
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 10);
      ctx.fill();
      ctx.restore();
      ctx.drawImage(img, x, y, logoSize, logoSize);
    };
    img.src = imgSrc;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function canvasToPNG(canvas) {
    return canvas.toDataURL("image/png");
  }

  return { buildPayload, renderToCanvas, canvasToPNG };
})();
