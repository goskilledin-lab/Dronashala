import { Eyebrow } from "../ui/Eyebrow.jsx";
import { Empty } from "../ui/Empty.jsx";

export function Pipeline() {
  return (
    <div>
      <Eyebrow>Pipeline Board</Eyebrow>
      <Empty text="Pipeline module — full build lands in Step 6." />
    </div>
  );
}
