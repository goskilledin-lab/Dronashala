import { T } from "../core/tokens.js";
import { Card } from "./Card.jsx";
import { Button } from "./Button.jsx";

export function Empty({ text, action, onAction }) {
  return (
    <Card style={{ textAlign: "center", padding: 32, borderStyle: "dashed" }}>
      <div style={{ color: T.dim, fontSize: 13, lineHeight: 1.5, marginBottom: action ? 14 : 0 }}>
        {text}
      </div>
      {action && <Button onClick={onAction}>{action}</Button>}
    </Card>
  );
}
