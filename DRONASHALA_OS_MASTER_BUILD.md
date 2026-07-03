# DRONASHALA OS — MASTER BUILD DOCUMENT (V1)
**For: Claude Code · Status: Architecture Frozen · Build from Step 0 → Deploy**

---

## 0. WHAT WE ARE BUILDING

A Jarvis-style, mobile-first PWA **Command Center** for Dronashala — a faceless cinematic documentary media studio producing short-form content (YouTube Shorts / Instagram Reels) in Hindi/Hinglish.

Dronashala's content pipeline runs on 12 AI agents (Claude Skills) covering an 11-stage production flow: Topic → Research → Script → Voiceover → Scene Breakdown → Continuity → Image Prompts → Video Prompts → Edit → Upload → Analysis.

**V1 = Path A "Cockpit":** The dashboard does NOT execute agents. It is the intelligent launchpad + workflow manager. Agents run inside Claude chat; the OS gives one-tap access to their exact invocation phrases, tracks every video through the pipeline, stores prompts and notes, and logs all activity. API-based agent execution is V3+.

**Prime directive:** This is not a dashboard. It is the foundation of Dronashala OS. Every future version (V2–V7) plugs into this foundation without rebuilds. Scalability, maintainability, and modularity > aesthetics.

**DO NOT redesign, rename concepts, or expand scope beyond this document.**

---

## 1. TECH STACK

| Layer | Choice | Reason |
|---|---|---|
| Build | Vite + React 18 (JavaScript, no TS in V1) | Fast, simple, portable |
| Styling | Design tokens (JS object) + inline/CSS — no UI framework | tokens.js IS the design system |
| Fonts | `@fontsource/montserrat` + `@fontsource/cinzel` + `@fontsource/tiro-devanagari-sanskrit`, self-hosted | Must render identically offline — NO Google Fonts CDN |
| Persistence | localStorage via versioned storage service | `{v:1, data}` envelope + migrate() hook |
| Routing | Hash-based (`#/home`) driven by registry | Android/browser back button must work |
| PWA | vite-plugin-pwa, offline-first | Installable app |
| Deploy | Cloudflare Pages (static) | Zero backend for V1 |
| VCS | Git, commit per step, tag `v1.0-rc` at end | Traceability |

---

## 2. ARCHITECTURE (4 LAYERS — FROZEN)

```
LAYER 4 — MODULES (plugins)
  Home · Agents · Pipeline · Prompts · Notes
  [reserved: analytics(V2), calendar(V2), conductor(V4), voice(V5), aiMemory(V7)]
LAYER 3 — SHARED UI KIT
  Card · Badge · Eyebrow · Empty · SectionHead · StageTrail · Modal · IconButton
LAYER 2 — CORE SERVICES
  tokens · storage (versioned) · store (Context) · registry · seed · utils
LAYER 1 — SHELL
  App frame · Header · BottomNav · Toast · hash router bootstrap
```

**Golden rules (non-negotiable):**
1. Modules NEVER import each other. Communication only through the store.
2. Nav + routing generated from `registry.js`. Adding a module = 1 registry entry + 1 component file.
3. ONE unified activity log (`ds-activity`, capped 100 entries) powers Toast + Recent Activity + History. No separate notification store.
4. All colors/type from `tokens.js`. Zero hardcoded hex in components.
5. Data model (Section 4) is locked. Changes require schema version bump + migration.

---

## 3. FOLDER STRUCTURE

```
dronashala-os/
├── public/                    # icons (generated, Step 1)
├── src/
│   ├── shell/
│   │   ├── App.jsx            # frame, provider wiring
│   │   ├── Header.jsx         # logo, search btn, settings btn
│   │   ├── BottomNav.jsx      # registry-driven tabs
│   │   └── Toast.jsx          # fed by activity log
│   ├── core/
│   │   ├── tokens.js          # T, SERIES, STAGES
│   │   ├── storage.js         # stLoad/stSave, {v,data}, migrate()
│   │   ├── store.jsx          # Context + all actions
│   │   ├── registry.js        # module plugin list + reserved slots
│   │   ├── seed.js            # 12 agents, 16 prompts (verbatim §5)
│   │   ├── router.js          # hash sync ↔ store.nav, modal hash
│   │   └── utils.js           # uid, now, timeAgo
│   ├── ui/
│   │   ├── Card.jsx  Badge.jsx  Eyebrow.jsx  Empty.jsx
│   │   ├── SectionHead.jsx  StageTrail.jsx  Modal.jsx
│   ├── modules/
│   │   ├── Home.jsx  Agents.jsx  Pipeline.jsx  Prompts.jsx  Notes.jsx
│   ├── features/
│   │   ├── CommandPalette.jsx  ModalRouter.jsx  SettingsModal.jsx
│   └── main.jsx
├── vite.config.js             # PWA plugin config
└── package.json
```

---

## 4. DATA MODEL (LOCKED — SCHEMA v1)

All localStorage payloads wrapped: `{ v: 1, data: ... }`. `migrate(payload, fallback)` upgrades old versions; never corrupts.

**Keys:** `ds-projects` · `ds-agents` · `ds-prompts` · `ds-notes` · `ds-settings` · `ds-activity`

```js
Project  { id, title, series /*HIDDEN|SIGNAL|MAPROOM|EMPIRES|HTWW|MIND*/,
           status /*active|paused|done|archived*/, stage /*0-10*/,
           stageUpdatedAt, hookArchetype /*A|B|C|D|null*/,
           priority /*high|normal|low*/, favorite /*bool*/,
           notes, createdAt, updatedAt }

Agent    { id, name, desc, invocation, stageLink /*0-10, -1=global*/, pinned }

Prompt   { id, title, category, body, tags[], createdAt }

Note     { id, text, tag /*idea|hook|task|research*/, projectId?, createdAt }

Settings { activeProjectId, todayFocus, lastExportAt }

Activity { id, text, kind /*info|ok|warn*/, at }   // capped at 100
```

**Pipeline stages (index = stage value):**
`0 Topic Intake · 1 Research · 2 Script · 3 Voiceover · 4 Scene Breakdown · 5 Continuity · 6 Image Prompts · 7 Video Prompts · 8 Edit · 9 Upload · 10 Analysis`

**Series + colors:**
`HIDDEN #D99A2B · SIGNAL #5B8DD9 · MAPROOM #4CAF7D · EMPIRES #B0619A · HTWW #4FB3C6 · MIND #9B7ED9`

---

## 5. SEED DATA (COPY VERBATIM INTO seed.js)

### 5.1 Agents (12)

| id | name | stageLink | pinned | invocation |
|---|---|---|---|---|
| ag_topic | Topic Agent | 0 | ✓ | `Use dronashala-topic: generate and score topic ideas for the next video` |
| ag_research | Research Agent | 1 | ✓ | `Use dronashala-research: build a research brief for [TOPIC]` |
| ag_script | Script Agent | 2 | ✓ | `Use dronashala-script: write the DSSF script from the locked research brief` |
| ag_vo | Voiceover Agent | 3 | — | `Use dronashala-voiceover: convert the locked script to an ElevenLabs VO document` |
| ag_scene | Scene Breakdown Agent | 4 | — | `Use dronashala-scene-breakdown: break down the locked script into the 20-field schema` |
| ag_cont | Continuity Agent | 5 | — | `Use dronashala-continuity: build lock sheets for all recurring elements` |
| ag_img | Image Prompt Agent | 6 | — | `Use dronashala-image-prompts: generate the 5-variation prompt set per scene` |
| ag_vid | Video Prompt Agent | 7 | — | `Use dronashala-video-prompts: generate motion prompts for the accepted key frames` |
| ag_edit | Edit Blueprint Agent | 8 | — | `Use dronashala-edit-blueprint: build the editing decision sheet` |
| ag_upload | Upload Pack Agent | 9 | — | `Use dronashala-upload-pack: generate the platform upload pack` |
| ag_analysis | Analysis Agent | 10 | — | `Use dronashala-analysis: run post-upload analysis on this video's data` |
| ag_conductor | Conductor | -1 | ✓ | `Use dronashala-conductor: what's next for the current video?` |

Descriptions: Topic="Generate & score video topic ideas, topic intake." Research="Sourced, confidence-tagged Research Brief." Script="DSSF six-beat Hindi narration script." Voiceover="ElevenLabs-ready VO doc with tags & silences." Scene="Line-by-line 20-field scene breakdown." Continuity="Character / Location / Object Lock Sheets." Image="5 cinematic image prompts per scene." Video="Image-to-video motion prompts (Veo/Kling/Runway)." Edit="Pacing, cuts, silences, sound, captions." Upload="Titles, description, hashtags, thumbnail, CTA." Analysis="Retention diagnosis + one improvement." Conductor="Orchestrates all 11 agents, enforces stage gates."

### 5.2 Prompts (16 — Dronashala OS Prompt Library)

Categories in brackets: 1 Topic Research [Research] · 2 Research Consolidation [Research] · 3 Script Writing [Script] · 4 Script Rewriting [Script] · 5 Hook Generation [Script] · 6 VO Conversion [Voiceover] · 7 Scene Breakdown [Visual] · 8 Character Sheet Generation [Continuity] · 9 Location Sheet Generation [Continuity] · 10 Object Continuity Sheet [Continuity] · 11 Image Prompt Generation [Visual] · 12 Image Prompt Enhancement [Visual] · 13 Image-to-Video Prompt [Visual] · 14 Edit Plan Generation [Edit] · 15 Upload Pack Generation [Upload] · 16 Post-Upload Analysis [Analysis]

Body placeholder per prompt: `[Dronashala OS Prompt #N — TITLE]\nPaste the full prompt text from the Production OS here, or run the matching agent skill directly.`

---

## 6. DESIGN LANGUAGE — "The Digital Gurukul" (tokens.js)

**Identity thesis:** *If Dronacharya built JARVIS in 2050.* Ancient gurukul discipline (engraved bronze, temple geometry, Sanskrit motifs) fused with a futuristic AI HUD (glass depth, gold data-glow). Timeless, cinematic, unmistakably Dronashala. Name meaning drives every choice: **Dronashala = Dronacharya (mastery/wisdom) + Pathshala (structured learning).**

> **V1 execution rule — Progressive Intensity.** Lock the full visual DNA now; execute with restraint. V1 ships the *language* + 3 signature moments. Heavy motion (particle systems, 3D depth, animated light trails, live mandala rotation) is explicitly **deferred to V2** per roadmap — do NOT build it in V1. Reason: mobile-first PWA performance on mid-range Android. Everything below marked `[V2]` is spec-for-later, not build-now.

### 6.1 Palette (tokens.js)
```js
T = {
  // Cinematic obsidian base
  bg:"#07090D", bgDeep:"#04050A", surface:"#0F131B", surface2:"#161C27",
  glass:"rgba(18,24,34,0.55)",           // glass panel fill (blur 14px)
  line:"#232C3A", hair:"rgba(184,132,64,0.22)", // bronze hairline
  // Parchment / bone text
  text:"#EDE6D6", dim:"#9AA0AD", faint:"#5A6272",
  // Bronze → Gold spectrum (primary accent)
  bronze:"#B0763C", ember:"#D99A2B", gold:"#F0C060", goldSoft:"rgba(217,154,43,0.14)",
  // Sapphire (secondary accent — AI/data)
  sapphire:"#2A6FDB", sapphireDeep:"#14294D", sapphireSoft:"rgba(42,111,219,0.14)",
  ok:"#4CAF7D", warn:"#E0684B",
  fontDisplay:"'Cinzel',serif",          // engraved-stone temple display
  fontBody:"'Montserrat',system-ui,sans-serif",
  fontDeva:"'Tiro Devanagari Sanskrit',serif", // Sanskrit accents
  r:14, rSm:9
}
```
- **Bronze/gold = primary** (mastery, sacred). **Sapphire = secondary** (intelligence, data/AI states — active glows, palette, agent links). Never let sapphire outweigh gold.
- Series colors (§4) stay unchanged — they slot cleanly into the darker base.

### 6.2 Typography (all self-hosted, offline)
- **Display — Cinzel** (`@fontsource/cinzel`, 600/700): Roman-inscription / engraved-temple feel for the wordmark, module eyebrows, big numbers. Used with restraint.
- **Body/UI — Montserrat** (600/700/800): all functional text, buttons, cards.
- **Sanskrit accent — Tiro Devanagari Sanskrit** (`@fontsource/tiro-devanagari-sanskrit`): optional ॐ / द्रोण motif, series glyphs, decorative dividers only — never load-bearing UI.
- Eyebrows: Cinzel/Montserrat 700, uppercase, letter-spacing 0.18em, in ember.

### 6.3 Signature elements (build all 3 in V1)
1. **Chakra Trail** (evolves the Ember Trail): the 11-stage pipeline as engraved bronze notches on a hairline rail. Completed = filled bronze @0.55; current = gold-filled with `box-shadow:0 0 10px gold` + a tiny diamond cap; future = line color. This is the app's core visual verb — appears on Home, Pipeline, anywhere a video's progress shows.
2. **Yantra backdrop**: a subtle, **static** SVG sacred-geometry mark (concentric mandala / Sri-Yantra-inspired triangles) fixed behind Home, ≤6% opacity, bronze stroke. Sets the temple mood with zero runtime cost. *(V2: slow rotation + parallax.)*
3. **Glass panels**: cards = `T.glass` fill + `backdrop-filter:blur(14px)` + 1px bronze `hair` border + a 1px gold top-edge highlight (holographic depth). One consistent panel = the whole HUD language.

### 6.4 Ornament & structure
- **Sanskrit divider**: thin bronze rule with a centered diamond/◈ node — separates sections instead of plain lines. Encodes the "engraved manuscript" feel.
- **Diamond bullets** (◆/◈) over dots; **corner ticks** on key panels (HUD framing) — subtle, 1px, bronze.
- Circular/HUD accents allowed around the Home health snapshot (mandala-inspired ring), but static in V1.

### 6.5 Buttons, toast, layout
- Primary button: gold→ember vertical gradient, dark ink text, weight 700, faint gold glow on press.
- Ghost button: transparent, bronze `hair` border, dim text; hover/active = sapphire border.
- Toast: glass pill, bottom-center above nav, bronze border (warn = warn border), 2.4s dismiss.
- Layout: mobile-first, bottom nav, safe-area insets, content max-width 640px centered. Desktop = same layout, no sidebar in V1.

### 6.6 Motion policy
- **V1:** micro-interactions only — press feedback, card tap glow, palette/modal fade+slide, stage-set pulse. Respect `prefers-reduced-motion`.
- **[V2] deferred:** flowing knowledge-particle field, animated light trails between stages, 3D panel tilt/parallax, live mandala rotation, page-load orchestration.

---

## 7. MODULE SPECS (FULL V1)

### 7.1 Home (`#/home`)
1. **Health Snapshot** — 4 stat cards (derived, no extra storage): Projects total · Active · Pinned agents · Notes count.
2. **Active Video card** — title, series badge, Ember Trail, "Stage N/11 · [name] · updated Xm ago". Tap → Pipeline. Empty state → "+ New Project".
3. **Backup nudge** — if `lastExportAt` null or >7 days: dismissible one-liner "Backup 7+ din purana hai — Export JSON" → opens Settings. No popups.
4. **Today's Focus** — single editable input, persists to settings on blur.
5. **Quick Actions** — + Project · + Note · Agents · 🎙 Voice (placeholder: toast "Voice — coming in V5").
6. **Pinned Agents** — 2-col grid, tap = copy invocation.
7. **Recent Activity** — last 5 from unified log · "History →" opens full Activity modal.

### 7.2 Agents / Launchpad (`#/agents`)
- Agents grouped by pipeline stage order (Conductor pinned at top as "Global").
- Each card: name, desc, stage label, ★ pin/unpin toggle (persists), tap card = expand to show full invocation text, **Copy** button = one-tap copy + activity log.
- Pinned agents surface on Home automatically.

### 7.3 Pipeline (`#/pipeline`)
- Filter chips: series (6) + status (active/paused/done).
- Project card: ★ favorite toggle, priority dot (high=ember, low=faint), title, series badge, **Ember Trail where each segment is tappable → sets that stage directly** (not just Next). Confirm via toast.
- Current-stage linked agent shortcut button (`⚡ AgentName` = copy invocation).
- "Next →" button advances stage; stage 10 shows "Done" action → status=done.
- Long-press / edit icon → modal: edit title, series, priority, hookArchetype, status (incl. archive).
- Tap card header → set as activeProjectId.

### 7.4 Prompt Library (`#/prompts`)
- Search input + category filter chips.
- Prompt card: title + category badge. Tap → full-body modal with **Copy** button.
- "+ Prompt" → modal: title, category select, body textarea. Edit existing via modal.

### 7.5 Notes (`#/notes`)
- "+ Quick Note" → modal: textarea, tag chips (idea/hook/task/research), optional project selector.
- Feed: reverse-chrono cards — text, tag badge, linked project name (if any), timeAgo, delete (✕ with inline confirm).

### 7.6 Command Palette (global)
- Open: header 🔍 button (mobile) + Ctrl/Cmd+K (desktop).
- Searches: modules ("Open Pipeline"), actions (New Project, Quick Note, Export Backup), agents (⚡ copy invocation), projects (🎬 set active + jump to pipeline).
- Enter = run top result. Esc = close. Max 10 results.

### 7.7 Settings modal (header ⚙)
- **Export JSON** — downloads full backup `dronashala-os-backup-YYYY-MM-DD.json`, sets `lastExportAt`.
- **Import JSON** — strict check: reject if `v !== 1` → warn toast. Replaces all stores.
- **Reset Workspace** — double-tap confirm, restores seed data.
- Footer: "Dronashala OS · V1 · Schema v1".

### 7.8 Activity system (core, not a module)
- `log(text, kind)` → prepend to `ds-activity` (cap 100) + fire toast.
- Logged events: project created, stage changed, note saved, prompt/invocation copied, export/import/reset, warns.
- Views: Toast (transient) · Home Recent (5) · Activity modal (full).

---

## 8. ROUTING & RELIABILITY RULES

- **Hash routing:** `#/home` etc. ↔ store.nav two-way sync. Opening a modal pushes a hash state (`#/pipeline?m=editProject`) so **back button closes modal first, then navigates modules, never exits the app**.
- **Storage safety:** every localStorage write in try/catch; on QuotaExceeded/failure → warn toast via activity log. Never fail silently.
- **Copy fallback:** `navigator.clipboard` → fallback textarea + execCommand → warn toast on total failure.
- **First-run:** empty storage → seed agents+prompts, persist immediately.

---

## 9. PWA CONFIG

- vite-plugin-pwa: `registerType: 'autoUpdate'`, offline-first precache of all assets incl. fonts.
- Manifest: name "Dronashala OS", short_name "DronaOS", theme_color `#0B0E13`, background_color `#0B0E13`, display "standalone".
- **Icons:** generate programmatically (node script in Step 1) — 192, 512, and maskable variants: deep obsidian `#07090D` background, a **bronze→gold engraved "द्रोण / D" mark** (Cinzel "D" or ॐ-inspired glyph) centered inside a thin bronze mandala ring. Keep it a clean monogram — legible at 48px, not busy.
- `<meta name="theme-color" content="#0B0E13">`.

---

## 10. BUILD STEPS (EXECUTE IN ORDER — COMMIT AFTER EACH)

**After EVERY step report:** (1) completed, (2) files created/modified, (3) decisions, (4) completion %, (5) blockers, (6) exact next command. Verify `npm run build` compiles clean between steps. No scope additions.

- **Step 0 — Init:** `npm create vite` (react), git init, install `@fontsource/montserrat`, `vite-plugin-pwa`. Folder skeleton. Commit: `chore: scaffold`.
- **Step 1 — Core foundation:** tokens.js · storage.js (versioned envelope, migrate, try/catch safety) · utils.js · icon-generation script + PWA manifest wiring. Add 2–3 sanity checks (envelope round-trip, migrate fallback, quota-failure path). Commit.
- **Step 2 — Store + registry + seed + router:** full store (all actions: addProject, updateProject, setStage, addNote, addPrompt, updatePrompt, deleteNote, pin toggles, log, copyText, exportJSON, importJSON, resetWorkspace) · registry with 5 modules + reserved slot comments · hash router with modal-hash handling. Commit.
- **Step 3 — UI kit + shell:** all L3 components (StageTrail per spec §6, remove any redundant ternaries) · Header, BottomNav, Toast, App frame. App boots with placeholder modules. Commit.
- **Step 4 — Home module** (full spec 7.1 incl. backup nudge). Commit.
- **Step 5 — Agents module** (full spec 7.2). Commit.
- **Step 6 — Pipeline module** (full spec 7.3 — tappable Ember Trail, filters, edit modal). Commit.
- **Step 7 — Prompts + Notes modules** (specs 7.4, 7.5). Commit.
- **Step 8 — Features:** CommandPalette, ModalRouter (newProject / newNote / editProject / promptView / promptEdit / activity / settings), SettingsModal with export/import/reset. Commit.
- **Step 9 — PWA + QA:** offline test (fonts render, app loads airplane-mode) · install prompt works · back-button flows (module→module, modal-close) · mobile 380px viewport pass · Lighthouse PWA installable check · run full QA checklist §11. Commit.
- **Step 10 — Release:** `npm run build` clean → tag `v1.0-rc` → deploy `dist/` to Cloudflare Pages (`npx wrangler pages deploy dist` or dashboard). Report live URL. Done.

---

## 11. QA CHECKLIST (STEP 9 GATE — ALL MUST PASS)

- [ ] Create project → appears Home + Pipeline, becomes active
- [ ] Tap Ember Trail segment → stage sets, toast + activity log entry
- [ ] Copy agent invocation → clipboard verified, logged
- [ ] Pin/unpin agent → Home pinned grid updates
- [ ] Pipeline filters (series/status) work
- [ ] Prompt search + category filter + copy body work
- [ ] Note with project link saves + deletes with confirm
- [ ] Ctrl+K + 🔍 open palette; Enter runs top result
- [ ] Export → file downloads, lastExportAt set, nudge disappears
- [ ] Import valid file → restores; invalid → warn toast, no data loss
- [ ] Reset → double-confirm → seed restored
- [ ] Android/browser back: closes modal → switches module → only then exits
- [ ] Offline: full app + Montserrat render with network off
- [ ] Refresh → all data persists
- [ ] Activity log caps at 100
- [ ] No hardcoded hex in any module (grep check)
- [ ] `npm run build` zero warnings-as-errors

---

## 12. ROADMAP (CONTEXT ONLY — DO NOT BUILD)

V2 UI/UX + Calendar/Tasks/KPIs (needs `targetDate` field → schema v2 migration) · V3 Automation — agents execute via Anthropic API inside dashboard (Path B) · V4 Agent collaboration / Conductor orchestration · V5 Voice · V6 Analytics + integrations + possible backend sync · V7 AI Memory (context, decision history, knowledge). All plug in via registry — zero rebuilds if this document is followed exactly.

---
*Dronashala OS · Master Build Document · Architecture Frozen · Founder: Ashish*
