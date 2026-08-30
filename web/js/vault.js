/* QR Vault — vault.js
   Renders and manages the Vault view (list of saved QR records).
*/

const Vault = (() => {
  let allRecords = [];
  let filter = "all"; // "all" | "fav"
  let query = "";

  const typeIcon = {
    text: "📝", url: "🔗", wifi: "📶", contact: "👤", email: "✉️",
    phone: "📞", sms: "💬", location: "📍", whatsapp: "🟢", telegram: "✈️",
  };

  async function refresh() {
    allRecords = await Storage.getAllRecords();
    render();
    updateHomeStats();
  }

  function setFilter(f) {
    filter = f;
    render();
  }

  function setQuery(q) {
    query = q.toLowerCase();
    render();
  }

  function getVisible() {
    return allRecords.filter((r) => {
      if (filter === "fav" && !r.favorite) return false;
      if (!query) return true;
      return (
        (r.title || "").toLowerCase().includes(query) ||
        (r.data || "").toLowerCase().includes(query)
      );
    });
  }

  function render() {
    const list = document.getElementById("vault-list");
    const empty = document.getElementById("vault-empty");
    if (!list) return;
    const items = getVisible();
    list.innerHTML = "";

    if (items.length === 0) {
      empty.hidden = false;
      empty.textContent = I18N.t("vault_empty");
      return;
    }
    empty.hidden = true;

    const lang = I18N.getLang();
    items.forEach((rec) => {
      const card = document.createElement("div");
      card.className = "vault-card glass";
      card.setAttribute("role", "listitem");

      const icon = typeIcon[rec.type] || "📄";
      const title = Utils.escapeHTML(rec.title || I18N.t("type_" + rec.type) || rec.type);
      const dateStr = Utils.escapeHTML(Utils.formatDate(rec.createdAt, lang));

      card.innerHTML = `
        <div class="vault-card-icon" aria-hidden="true">${icon}</div>
        <div class="vault-card-body">
          <div class="vault-card-title">${title}</div>
          <div class="vault-card-meta">${I18N.t("vault_created")}: ${dateStr}</div>
        </div>
        <div class="vault-card-actions">
          <button class="icon-btn fav-btn ${rec.favorite ? "active" : ""}" data-action="fav" aria-label="favorite">★</button>
          <button class="icon-btn" data-action="open" aria-label="${I18N.t("btn_open")}">👁</button>
          <button class="icon-btn" data-action="copy" aria-label="${I18N.t("btn_copy")}">📋</button>
          <button class="icon-btn" data-action="delete" aria-label="${I18N.t("btn_delete")}">🗑</button>
        </div>
      `;

      card.querySelector('[data-action="fav"]').addEventListener("click", async () => {
        await Storage.toggleFavorite(rec.id);
        refresh();
      });
      card.querySelector('[data-action="open"]').addEventListener("click", () => {
        UI.openVaultRecord(rec);
      });
      card.querySelector('[data-action="copy"]').addEventListener("click", async () => {
        try {
          await Utils.copyToClipboard(rec.data);
          UI.toast(I18N.t("toast_copied"));
        } catch (e) {
          UI.toast(I18N.t("error_clipboard"), true);
        }
      });
      card.querySelector('[data-action="delete"]').addEventListener("click", () => {
        UI.confirmDialog(I18N.t("vault_confirm_delete"), async () => {
          await Storage.deleteRecord(rec.id);
          UI.toast(I18N.t("toast_deleted"));
          refresh();
        });
      });

      list.appendChild(card);
    });
  }

  async function save(type, title, data) {
    const record = {
      id: Utils.uid(),
      type,
      title: title || "",
      data,
      createdAt: Utils.nowISO(),
      favorite: false,
    };
    await Storage.addRecord(record);
    return record;
  }

  async function clearAll() {
    await Storage.clearAll();
    await refresh();
  }

  async function updateHomeStats() {
    const el = document.getElementById("home-vault-stats");
    if (!el) return;
    const total = allRecords.length;
    const favs = allRecords.filter((r) => r.favorite).length;
    el.textContent = `${total} · ${I18N.t("nav_vault")} · ${favs} ${I18N.t("vault_filter_fav")}`;
  }

  return { refresh, setFilter, setQuery, save, clearAll, getVisible };
})();
