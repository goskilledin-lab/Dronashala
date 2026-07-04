import { T } from "../core/tokens.js";

/* Toggleable filter/tag chip — series/status filters (Pipeline),
   category filters (Prompts), tag picker (Notes). */
export function Chip({ label, active, color, onClick }) {
  const c = color || T.sapphire;
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: T.fontBody, fontWeight: 600, fontSize: 11, padding: "7px 11px",
        borderRadius: T.rSm, cursor: "pointer",
        background: active ? c + "22" : "transparent",
        border: `1px solid ${active ? c : T.hair}`,
        color: active ? c : T.dim,
      }}
    >
      {label}
    </button>
  );
}
