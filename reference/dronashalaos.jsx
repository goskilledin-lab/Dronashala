import React, { useState, useEffect, useContext, createContext, useMemo, useRef, useCallback } from "react";

/* ════════════════════════════════════════════════════════════════
   DRONASHALA OS — V1 (Architecture Frozen)
   Layers: L1 Shell/Tokens · L2 Core Services · L3 UI Kit · L4 Modules
   Single-file artifact; each banner section = future file in PWA port.
   ════════════════════════════════════════════════════════════════ */

/* ═══════════ L1 · THEME TOKENS ═══════════ */
const T = {
  bg: "#0B0E13", surface: "#141922", surface2: "#1C232F", line: "#242D3B",
  text: "#EDEAE3", dim: "#8B93A1", faint: "#5A6272",
  ember: "#D99A2B", emberSoft: "rgba(217,154,43,0.14)",
  ok: "#4CAF7D", warn: "#E0684B",
  font: "'Montserrat','Segoe UI',system-ui,sans-serif",
  r: 14, rSm: 9,
};
const SERIES = {
  HIDDEN:  { label: "HIDDEN",  c: "#D99A2B" },
  SIGNAL:  { label: "Signal",  c: "#5B8DD9" },
  MAPROOM: { label: "The Map Room", c: "#4CAF7D" },
  EMPIRES: { label: "Empires", c: "#B0619A" },
  HTWW:    { label: "How The World Works", c: "#4FB3C6" },
  MIND:    { label: "The Mind", c: "#9B7ED9" },
};
const STAGES = ["Topic Intake","Research","Script","Voiceover","Scene Breakdown","Continuity","Image Prompts","Video Prompts","Edit","Upload","Analysis"];

/* ═══════════ L2 · CORE — ids, storage (versioned) ═══════════ */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const now = () => new Date().toISOString();
const SCHEMA_V = 1;

async function stLoad(key, fallback) {
  try {
    const r = await window.storage.get(key);
    if (!r) return fallback;
    const p = JSON.parse(r.value);
    return p && p.v === SCHEMA_V ? p.data : migrate(p, fallback);
  } catch { return fallback; }
}
async function stSave(key, data) {
  try { await window.storage.set(key, JSON.stringify({ v: SCHEMA_V, data })); return true; }
  catch (e) { console.error("save fail", key, e); return false; }
}
function migrate(payload, fallback) {
  // v1 = base schema. Future versions upgrade here, never break.
  if (payload && payload.data !== undefined) return payload.data;
  return fallback;
}

/* ═══════════ L2 · SEED DATA (agents = real Claude Skills; prompts = OS 16-library) ═══════════ */
const SEED_AGENTS = [
  { id:"ag_topic", name:"Topic Agent", desc:"Generate & score video topic ideas, topic intake.", invocation:"Use dronashala-topic: generate and score topic ideas for the next video", stageLink:0, pinned:true },
  { id:"ag_research", name:"Research Agent", desc:"Sourced, confidence-tagged Research Brief.", invocation:"Use dronashala-research: build a research brief for [TOPIC]", stageLink:1, pinned:true },
  { id:"ag_script", name:"Script Agent", desc:"DSSF six-beat Hindi narration script.", invocation:"Use dronashala-script: write the DSSF script from the locked research brief", stageLink:2, pinned:true },
  { id:"ag_vo", name:"Voiceover Agent", desc:"ElevenLabs-ready VO doc with tags & silences.", invocation:"Use dronashala-voiceover: convert the locked script to an ElevenLabs VO document", stageLink:3, pinned:false },
  { id:"ag_scene", name:"Scene Breakdown Agent", desc:"Line-by-line 20-field scene breakdown.", invocation:"Use dronashala-scene-breakdown: break down the locked script into the 20-field schema", stageLink:4, pinned:false },
  { id:"ag_cont", name:"Continuity Agent", desc:"Character / Location / Object Lock Sheets.", invocation:"Use dronashala-continuity: build lock sheets for all recurring elements", stageLink:5, pinned:false },
  { id:"ag_img", name:"Image Prompt Agent", desc:"5 cinematic image prompts per scene.", invocation:"Use dronashala-image-prompts: generate the 5-variation prompt set per scene", stageLink:6, pinned:false },
  { id:"ag_vid", name:"Video Prompt Agent", desc:"Image-to-video motion prompts (Veo/Kling/Runway).", invocation:"Use dronashala-video-prompts: generate motion prompts for the accepted key frames", stageLink:7, pinned:false },
  { id:"ag_edit", name:"Edit Blueprint Agent", desc:"Pacing, cuts, silences, sound, captions.", invocation:"Use dronashala-edit-blueprint: build the editing decision sheet", stageLink:8, pinned:false },
  { id:"ag_upload", name:"Upload Pack Agent", desc:"Titles, description, hashtags, thumbnail, CTA.", invocation:"Use dronashala-upload-pack: generate the platform upload pack", stageLink:9, pinned:false },
  { id:"ag_analysis", name:"Analysis Agent", desc:"Retention diagnosis + one improvement.", invocation:"Use dronashala-analysis: run post-upload analysis on this video's data", stageLink:10, pinned:false },
  { id:"ag_conductor", name:"Conductor", desc:"Orchestrates all 11 agents, enforces stage gates.", invocation:"Use dronashala-conductor: what's next for the current video?", stageLink:-1, pinned:true },
];
const SEED_PROMPTS = [
  ["Topic Research","Research"],["Research Consolidation","Research"],["Script Writing","Script"],["Script Rewriting","Script"],["Hook Generation","Script"],["VO Conversion","Voiceover"],["Scene Breakdown","Visual"],["Character Sheet Generation","Continuity"],["Location Sheet Generation","Continuity"],["Object Continuity Sheet","Continuity"],["Image Prompt Generation","Visual"],["Image Prompt Enhancement","Visual"],["Image-to-Video Prompt","Visual"],["Edit Plan Generation","Edit"],["Upload Pack Generation","Upload"],["Post-Upload Analysis","Analysis"],
].map(([title, category], i) => ({
  id: "pr_" + (i+1), title, category,
  body: `[Dronashala OS Prompt #${i+1} — ${title}]\nPaste the full prompt text from the Production OS here, or run the matching agent skill directly.`,
  tags: [category.toLowerCase()], createdAt: now(),
}));

/* ═══════════ L2 · STORE ═══════════ */
const Store = createContext(null);
const useStore = () => useContext(Store);

function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState([]);
  const [agents, setAgents] = useState(SEED_AGENTS);
  const [prompts, setPrompts] = useState(SEED_PROMPTS);
  const [notes, setNotes] = useState([]);
  const [settings, setSettings] = useState({ activeProjectId: null, todayFocus: "" });
  const [activity, setActivity] = useState([]);   // unified log: toasts + history + notifications
  const [toast, setToast] = useState(null);
  const [nav, setNav] = useState("home");
  const [modal, setModal] = useState(null);       // {type, payload}
  const [paletteOpen, setPaletteOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => { (async () => {
    const [p, a, pr, n, s, act] = await Promise.all([
      stLoad("ds-projects", []), stLoad("ds-agents", null), stLoad("ds-prompts", null),
      stLoad("ds-notes", []), stLoad("ds-settings", { activeProjectId:null, todayFocus:"" }), stLoad("ds-activity", []),
    ]);
    setProjects(p); if (a) setAgents(a); if (pr) setPrompts(pr);
    setNotes(n); setSettings(s); setActivity(act);
    loaded.current = true; setReady(true);
  })(); }, []);

  const persist = (key, val) => { if (loaded.current) stSave(key, val); };
  useEffect(() => persist("ds-projects", projects), [projects]);
  useEffect(() => persist("ds-agents", agents), [agents]);
  useEffect(() => persist("ds-prompts", prompts), [prompts]);
  useEffect(() => persist("ds-notes", notes), [notes]);
  useEffect(() => persist("ds-settings", settings), [settings]);
  useEffect(() => persist("ds-activity", activity), [activity]);

  const log = useCallback((text, kind = "info") => {
    const entry = { id: uid(), text, kind, at: now() };
    setActivity(a => [entry, ...a].slice(0, 100));
    setToast(entry);
    setTimeout(() => setToast(t => (t && t.id === entry.id ? null : t)), 2400);
  }, []);

  const copyText = useCallback(async (text, label) => {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
    log(ok ? `Copied: ${label}` : `Copy failed — select manually`, ok ? "ok" : "warn");
  }, [log]);

  const addProject = (data) => {
    const p = { id: uid(), title: data.title, series: data.series, status: "active",
      stage: 0, stageUpdatedAt: now(), hookArchetype: null, priority: data.priority || "normal",
      favorite: false, notes: "", createdAt: now(), updatedAt: now() };
    setProjects(ps => [p, ...ps]);
    setSettings(s => ({ ...s, activeProjectId: s.activeProjectId || p.id }));
    log(`Project created: ${p.title}`, "ok");
    return p;
  };
  const updateProject = (id, patch) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, ...patch, updatedAt: now() } : p));
  };
  const setStage = (id, stage) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, stage, stageUpdatedAt: now(), updatedAt: now() } : p));
    const p = projects.find(x => x.id === id);
    log(`${p ? p.title : "Project"} → ${STAGES[stage]}`, "ok");
  };
  const addNote = (text, tag, projectId) => {
    setNotes(ns => [{ id: uid(), text, tag: tag || "idea", projectId: projectId || null, createdAt: now() }, ...ns]);
    log("Note saved", "ok");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ v: SCHEMA_V, exportedAt: now(),
      projects, agents, prompts, notes, settings, activity }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dronashala-os-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
    log("Export complete", "ok");
  };
  const importJSON = (file) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || d.v !== SCHEMA_V) { log("Import failed — schema mismatch", "warn"); return; }
        setProjects(d.projects || []); setAgents(d.agents || SEED_AGENTS);
        setPrompts(d.prompts || SEED_PROMPTS); setNotes(d.notes || []);
        setSettings(d.settings || { activeProjectId:null, todayFocus:"" });
        setActivity(d.activity || []);
        log("Import complete", "ok");
      } catch { log("Import failed — invalid file", "warn"); }
    };
    r.readAsText(file);
  };
  const resetWorkspace = () => {
    setProjects([]); setAgents(SEED_AGENTS); setPrompts(SEED_PROMPTS);
    setNotes([]); setSettings({ activeProjectId:null, todayFocus:"" }); setActivity([]);
    log("Workspace reset", "warn");
  };

  const api = { ready, projects, agents, prompts, notes, settings, activity, toast,
    nav, setNav, modal, setModal, paletteOpen, setPaletteOpen,
    setSettings, setAgents, setPrompts, setNotes,
    log, copyText, addProject, updateProject, setStage, addNote,
    exportJSON, importJSON, resetWorkspace };
  return <Store.Provider value={api}>{children}</Store.Provider>;
}

/* ═══════════ L2 · MODULE REGISTRY (plugin system) ═══════════ */
/* Future reserve slots: analytics(V2) calendar(V2) conductor(V4) voice(V5) aiMemory(V7) */
const REGISTRY = [
  { id: "home",     label: "Home",     icon: "◆", component: HomeModule },
  { id: "agents",   label: "Agents",   icon: "⚡", component: AgentsModule },
  { id: "pipeline", label: "Pipeline", icon: "▸▸", component: PipelineModule },
  { id: "prompts",  label: "Prompts",  icon: "❝",  component: PromptsModule },
  { id: "notes",    label: "Notes",    icon: "✎",  component: NotesModule },
];

/* ═══════════ L3 · UI KIT ═══════════ */
const S = {
  card: { background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r, padding: 16 },
  h: { fontFamily: T.font, fontWeight: 800, letterSpacing: "0.04em", color: T.text },
  dim: { color: T.dim, fontSize: 13, lineHeight: 1.5 },
  btn: { background: T.ember, color: "#14100A", border: "none", borderRadius: T.rSm,
    padding: "10px 16px", fontFamily: T.font, fontWeight: 700, fontSize: 13, cursor: "pointer" },
  btnGhost: { background: "transparent", color: T.dim, border: `1px solid ${T.line}`,
    borderRadius: T.rSm, padding: "9px 14px", fontFamily: T.font, fontWeight: 600, fontSize: 13, cursor: "pointer" },
  input: { width: "100%", boxSizing: "border-box", background: T.surface2, border: `1px solid ${T.line}`,
    borderRadius: T.rSm, padding: "11px 13px", color: T.text, fontFamily: T.font, fontSize: 14, outline: "none" },
};
const Card = ({ children, style, onClick }) => (
  <div style={{ ...S.card, ...(onClick ? { cursor: "pointer" } : {}), ...style }} onClick={onClick}>{children}</div>
);
const Eyebrow = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: T.ember,
    textTransform: "uppercase", marginBottom: 8, fontFamily: T.font }}>{children}</div>
);
const Badge = ({ children, color }) => (
  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px",
    borderRadius: 20, background: (color || T.ember) + "22", color: color || T.ember,
    border: `1px solid ${(color || T.ember)}44` }}>{children}</span>
);
const Empty = ({ text, action, onAction }) => (
  <Card style={{ textAlign: "center", padding: 32, borderStyle: "dashed" }}>
    <div style={{ ...S.dim, marginBottom: action ? 14 : 0 }}>{text}</div>
    {action && <button style={S.btn} onClick={onAction}>{action}</button>}
  </Card>
);
const SectionHead = ({ title, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "22px 0 12px" }}>
    <div style={{ ...S.h, fontSize: 15 }}>{title}</div>{right}
  </div>
);
function StageTrail({ stage }) {
  // Signature element: ember trail — the 11-stage pipeline as a glowing progress path
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {STAGES.map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2,
          background: i < stage ? T.ember : i === stage ? T.ember : T.line,
          opacity: i < stage ? 0.55 : i === stage ? 1 : 1,
          boxShadow: i === stage ? `0 0 8px ${T.ember}` : "none" }} />
      ))}
    </div>
  );
}
const timeAgo = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "abhi"; if (m < 60) return m + "m"; const h = Math.floor(m/60);
  if (h < 24) return h + "h"; return Math.floor(h/24) + "d";
};

/* ═══════════ L4 · MODULE — HOME ═══════════ */
function HomeModule() {
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

  return (
    <div>
      {/* Health snapshot */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[["Projects", health.total],["Active", health.active],["Pinned", health.pinned],["Notes", health.notes]].map(([l,v]) => (
          <Card key={l} style={{ padding: "12px 8px", textAlign: "center" }}>
            <div style={{ ...S.h, fontSize: 22, color: T.ember }}>{v}</div>
            <div style={{ fontSize: 10, color: T.dim, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* Active project */}
      <Eyebrow>Active Video</Eyebrow>
      {active ? (
        <Card onClick={() => st.setNav("pipeline")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ ...S.h, fontSize: 17 }}>{active.title}</div>
            <Badge color={SERIES[active.series]?.c}>{SERIES[active.series]?.label}</Badge>
          </div>
          <StageTrail stage={active.stage} />
          <div style={{ ...S.dim, marginTop: 8, fontSize: 12 }}>
            Stage {active.stage + 1}/11 · <span style={{ color: T.ember, fontWeight: 700 }}>{STAGES[active.stage]}</span> · updated {timeAgo(active.stageUpdatedAt)}
          </div>
        </Card>
      ) : (
        <Empty text="Koi active project nahi. Pehla video shuru karo." action="+ New Project"
          onAction={() => st.setModal({ type: "newProject" })} />
      )}

      {/* Today's focus */}
      <SectionHead title="Today's Focus" />
      <input style={S.input} placeholder="Aaj ka ek focus likho…" value={focus}
        onChange={e => setFocus(e.target.value)}
        onBlur={() => st.setSettings(s => ({ ...s, todayFocus: focus }))} />

      {/* Quick actions */}
      <SectionHead title="Quick Actions" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={S.btn} onClick={() => st.setModal({ type: "newProject" })}>+ Project</button>
        <button style={S.btnGhost} onClick={() => st.setModal({ type: "newNote" })}>+ Note</button>
        <button style={S.btnGhost} onClick={() => st.setNav("agents")}>Agents</button>
        <button style={{ ...S.btnGhost, opacity: 0.45 }} onClick={() => st.log("Voice — coming in V5", "info")}>🎙 Voice</button>
      </div>

      {/* Pinned agents */}
      <SectionHead title="Pinned Agents" right={<button style={{ ...S.btnGhost, padding: "5px 10px", fontSize: 11 }} onClick={() => st.setNav("agents")}>All →</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {st.agents.filter(a => a.pinned).map(a => (
          <Card key={a.id} style={{ padding: 12 }} onClick={() => st.copyText(a.invocation, a.name)}>
            <div style={{ ...S.h, fontSize: 13 }}>{a.name}</div>
            <div style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>tap = copy invocation</div>
          </Card>
        ))}
      </div>

      {/* Recent activity — unified log */}
      <SectionHead title="Recent Activity" right={<button style={{ ...S.btnGhost, padding: "5px 10px", fontSize: 11 }} onClick={() => st.setModal({ type: "activity" })}>History →</button>} />
      {st.activity.length === 0 ? <div style={S.dim}>Abhi tak koi activity nahi.</div> :
        st.activity.slice(0, 5).map(a => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 4px", borderBottom: `1px solid ${T.line}`, fontSize: 13 }}>
            <span style={{ color: a.kind === "warn" ? T.warn : T.text }}>{a.text}</span>
            <span style={{ color: T.faint, fontSize: 11, whiteSpace: "nowrap", marginLeft: 10 }}>{timeAgo(a.at)}</span>
          </div>
        ))}
    </div>
  );
}

/* ═══════════ L4 · MODULE — AGENTS (Launchpad scaffold; full build = Task 4) ═══════════ */
function AgentsModule() {
  const st = useStore();
  return (
    <div>
      <Eyebrow>Agent Launchpad</Eyebrow>
      <div style={{ display: "grid", gap: 8 }}>
        {st.agents.map(a => (
          <Card key={a.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ ...S.h, fontSize: 14 }}>{a.name} {a.pinned && <span style={{ color: T.ember }}>★</span>}</div>
                <div style={{ ...S.dim, fontSize: 12, marginTop: 3 }}>{a.desc}</div>
                {a.stageLink >= 0 && <div style={{ fontSize: 10, color: T.faint, marginTop: 5 }}>Stage: {STAGES[a.stageLink]}</div>}
              </div>
              <button style={{ ...S.btn, padding: "8px 12px", whiteSpace: "nowrap" }}
                onClick={() => st.copyText(a.invocation, a.name)}>Copy</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ L4 · MODULE — PIPELINE (scaffold; full build = Task 5) ═══════════ */
function PipelineModule() {
  const st = useStore();
  const list = st.projects.filter(p => p.status !== "archived");
  return (
    <div>
      <Eyebrow>Pipeline Board</Eyebrow>
      {list.length === 0 ? <Empty text="Pipeline khaali hai." action="+ New Project" onAction={() => st.setModal({ type: "newProject" })} /> :
        list.map(p => {
          const agent = st.agents.find(a => a.stageLink === p.stage);
          return (
            <Card key={p.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ ...S.h, fontSize: 15 }}>{p.favorite && "★ "}{p.title}</div>
                <Badge color={SERIES[p.series]?.c}>{SERIES[p.series]?.label}</Badge>
              </div>
              <StageTrail stage={p.stage} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <div style={{ ...S.dim, fontSize: 12 }}>{STAGES[p.stage]}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {agent && <button style={{ ...S.btnGhost, padding: "6px 10px", fontSize: 11 }}
                    onClick={() => st.copyText(agent.invocation, agent.name)}>⚡ {agent.name}</button>}
                  {p.stage < 10 && <button style={{ ...S.btn, padding: "6px 10px", fontSize: 11 }}
                    onClick={() => st.setStage(p.id, p.stage + 1)}>Next →</button>}
                </div>
              </div>
            </Card>
          );
        })}
    </div>
  );
}

/* ═══════════ L4 · MODULE — PROMPTS (scaffold; full build = Task 6) ═══════════ */
function PromptsModule() {
  const st = useStore();
  const [q, setQ] = useState("");
  const list = st.prompts.filter(p => (p.title + p.category).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Eyebrow>Prompt Library · {st.prompts.length}</Eyebrow>
      <input style={{ ...S.input, marginBottom: 12 }} placeholder="Search prompts…" value={q} onChange={e => setQ(e.target.value)} />
      {list.map(p => (
        <Card key={p.id} style={{ marginBottom: 8, padding: 13 }} onClick={() => st.copyText(p.body, p.title)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ ...S.h, fontSize: 13 }}>{p.title}</div>
            <Badge>{p.category}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ═══════════ L4 · MODULE — NOTES (scaffold; full build = Task 7) ═══════════ */
function NotesModule() {
  const st = useStore();
  return (
    <div>
      <Eyebrow>Notes · {st.notes.length}</Eyebrow>
      <button style={{ ...S.btn, marginBottom: 12 }} onClick={() => st.setModal({ type: "newNote" })}>+ Quick Note</button>
      {st.notes.length === 0 ? <Empty text="Ideas yahan capture honge." /> :
        st.notes.map(n => (
          <Card key={n.id} style={{ marginBottom: 8, padding: 13 }}>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5 }}>{n.text}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <Badge>{n.tag}</Badge>
              <span style={{ fontSize: 11, color: T.faint }}>{timeAgo(n.createdAt)}</span>
            </div>
          </Card>
        ))}
    </div>
  );
}

/* ═══════════ SHELL · Modals ═══════════ */
function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,7,10,0.75)", zIndex: 60,
      display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: T.surface, borderTop: `2px solid ${T.ember}`, borderRadius: "18px 18px 0 0",
        width: "100%", maxWidth: 560, maxHeight: "82vh", overflowY: "auto", padding: 20 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ ...S.h, fontSize: 16 }}>{title}</div>
          <button style={{ ...S.btnGhost, padding: "4px 10px" }} onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ModalRouter() {
  const st = useStore();
  const m = st.modal;
  const [f, setF] = useState({});
  useEffect(() => setF({}), [m]);
  if (!m) return null;
  const close = () => st.setModal(null);

  if (m.type === "newProject") return (
    <Modal title="New Project" onClose={close}>
      <input style={{ ...S.input, marginBottom: 10 }} placeholder="Video title…" autoFocus
        value={f.title || ""} onChange={e => setF({ ...f, title: e.target.value })} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.entries(SERIES).map(([k, v]) => (
          <button key={k} style={{ ...S.btnGhost, fontSize: 11, padding: "7px 11px",
            borderColor: f.series === k ? v.c : T.line, color: f.series === k ? v.c : T.dim }}
            onClick={() => setF({ ...f, series: k })}>{v.label}</button>
        ))}
      </div>
      <button style={{ ...S.btn, width: "100%" }} disabled={!f.title || !f.series}
        onClick={() => { st.addProject(f); close(); st.setNav("pipeline"); }}>
        Create Project</button>
    </Modal>
  );

  if (m.type === "newNote") return (
    <Modal title="Quick Note" onClose={close}>
      <textarea style={{ ...S.input, minHeight: 90, marginBottom: 12, resize: "vertical" }} autoFocus
        placeholder="Idea, hook, ya reminder…" value={f.text || ""} onChange={e => setF({ ...f, text: e.target.value })} />
      <button style={{ ...S.btn, width: "100%" }} disabled={!f.text}
        onClick={() => { st.addNote(f.text); close(); }}>Save Note</button>
    </Modal>
  );

  if (m.type === "activity") return (
    <Modal title="Activity Log" onClose={close}>
      {st.activity.length === 0 ? <div style={S.dim}>Log khaali hai.</div> :
        st.activity.map(a => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 2px",
            borderBottom: `1px solid ${T.line}`, fontSize: 13 }}>
            <span style={{ color: a.kind === "warn" ? T.warn : T.text }}>{a.text}</span>
            <span style={{ color: T.faint, fontSize: 11, marginLeft: 10, whiteSpace: "nowrap" }}>{timeAgo(a.at)}</span>
          </div>
        ))}
    </Modal>
  );

  if (m.type === "settings") return (
    <Modal title="Settings & Data" onClose={close}>
      <div style={{ display: "grid", gap: 10 }}>
        <button style={S.btn} onClick={st.exportJSON}>Export JSON Backup</button>
        <label style={{ ...S.btnGhost, textAlign: "center", display: "block" }}>
          Import JSON
          <input type="file" accept=".json" style={{ display: "none" }}
            onChange={e => { if (e.target.files[0]) { st.importJSON(e.target.files[0]); close(); } }} />
        </label>
        <button style={{ ...S.btnGhost, color: T.warn, borderColor: T.warn + "55" }}
          onClick={() => { if (f.confirmReset) { st.resetWorkspace(); close(); } else setF({ confirmReset: true }); }}>
          {f.confirmReset ? "Tap again to confirm reset" : "Reset Workspace"}</button>
        <div style={{ ...S.dim, fontSize: 11, textAlign: "center", marginTop: 4 }}>
          Dronashala OS · V1 · Schema v{SCHEMA_V}</div>
      </div>
    </Modal>
  );
  return null;
}

/* ═══════════ SHELL · Command Palette ═══════════ */
function CommandPalette() {
  const st = useStore();
  const [q, setQ] = useState("");
  useEffect(() => { if (st.paletteOpen) setQ(""); }, [st.paletteOpen]);
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); st.setPaletteOpen(true); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  if (!st.paletteOpen) return null;

  const ql = q.toLowerCase();
  const results = [
    ...REGISTRY.map(m => ({ k: "nav", label: `Open ${m.label}`, run: () => st.setNav(m.id) })),
    { k: "act", label: "Create New Project", run: () => st.setModal({ type: "newProject" }) },
    { k: "act", label: "Quick Note", run: () => st.setModal({ type: "newNote" }) },
    { k: "act", label: "Export Backup", run: () => st.exportJSON() },
    ...st.agents.map(a => ({ k: "agent", label: `⚡ ${a.name}`, run: () => st.copyText(a.invocation, a.name) })),
    ...st.projects.map(p => ({ k: "proj", label: `🎬 ${p.title}`, run: () => { st.setSettings(s => ({ ...s, activeProjectId: p.id })); st.setNav("pipeline"); } })),
  ].filter(r => r.label.toLowerCase().includes(ql)).slice(0, 10);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,7,10,0.8)", zIndex: 70, padding: "12vh 16px 0" }}
      onClick={() => st.setPaletteOpen(false)}>
      <div style={{ maxWidth: 520, margin: "0 auto", background: T.surface, borderRadius: T.r,
        border: `1px solid ${T.ember}55`, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <input autoFocus style={{ ...S.input, border: "none", borderRadius: 0, borderBottom: `1px solid ${T.line}`, padding: 15 }}
          placeholder="Search agents, projects, actions…" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => { if (e.key === "Escape") st.setPaletteOpen(false);
            if (e.key === "Enter" && results[0]) { results[0].run(); st.setPaletteOpen(false); } }} />
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {results.map((r, i) => (
            <div key={i} style={{ padding: "12px 15px", fontSize: 14, color: T.text, cursor: "pointer",
              borderBottom: `1px solid ${T.line}`, background: i === 0 ? T.emberSoft : "transparent" }}
              onClick={() => { r.run(); st.setPaletteOpen(false); }}>{r.label}</div>
          ))}
          {results.length === 0 && <div style={{ padding: 15, ...S.dim }}>Kuch nahi mila.</div>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ SHELL · Frame ═══════════ */
function Shell() {
  const st = useStore();
  if (!st.ready) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center",
      justifyContent: "center", color: T.ember, fontFamily: T.font, fontWeight: 800, letterSpacing: "0.2em" }}>
      DRONASHALA OS</div>
  );
  const Active = REGISTRY.find(m => m.id === st.nav)?.component || HomeModule;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: T.bg + "F2", backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${T.line}`, padding: "14px 16px", display: "flex",
        justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ ...S.h, fontSize: 15, letterSpacing: "0.14em" }}>DRONASHALA <span style={{ color: T.ember }}>OS</span></div>
          <div style={{ fontSize: 9, color: T.faint, letterSpacing: "0.22em", textTransform: "uppercase" }}>Command Center · V1</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...S.btnGhost, padding: "7px 12px" }} onClick={() => st.setPaletteOpen(true)}>🔍</button>
          <button style={{ ...S.btnGhost, padding: "7px 12px" }} onClick={() => st.setModal({ type: "settings" })}>⚙</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "18px 16px 100px" }}>
        <Active />
      </div>

      {/* Bottom nav from registry */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: T.surface, borderTop: `1px solid ${T.line}`, display: "flex",
        justifyContent: "space-around", padding: "8px 4px calc(8px + env(safe-area-inset-bottom))" }}>
        {REGISTRY.map(m => (
          <button key={m.id} onClick={() => st.setNav(m.id)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 10px",
              color: st.nav === m.id ? T.ember : T.faint, fontFamily: T.font }}>
            <div style={{ fontSize: 16, lineHeight: 1 }}>{m.icon}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", marginTop: 3, textTransform: "uppercase" }}>{m.label}</div>
          </button>
        ))}
      </div>

      {/* Toast (fed by unified activity log) */}
      {st.toast && (
        <div style={{ position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)", zIndex: 65,
          background: T.surface2, border: `1px solid ${st.toast.kind === "warn" ? T.warn : T.ember}66`,
          borderRadius: 24, padding: "9px 18px", fontSize: 13, fontWeight: 600,
          color: st.toast.kind === "warn" ? T.warn : T.text, whiteSpace: "nowrap",
          boxShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
          {st.toast.text}
        </div>
      )}

      <ModalRouter />
      <CommandPalette />
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
