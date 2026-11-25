# Post-Build Art Director Critique & Anti-Slop Quality Audit

Load and run this module at **Stage 4** of every Design 27 task before declaring work complete. Gates operate in **3 strict tiers**:
- **Tier 1 — The Floor (Unwaivable):** Contrast floors, `:focus-visible`, `prefers-reduced-motion`, zero invented facts/testimonials/metrics, zero `transition: all`, zero edge clipping/overflow, anti-AI-prose rules, cutout silhouettes for mascots, and medium safe zones. Never ship with a Floor failure.
- **Tier 2 — Reflex Gates (Waivable On-Record Only):** Default AI habits (charcoal + safety-orange convergence, eyebrow spam above headings, repetitive `.ruled-row` / card soup, `scale(0)` or `ease-in` UI entrances, badge clutter, emoji icons, hype copy). Fix by default — or log an explicit brief-driven waiver in the Sign-Off block.
- **Tier 3 — Finish Checks (Craft Polish):** Optical alignment, nested radius harmony, micro-typography, sentence burstiness, and pacing cadence. Answer honestly; fix every quick win before delivery.

### Deterministic Verification & Cold-Review Protocol (Zero Sign-Off Theater)
1. **Run the Static, Brief & Render Checker First:** Run `node scripts/d27-check.mjs <target> --medium <medium> --render --json` (passing `--brief .design27/brief.json` when `d27-deal.mjs` was used; `--render` uses Playwright or the zero-dep `chrome-cdp.mjs` fallback). Fix every `[FLOOR]` failure until exit code `0`. `UNVERIFIED: no runtime` is permitted ONLY when quoting the exact failed `--doctor` runtime error — never as a convenience skip.
2. **Visual & Cold Evidence:** Never claim a "3-second squint test" or "64px silhouette test" passed purely in your head. Inspect real rendered screenshots (`--snapshots .d27/snapshots` or `d27-frames.mjs sheet`) or, in code-only environments, cite exact `file:line` tokens and computed dimensions.

---

## Pass 0 — The Idea (before any craft check)

- [ ] **Say it in one sentence:** State the idea (SMP + concept) in one sentence with no colour, font or widget in it. If you cannot, the build has no idea. Return to SKILL.md Stage 0.
- [ ] **Kill your darlings:** Name the best-loved element that does not serve the SMP, and delete it.
- [ ] **Mirror Test:** Swap in each of the 3 named competitors. The headline and artifact must stop fitting.
- [ ] **Campaign coherence:** Every medium of the campaign uses the same `brief.json` world, the same emotion and the same line.

---

## Pass 1 — Visual Hierarchy, Diegetic Metaphor & Focal Point

Inspect the rendered view at `25%` / mobile scale (or verify exact heading/visual sizing and placement in source):

- [ ] **Unmistakable #1 Focal Anchor & Assertion Headline:** Exactly ONE primary headline, visual artifact, or hero figure dominates instantly. Headline states a concrete claim or tension rather than a vague topic label. If two elements fight equally, demote the weaker by `>= 35%`.
- [ ] **Clear 1 → 2 → 3 Eye Path:** The eye travels smoothly from Focal Anchor (#1) → Supporting Context / Interactive Proof (#2) → Action / Metadata (#3) without bouncing randomly across boxes.
- [ ] **Intentional Negative Space:** Calm open ground actively frames the subject (`>= 25–45%` breathing room for websites/editorial/motion/mascots; crisp micro-gutters for dense dual-safe one-pagers). Zero anxious void-filling.
- [ ] **Diegetic Fidelity & Pre-Emit `M·I·H·C·R` Lock:** The finished piece embodies the Stage 1 Material World and Diegetic Physical Artifact, with `M >= 4` and `I >= 4` on *Persuade/Experience* builds — never quietly drifting back to charcoal + safety-orange or generic SaaS styling.

---

## Pass 2 — Color, Contrast & Accessibility Audit

Verify actual foreground/background luminance pairs — never eyeball low-contrast greys:

- [ ] **Body Copy Contrast:** `>= 4.5:1` (WCAG AA hard floor) for all body copy, labels, and captions (`< 24px` normal / `< 18.66px` bold). Target **`>= 7:1` (WCAG AAA)** for books, monographs, and dense dual-safe one-pagers.
- [ ] **Display & UI Component Contrast:** `>= 3.0:1` minimum for oversized display headlines (`>= 24px`), primary icons, active inputs, and focus rings.
- [ ] **Zero Dark-Mode Halation:** Avoid harsh pure `#FFFFFF` reading copy on pure `#000000` for extended reading; prefer calibrated off-white (`#ECEEF2` / `#DCEEE4`) on deep obsidian/CRT/bath grounds (`#0B0E14` / `#0B110E`).
- [ ] **Text-Over-Media Legibility:** Check contrast against the *brightest or noisiest* pixel behind text. Apply a directional scrim (`rgba(0,0,0,0.72–0.85)`), solid editorial panel, or quiet negative-space crop if any letter blurs into photography or video.
- [ ] **Grayscale / Colorblind Resilience:** Hierarchy, charts, status indicators, and CTAs remain clear in grayscale without relying exclusively on red/green hue differences.
- [ ] **60 / 30 / 10 Palette Discipline:** Surface ground dominates, ink reads crisply, and `--accent-focal` remains disciplined (`<= 10%` of visual area) rather than tinting every heading, border, and background alike.

---

## Pass 3 — Typography & Prose Hygiene Audit

- [ ] **Typeface Cap:** Strictly `<= 2` primary font families + `1` optional monospace utility face (explicitly loaded via `@font-face` or web fonts — zero Arial/Times fallbacks).
- [ ] **Scale Tension:** Headline-to-body ratio meets medium target: `4:1–10:1` at `0.86–0.96` leading on *Experience*, *Thumbnails*, and *Motion*; `>= 2.5×` on *Persuade* websites (`>= 2.2×` mobile); `1.8×–2.5×` on *Operate/Read* and dense one-pagers. *(Thumbnails have no body copy; enforce `16–24%` canvas height per hook line.)*
- [ ] **Eyebrow Discipline:** Tracked-uppercase eyebrows capped at **`<= 2` structural landmarks** per page — never mechanically stamped above every `<h2>` (`no-eyebrow-spam`).
- [ ] **Body Measure, Orphans & Widows:** Continuous prose stays within **`50–75ch`** (ideal `58–65ch`; `36–48ch` multi-column). Display headings balance cleanly (`text-wrap: balance` or manual breaks) with zero single-word orphans. Print/PDF books enforce `widows: 3`, `orphans: 3`, and `break-after: avoid` on headings.
- [ ] **Minimum Legibility Floors Enforced:**
  - Websites & Dashboards: Body `>= 16px`, utility labels/captions `>= 12px`.
  - Dense Dual-Safe One-Pagers: Print `>= 7.5pt`, screen `>= 11px`.
  - Books & Editorial: Print body `9.5–11pt` (screen PDF `10.5–11.5pt`), footnotes/captions `>= 7.5pt`.
  - Thumbnails: Display hook `16–24%` of canvas height target, `14%` checker floor (`0–4` words max).
- [ ] **Tabular Numerals & Proper Punctuation:** `font-variant-numeric: tabular-nums` applied to tables, KPIs, prices, timecodes, and folios. True em-dashes (`—`), en-dashes (`–`), curly quotes (`“ ” ‘ ’`), and proper `×` multiplication signs replace ASCII hacks (`--`, `"`, `x`).

---

## Pass 4 — Spatial Alignment, Rhythm & Edge-Clipping Check

Inspect desktop (`1440px` / `1280px`), mobile (`390px`), or print trim margins:

- [ ] **Zero Edge Clipping, Overflow & CSS Floor Intact:** `overflow-x: clip` (never `overflow-x: hidden` or `100vw`); grid tracks use `minmax(0, 1fr)`; display heads carry `min-width: 0; overflow-wrap: break-word;`; zero horizontal scrollbars on mobile, zero clipped descenders inside masked containers, and nested radii follow `max(outer - padding, 4px)`.
- [ ] **Honest Media Proportions:** Every photograph, SVG, video, and diagram uses an explicit `aspect-ratio` + clean crop (`object-fit: cover`, focal-aware `object-position`). Zero stretched, squished, or pixelated assets; zero data visuals strangled in narrow sidebars (`>= 65%` desktop width).
- [ ] **Alternating Macrostructure Rhythm:** No two consecutive sections share the exact same column split, `.ruled-row` list, or card pattern.
- [ ] **The Deletion Test (Open-Canvas Check):** Inspect every border, card box, background pill, shadow, and divider. If removing a box or shadow makes alignment clearer and calmer, **delete it**.
- [ ] **Macro vs. Micro Proximity:** Section separation is `>= 3×` internal element spacing; captions sit tighter to their own figure (`6–8px`) than to surrounding paragraphs (`>= 20px`).

---

## Pass 5 — UI Choreography & Video Motion Critique (Skip Only for Static Print/Images)

- [ ] **Frequency & Intent Gate (UI):** `100×/day` actions & keyboard navigation run `0–100ms` (never animate keystroke focus/selection); hover/press micro-feedback `120–200ms`; popovers/dropdowns/modals stay strictly `< 300ms` (`180–280ms`), scale from **`0.95 → 1`** anchored to trigger `transform-origin` (zero `scale(0)`), and exits run `~25%` faster than entrances.
- [ ] **Zero Robotic Curves & Single Motion Personality:** Zero `linear`, default `ease`, `ease-in` on UI entrances (`> 220ms`), or `transition: all`. One cohesive easing or critically-damped spring family governs the piece.
- [ ] **Signature Load Demo & 60fps GPU Floor:** *Persuade/Experience* interactive builds feature one `1.2s–2.4s` domain-specific auto-play-once demo that cancels immediately on `pointerdown`/`keydown`. Only `transform`, `opacity`, or `clip-path` animate; scroll timelines (`animation-timeline: view()`) never strand elements at `opacity: 0`; `prefers-reduced-motion` settles cleanly.
- [ ] **Video Storyboard, Determinism, Seekable HTML & Audio:** Stage 2 Beat Sheet locked; HTML motion exposes deterministic `window.__d27Seek(t)` / `renderAt(frame)` + minimal scrub bar; 2.5D camera rig uses depth planes rather than flat 2D scenes; PRNG uses seeded `mulberry32` (zero `Math.random`/`Date.now`/`rAF`/`setTimeout`/wall-clock CSS/`repeat: -1`); audio mastered to `-14/-16 LUFS` (`-1 dBTP`, `-12` to `-18 dB` VO ducking) and `yuv420p`; visuals inside **90% action-safe** and titles inside **80% title-safe**; final **20–25% (`>= 1.2s`) lockup hold** with zero late shifts. **Beat-Boundary Contact Sheet:** Inspect **Frame 0** + scene entrances, holds, and exits via `d27-frames.mjs sheet`.

---

## Pass 6 — Medium-Specific Sign-Off Gate

Run the **Final Medium Gate** at the end of your active medium module(s) (`websites.md`, `animations.md`, `motion-design.md`, `book-writing.md`, `mascot-creation.md`, `thumbnails.md`). Only the active medium's gate is loaded.

---

## Pass 7 — The Anti-AI-Slop Kill Switch

If ANY of these patterns survived into the artifact, **STOP — revise before delivering**:

1. **Polite Charcoal + Safety-Orange Convergence** (`#090B10` + `Geist` + `#FF5B1F`) or default purple-blue/pink AI gradient (`#6366f1` → `#a855f7` → `#ec4899`) ignoring the brief's Material World.
2. **Eyebrow Spam & Structural Repetition:** Tracked uppercase eyebrows stamped mechanically above every `<h2>`, 3-column icon-in-a-square card soup, or identical `.ruled-row` `01/02/03` stacks.
3. **Unproven Persuade Pages:** A testable claim with no interactive proof, or a waived proof with no story/evidence replacing it and no logged reason.
4. **AI Prose & Hype Slop:** *delve, tapestry, testament, pivotal, underscore, supercharge, seamless, unlock*, `"It's not just X — it's Y"`, `"Moreover,"`, `"Welcome back! 👋"`, `!` spam, or single italic gimmick words inside roman display headings.
5. **Broken Mascot / Animation Physics:** Blind `filter: brightness(0)` silhouette blobs, cloned fox-ear templates on technical tools, `scale(0)` or `ease-in` UI entrances, `transition: all`, or linear hover states.
6. **Fake Proof & Decorative Clutter:** Unprompted `✨ AI-Powered` badges, emoji UI icons, fake macOS window dots, floating glass blobs, washed-out low-contrast grey text, or invented metrics/testimonials/logo walls.

---

## Mandatory Studio Sign-Off Block

Include this compact 8-line **Art Director Sign-Off** at the end of Stage 4 (both when building new artifacts and when reviewing existing work) to confirm every gate was verified:

```markdown
### Art Director Sign-Off — Design 27
- **Checker & Evidence:** [d27-check exit 0 · render: playwright|chrome-cdp · snapshots/frames inspected | UNVERIFIED: <exact reason>]
- **Idea:** [SMP in ≤ 12 words · concept in 1 sentence · line · 3 competitors whose code was banned]
- **D27-Lock & Material World:** [M:x I:x H:x C:x R:x] — [Material World · Macrostructure · Diegetic Artifact · Mode · Banned Cliché]
- **Focal Anchor & Interactive Proof:** [Pass / Revised] — [Assertion Headline → Interactive Proof / Motion Hook → Action]
- **Contrast, Type & Prose Hygiene:** [Pass / Revised] — [Min contrast ratio, measure, scale ratio, eyebrow count, AI-prose check]
- **Spatial Rhythm, Physics & Medium Gate:** [Pass / Revised] — [CSS/print/SVG-cutout/dead-zone/AV floor + medium pillar gate verified]
- **Emotion & Story:** [Pass / Revised] — [Emotional Target · `brief-emotion-chroma-mismatch` clear · peak moment · end moment · 0 Grade-C claims (`emotion-science.md` §7)]
- **Material Honesty & Waivers:** [0 Floor fails · 0 invented facts · Waivers: None / Rule + rationale]
```
