import { T, STAGES } from "../core/tokens.js";

/* "Chakra Trail" — §6.3.1, the app's core visual verb. The 11-stage
   pipeline as engraved bronze notches on a hairline rail: completed =
   filled bronze @0.55, current = gold-filled with a glow + diamond cap,
   future = plain line color. Pass onStageClick to make segments
   tappable (Pipeline, §7.3) — Home just renders it read-only. */
export function StageTrail({ stage, onStageClick }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {STAGES.map((_, i) => {
        const done = i < stage;
        const current = i === stage;
        const bar = (
          <div
            style={{
              height: 4, borderRadius: 2, position: "relative",
              background: done ? T.bronze : current ? T.gold : T.line,
              opacity: done ? 0.55 : 1,
              boxShadow: current ? `0 0 10px ${T.gold}` : "none",
            }}
          >
            {current && (
              <div
                style={{
                  position: "absolute", top: -2, right: -2, width: 8, height: 8,
                  background: T.gold, transform: "rotate(45deg)", borderRadius: 2,
                  boxShadow: `0 0 6px ${T.gold}`,
                }}
              />
            )}
          </div>
        );
        return onStageClick ? (
          <div key={i} style={{ flex: 1, padding: "10px 0", cursor: "pointer" }} onClick={() => onStageClick(i)}>
            {bar}
          </div>
        ) : (
          <div key={i} style={{ flex: 1 }}>{bar}</div>
        );
      })}
    </div>
  );
}
