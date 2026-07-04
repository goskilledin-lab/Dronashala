import { T } from "../core/tokens.js";

export function Badge({ children, color }) {
  const c = color || T.ember;
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px",
        borderRadius: 20, background: c + "22", color: c, border: `1px solid ${c}44`,
        fontFamily: T.fontBody,
      }}
    >
      {children}
    </span>
  );
}
