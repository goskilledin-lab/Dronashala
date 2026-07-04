import { T } from "../core/tokens.js";

/* §6.5: Primary = gold→ember gradient, dark ink text. Ghost = transparent,
   bronze hairline border, dim text. Hover/press states live in index.css
   (.btn-primary / .btn-ghost) since inline styles can't express :hover. */
export function Button({ children, onClick, variant = "primary", disabled, style, type = "button" }) {
  const isGhost = variant === "ghost";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={isGhost ? "btn-ghost" : "btn-primary"}
      style={{
        fontFamily: T.fontBody, fontWeight: 700, fontSize: 13, borderRadius: T.rSm,
        padding: isGhost ? "9px 14px" : "10px 16px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        border: isGhost ? `1px solid ${T.hair}` : "none",
        background: isGhost ? "transparent" : `linear-gradient(180deg, ${T.gold}, ${T.ember})`,
        color: isGhost ? T.dim : "#14100A",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
