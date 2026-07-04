/* ═══════════ L2 · CORE — versioned localStorage service ═══════════
   Every payload is wrapped {v, data}. migrate() upgrades old versions
   without ever corrupting or losing user data. All reads/writes are
   try/catch-safe per the golden rules — storage must never throw. */

export const SCHEMA_V = 1;

function migrate(payload, fallback) {
  // v1 = base schema. Future versions upgrade here, never break.
  if (payload && payload.data !== undefined) return payload.data;
  return fallback;
}

export async function stLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const payload = JSON.parse(raw);
    return payload && payload.v === SCHEMA_V ? payload.data : migrate(payload, fallback);
  } catch {
    return fallback;
  }
}

export async function stSave(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ v: SCHEMA_V, data }));
    return true;
  } catch (e) {
    console.error("save fail", key, e);
    return false;
  }
}
