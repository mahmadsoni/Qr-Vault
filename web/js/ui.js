/* QR Vault — ui.js
   Reusable UI primitives: navigation, toasts, modals, theme, and the
   dynamic form builder used by the Create view.
*/

const UI = (() => {
  function showView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const target = document.getElementById(`view-${name}`);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-item").forEach((n) => {
      n.classList.toggle("active", n.dataset.view === name);
    });

    if (name !== "scan") QRScanner.stop();
    history.replaceState(null, "", `#${name}`);
  }

  function toast(message, isError = false) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const el = document.createElement("div");
    el.className = "toast" + (isError ? " toast-error" : "");
    el.textContent = message;
    el.setAttribute("role", "status");
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  function confirmDialog(message, onConfirm) {
    const modal = document.getElementById("confirm-modal");
    const msgEl = document.getElementById("confirm-message");
    const okBtn = document.getElementById("confirm-ok");
    const cancelBtn = document.getElementById("confirm-cancel");
    msgEl.textContent = message;
    modal.hidden = false;
    modal.classList.add("open");

    const close = () => {
      modal.classList.remove("open");
      modal.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
    };
    const onOk = () => {
      close();
      onConfirm();
    };
    const onCancel = () => close();

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  }

  function applyTheme(theme) {
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : theme;
    document.documentElement.setAttribute("data-theme", resolved);
  }

  // --- Dynamic form fields per QR type ---
  const FORM_SCHEMAS = {
    text: [{ id: "text", labelKey: "field_text", type: "textarea", required: true }],
    url: [{ id: "url", labelKey: "field_url", type: "url", required: true, placeholderKey: "field_url" }],
    wifi: [
      { id: "ssid", labelKey: "field_wifi_ssid", type: "text", required: true },
      { id: "password", labelKey: "field_wifi_password", type: "password", required: false },
      {
        id: "security",
        labelKey: "field_wifi_security",
        type: "select",
        required: true,
        options: [
          { value: "WPA", labelKey: "security_wpa" },
          { value: "WEP", labelKey: "security_wep" },
          { value: "none", labelKey: "security_none" },
        ],
      },
      { id: "hidden", labelKey: "field_wifi_hidden", type: "checkbox", required: false },
    ],
    contact: [
      { id: "name", labelKey: "field_contact_name", type: "text", required: true },
      { id: "phone", labelKey: "field_contact_phone", type: "tel", required: false },
      { id: "email", labelKey: "field_contact_email", type: "email", required: false },
      { id: "org", labelKey: "field_contact_org", type: "text", required: false },
      { id: "site", labelKey: "field_contact_site", type: "url", required: false },
    ],
    email: [
      { id: "to", labelKey: "field_email_to", type: "email", required: true },
      { id: "subject", labelKey: "field_email_subject", type: "text", required: false },
      { id: "body", labelKey: "field_email_body", type: "textarea", required: false },
    ],
    phone: [{ id: "phone", labelKey: "field_phone", type: "tel", required: true }],
    sms: [
      { id: "phone", labelKey: "field_sms_phone", type: "tel", required: true },
      { id: "message", labelKey: "field_sms_message", type: "textarea", required: false },
    ],
    location: [
      { id: "lat", labelKey: "field_location_lat", type: "number", required: true, step: "any" },
      { id: "lng", labelKey: "field_location_lng", type: "number", required: true, step: "any" },
    ],
    whatsapp: [
      { id: "phone", labelKey: "field_whatsapp_phone", type: "tel", required: true },
      { id: "message", labelKey: "field_whatsapp_message", type: "textarea", required: false },
    ],
    telegram: [{ id: "username", labelKey: "field_telegram_username", type: "text", required: true }],
  };

  function renderFormFields(type) {
    const container = document.getElementById("create-fields");
    container.innerHTML = "";
    const schema = FORM_SCHEMAS[type] || [];

    schema.forEach((field) => {
      const wrap = document.createElement("div");
      wrap.className = field.type === "checkbox" ? "form-field form-field-checkbox" : "form-field";

      const label = document.createElement("label");
      label.setAttribute("for", `f-${field.id}`);
      label.textContent = I18N.t(field.labelKey) + (field.required ? " *" : "");

      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 3;
      } else if (field.type === "select") {
        input = document.createElement("select");
        field.options.forEach((opt) => {
          const o = document.createElement("option");
          o.value = opt.value;
          o.textContent = I18N.t(opt.labelKey);
          input.appendChild(o);
        });
      } else if (field.type === "checkbox") {
        input = document.createElement("input");
        input.type = "checkbox";
      } else {
        input = document.createElement("input");
        input.type = field.type;
        if (field.step) input.step = field.step;
      }
      input.id = `f-${field.id}`;
      input.name = field.id;
      if (field.required) input.required = true;
      if (field.placeholderKey && "placeholder" in input) input.placeholder = I18N.t(field.placeholderKey);

      if (field.type === "checkbox") {
        wrap.appendChild(input);
        wrap.appendChild(label);
      } else {
        wrap.appendChild(label);
        wrap.appendChild(input);
      }
      container.appendChild(wrap);
    });
  }

  function collectFormData(type) {
    const schema = FORM_SCHEMAS[type] || [];
    const data = {};
    schema.forEach((field) => {
      const el = document.getElementById(`f-${field.id}`);
      if (!el) return;
      data[field.id] = field.type === "checkbox" ? el.checked : el.value.trim();
    });
    return { data, schema };
  }

  function validateFormData(type, data, schema) {
    for (const field of schema) {
      if (field.required && field.type !== "checkbox" && !data[field.id]) {
        return I18N.t("error_empty_field");
      }
    }
    if (type === "url" && data.url && !Utils.isValidURL(/^https?:\/\//i.test(data.url) ? data.url : "https://" + data.url)) {
      return I18N.t("error_invalid_url");
    }
    return null;
  }

  function openVaultRecord(rec) {
    const modal = document.getElementById("record-modal");
    const canvas = document.getElementById("record-canvas");
    const dataEl = document.getElementById("record-data");
    dataEl.textContent = rec.data;

    QRGenerator.renderToCanvas(canvas, rec.data, { size: 260 }).catch(() => {});

    modal.hidden = false;
    modal.classList.add("open");

    document.getElementById("record-close").onclick = () => {
      modal.hidden = true;
      modal.classList.remove("open");
    };
    document.getElementById("record-copy").onclick = async () => {
      try {
        await Utils.copyToClipboard(rec.data);
        toast(I18N.t("toast_copied"));
      } catch (e) {
        toast(I18N.t("error_clipboard"), true);
      }
    };
    document.getElementById("record-download").onclick = () => {
      Utils.downloadDataURL(QRGenerator.canvasToPNG(canvas), `qrvault-${rec.id}.png`);
      toast(I18N.t("toast_downloaded"));
    };
    document.getElementById("record-open").onclick = () => {
      if (!Utils.safeOpen(rec.data)) toast(I18N.t("scan_invalid"), true);
    };
    document.getElementById("record-delete").onclick = () => {
      confirmDialog(I18N.t("vault_confirm_delete"), async () => {
        await Storage.deleteRecord(rec.id);
        modal.hidden = true;
        modal.classList.remove("open");
        toast(I18N.t("toast_deleted"));
        Vault.refresh();
      });
    };
  }

  return {
    showView,
    toast,
    confirmDialog,
    applyTheme,
    renderFormFields,
    collectFormData,
    validateFormData,
    openVaultRecord,
    FORM_SCHEMAS,
  };
})();
