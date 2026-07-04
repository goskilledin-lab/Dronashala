import { useState, useEffect } from "react";
import { T, SERIES, STAGES } from "../core/tokens.js";
import { timeAgo } from "../core/utils.js";
import { useStore } from "../core/store.jsx";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Eyebrow } from "../ui/Eyebrow.jsx";
import { Empty } from "../ui/Empty.jsx";
import { SectionHead } from "../ui/SectionHead.jsx";
import { StageTrail } from "../ui/StageTrail.jsx";
import { Button } from "../ui/Button.jsx";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/* §6.3.2 — subtle static sacred-geometry mark, ≤6% opacity, bronze
   stroke, fixed behind Home only. Zero runtime cost (no animation). */
function YantraBackdrop() {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "140vw", maxWidth: 700, opacity: 0.06, pointerEvents: "none", zIndex: 0,
      }}
    >
      <g fill="none" stroke={T.bronze} strokeWidth="1.5">
        <circle cx="200" cy="200" r="180" />
        <circle cx="200" cy="200" r="140" />
        <circle cx="200" cy="200" r="100" />
        <polygon points="200,60 322,270 78,270" />
        <polygon points="200,340 78,130 322,130" />
      </g>
    </svg>
  );
}

export function Home() {
  const st = useStore();
  const active = st.projects.find(p => p.id === st.settings.activeProjectId) || st.projects.find(p => p.status === "active");
  const health = {
    total: st.projects.length,
    active: st.projects.filter(p => p.status === "active").length,
    pinned: st.agents.filter(a => a.pinned).length,
    notes: st.notes.length,
  };

  const [focus, setFocus] = useState(st.settings.todayFocus);
  useEffect(() => setFocus(st.settings.todayFocus), [st.settings.todayFocus]);

  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const daysSinceExport = st.settings.lastExportAt
    ? (Date.now() - new Date(st.settings.lastExportAt)) / SEVEN_DAYS_MS
    : Infinity;
  const showBackupNudge = !nudgeDismissed && daysSinceExport > 7;

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <YantraBackdrop />

      {/* 1 — Health snapshot */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[["Projects", health.total], ["Active", health.active], ["Pinned", health.pinned], ["Notes", health.notes]].map(([l, v]) => (
          <Card key={l} style={{ padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 22, color: T.ember }}>{v}</div>
            <div style={{ fontSize: 10, color: T.dim, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* 2 — Active video */}
      <Eyebrow>Active Video</Eyebrow>
      {active ? (
        <Card onClick={() => st.setNav("pipeline")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ fontFamily: T.fontBody, fontWeight: 800, fontSize: 17, color: T.text }}>{active.title}</div>
            <Badge color={SERIES[active.series]?.c}>{SERIES[active.series]?.label}</Badge>
          </div>
          <StageTrail stage={active.stage} />
          <div style={{ color: T.dim, fontSize: 12, marginTop: 8 }}>
            Stage {active.stage + 1}/11 · <span style={{ color: T.ember, fontWeight: 700 }}>{STAGES[active.stage]}</span> · updated {timeAgo(active.stageUpdatedAt)}
          </div>
        </Card>
      ) : (
        <Empty text="Koi active project nahi. Pehla video shuru karo." action="+ New Project"
          onAction={() => st.setModal({ type: "newProject" })} />
      )}

      {/* 3 — Backup nudge (dismissible one-liner, no popups) */}
      {showBackupNudge && (
        <div
          onClick={() => st.setModal({ type: "settings" })}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 10, marginTop: 12, padding: "9px 12px", borderRadius: T.rSm,
            border: `1px solid ${T.warn}44`, background: T.warn + "14",
            fontSize: 12, color: T.dim, cursor: "pointer",
          }}
        >
          <span>Backup 7+ din purana hai — Export JSON</span>
          <button
            onClick={(e) => { e.stopPropagation(); setNudgeDismissed(true); }}
            aria-label="Dismiss"
            style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontSize: 13, padding: 0 }}
          >✕</button>
        </div>
      )}

      {/* 4 — Today's focus */}
      <SectionHead title="Today's Focus" />
      <input
        style={{
          width: "100%", boxSizing: "border-box", background: T.surface2, border: `1px solid ${T.line}`,
          borderRadius: T.rSm, padding: "11px 13px", color: T.text, fontFamily: T.fontBody, fontSize: 14, outline: "none",
        }}
        placeholder="Aaj ka ek focus likho…"
        value={focus}
        onChange={(e) => setFocus(e.target.value)}
        onBlur={() => st.setSettings(s => ({ ...s, todayFocus: focus }))}
      />

      {/* 5 — Quick actions */}
      <SectionHead title="Quick Actions" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button onClick={() => st.setModal({ type: "newProject" })}>+ Project</Button>
        <Button variant="ghost" onClick={() => st.setModal({ type: "newNote" })}>+ Note</Button>
        <Button variant="ghost" onClick={() => st.setNav("agents")}>Agents</Button>
        <Button variant="ghost" style={{ opacity: 0.45 }} onClick={() => st.log("Voice — coming in V5", "info")}>🎙 Voice</Button>
      </div>

      {/* 6 — Pinned agents */}
      <SectionHead title="Pinned Agents" right={
        <Button variant="ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => st.setNav("agents")}>All →</Button>
      } />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {st.agents.filter(a => a.pinned).map(a => (
          <Card key={a.id} style={{ padding: 12 }} onClick={() => st.copyText(a.invocation, a.name)}>
            <div style={{ fontFamily: T.fontBody, fontWeight: 800, fontSize: 13, color: T.text }}>{a.name}</div>
            <div style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>tap = copy invocation</div>
          </Card>
        ))}
      </div>

      {/* 7 — Recent activity */}
      <SectionHead title="Recent Activity" right={
        <Button variant="ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => st.setModal({ type: "activity" })}>History →</Button>
      } />
      {st.activity.length === 0 ? (
        <div style={{ color: T.dim, fontSize: 13 }}>Abhi tak koi activity nahi.</div>
      ) : (
        st.activity.slice(0, 5).map(a => (
          <div key={a.id} style={{
            display: "flex", justifyContent: "space-between", padding: "9px 4px",
            borderBottom: `1px solid ${T.line}`, fontSize: 13,
          }}>
            <span style={{ color: a.kind === "warn" ? T.warn : T.text }}>{a.text}</span>
            <span style={{ color: T.faint, fontSize: 11, whiteSpace: "nowrap", marginLeft: 10 }}>{timeAgo(a.at)}</span>
          </div>
        ))
      )}
    </div>
  );
}
