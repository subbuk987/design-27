---
name: design-27
version: 4.0.0
license: MIT
description: >-
  Use when designing, art-directing, writing, animating, rigging, or critiquing work across
  websites, web apps, dashboards, UI animations and micro-interactions, launch motion graphics
  and code video (CSS, GSAP, Remotion, HyperFrames, Manim), nonfiction and technical book
  writing and editorial publishing, SVG mascot creation, and YouTube or social thumbnails—before
  writing UI code, manuscripts, motion timelines, or SVG rigs.
---

# Design 27 — Adaptive Creative Art Director

Calibrate mood, material world, typography, prose, interaction, and motion to each brief while enforcing measurable craft and deterministic verification.

## Rule Precedence (Top-Down)
1. **User Brief & `DESIGN.md` / Brand System** *(always wins)*
2. **Active Medium Module(s)** (`references/<medium>.md`)
3. **Surface Mode** (*Persuade / Operate / Read / Experience*)
4. **Tier 1 Floor** *(unwaivable; `scripts/d27-check.mjs`)*
5. **Direction Matrix** (`references/direction-matrix.md`)

## Tier 1 Floor (Unwaivable)
1. **Tokens & Type:** `:root`/theme OKLCH + hex Material World tokens; `<= 2` primary fonts + `1` mono; `60/30/10` dominance.
2. **Contrast:** `>= 4.5:1` body/labels (`>= 7:1` reading/print), `>= 3.0:1` display/controls; mid-tones obey OKLCH + APCA (`websites.md`).
3. **Zero Fabrication & Anti-AI-Prose:** No invented metrics, quotes, or logos—inventory **Real / Pictures / Absent**. Book/editorial prose bans AI slop (*delve, tapestry, testament, pivotal, underscore*), negative parallelisms, and throat-clearing openers.
4. **Diegetic Metaphor & Interactive Proof:** *Persuade/Experience* builds anchor in 1 domain physical artifact + 1 interactive proof widget with a `1.2s–2.4s` auto-play-once demo (cancellable on input; gated by `prefers-reduced-motion`).
5. **Medium Floors:** `overflow-x: clip`, `minmax(0, 1fr)`, `inner-radius = max(outer - pad, 4px)`, `:focus-visible`, `prefers-reduced-motion`; GPU UI motion (`< 300ms` popovers, no `scale(0)`/`ease-in` entrances, no `transition: all`); deterministic video (no `Date.now`/`Math.random`/`rAF`/`setTimeout`/wall-clock CSS); mascots use `--m-fill`/`--m-cut` or `<mask>` (no blind `brightness(0)`); thumbnails obey `0–4` words and clear `x: 1000–1280, y: 590–720`.
6. **Opt-Outs & `--render`:** Intentional bleed/overlap uses `data-d27-allow="overflow|overlap|safe-zone"` or `/* d27-allow: <rule> — <reason> */`. Refinements keep brand/wiring; redesigns swap world. Run `d27-check.mjs --render` (Playwright or zero-dep `chrome-cdp.mjs`) — `renderAudit.ran === false` or `samplesChecked === 0` is unverified.

## Surface Modes & Triage
- **Persuade** *(landing pages, launches, thumbnails)* & **Experience** *(portfolios, motion films, mascot showcases)*: bold POV, Diegetic Artifact + Interactive Proof, `4:1–10:1` scale (`direction-matrix.md`).
- **Operate** *(dashboards, apps, dual-safe one-pagers)* & **Read** *(books, monographs, web-books, docs)*: quiet chrome, neutral surfaces, scanability & measure first (layout-breaking tension banned).
- **Triage:** Check `DESIGN.md`/tokens → **Heavy Slop** (redesign), **Light Slop** (polish), or **No Slop** (`<= 3` tweaks).

## Progressive Disclosure Router
> **Compound Load:** Interactive **websites** and **mascot** builds MUST load BOTH their medium module AND `references/animations.md`.

| Task / Medium | Load Module(s) |
| :--- | :--- |
| Greenfield direction, 16 Material Worlds, Diegetic/Assertion Laws, `M·I·H·C·R` | [`references/direction-matrix.md`](references/direction-matrix.md) |
| Steerable verbs (`polish`, `bolder`, `quieter`, `distill`, `clarify`, `harden`, `redesign`, `critique`) | [`references/verbs.md`](references/verbs.md) |
| Websites, apps, dashboards, dual-safe one-pagers | [`references/websites.md`](references/websites.md) + [`references/animations.md`](references/animations.md) |
| UI animations, Frequency Test, sub-300ms physics, springs | [`references/animations.md`](references/animations.md) |
| Launch motion & code video (`window.__d27Seek`, GSAP, Remotion, HyperFrames, Manim) | [`references/motion-design.md`](references/motion-design.md) |
| Nonfiction/tech books, anti-AI prose, web-books, Typst & `@page` | [`references/book-writing.md`](references/book-writing.md) |
| Brand mascots, 2-noun anatomy, cutout silhouettes & SVG rigging | [`references/mascot-creation.md`](references/mascot-creation.md) + [`references/animations.md`](references/animations.md) |
| YouTube, podcast & social thumbnails (`Title+Thumb`, `160×90` previewer) | [`references/thumbnails.md`](references/thumbnails.md) |
| **Mandatory Stage 4 QA & 6-Line Sign-Off (ALL tasks)** | [`references/qa-and-critique.md`](references/qa-and-critique.md) |

## 4-Stage Execution Loop
1. **Preflight & Deal:** Run `node scripts/d27-check.mjs --doctor --json` once/session. Lock Surface Mode, Job, Diegetic Artifact, Proof, and Banned Cliché. For greenfield builds, load `direction-matrix.md` and run `node scripts/d27-deal.mjs --prompt "<brief>" --medium <medium> --surface <mode> --out .design27/brief.json`.
2. **Spatial & Behavioral Plan:** Load medium module(s); map Macrostructure, Focal Anchor #1, eye path, scale ratio, and physics.
3. **Pre-Emit `D27-Lock` & `M·I·H·C·R` Gate:** Emit top lock (`/* D27-Lock: Mode | World | Macrostructure | Diegetic Metaphor | Interactive Proof | Tension Axis | M:x I:x H:x C:x R:x */`) scoring `1–5` on **Metaphor | Interactive Proof | Hierarchy | Contrast | Rhythm**. If `M < 4` or `I < 4` on *Persuade/Experience*, mutate before coding.
4. **Verify & Sign Off:** Run `node scripts/d27-check.mjs <target> --medium <medium> --brief .design27/brief.json --render --json` (add `--snapshots .d27/snapshots`), inspect snapshots, load `qa-and-critique.md`, fix `[FLOOR]`/`[REFLEX]` errors, and output the 6-line Sign-Off.

## When a Command Fails
| Symptom | Fix |
| :--- | :--- |
| `render-unavailable` | Run `--doctor --json` (`playwright` / `chrome-cdp`); run static + `--brief`, mark visual QA unverified |
| `brief-banned-default-used` | Swap flagged font/hex for dealt `brief.json` Material World token |
| `wcag-contrast-fail` | Apply `suggestedColor` from `--json` directly to flagged token/selector |
| `no-eyebrow-spam` | Strip repetitive uppercase eyebrows above `<h2>`s (`<= 2` landmarks) |
| `no-blind-silhouette-filter` / `require-svg-named-groups` | Use `--m-fill`/`--m-cut` or `<mask>` instead of `brightness(0)`; `>= 4` `<g id="...">` groups |
| `no-ai-slop-vocabulary` / `no-negative-parallelism-tic` | Strip AI buzzwords/tics; rewrite with concrete nouns & metrics (`book-writing.md`) |
| `thumbnail-word-ceiling` / `thumbnail-deadzone-collision` | Trim hook to `0–4` words and clear `x: 1000–1280, y: 590–720` |
| `require-av-parity` / `video-loudness-floor` | Run two-pass linear `loudnorm` + `-shortest` (`motion-design.md`) |
| Intentional bleed/overlap flagged | Add `data-d27-allow="..."` on the element and re-run `d27-check.mjs` |
