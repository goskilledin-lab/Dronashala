/* ═══════════ L2 · CORE — small shared utilities ═══════════ */

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const now = () => new Date().toISOString();

export const timeAgo = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "abhi";
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h";
  return Math.floor(h / 24) + "d";
};
