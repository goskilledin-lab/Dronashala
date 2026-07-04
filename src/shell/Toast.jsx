import { T } from "../core/tokens.js";
import { useStore } from "../core/store.jsx";

/* Fed entirely by the unified activity log (§2 Golden Rule #3) — no
   separate notification store. 2.4s auto-dismiss handled in store.jsx. */
export function Toast() {
  const st = useStore();
  if (!st.toast) return null;
  const warn = st.toast.kind === "warn";
  return (
    <div
      style={{
        position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)", zIndex: 65,
        background: T.surface2, border: `1px solid ${(warn ? T.warn : T.gold)}66`,
        borderRadius: 24, padding: "9px 18px", fontSize: 13, fontWeight: 600,
        color: warn ? T.warn : T.text, whiteSpace: "nowrap",
        boxShadow: "0 6px 24px rgba(0,0,0,0.5)", fontFamily: T.fontBody,
      }}
    >
      {st.toast.text}
    </div>
  );
}
