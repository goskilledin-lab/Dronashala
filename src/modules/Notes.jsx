import { useState } from "react";
import { T } from "../core/tokens.js";
import { useStore } from "../core/store.jsx";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Eyebrow } from "../ui/Eyebrow.jsx";
import { Empty } from "../ui/Empty.jsx";
import { Button } from "../ui/Button.jsx";
import { timeAgo } from "../core/utils.js";

export function Notes() {
  const st = useStore();
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div>
      <Eyebrow>Notes · {st.notes.length}</Eyebrow>
      <Button style={{ marginBottom: 12 }} onClick={() => st.setModal({ type: "newNote" })}>+ Quick Note</Button>

      {st.notes.length === 0 ? (
        <Empty text="Ideas yahan capture honge." />
      ) : (
        st.notes.map((n) => {
          const linkedProject = n.projectId ? st.projects.find((p) => p.id === n.projectId) : null;
          const confirming = confirmId === n.id;
          return (
            <Card key={n.id} style={{ marginBottom: 8, padding: 13 }}>
              <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5 }}>{n.text}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 0 }}>
                  <Badge>{n.tag}</Badge>
                  {linkedProject && (
                    <span style={{ fontSize: 11, color: T.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {linkedProject.title}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  {confirming ? (
                    <>
                      <button
                        onClick={() => st.deleteNote(n.id)}
                        style={{ background: "none", border: "none", color: T.warn, cursor: "pointer", fontSize: 11, fontWeight: 700, padding: 0 }}
                      >
                        Delete?
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontSize: 11, padding: 0 }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 11, color: T.faint }}>{timeAgo(n.createdAt)}</span>
                      <button
                        onClick={() => setConfirmId(n.id)}
                        aria-label="Delete note"
                        style={{ background: "none", border: "none", color: T.faint, cursor: "pointer", fontSize: 13, padding: 0 }}
                      >
                        ✕
                      </button>
                    </>
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
