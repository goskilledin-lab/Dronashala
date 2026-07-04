// Lightweight sanity checks for src/core/storage.js — no test framework
// dependency; run directly with `node scripts/sanity-storage.mjs`.

globalThis.localStorage = (() => {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();

const { stLoad, stSave } = await import("../src/core/storage.js");

let pass = 0, fail = 0;
function assert(cond, label) {
  if (cond) { pass++; console.log(`ok - ${label}`); }
  else { fail++; console.error(`FAIL - ${label}`); }
}

// 1. Envelope round-trip
await stSave("sanity-roundtrip", { hello: "world" });
const loaded = await stLoad("sanity-roundtrip", null);
assert(JSON.stringify(loaded) === JSON.stringify({ hello: "world" }), "envelope round-trip");

// 2. migrate() fallback paths
localStorage.setItem("sanity-migrate", JSON.stringify({ v: 0, data: { old: true } }));
const migrated = await stLoad("sanity-migrate", "FALLBACK");
assert(migrated && migrated.old === true, "migrate() recovers data from an old-version payload");

localStorage.setItem("sanity-migrate-bad", "not json{{{");
const badFallback = await stLoad("sanity-migrate-bad", "FALLBACK");
assert(badFallback === "FALLBACK", "corrupt JSON falls back safely instead of throwing");

// 3. Quota-failure path
const originalSetItem = localStorage.setItem;
localStorage.setItem = () => { throw new DOMException("quota exceeded", "QuotaExceededError"); };
const saveResult = await stSave("sanity-quota", { big: "data" });
assert(saveResult === false, "stSave() returns false on quota failure instead of throwing");
localStorage.setItem = originalSetItem;

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
