/* ═══════════ L2 · CORE — design tokens ("The Digital Gurukul") ═══════════
   Locked palette per DRONASHALA_OS_MASTER_BUILD.md §6.1/§4. Zero hardcoded
   hex in components — everything routes through T / SERIES / STAGES. */

export const T = {
  // Cinematic obsidian base
  bg: "#07090D", bgDeep: "#04050A", surface: "#0F131B", surface2: "#161C27",
  glass: "rgba(18,24,34,0.55)",            // glass panel fill (blur 14px)
  line: "#232C3A", hair: "rgba(184,132,64,0.22)", // bronze hairline
  // Parchment / bone text
  text: "#EDE6D6", dim: "#9AA0AD", faint: "#5A6272",
  // Bronze → Gold spectrum (primary accent)
  bronze: "#B0763C", ember: "#D99A2B", gold: "#F0C060", goldSoft: "rgba(217,154,43,0.14)",
  // Sapphire (secondary accent — AI/data)
  sapphire: "#2A6FDB", sapphireDeep: "#14294D", sapphireSoft: "rgba(42,111,219,0.14)",
  ok: "#4CAF7D", warn: "#E0684B",
  ink: "#14100A",                           // dark text on gold/ember surfaces
  fontDisplay: "'Cinzel',serif",           // engraved-stone temple display
  fontBody: "'Montserrat',system-ui,sans-serif",
  fontDeva: "'Tiro Devanagari Sanskrit',serif", // Sanskrit accents
  r: 14, rSm: 9,
};

export const SERIES = {
  HIDDEN: { label: "HIDDEN", c: "#D99A2B" },
  SIGNAL: { label: "Signal", c: "#5B8DD9" },
  MAPROOM: { label: "The Map Room", c: "#4CAF7D" },
  EMPIRES: { label: "Empires", c: "#B0619A" },
  HTWW: { label: "How The World Works", c: "#4FB3C6" },
  MIND: { label: "The Mind", c: "#9B7ED9" },
};

export const STAGES = [
  "Topic Intake", "Research", "Script", "Voiceover", "Scene Breakdown",
  "Continuity", "Image Prompts", "Video Prompts", "Edit", "Upload", "Analysis",
];
