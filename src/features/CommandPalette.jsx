import { useState, useEffect } from "react";
import { T } from "../core/tokens.js";
import { useStore } from "../core/store.jsx";
import { REGISTRY } from "../core/registry.js";

export function CommandPalette() {
  const st = useStore();
  const [q, setQ] = useState("");

  useEffect(() => { if (st.paletteOpen) setQ(""); }, [st.paletteOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); st.setPaletteOpen(true); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [st]);

  if (!st.paletteOpen) return null;

  const ql = q.toLowerCase();
  const results = [
    ...REGISTRY.map((mod) => ({ label: `Open ${mod.label}`, run: () => st.setNav(mod.id) })),
    { label: "Create New Project", run: () => st.setModal({ type: "newProject" }) },
    { label: "Quick Note", run: () => st.setModal({ type: "newNote" }) },
    { label: "Export Backup", run: () => st.exportJSON() },
    ...st.agents.map((a) => ({ label: `⚡ ${a.name}`, run: () => st.copyText(a.invocation, a.name) })),
    ...st.projects.map((p) => ({
      label: `🎬 ${p.title}`,
      run: () => { st.setSettings((s) => ({ ...s, activeProjectId: p.id })); st.setNav("pipeline"); },
    })),
  ].filter((r) => r.label.toLowerCase().includes(ql)).slice(0, 10);

  return (
    <div
      onClick={() => st.setPaletteOpen(false)}
      style={{ position: "fixed", inset: 0, background: "rgba(4,5,10,0.8)", zIndex: 70, padding: "12vh 16px 0" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520, margin: "0 auto", background: T.surface, borderRadius: T.r, border: `1px solid ${T.gold}55`, overflow: "hidden" }}
      >
        <input
          autoFocus
          style={{
            width: "100%", boxSizing: "border-box", background: "transparent", border: "none",
            borderBottom: `1px solid ${T.line}`, padding: 15, color: T.text, fontFamily: T.fontBody, fontSize: 14, outline: "none",
          }}
          placeholder="Search agents, projects, actions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") st.setPaletteOpen(false);
            if (e.key === "Enter" && results[0]) { results[0].run(); st.setPaletteOpen(false); }
          }}
        />
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => { r.run(); st.setPaletteOpen(false); }}
              style={{
                padding: "12px 15px", fontSize: 14, color: T.text, cursor: "pointer",
                borderBottom: `1px solid ${T.line}`, background: i === 0 ? T.goldSoft : "transparent",
              }}
            >
              {r.label}
            </div>
          ))}
          {results.length === 0 && <div style={{ padding: 15, color: T.dim, fontSize: 13 }}>Kuch nahi mila.</div>}
        </div>
      </div>
    </div>
  );
}
