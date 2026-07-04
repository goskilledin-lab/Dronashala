import { T } from "../core/tokens.js";
import { IconButton } from "../ui/IconButton.jsx";
import { useStore } from "../core/store.jsx";

export function Header() {
  const st = useStore();
  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 40,
        background: T.bg + "F2", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        borderBottom: `1px solid ${T.line}`, padding: "14px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 15, letterSpacing: "0.14em", color: T.text }}>
          DRONASHALA <span style={{ color: T.ember }}>OS</span>
        </div>
        <div style={{ fontSize: 9, color: T.faint, letterSpacing: "0.22em", textTransform: "uppercase" }}>
          Command Center · V1
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <IconButton onClick={() => st.setPaletteOpen(true)} label="Search">🔍</IconButton>
        <IconButton onClick={() => st.setModal({ type: "settings" })} label="Settings">⚙</IconButton>
      </div>
    </div>
  );
}
