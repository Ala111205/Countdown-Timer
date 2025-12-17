const DB_NAME = "alarmDB";
const STORE_NAME = "alarms";
const VERSION = 3;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);

    req.onupgradeneeded = e => {
      const db = e.target.result;

      let store;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      } else {
        store = e.target.transaction.objectStore(STORE_NAME);
      }

      if (!store.indexNames.contains("time")) {
        store.createIndex("time", "time");
      }

      if (!store.indexNames.contains("status")) {
        store.createIndex("status", "status");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAlarm(alarm) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.put(alarm);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateAlarm(partial) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const existing = await new Promise((resolve, reject) => {
    const req = store.get(partial.id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (!existing) return;

  store.put({ ...existing, ...partial });
  return tx.complete;
}

export async function getAllAlarms() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const req = store.getAll();

    req.onsuccess = () => {
      resolve(req.result ?? []);
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
}

export async function deleteAlarm(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}