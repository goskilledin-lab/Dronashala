import { useState } from "react";
import { T, SERIES, STAGES } from "../core/tokens.js";
import { useStore } from "../core/store.jsx";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Eyebrow } from "../ui/Eyebrow.jsx";
import { Empty } from "../ui/Empty.jsx";
import { StageTrail } from "../ui/StageTrail.jsx";
import { Button } from "../ui/Button.jsx";
import { Chip } from "../ui/Chip.jsx";

const STATUS_FILTERS = ["active", "paused", "done"];

export function Pipeline() {
  const st = useStore();
  const [seriesFilter, setSeriesFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const list = st.projects.filter((p) => {
    if (p.status === "archived") return false;
    if (seriesFilter && p.series !== seriesFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <Eyebrow>Pipeline Board</Eyebrow>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {Object.entries(SERIES).map(([key, v]) => (
          <Chip
            key={key}
            label={v.label}
            color={v.c}
            active={seriesFilter === key}
            onClick={() => setSeriesFilter((f) => (f === key ? null : key))}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {STATUS_FILTERS.map((s) => (
          <Chip
            key={s}
            label={s[0].toUpperCase() + s.slice(1)}
            active={statusFilter === s}
            onClick={() => setStatusFilter((f) => (f === s ? null : s))}
          />
        ))}
      </div>

      {list.length === 0 ? (
        <Empty text="Pipeline khaali hai." action="+ New Project" onAction={() => st.setModal({ type: "newProject" })} />
      ) : (
        list.map((p) => {
          const agent = st.agents.find((a) => a.stageLink === p.stage);
          const priorityColor = p.priority === "high" ? T.ember : p.priority === "low" ? T.faint : T.dim;
          return (
            <Card key={p.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div
                  onClick={() => st.setSettings((s) => ({ ...s, activeProjectId: p.id }))}
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 0 }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: priorityColor, flexShrink: 0 }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); st.updateProject(p.id, { favorite: !p.favorite }); }}
                    aria-label={p.favorite ? "Unfavorite" : "Favorite"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: p.favorite ? T.gold : T.faint, fontSize: 14, padding: 0 }}
                  >
                    {p.favorite ? "★" : "☆"}
                  </button>
                  <div style={{ fontFamily: T.fontBody, fontWeight: 800, fontSize: 15, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.title}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <Badge color={SERIES[p.series]?.c}>{SERIES[p.series]?.label}</Badge>
                  <button
                    onClick={() => st.setModal({ type: "editProject", payload: { id: p.id } })}
                    aria-label="Edit project"
                    style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, fontSize: 13, padding: 0 }}
                  >
                    ✎
                  </button>
                </div>
              </div>

              <StageTrail stage={p.stage} onStageClick={(i) => st.setStage(p.id, i)} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <div style={{ color: T.dim, fontSize: 12 }}>{STAGES[p.stage]}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {agent && (
                    <Button variant="ghost" style={{ padding: "6px 10px", fontSize: 11 }} onClick={() => st.copyText(agent.invocation, agent.name)}>
                      ⚡ {agent.name}
                    </Button>
                  )}
                  {p.stage < 10 ? (
                    <Button style={{ padding: "6px 10px", fontSize: 11 }} onClick={() => st.setStage(p.id, p.stage + 1)}>
                      Next →
                    </Button>
                  ) : (
                    <Button style={{ padding: "6px 10px", fontSize: 11 }} onClick={() => st.updateProject(p.id, { status: "done" })}>
                      Done
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
