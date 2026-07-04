import { T } from "../core/tokens.js";

export function SectionHead({ title, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "22px 0 12px" }}>
      <div style={{ fontFamily: T.fontBody, fontWeight: 800, letterSpacing: "0.04em", color: T.text, fontSize: 15 }}>
        {title}
      </div>
      {right}
    </div>
  );
}
