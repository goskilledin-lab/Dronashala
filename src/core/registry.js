/* ═══════════ L2 · MODULE REGISTRY (plugin system) ═══════════
   Nav + routing are generated from this list — adding a module later is
   1 registry entry + 1 component file, never a Shell/BottomNav rewrite.

   Reserved slots (context only — do not build until their version):
     analytics  (V2)   calendar (V2)   conductor (V4)
     voice      (V5)   aiMemory (V7) */
import { Home } from "../modules/Home.jsx";
import { Agents } from "../modules/Agents.jsx";
import { Pipeline } from "../modules/Pipeline.jsx";
import { Prompts } from "../modules/Prompts.jsx";
import { Notes } from "../modules/Notes.jsx";

export const REGISTRY = [
  { id: "home", label: "Home", icon: "◆", component: Home },
  { id: "agents", label: "Agents", icon: "⚡", component: Agents },
  { id: "pipeline", label: "Pipeline", icon: "▸▸", component: Pipeline },
  { id: "prompts", label: "Prompts", icon: "❝", component: Prompts },
  { id: "notes", label: "Notes", icon: "✎", component: Notes },
];
