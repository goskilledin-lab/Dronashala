import { useState, useEffect } from "react";
import { T, SERIES } from "../core/tokens.js";
import { timeAgo } from "../core/utils.js";
import { useStore } from "../core/store.jsx";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";
import { Chip } from "../ui/Chip.jsx";
import { Badge } from "../ui/Badge.jsx";
import { SettingsModal } from "./SettingsModal.jsx";

const PRIORITIES = ["high", "normal", "low"];
const HOOK_ARCHETYPES = ["A", "B", "C", "D"];
const STATUSES = ["active", "paused", "done", "archived"];
const NOTE_TAGS = ["idea", "hook", "task", "research"];

const inputStyle = {
  width: "100%", boxSizing: "border-box", background: T.surface2, border: `1px solid ${T.line}`,
  borderRadius: T.rSm, padding: "11px 13px", color: T.text, fontFamily: T.fontBody, fontSize: 14, outline: "none",
};
const fieldLabel = { marginBottom: 4, fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: "0.06em" };

export function ModalRouter() {
  const st = useStore();
  const m = st.modal;
  const [f, setF] = useState({});
  useEffect(() => setF({}), [m]);
  if (!m) return null;
  const close = () => st.setModal(null);

  if (m.type === "newProject") {
    return (
      <Modal title="New Project" onClose={close}>
        <input
          style={inputStyle} placeholder="Video title…" autoFocus
          value={f.title || ""} onChange={(e) => setF({ ...f, title: e.target.value })}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 16px" }}>
          {Object.entries(SERIES).map(([k, v]) => (
            <Chip key={k} label={v.label} color={v.c} active={f.series === k} onClick={() => setF({ ...f, series: k })} />
          ))}
        </div>
        <Button
          style={{ width: "100%" }} disabled={!f.title || !f.series}
          onClick={() => { st.addProject(f); close(); st.setNav("pipeline"); }}
        >
          Create Project
        </Button>
      </Modal>
    );
  }

  if (m.type === "newNote") {
    return (
      <Modal title="Quick Note" onClose={close}>
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} autoFocus
          placeholder="Idea, hook, ya reminder…" value={f.text || ""} onChange={(e) => setF({ ...f, text: e.target.value })}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 16px" }}>
          {NOTE_TAGS.map((t) => (
            <Chip key={t} label={t} active={(f.tag || "idea") === t} onClick={() => setF({ ...f, tag: t })} />
          ))}
        </div>
        {st.projects.length > 0 && (
          <select
            style={{ ...inputStyle, marginBottom: 16 }}
            value={f.projectId || ""}
            onChange={(e) => setF({ ...f, projectId: e.target.value || null })}
          >
            <option value="">No linked project</option>
            {st.projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        )}
        <Button
          style={{ width: "100%" }} disabled={!f.text}
          onClick={() => { st.addNote(f.text, f.tag || "idea", f.projectId); close(); }}
        >
          Save Note
        </Button>
      </Modal>
    );
  }

  if (m.type === "editProject") {
    const project = st.projects.find((p) => p.id === m.payload?.id);
    if (!project) return null;
    const title = f.title !== undefined ? f.title : project.title;
    const series = f.series !== undefined ? f.series : project.series;
    const priority = f.priority !== undefined ? f.priority : project.priority;
    const hookArchetype = f.hookArchetype !== undefined ? f.hookArchetype : project.hookArchetype;
    const status = f.status !== undefined ? f.status : project.status;
    return (
      <Modal title="Edit Project" onClose={close}>
        <input style={inputStyle} value={title} onChange={(e) => setF({ ...f, title: e.target.value })} />

        <div style={{ ...fieldLabel, marginTop: 14 }}>Series</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(SERIES).map(([k, v]) => (
            <Chip key={k} label={v.label} color={v.c} active={series === k} onClick={() => setF({ ...f, series: k })} />
          ))}
        </div>

        <div style={fieldLabel}>Priority</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRIORITIES.map((p) => (
            <Chip key={p} label={p} active={priority === p} onClick={() => setF({ ...f, priority: p })} />
          ))}
        </div>

        <div style={fieldLabel}>Hook Archetype</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {HOOK_ARCHETYPES.map((h) => (
            <Chip key={h} label={h} active={hookArchetype === h} onClick={() => setF({ ...f, hookArchetype: hookArchetype === h ? null : h })} />
          ))}
        </div>

        <div style={fieldLabel}>Status</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {STATUSES.map((s) => (
            <Chip key={s} label={s} color={s === "archived" ? T.warn : undefined} active={status === s} onClick={() => setF({ ...f, status: s })} />
          ))}
        </div>

        <Button
          style={{ width: "100%" }} disabled={!title}
          onClick={() => { st.updateProject(project.id, { title, series, priority, hookArchetype, status }); close(); }}
        >
          Save Changes
        </Button>
      </Modal>
    );
  }

  if (m.type === "promptView") {
    const prompt = st.prompts.find((p) => p.id === m.payload?.id);
    if (!prompt) return null;
    return (
      <Modal title={prompt.title} onClose={close}>
        <Badge>{prompt.category}</Badge>
        <div
          style={{
            marginTop: 12, padding: 12, borderRadius: T.rSm, background: T.surface2,
            border: `1px solid ${T.line}`, fontSize: 13, color: T.text, lineHeight: 1.6,
            whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto",
          }}
        >
          {prompt.body}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Button style={{ flex: 1 }} onClick={() => st.copyText(prompt.body, prompt.title)}>Copy</Button>
          <Button variant="ghost" onClick={() => st.setModal({ type: "promptEdit", payload: { id: prompt.id } })}>Edit</Button>
        </div>
      </Modal>
    );
  }

  if (m.type === "promptEdit") {
    const existing = m.payload?.id ? st.prompts.find((p) => p.id === m.payload.id) : null;
    const title = f.title !== undefined ? f.title : (existing?.title || "");
    const category = f.category !== undefined ? f.category : (existing?.category || "");
    const body = f.body !== undefined ? f.body : (existing?.body || "");
    const knownCategories = [...new Set(st.prompts.map((p) => p.category))];
    return (
      <Modal title={existing ? "Edit Prompt" : "New Prompt"} onClose={close}>
        <input style={inputStyle} placeholder="Prompt title…" value={title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <input style={{ ...inputStyle, marginTop: 10 }} placeholder="Category…" value={category} onChange={(e) => setF({ ...f, category: e.target.value })} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 10px" }}>
          {knownCategories.map((c) => (
            <Chip key={c} label={c} active={category === c} onClick={() => setF({ ...f, category: c })} />
          ))}
        </div>
        <textarea
          style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
          placeholder="Prompt body…" value={body} onChange={(e) => setF({ ...f, body: e.target.value })}
        />
        <Button
          style={{ width: "100%", marginTop: 14 }} disabled={!title || !category || !body}
          onClick={() => {
            if (existing) st.updatePrompt(existing.id, { title, category, body });
            else st.addPrompt({ title, category, body });
            close();
          }}
        >
          {existing ? "Save Changes" : "Create Prompt"}
        </Button>
      </Modal>
    );
  }

  if (m.type === "activity") {
    return (
      <Modal title="Activity Log" onClose={close}>
        {st.activity.length === 0 ? (
          <div style={{ color: T.dim, fontSize: 13 }}>Log khaali hai.</div>
        ) : (
          st.activity.map((a) => (
            <div
              key={a.id}
              style={{ display: "flex", justifyContent: "space-between", padding: "9px 2px", borderBottom: `1px solid ${T.line}`, fontSize: 13 }}
            >
              <span style={{ color: a.kind === "warn" ? T.warn : T.text }}>{a.text}</span>
              <span style={{ color: T.faint, fontSize: 11, marginLeft: 10, whiteSpace: "nowrap" }}>{timeAgo(a.at)}</span>
            </div>
          ))
        )}
      </Modal>
    );
  }

  if (m.type === "settings") {
    return <SettingsModal onClose={close} />;
  }

  return null;
}
