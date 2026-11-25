# Design 27 `v4.0.0` Implementation Plan

> **Orchestration Architecture:** 6 parallel Hydrogen (`flash`) implementation tracks with strictly disjoint file ownership, coordinated by the Carbon Orchestrator, followed by integration verification and a full-repository audit by a Neon High (`pro`) Reviewer.

**Goal:** Upgrade Design 27 to `v4.0.0` as the undisputed #1 zero-dependency creative direction, writing, animation, and verification skill across **Websites**, **UI Animations**, **Motion Design**, **Book Writing**, **Mascot Creation**, and **Thumbnails**, while completely removing **Posters** and **Slides/Presentations**.

**Spec:** [`docs/v4-research-and-action-plan.md`](./v4-research-and-action-plan.md)

---

## Global Constraints (Binding on Every Track)

1. **Version:** `"4.0.0"` across `SKILL.md`, `README.md`, `docs/index.html`, `scripts/*.mjs`, and `evals/run-eval.mjs`.
2. **Zero Runtime NPM Dependencies:** Scripts in `scripts/` MUST use pure Node.js built-in ESM modules (`node:fs`, `node:path`, `node:child_process`, `node:crypto`, `node:os`, `node:url`, `node:http`, and global `WebSocket`). `0` `package.json` runtime dependencies.
3. **Strict Scope Removal:** Zero references to `posters.md`, `presentations.md`, `cheatsheets.md`, `books-and-editorial.md`, `mascot-and-illustration.md`, `before-after-deck.svg`, pitch decks, `16:9` slide decks, `python-pptx`, Slidev, Marp, Reveal.js, or print posters anywhere in `SKILL.md`, `README.md`, `references/`, `scripts/`, `docs/index.html`, or `evals/README.md`.
4. **Workspace-Only Files:** Never create permanent project files outside `/Users/subramanyam/Documents/Design27` (ephemeral OS temp dirs inside CLI tests/CDP user-data-dir are fine and must clean up after themselves).
5. **No Subagent Spawning Inside Workers:** Implementer workers MUST NOT call `invoke_subagent` or `swarm`; do your assigned track directly and report back concisely.

---

## Locked Cross-Track Interfaces & Contracts

### A. Active `references/` Modules (Exactly 9 Files)
- `references/direction-matrix.md` — 3-Axis Calibration, Diegetic Metaphor Law, Assertion Headline Law, Extreme Display Scale Contrast, 16 Material Worlds, Macrostructure Rotation, Mirror Test, Pre-Emit `M·I·H·C·R` Gate
- `references/verbs.md` — 8 Steerable Studio Verbs (`polish`, `bolder`, `quieter`, `distill`, `clarify`, `harden`, `redesign`, `critique`)
- `references/websites.md` — Websites, Web Apps, Dashboards & Dense Dual-Safe One-Pagers (`188×257mm`)
- `references/animations.md` — UI Animations, Frequency Test, Sub-300ms Physics, Trigger `transform-origin`, Auto-Play-Once Demos, Springs, View Transitions & Scroll Timelines
- `references/motion-design.md` — Launch Films, Standalone HTML Scrubbable Motion (`window.__d27Seek`), 2.5D Camera Rigs, Seeded Waveforms, Remotion/HyperFrames/Manim & Two-Pass FFmpeg
- `references/book-writing.md` — Book Charter, Chapter Beat Cards, Anti-AI-Prose Rules, Sentence Burstiness, HTML Web-Books (Tufte Sidenotes), Typst & CSS `@page` Spreads
- `references/mascot-creation.md` — 2-Noun Domain Metaphor Matrix, CSS-Variable Negative-Space Cutout Silhouettes (`--m-fill` / `--m-cut`), Interactive `#group` Anatomy Sheet, SVG Rigging & AI Character Locks
- `references/thumbnails.md` — Title+Thumbnail Curiosity-Gap Pairing, `0–4` Word Ceiling, Live `1280×720` + `160×90` YouTube Feed Context Previewer, Dead-Zone (`x: 1000–1280, y: 590–720`) Math
- `references/qa-and-critique.md` — 3-Tier, 7-Pass Post-Build Audit & 6-Line Art Director Sign-Off across the 6 pillars

### B. `scripts/d27-deal.mjs` (`schemaVersion: 4`) Contract
- CLI: `node scripts/d27-deal.mjs --prompt "<brief>" [--medium web|animation|motion|book|mascot|thumbnail] [--surface persuade|operate|read|experience] [--out brief.json] [--history <file>] [--no-save]`
- JSON Output Shape:
  - `tool: "d27-deal"`, `schemaVersion: 4`, `version: "4.0.0"`, `medium`, `surfaceMode`
  - `primary` & `alternate`: selected from **16 contrast-verified Material Worlds** (no `poster` slug; each object includes `slug`, `label`, `surfaceWorld`, `tokens: { surfaceCanvas, surfaceElevated, inkPrimary, inkSecondary, accentFocal, accentInk }`, `oklchNote`, `fonts: { display, accent, body, mono }`, `materialRegister`, `motionPhysics`, `compatibleSurfaces`) where `tokens.inkPrimary` and `tokens.inkSecondary` both pass `>= 4.5:1` WCAG 2.1 contrast against `tokens.surfaceCanvas`!
  - `macrostructure`: `{ slug, label, blueprint }` dealt per `medium`
  - `signatureContract`: `{ requireDiegeticMetaphor: true, requireInteractiveProof: boolean, preEmitLockComment: "/* D27-Lock: ... */" }`
  - `bannedCliche`, `bannedDefaults`, `floors`, `assertions`, `requiredRefs` (matching the new `v4.0.0` `references/*.md` filenames!)

### C. `scripts/d27-check.mjs` (`v4.0.0`) Rules & `--render` CDP Contract
- CLI flags: `--brief <file>`, `--medium=<web|animation|motion|book|mascot|thumbnail>` (also `--medium <val>`), `--render`, `--snapshots <dir>`, `--json`, `--sarif`, `--github`, `--strict`, `--tier=fast|deep`, `--report-unused-ignores`, `--list-rules`, `--doctor`, `--no-inline-ignores`, `--target-lufs <num>`.
- Preserves all `v3.0.0` exit codes (`0` pass, `1` fatal/missing target, `2` compliance fail, `3` unknown flag) and JSON/SARIF/GitHub output shapes.
- **New/Updated Rules:**
  1. `no-eyebrow-spam` (`REFLEX`, `web`): `>= 4` tracked-uppercase eyebrow/meta tags immediately preceding headings in one HTML file.
  2. `no-scale-zero-entrance` (`REFLEX`, `animation`): `scale(0)` inside UI keyframes/transitions (`!isVideoFile`).
  3. `no-ease-in-ui-entrance` (`REFLEX`, `animation`): `ease-in` (excluding `ease-in-out` or explicit exit classes) on UI keyframes/transitions `> 220ms`.
  4. `no-freehand-svg-clipart` (`REFLEX`, `web`): Updated so `<svg>` blocks with `>= 3` named `<g id="...">` groups OR `data-mascot` OR `data-asset="verified"` do NOT false-positive!
  5. `no-blind-silhouette-filter` (`FLOOR` when `medium === "mascot"`, `REFLEX` otherwise): Flags `filter:\s*brightness\(0\)` used for silhouettes without `<mask` or `--m-cut` / `--sil-bg` custom-property cutouts.
  6. `require-svg-named-groups` (`FLOOR` when `medium === "mascot"`): Primary `<svg>` must contain `>= 4` `<g` elements with `id="..."`.
  7. `thumbnail-word-ceiling` (`FLOOR` when `medium === "thumbnail"` or `.yt-thumb` / `data-thumbnail` present): Primary thumbnail stage visible text must have `<= 5` words (`0–4` recommended).
  8. `thumbnail-deadzone-collision` (`FLOOR` in `--render` mode when `medium === "thumbnail"` or `.yt-thumb` / `[data-thumbnail]` present): Checks that text/heading elements inside the `16:9` thumbnail canvas do not intersect the bottom-right timestamp dead zone (`x >= 0.78 * stageW && y >= 0.82 * stageH`).
  9. `no-ai-slop-vocabulary` (`FLOOR` when `medium === "book"` and `>= 2` hits, else `REFLEX` on `.md`/`.typ`/book `.html`): Flags `\b(delve|delves|delving|tapestry|testament|pivotal|underscores|underscoring|realm|vibrant|multifaceted|overarching)\b` (case-insensitive).
  10. `no-negative-parallelism-tic` (`REFLEX`, `book`): Flags `"It's not just X — it's Y"` / `"not merely X, but Y"` AI prose tells.
  11. `no-throat-clearing-opener` (`REFLEX`, `book`): Flags paragraphs opening with `Moreover,`, `Furthermore,`, `Additionally,`, `In conclusion,`, `It is worth noting`.
  12. `no-double-signaled-paragraphs` (`FLOOR` when `medium === "book"`): Flags CSS/Typst that combines positive `text-indent` (`first-line-indent`) with positive paragraph bottom margin (`spacing > leading * 1.25`).
- **Directory Scanning Safety for `.md`:** When target is a directory and `--medium=book` is NOT set, do NOT scan `.md` files (so project `README.md`/`SKILL.md` aren't linted as book manuscripts). Scan `.md`/`.typ` when passed directly as a file path OR when `--medium=book` is set.
- **Zero-Dep `--render` Engine (`scripts/lib/chrome-cdp.mjs`):**
  - Try `import("playwright")` first; if unavailable, fall back to `chrome-cdp.mjs` using system Chrome/Chromium (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, etc.) + Node global `WebSocket`.
  - `renderAudit.engine` reports `"playwright"` or `"chrome-cdp"` (and `--doctor` reports `chromeCdp: { available, binary }` plus `"render-dom"` & `"snapshots"` in `capabilities` whenever either is available).

---

## Track Breakdown (6 Parallel Hydrogen Workers)

- **Track 1 (`Core-Engine-Builder`):** `SKILL.md`, `references/direction-matrix.md`, `references/verbs.md`, `references/qa-and-critique.md`
- **Track 2 (`Web-And-Animations-Builder`):** `references/websites.md`, `references/animations.md`
- **Track 3 (`Motion-And-Books-Builder`):** `references/motion-design.md`, `references/book-writing.md`
- **Track 4 (`Mascot-And-Thumbnails-Builder`):** `references/mascot-creation.md`, `references/thumbnails.md`
- **Track 5 (`CLI-And-CDP-Builder`):** `scripts/lib/chrome-cdp.mjs`, `scripts/d27-deal.mjs`, `scripts/d27-check.mjs`, `scripts/d27-frames.mjs`, `scripts/d27-cli.mjs`, `scripts/d27-captions.mjs`, `scripts/d27-hook.mjs`
- **Track 6 (`Docs-Gallery-And-Evals-Builder`):** `README.md`, `assets/before-after-pillars.svg`, `docs/index.html`, `evals/README.md`, `evals/run-eval.mjs`, `evals/fixtures/*`, `evals/showcase/PROMPTS.md`, `evals/showcase/index.html`

---

## Review Focus (Edge Cases Verified at Integration & Final Review)
1. `d27-deal.mjs` palette contrast integrity: every single one of the 16 dealt Material Worlds must pass `d27-check.mjs` WCAG contrast checks (`0` self-contradicting palettes).
2. `d27-check.mjs` directory scan on `.` or `docs/` must NOT treat `README.md` or `docs/*.md` as book prose unless `--medium=book` or a `.md` file is explicitly passed.
3. `chrome-cdp.mjs` process cleanup: spawned headless Chrome processes and temp `--user-data-dir` folders must ALWAYS be killed and removed in `finally` blocks even on timeout or error.
4. `evals/fixtures/design27-saas.html` and `docs/index.html` must pass `d27-check.mjs --render --strict` with `0` FLOOR fails and `0` REFLEX warnings.
5. Complete eradication of stale `posters.md`, `presentations.md`, `cheatsheets.md`, `books-and-editorial.md`, `mascot-and-illustration.md`, and `before-after-deck.svg` links across the entire repository.
