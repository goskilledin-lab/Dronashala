/* ═══════════ L2 · MODULE REGISTRY (plugin system) ═══════════
   Nav + routing are generated from this list — adding a module later is
   1 registry entry + 1 component file (wired in src/modules/index.js),
   never a Shell/BottomNav rewrite.

   Reserved slots (context only — do not build until their version):
     analytics  (V2)   calendar (V2)   conductor (V4)
     voice      (V5)   aiMemory (V7) */
export const REGISTRY = [
  { id: "home", label: "Home", icon: "◆" },
  { id: "agents", label: "Agents", icon: "⚡" },
  { id: "pipeline", label: "Pipeline", icon: "▸▸" },
  { id: "prompts", label: "Prompts", icon: "❝" },
  { id: "notes", label: "Notes", icon: "✎" },
];
