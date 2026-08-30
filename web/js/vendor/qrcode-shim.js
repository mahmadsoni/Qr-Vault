/* QR Vault — vendor/qrcode-shim.js
   Exposes window.QRCode.toCanvas(canvas, text, options, callback) using
   the self-hosted vendor/qrcode-generator.js — same call signature the
   app already used for the (now removed) CDN "qrcode" library, so no
   other app code needed to change.
*/
(function () {
  window.QRCode = window.QRCode || {};

  window.QRCode.toCanvas = function (canvas, text, options, callback) {
    try {
      options = options || {};
      var width = options.width || 256;
      var margin = options.margin != null ? options.margin : 4;
      var ecMap = { low: "L", medium: "M", quartile: "Q", high: "H" };
      var level = ecMap[options.errorCorrectionLevel] || "M";
      var dark = (options.color && options.color.dark) || "#000000";
      var light = (options.color && options.color.light) || "#ffffff";

      var qr = qrcode(0, level); // typeNumber 0 = auto-select smallest version
      qr.addData(text);
      qr.make();

      var moduleCount = qr.getModuleCount();
      var cellSize = Math.max(1, Math.floor(width / (moduleCount + margin * 2)));
      var imageSize = cellSize * (moduleCount + margin * 2);

      canvas.width = imageSize;
      canvas.height = imageSize;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, imageSize, imageSize);
      ctx.fillStyle = dark;
      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {
          if (qr.isDark(row, col)) {
            ctx.fillRect((col + margin) * cellSize, (row + margin) * cellSize, cellSize, cellSize);
          }
        }
      }
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
      else throw err;
    }
  };
})();
