import { useState } from "react";
import { T, STAGES } from "../core/tokens.js";
import { useStore } from "../core/store.jsx";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Eyebrow } from "../ui/Eyebrow.jsx";
import { Button } from "../ui/Button.jsx";

export function Agents() {
  const st = useStore();
  const [expandedId, setExpandedId] = useState(null);

  // Conductor (stageLink -1) pinned at top as "Global"; the rest follow
  // pipeline stage order, per §7.2.
  const conductor = st.agents.find(a => a.stageLink === -1);
  const staged = st.agents.filter(a => a.stageLink >= 0).slice().sort((a, b) => a.stageLink - b.stageLink);
  const ordered = conductor ? [conductor, ...staged] : staged;

  return (
    <div>
      <Eyebrow>Agent Launchpad</Eyebrow>
      <div style={{ display: "grid", gap: 8 }}>
        {ordered.map((a) => {
          const expanded = expandedId === a.id;
          const stageLabel = a.stageLink === -1 ? "Global" : STAGES[a.stageLink];
          return (
            <Card key={a.id} onClick={() => setExpandedId(expanded ? null : a.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.fontBody, fontWeight: 800, fontSize: 14, color: T.text }}>
                    {a.name}
                  </div>
                  <div style={{ color: T.dim, fontSize: 12, marginTop: 3 }}>{a.desc}</div>
                  <div style={{ marginTop: 6 }}>
                    <Badge color={a.stageLink === -1 ? T.sapphire : T.bronze}>{stageLabel}</Badge>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); st.togglePin(a.id); }}
                    aria-label={a.pinned ? "Unpin" : "Pin"}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: a.pinned ? T.gold : T.faint, padding: 0 }}
                  >
                    {a.pinned ? "★" : "☆"}
                  </button>
                  <Button
                    variant="ghost"
                    style={{ padding: "6px 10px", fontSize: 11 }}
                    onClick={(e) => { e.stopPropagation(); st.copyText(a.invocation, a.name); }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              {expanded && (
                <div
                  style={{
                    marginTop: 10, padding: 10, borderRadius: T.rSm, background: T.surface2,
                    border: `1px solid ${T.line}`, fontSize: 12, color: T.text, lineHeight: 1.5,
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  {a.invocation}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
