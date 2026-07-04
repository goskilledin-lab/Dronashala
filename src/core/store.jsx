/* ═══════════ L2 · STORE — Context + all actions ═══════════
   Single source of truth. Modules never talk to each other directly —
   only through this store (Golden Rule #1). */
import { useState, useEffect, useContext, createContext, useCallback, useRef } from "react";
import { stLoad, stSave } from "./storage.js";
import { uid, now } from "./utils.js";
import { SEED_AGENTS, SEED_PROMPTS } from "./seed.js";
import { STAGES } from "./tokens.js";

const Store = createContext(null);
export const useStore = () => useContext(Store);

const DEFAULT_SETTINGS = { activeProjectId: null, todayFocus: "", lastExportAt: null };

export function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState([]);
  const [agents, setAgents] = useState(SEED_AGENTS);
  const [prompts, setPrompts] = useState(SEED_PROMPTS);
  const [notes, setNotes] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activity, setActivity] = useState([]); // unified log: toasts + history + notifications
  const [toast, setToast] = useState(null);
  const [nav, setNav] = useState("home");
  const [modal, setModal] = useState(null);      // {type, payload}
  const [paletteOpen, setPaletteOpen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => { (async () => {
    const [p, a, pr, n, s, act] = await Promise.all([
      stLoad("ds-projects", []), stLoad("ds-agents", null), stLoad("ds-prompts", null),
      stLoad("ds-notes", []), stLoad("ds-settings", DEFAULT_SETTINGS), stLoad("ds-activity", []),
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
      try { ok = document.execCommand("copy"); } catch { /* fallback exhausted below */ }
      document.body.removeChild(ta);
    }
    log(ok ? `Copied: ${label}` : "Copy failed — select manually", ok ? "ok" : "warn");
  }, [log]);

  // ── Projects ──────────────────────────────────────────────
  const addProject = (data) => {
    const p = {
      id: uid(), title: data.title, series: data.series, status: "active",
      stage: 0, stageUpdatedAt: now(), hookArchetype: null, priority: data.priority || "normal",
      favorite: false, notes: "", createdAt: now(), updatedAt: now(),
    };
    setProjects(ps => [p, ...ps]);
    setSettings(s => ({ ...s, activeProjectId: s.activeProjectId || p.id }));
    log(`Project created: ${p.title}`, "ok");
    return p;
  };
  const updateProject = (id, patch) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, ...patch, updatedAt: now() } : p));
  };
  const setStage = (id, stage) => {
    setProjects(ps => {
      const p = ps.find(x => x.id === id);
      if (p) log(`${p.title} → ${STAGES[stage] ?? `Stage ${stage}`}`, "ok");
      return ps.map(x => x.id === id ? { ...x, stage, stageUpdatedAt: now(), updatedAt: now() } : x);
    });
  };

  // ── Notes ─────────────────────────────────────────────────
  const addNote = (text, tag, projectId) => {
    setNotes(ns => [{ id: uid(), text, tag: tag || "idea", projectId: projectId || null, createdAt: now() }, ...ns]);
    log("Note saved", "ok");
  };
  const deleteNote = (id) => {
    setNotes(ns => ns.filter(n => n.id !== id));
    log("Note deleted", "warn");
  };

  // ── Prompts ───────────────────────────────────────────────
  const addPrompt = (data) => {
    const pr = { id: uid(), title: data.title, category: data.category, body: data.body, tags: data.tags || [], createdAt: now() };
    setPrompts(ps => [pr, ...ps]);
    log(`Prompt created: ${pr.title}`, "ok");
    return pr;
  };
  const updatePrompt = (id, patch) => {
    setPrompts(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));
    log("Prompt updated", "ok");
  };

  // ── Agents ────────────────────────────────────────────────
  const togglePin = (id) => {
    setAgents(as => as.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  // ── Data (export / import / reset) ───────────────────────
  const exportJSON = () => {
    const exportedAt = now();
    const blob = new Blob([JSON.stringify({
      v: 1, exportedAt, projects, agents, prompts, notes, settings, activity,
    }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dronashala-os-backup-${exportedAt.slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
    setSettings(s => ({ ...s, lastExportAt: exportedAt }));
    log("Export complete", "ok");
  };
  const importJSON = (file) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d || d.v !== 1) { log("Import failed — schema mismatch", "warn"); return; }
        setProjects(d.projects || []); setAgents(d.agents ? [...d.agents] : [...SEED_AGENTS]);
        setPrompts(d.prompts ? [...d.prompts] : [...SEED_PROMPTS]); setNotes(d.notes || []);
        setSettings(d.settings ? { ...d.settings } : { ...DEFAULT_SETTINGS });
        setActivity(d.activity || []);
        log("Import complete", "ok");
      } catch { log("Import failed — invalid file", "warn"); }
    };
    r.readAsText(file);
  };
  const resetWorkspace = () => {
    // Spread into fresh references — SEED_AGENTS/SEED_PROMPTS/DEFAULT_SETTINGS
    // are shared module constants, so if state already equals one of them by
    // reference, React bails out of the update and the persist effect never
    // fires, silently skipping the localStorage write.
    setProjects([]); setAgents([...SEED_AGENTS]); setPrompts([...SEED_PROMPTS]);
    setNotes([]); setSettings({ ...DEFAULT_SETTINGS }); setActivity([]);
    log("Workspace reset", "warn");
  };

  const api = {
    ready, projects, agents, prompts, notes, settings, activity, toast,
    nav, setNav, modal, setModal, paletteOpen, setPaletteOpen,
    setSettings, setAgents, setPrompts, setNotes,
    log, copyText, addProject, updateProject, setStage,
    addNote, deleteNote, addPrompt, updatePrompt, togglePin,
    exportJSON, importJSON, resetWorkspace,
  };
  return <Store.Provider value={api}>{children}</Store.Provider>;
}
