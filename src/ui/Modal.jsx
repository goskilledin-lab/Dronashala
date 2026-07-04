import { T } from "../core/tokens.js";
import { IconButton } from "./IconButton.jsx";

export function Modal({ title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(4,5,10,0.75)", zIndex: 60,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface, borderTop: `2px solid ${T.gold}`, borderRadius: "18px 18px 0 0",
          width: "100%", maxWidth: 560, maxHeight: "82vh", overflowY: "auto", padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: T.fontBody, fontWeight: 800, fontSize: 16, color: T.text }}>{title}</div>
          <IconButton onClick={onClose} label="Close">✕</IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
