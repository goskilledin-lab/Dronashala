import { T } from "../core/tokens.js";

/* §6.2: Cinzel, uppercase, letter-spacing 0.18em, in ember. */
export function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: T.ember,
        textTransform: "uppercase", marginBottom: 8, fontFamily: T.fontDisplay,
      }}
    >
      {children}
    </div>
  );
}
