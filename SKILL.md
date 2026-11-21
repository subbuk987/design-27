---
name: design-27
version: 3.0.0
license: MIT
description: >-
  Use when designing, art-directing, laying out, animating, illustrating, or critiquing visual work
  across websites, web apps, dashboards, editorial publications, books, slide/pitch decks,
  cheatsheets, posters, YouTube/social thumbnails, SVG mascots, or motion graphics (CSS, GSAP,
  Remotion, HyperFrames, Manim)—before writing UI code, layout specs, motion timelines, or image prompts.
---

# Design 27 — Adaptive Creative Art Director

Calibrate mood, palette, typography, imagery, and motion to each brief's soul while enforcing measurable craft and deterministic verification.

## Rule Precedence (Top-Down)
1. **User Brief & Existing `DESIGN.md` / Brand System** *(the brief always wins)*
2. **Active Medium Module** (`references/<medium>.md` overrides generic defaults)
3. **Surface Mode** (*Persuade / Operate / Read / Experience*)
4. **Tier 1 Floor** *(unwaivable; enforced by `scripts/d27-check.mjs`)*
5. **Direction Matrix** (`references/direction-matrix.md`)

## Tier 1 Floor (Unwaivable)
1. **Tokens & Type Cap:** Semantic tokens (`:root`/theme); `<= 2` primary fonts + `1` optional mono; `60/30/10` dominance.
2. **Contrast:** `>= 4.5:1` body/labels (`>= 7:1` reading/print), `>= 3.0:1` display & controls; mid-tone grounds obey OKLCH + APCA math (`references/websites.md`).
3. **Zero Fabrication:** Never invent metrics, testimonials, quotes, or logo walls. Inventory **Real / Pictures / Absent**.
4. **Web & Motion Floor:** `overflow-x: clip`, `minmax(0, 1fr)`, `inner-radius = max(outer - pad, 4px)`, `:focus-visible`, `prefers-reduced-motion`, GPU-only motion (no `transition: all`), deterministic video (zero `Date.now`/`Math.random`/`rAF`/`setTimeout`/wall-clock CSS).
5. **Scoped Opt-Outs:** Deliberate bleed/layering uses `data-d27-allow="overflow|overlap|safe-zone"` (`overlap` is element-local only) or `/* d27-allow: <rule> — <reason> */` — never disable the checker.
6. **Preservation & Anti-False-Pass:** Refinement preserves incumbent brand/wiring; redesign replaces visual world. Run `d27-check.mjs` — treat `renderAudit.ran === false` or `samplesChecked === 0` as unverified, never a pass.

## Surface Modes & Triage
- **Persuade** *(landing, pitch decks)* & **Experience** *(portfolios, posters, films)*: bold POV, Viewport-1 Signature, `700–900` display & color blocking permitted (follow Loud Craft in `direction-matrix.md`).
- **Operate** *(dashboards, apps, cheatsheets)* & **Read** *(books, docs, reports)*: quiet chrome, neutral surfaces, scanability & measure first (layout-breaking tension banned).
- **Triage Existing Work:** Check `DESIGN.md`/tokens first → **Heavy Slop** (redesign), **Light Slop** (polish only), or **No Slop** (leave clean; `<= 3` optional tweaks).

## Progressive Disclosure Router

| Task / Medium | Load Module |
| :--- | :--- |
| Greenfield direction, Loud Craft, 4 Tension Archetypes, Mirror Test | [`references/direction-matrix.md`](references/direction-matrix.md) |
| Steerable verbs (`polish`, `bolder`, `quieter`, `distill`, `clarify`, `harden`, `redesign`, `critique`) | [`references/verbs.md`](references/verbs.md) |
| Websites, landing pages, web apps, dashboards | [`references/websites.md`](references/websites.md) |
| Presentations, pitch decks, `16:9` slide systems | [`references/presentations.md`](references/presentations.md) |
| Motion graphics & video (CSS/GSAP/Remotion/HyperFrames/Manim) | [`references/motion-design.md`](references/motion-design.md) |
| Books, magazines, reports, print/screen PDFs | [`references/books-and-editorial.md`](references/books-and-editorial.md) |
| Cheatsheets, quick-reference cards, dense one-pagers | [`references/cheatsheets.md`](references/cheatsheets.md) |
| Posters, event key art, exhibition prints | [`references/posters.md`](references/posters.md) |
| YouTube, podcast, social & article thumbnails | [`references/thumbnails.md`](references/thumbnails.md) |
| Brand mascots, characters, iconography, illustration | [`references/mascot-and-illustration.md`](references/mascot-and-illustration.md) |
| **Mandatory Stage 4 QA & Art Director Sign-Off (ALL tasks)** | [`references/qa-and-critique.md`](references/qa-and-critique.md) |

## 4-Stage Execution Loop
1. **Preflight & Deal:** Run `node scripts/d27-check.mjs --doctor --json` once per session. Lock Surface Mode, Job, Material Truth, Viewport-1 Signature, and Banned Cliché. For greenfield builds, load `direction-matrix.md` and run `node scripts/d27-deal.mjs --prompt "<brief>" --surface <mode> --out .design27/brief.json`.
2. **Spatial Plan:** Load active medium module(s); map Focal Anchor #1, eye path, scale ratio, and alternating rhythm.
3. **Pre-Emit Lock & Build:** Print 1-line Lock (`Mode | Direction | Signature | Tension Axis | Ground Band | Material`), freeze tokens, and build faithfully.
4. **Verify & Sign Off:** Run `node scripts/d27-check.mjs <target> --brief .design27/brief.json --json` (add `--render --snapshots .d27/snapshots` when Playwright is available), inspect snapshots, load `references/qa-and-critique.md`, fix every error, and output the Sign-Off.

## When a Command Fails
| Symptom | Fix |
| :--- | :--- |
| `render-unavailable` / Playwright missing | Run `--doctor --json`; run static + `--brief` checks and mark visual QA unverified |
| `brief-banned-default-used` | Swap the flagged font/hex for the dealt `brief.json` token |
| `wcag-contrast-fail` | Apply `suggestedColor` from `--json` directly to the flagged token/selector |
| `require-av-parity` / `video-loudness-floor` | Run two-pass linear `loudnorm` + `-shortest` from `references/motion-design.md` |
| Intentional bleed/overlap flagged | Add element-scoped `data-d27-allow="..."` and re-run `d27-check.mjs` |
