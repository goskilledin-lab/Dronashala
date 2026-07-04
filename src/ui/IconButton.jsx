import { T } from "../core/tokens.js";

/* Icon-only ghost button — header search/settings, modal close, etc. */
export function IconButton({ children, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="btn-ghost"
      style={{
        background: "transparent", color: T.dim, border: `1px solid ${T.hair}`,
        borderRadius: T.rSm, padding: "7px 12px", fontFamily: T.fontBody,
        fontSize: 14, cursor: "pointer", lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}
