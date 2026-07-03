/* ═══════════ L2 · SEED DATA ═══════════
   Agents = real Claude Skills (12, incl. Conductor). Prompts = the
   Dronashala OS 16-prompt library. Copied verbatim from
   DRONASHALA_OS_MASTER_BUILD.md §5. */
import { now } from "./utils.js";

export const SEED_AGENTS = [
  { id: "ag_topic", name: "Topic Agent", desc: "Generate & score video topic ideas, topic intake.", invocation: "Use dronashala-topic: generate and score topic ideas for the next video", stageLink: 0, pinned: true },
  { id: "ag_research", name: "Research Agent", desc: "Sourced, confidence-tagged Research Brief.", invocation: "Use dronashala-research: build a research brief for [TOPIC]", stageLink: 1, pinned: true },
  { id: "ag_script", name: "Script Agent", desc: "DSSF six-beat Hindi narration script.", invocation: "Use dronashala-script: write the DSSF script from the locked research brief", stageLink: 2, pinned: true },
  { id: "ag_vo", name: "Voiceover Agent", desc: "ElevenLabs-ready VO doc with tags & silences.", invocation: "Use dronashala-voiceover: convert the locked script to an ElevenLabs VO document", stageLink: 3, pinned: false },
  { id: "ag_scene", name: "Scene Breakdown Agent", desc: "Line-by-line 20-field scene breakdown.", invocation: "Use dronashala-scene-breakdown: break down the locked script into the 20-field schema", stageLink: 4, pinned: false },
  { id: "ag_cont", name: "Continuity Agent", desc: "Character / Location / Object Lock Sheets.", invocation: "Use dronashala-continuity: build lock sheets for all recurring elements", stageLink: 5, pinned: false },
  { id: "ag_img", name: "Image Prompt Agent", desc: "5 cinematic image prompts per scene.", invocation: "Use dronashala-image-prompts: generate the 5-variation prompt set per scene", stageLink: 6, pinned: false },
  { id: "ag_vid", name: "Video Prompt Agent", desc: "Image-to-video motion prompts (Veo/Kling/Runway).", invocation: "Use dronashala-video-prompts: generate motion prompts for the accepted key frames", stageLink: 7, pinned: false },
  { id: "ag_edit", name: "Edit Blueprint Agent", desc: "Pacing, cuts, silences, sound, captions.", invocation: "Use dronashala-edit-blueprint: build the editing decision sheet", stageLink: 8, pinned: false },
  { id: "ag_upload", name: "Upload Pack Agent", desc: "Titles, description, hashtags, thumbnail, CTA.", invocation: "Use dronashala-upload-pack: generate the platform upload pack", stageLink: 9, pinned: false },
  { id: "ag_analysis", name: "Analysis Agent", desc: "Retention diagnosis + one improvement.", invocation: "Use dronashala-analysis: run post-upload analysis on this video's data", stageLink: 10, pinned: false },
  { id: "ag_conductor", name: "Conductor", desc: "Orchestrates all 11 agents, enforces stage gates.", invocation: "Use dronashala-conductor: what's next for the current video?", stageLink: -1, pinned: true },
];

const PROMPT_DEFS = [
  ["Topic Research", "Research"], ["Research Consolidation", "Research"],
  ["Script Writing", "Script"], ["Script Rewriting", "Script"], ["Hook Generation", "Script"],
  ["VO Conversion", "Voiceover"], ["Scene Breakdown", "Visual"],
  ["Character Sheet Generation", "Continuity"], ["Location Sheet Generation", "Continuity"], ["Object Continuity Sheet", "Continuity"],
  ["Image Prompt Generation", "Visual"], ["Image Prompt Enhancement", "Visual"], ["Image-to-Video Prompt", "Visual"],
  ["Edit Plan Generation", "Edit"], ["Upload Pack Generation", "Upload"], ["Post-Upload Analysis", "Analysis"],
];

export const SEED_PROMPTS = PROMPT_DEFS.map(([title, category], i) => ({
  id: "pr_" + (i + 1),
  title,
  category,
  body: `[Dronashala OS Prompt #${i + 1} — ${title}]\nPaste the full prompt text from the Production OS here, or run the matching agent skill directly.`,
  tags: [category.toLowerCase()],
  createdAt: now(),
}));
