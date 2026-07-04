import { useState } from "react";
import { T } from "../core/tokens.js";
import { useStore } from "../core/store.jsx";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Eyebrow } from "../ui/Eyebrow.jsx";
import { Empty } from "../ui/Empty.jsx";
import { Button } from "../ui/Button.jsx";
import { Chip } from "../ui/Chip.jsx";

export function Prompts() {
  const st = useStore();
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const categories = [...new Set(st.prompts.map((p) => p.category))];

  const list = st.prompts.filter((p) => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (q && !(p.title + p.category).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Eyebrow>Prompt Library · {st.prompts.length}</Eyebrow>
        <Button variant="ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => st.setModal({ type: "promptEdit" })}>
          + Prompt
        </Button>
      </div>

      <input
        style={{
          width: "100%", boxSizing: "border-box", background: T.surface2, border: `1px solid ${T.line}`,
          borderRadius: T.rSm, padding: "11px 13px", color: T.text, fontFamily: T.fontBody, fontSize: 14,
          outline: "none", marginBottom: 10,
        }}
        placeholder="Search prompts…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {categories.map((c) => (
          <Chip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter((f) => (f === c ? null : c))} />
        ))}
      </div>

      {list.length === 0 ? (
        <Empty text="Koi prompt nahi mila." />
      ) : (
        list.map((p) => (
          <Card key={p.id} style={{ marginBottom: 8, padding: 13 }} onClick={() => st.setModal({ type: "promptView", payload: { id: p.id } })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: T.fontBody, fontWeight: 800, fontSize: 13, color: T.text }}>{p.title}</div>
              <Badge>{p.category}</Badge>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
