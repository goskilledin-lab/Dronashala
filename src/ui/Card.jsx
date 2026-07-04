import { T } from "../core/tokens.js";

/* Glass panel — §6.3.3: T.glass fill + blur(14px) + bronze hairline
   border + a 1px gold top-edge highlight. One consistent panel = the
   whole HUD language. */
export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.glass,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${T.hair}`,
        borderTop: `1px solid ${T.gold}55`,
        borderRadius: T.r,
        padding: 16,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
