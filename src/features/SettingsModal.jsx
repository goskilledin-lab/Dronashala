import { useState } from "react";
import { T } from "../core/tokens.js";
import { SCHEMA_V } from "../core/storage.js";
import { useStore } from "../core/store.jsx";
import { Modal } from "../ui/Modal.jsx";
import { Button } from "../ui/Button.jsx";

export function SettingsModal({ onClose }) {
  const st = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Modal title="Settings & Data" onClose={onClose}>
      <div style={{ display: "grid", gap: 10 }}>
        <Button onClick={st.exportJSON}>Export JSON Backup</Button>
        <label
          style={{
            fontFamily: T.fontBody, fontWeight: 600, fontSize: 13, textAlign: "center", display: "block",
            padding: "9px 14px", borderRadius: T.rSm, border: `1px solid ${T.hair}`, color: T.dim, cursor: "pointer",
          }}
        >
          Import JSON
          <input
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) { st.importJSON(e.target.files[0]); onClose(); } }}
          />
        </label>
        <Button
          variant="ghost"
          style={{ color: T.warn, borderColor: T.warn + "55" }}
          onClick={() => { if (confirmReset) { st.resetWorkspace(); onClose(); } else setConfirmReset(true); }}
        >
          {confirmReset ? "Tap again to confirm reset" : "Reset Workspace"}
        </Button>
        <div style={{ color: T.dim, fontSize: 11, textAlign: "center", marginTop: 4 }}>
          Dronashala OS · V1 · Schema v{SCHEMA_V}
        </div>
      </div>
    </Modal>
  );
}
