/* QR Vault — storage.js
   IndexedDB-backed vault storage. No network calls, ever.
*/

const Storage = (() => {
  const DB_NAME = "qrvault_db";
  const DB_VERSION = 1;
  const STORE = "records";

  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("indexeddb-unsupported"));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("favorite", "favorite", { unique: false });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => reject(req.error || new Error("indexeddb-open-failed"));
    });
    return dbPromise;
  }

  async function addRecord(record) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve(record);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getAllRecords() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function getRecord(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteRecord(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function clearAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function toggleFavorite(id) {
    const rec = await getRecord(id);
    if (!rec) return null;
    rec.favorite = !rec.favorite;
    await addRecord(rec);
    return rec;
  }

  // --- Settings (small, non-relational -> localStorage is fine and simpler) ---
  const SETTINGS_KEY = "qrvault_settings";
  const DEFAULT_SETTINGS = { theme: "dark" };

  function getSettings() {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(patch) {
    const merged = { ...getSettings(), ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  }

  return {
    addRecord,
    getAllRecords,
    getRecord,
    deleteRecord,
    clearAll,
    toggleFavorite,
    getSettings,
    saveSettings,
  };
})();
