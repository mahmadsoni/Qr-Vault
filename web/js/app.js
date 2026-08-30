/* QR Vault — app.js
   Application bootstrap. Wires together i18n, theme, navigation, the
   Create/Scan/Vault/Settings views, and PWA install/offline handling.
*/

(function () {
  let currentType = "url";
  let currentCanvas = null;
  let logoDataURL = null;
  let deferredInstallPrompt = null;

  function init() {
    I18N.applyTranslations();
    document.documentElement.setAttribute("lang", I18N.getLang());
    document.getElementById("lang-select").value = I18N.getLang();

    const settings = Storage.getSettings();
    UI.applyTheme(settings.theme || "dark");
    document.getElementById("theme-select").value = settings.theme || "dark";

    wireNav();
    wireLanguage();
    wireHome();
    wireCreate();
    wireScan();
    wireVault();
    wireSettings();
    wireInstall();
    wireOffline();

    Vault.refresh();

    const startView = (location.hash || "#home").replace("#", "");
    UI.showView(document.getElementById(`view-${startView}`) ? startView : "home");

    registerServiceWorker();
  }

  function wireNav() {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => UI.showView(btn.dataset.view));
    });
  }

  function wireLanguage() {
    document.getElementById("lang-select").addEventListener("change", (e) => {
      I18N.setLang(e.target.value);
      renderTypeGrid();
      UI.renderFormFields(currentType);
      Vault.refresh();
    });
  }

  function wireHome() {
    document.getElementById("home-create-btn").addEventListener("click", () => UI.showView("create"));
    document.getElementById("home-scan-btn").addEventListener("click", () => UI.showView("scan"));
    document.querySelectorAll("#home-quick-types [data-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        UI.showView("create");
        selectType(btn.dataset.type);
      });
    });
  }

  const QR_TYPES = ["url", "wifi", "contact", "text", "email", "phone", "sms", "location", "whatsapp", "telegram"];
  const TYPE_ICON = {
    text: "📝", url: "🔗", wifi: "📶", contact: "👤", email: "✉️",
    phone: "📞", sms: "💬", location: "📍", whatsapp: "🟢", telegram: "✈️",
  };

  function renderTypeGrid() {
    const grid = document.getElementById("type-grid");
    grid.innerHTML = "";
    QR_TYPES.forEach((type) => {
      const btn = document.createElement("button");
      btn.className = "type-chip" + (type === currentType ? " active" : "");
      btn.dataset.type = type;
      btn.innerHTML = `<span aria-hidden="true">${TYPE_ICON[type]}</span><span>${I18N.t("type_" + type)}</span>`;
      btn.addEventListener("click", () => selectType(type));
      grid.appendChild(btn);
    });
  }

  function selectType(type) {
    currentType = type;
    renderTypeGrid();
    UI.renderFormFields(type);
    clearPreview();
  }

  function clearPreview() {
    const canvas = document.getElementById("qr-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("preview-actions").hidden = true;
  }

  function wireCreate() {
    renderTypeGrid();
    UI.renderFormFields(currentType);

    document.getElementById("qr-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const { data, schema } = UI.collectFormData(currentType);
      const err = UI.validateFormData(currentType, data, schema);
      if (err) {
        UI.toast(err, true);
        return;
      }
      const payload = QRGenerator.buildPayload(currentType, data);
      const canvas = document.getElementById("qr-canvas");
      const opts = readCustomization();
      try {
        await QRGenerator.renderToCanvas(canvas, payload, opts);
        currentCanvas = canvas;
        currentCanvas.dataset.payload = payload;
        document.getElementById("preview-actions").hidden = false;
      } catch (ex) {
        UI.toast(I18N.t("error_generate"), true);
      }
    });

    document.getElementById("btn-reset-custom").addEventListener("click", () => {
      document.getElementById("opt-size").value = 320;
      document.getElementById("opt-margin").value = 4;
      document.getElementById("opt-fg").value = "#00e5ff";
      document.getElementById("opt-bg").value = "#0a0e17";
      document.getElementById("opt-ecc").value = "M";
      logoDataURL = null;
      document.getElementById("opt-logo").value = "";
    });

    document.getElementById("opt-logo").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => (logoDataURL = reader.result);
      reader.readAsDataURL(file);
    });

    document.getElementById("btn-remove-logo").addEventListener("click", () => {
      logoDataURL = null;
      document.getElementById("opt-logo").value = "";
    });

    document.getElementById("btn-download").addEventListener("click", () => {
      if (!currentCanvas) return;
      Utils.downloadDataURL(QRGenerator.canvasToPNG(currentCanvas), `qrvault-${currentType}.png`);
      UI.toast(I18N.t("toast_downloaded"));
    });

    document.getElementById("btn-copy-qr").addEventListener("click", async () => {
      if (!currentCanvas) return;
      try {
        await Utils.copyToClipboard(currentCanvas.dataset.payload);
        UI.toast(I18N.t("toast_copied"));
      } catch (e) {
        UI.toast(I18N.t("error_clipboard"), true);
      }
    });

    document.getElementById("btn-share-qr").addEventListener("click", async () => {
      if (!currentCanvas) return;
      const dataURL = QRGenerator.canvasToPNG(currentCanvas);
      const shared = await Utils.shareContent({
        title: "QR Vault",
        text: currentCanvas.dataset.payload,
        dataURL,
        filename: `qrvault-${currentType}.png`,
      }).catch(() => false);
      if (!shared) UI.toast(I18N.t("error_clipboard"), true);
    });

    document.getElementById("btn-save-vault").addEventListener("click", async () => {
      if (!currentCanvas) return;
      const { data } = UI.collectFormData(currentType);
      const title = data.title || data.ssid || data.name || data.url || data.text || I18N.t("type_" + currentType);
      await Vault.save(currentType, title, currentCanvas.dataset.payload);
      UI.toast(I18N.t("toast_saved"));
      Vault.refresh();
    });
  }

  function readCustomization() {
    return {
      size: parseInt(document.getElementById("opt-size").value, 10) || 320,
      margin: parseInt(document.getElementById("opt-margin").value, 10) || 4,
      fg: document.getElementById("opt-fg").value || "#00e5ff",
      bg: document.getElementById("opt-bg").value || "#0a0e17",
      ecc: document.getElementById("opt-ecc").value || "M",
      logoImage: logoDataURL,
    };
  }

  function wireScan() {
    const startBtn = document.getElementById("btn-scan-start");
    const stopBtn = document.getElementById("btn-scan-stop");
    const againBtn = document.getElementById("btn-scan-again");
    const resultBox = document.getElementById("scan-result-box");
    const statusBox = document.getElementById("scan-status");
    const video = document.getElementById("scan-video");
    const canvas = document.getElementById("scan-canvas");

    let lastValue = null;

    function showStatus(key) {
      statusBox.hidden = false;
      statusBox.textContent = I18N.t(key);
    }

    startBtn.addEventListener("click", () => {
      resultBox.hidden = true;
      statusBox.hidden = true;
      startBtn.hidden = true;
      stopBtn.hidden = false;
      video.hidden = false;

      QRScanner.start({
        video,
        canvas,
        onDetect: (value) => {
          if (value === lastValue) return;
          lastValue = value;
          onScanResult(value);
        },
        onError: (err) => {
          startBtn.hidden = false;
          stopBtn.hidden = true;
          video.hidden = true;
          if (err.code === "denied") showStatus("scan_denied");
          else if (err.code === "unavailable") showStatus("scan_unavailable");
          else showStatus("scan_unsupported");
        },
      });
    });

    stopBtn.addEventListener("click", () => {
      QRScanner.stop();
      startBtn.hidden = false;
      stopBtn.hidden = true;
      video.hidden = true;
    });

    againBtn.addEventListener("click", () => {
      lastValue = null;
      resultBox.hidden = true;
      startBtn.click();
    });

    function onScanResult(value) {
      QRScanner.stop();
      video.hidden = true;
      stopBtn.hidden = true;
      startBtn.hidden = true;
      resultBox.hidden = false;
      document.getElementById("scan-result-text").textContent = value;

      const openBtn = document.getElementById("btn-scan-open");
      openBtn.hidden = !Utils.isSafeURL(value);
      openBtn.onclick = () => Utils.safeOpen(value);

      document.getElementById("btn-scan-copy").onclick = async () => {
        try {
          await Utils.copyToClipboard(value);
          UI.toast(I18N.t("toast_copied"));
        } catch (e) {
          UI.toast(I18N.t("error_clipboard"), true);
        }
      };
      document.getElementById("btn-scan-save").onclick = async () => {
        await Vault.save("text", value.slice(0, 40), value);
        UI.toast(I18N.t("toast_saved"));
        Vault.refresh();
      };
    }
  }

  function wireVault() {
    document.getElementById("vault-search").addEventListener(
      "input",
      Utils.debounce((e) => Vault.setQuery(e.target.value), 200)
    );
    document.querySelectorAll("#vault-filters [data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#vault-filters [data-filter]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        Vault.setFilter(btn.dataset.filter);
      });
    });
    document.getElementById("btn-clear-vault-main").addEventListener("click", () => {
      UI.confirmDialog(I18N.t("vault_confirm_clear"), async () => {
        await Vault.clearAll();
        UI.toast(I18N.t("toast_cleared"));
      });
    });
  }

  function wireSettings() {
    document.getElementById("theme-select").addEventListener("change", (e) => {
      Storage.saveSettings({ theme: e.target.value });
      UI.applyTheme(e.target.value);
    });
    document.getElementById("btn-clear-vault-settings").addEventListener("click", () => {
      UI.confirmDialog(I18N.t("vault_confirm_clear"), async () => {
        await Vault.clearAll();
        UI.toast(I18N.t("toast_cleared"));
      });
    });
    document.getElementById("btn-clear-history").addEventListener("click", () => {
      UI.confirmDialog(I18N.t("vault_confirm_clear"), async () => {
        await Vault.clearAll();
        UI.toast(I18N.t("toast_cleared"));
      });
    });
  }

  function wireInstall() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      document.getElementById("btn-install").hidden = false;
    });
    document.getElementById("btn-install").addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      document.getElementById("btn-install").hidden = true;
    });
  }

  function wireOffline() {
    const banner = document.getElementById("offline-banner");
    function update() {
      banner.hidden = navigator.onLine;
    }
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {
          // Offline-first still works for the current session even if
          // registration fails (e.g. unsupported browser).
        });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
