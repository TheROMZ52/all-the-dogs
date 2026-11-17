const DB_NAME = "truth-or-dare-data";
const DB_VERSION = 1;
const STORE_NAME = "snapshots";
const RECORD_ID = "main";
const BACKUP_KEY = "tod_backup_v3";
const LEGACY_STATE_KEY = "tod_state_v2";
const LEGACY_PLAYERS_KEY = "tod_players";
const LEVELS = new Set(["all", "easy", "medium", "bold"]);
const CATEGORIES = new Set(["all", "fun", "friends", "school", "creative", "social"]);
const STAGES = new Set(["idle", "choose", "prompt", "next"]);

function cleanString(value, max = 500) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max) : "";
}
function cleanPlayers(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  const seen = new Set();
  for (const item of value) {
    const name = cleanString(item, 24).replace(/\s+/g, " ");
    const key = name.normalize("NFKC").toLocaleLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
    if (result.length >= 40) break;
  }
  return result;
}
function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map(item => ({
    asker: cleanString(item && item.asker, 24),
    answerer: cleanString(item && item.answerer, 24),
    kind: item && item.kind === "dare" ? "dare" : "truth",
    text: cleanString(item && item.text, 800),
    skipped: Boolean(item && item.skipped),
    round: Math.max(0, Number(item && item.round) || 0),
    createdAt: Math.max(0, Number(item && item.createdAt) || 0)
  })).filter(item => item.asker && item.answerer && item.text);
}

export function normalizeState(input = {}) {
  const raw = input && typeof input === "object" ? (input.state && typeof input.state === "object" ? input.state : input) : {};
  const filters = raw.filters && typeof raw.filters === "object" ? raw.filters : {};
  const levelCandidate = filters.level || raw.level || "all";
  const categoryCandidate = filters.category || raw.category || "all";
  const current = Array.isArray(raw.current) && raw.current.length >= 3
    ? [cleanString(raw.current[0], 16), cleanString(raw.current[1], 24), cleanString(raw.current[2], 800)]
    : null;
  const used = Array.isArray(raw.used)
    ? [...new Set(raw.used.filter(item => typeof item === "string" && item.length <= 1000))].slice(0, 5000)
    : [];
  return {
    schemaVersion: 3,
    savedAt: Math.max(0, Number(raw.savedAt) || 0),
    players: cleanPlayers(raw.players),
    round: Math.max(0, Math.min(1000000, Math.floor(Number(raw.round) || 0))),
    asker: cleanString(raw.asker, 24),
    answerer: cleanString(raw.answerer, 24),
    kind: raw.kind === "dare" || raw.kind === "truth" ? raw.kind : "",
    current,
    used,
    history: cleanHistory(raw.history),
    stage: STAGES.has(raw.stage) ? raw.stage : "idle",
    filters: {
      level: LEVELS.has(levelCandidate) ? levelCandidate : "all",
      category: CATEGORIES.has(categoryCandidate) ? categoryCandidate : "all"
    }
  };
}
function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}
export class StateStorage {
  constructor() {
    this.dbPromise = this.openDatabase().catch(() => null);
    this.writeQueue = Promise.resolve();
  }
  openDatabase() {
    if (!("indexedDB" in globalThis)) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "id" });
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => reject(request.error || new Error("Unable to open IndexedDB"));
      request.onblocked = () => reject(new Error("IndexedDB upgrade is blocked"));
    });
  }
  async readPrimary() {
    const db = await this.dbPromise;
    if (!db) return null;
    const tx = db.transaction(STORE_NAME, "readonly");
    const record = await requestResult(tx.objectStore(STORE_NAME).get(RECORD_ID));
    return record && record.payload ? normalizeState(record.payload) : null;
  }
  readLocalCandidates() {
    const candidates = [];
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      if (raw) candidates.push(normalizeState(JSON.parse(raw)));
    } catch (_) {}
    try {
      const raw = localStorage.getItem(LEGACY_STATE_KEY);
      if (raw) candidates.push(normalizeState(JSON.parse(raw)));
    } catch (_) {}
    return candidates;
  }
  async load() {
    const candidates = this.readLocalCandidates();
    try {
      const primary = await this.readPrimary();
      if (primary) candidates.push(primary);
    } catch (_) {}
    if (candidates.length) {
      candidates.sort((a, b) => b.savedAt - a.savedAt);
      const selected = candidates[0];
      if (!selected.players.length) {
        try {
          const legacy = JSON.parse(localStorage.getItem(LEGACY_PLAYERS_KEY) || "[]");
          if (Array.isArray(legacy) && legacy.length) selected.players = cleanPlayers(legacy);
        } catch (_) {}
      }
      return selected;
    }
    let players = [];
    try { players = cleanPlayers(JSON.parse(localStorage.getItem(LEGACY_PLAYERS_KEY) || "[]")); } catch (_) {}
    return normalizeState({ players, savedAt: 0 });
  }
  writeBackup(state) {
    const snapshot = normalizeState(state);
    snapshot.savedAt = Number(state && state.savedAt) || Date.now();
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(snapshot));
      try { localStorage.setItem(LEGACY_PLAYERS_KEY, JSON.stringify(snapshot.players)); } catch (_) {}
      return true;
    } catch (_) {
      return false;
    }
  }
  writePrimary(state) {
    const snapshot = normalizeState(state);
    snapshot.savedAt = Number(state && state.savedAt) || Date.now();
    this.writeQueue = this.writeQueue.catch(() => {}).then(async () => {
      const db = await this.dbPromise;
      if (!db) return false;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put({ id: RECORD_ID, payload: snapshot });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error || new Error("IndexedDB save failed"));
        tx.onabort = () => reject(tx.error || new Error("IndexedDB save aborted"));
      });
    });
    return this.writeQueue;
  }
  async save(state) {
    const backupOk = this.writeBackup(state);
    let primaryOk = false;
    try { primaryOk = await this.writePrimary(state); } catch (_) {}
    if (!backupOk && !primaryOk) throw new Error("No available local storage backend");
    return { backup: backupOk, primary: primaryOk };
  }
}
