import { T } from "../core/tokens.js";
import { REGISTRY } from "../core/registry.js";
import { useStore } from "../core/store.jsx";

export function BottomNav() {
  const st = useStore();
  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: T.surface, borderTop: `1px solid ${T.line}`,
        display: "flex", justifyContent: "space-around",
        padding: "8px 4px calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      {REGISTRY.map((m) => (
        <button
          key={m.id}
          onClick={() => st.setNav(m.id)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "6px 10px",
            color: st.nav === m.id ? T.ember : T.faint, fontFamily: T.fontBody,
          }}
        >
          <div style={{ fontSize: 16, lineHeight: 1 }}>{m.icon}</div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", marginTop: 3, textTransform: "uppercase" }}>
            {m.label}
          </div>
        </button>
      ))}
    </div>
  );
}
