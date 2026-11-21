---
name: design-27
version: 2.2.0
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
1. **Tokens & Type Cap:** Semantic tokens (`:root`/theme); `<= 2` primary fonts + `1` optional mono; `60/30/10` color dominance.
2. **Contrast:** `>= 4.5:1` body/labels (`>= 7:1` reading/print), `>= 3.0:1` display (`>= 24px`) & controls; `>= 4.5:1` over media via scrim/panel/crop.
3. **Zero Fabrication:** Never invent metrics, testimonials, quotes, or logo walls. Inventory **Real / Pictures / Absent**.
4. **Web & Motion Floor:** `overflow-x: clip` (no `overflow-x: hidden`/`100vw`), `minmax(0, 1fr)`, `inner-radius = max(outer - pad, 4px)`, `:focus-visible`, `prefers-reduced-motion`, GPU-only motion (no `transition: all`), deterministic video (zero `Date.now()`/`Math.random()`/`rAF`/wall-clock CSS).
5. **Measure & Safe Zones:** `45–70ch` prose (`>= 16px` web body), `text-wrap: balance`, `tabular-nums`, `>= 65%` chart span, `1280×800` hero fold, YouTube dead zone clear, 90%/80% video safe boxes, `188×257mm` cheatsheets.
6. **Preservation & Verification:** Refinement preserves incumbent brand/wiring; redesign replaces visual world. Run `d27-check.mjs` (never fake `PASS`).

## Surface Modes & Triage
- **Persuade** *(landing, pitch decks)* & **Experience** *(portfolios, posters, films)*: bold POV, visual anchor, `700–900` display & color blocking permitted (follow Loud Craft in `direction-matrix.md`).
- **Operate** *(dashboards, apps, cheatsheets)* & **Read** *(books, docs, reports)*: quiet chrome, neutral surfaces, scanability & measure first.
- **Triage Existing Work:** Check `DESIGN.md`/tokens first → **Heavy Slop** (redesign), **Light Slop** (polish only), or **No Slop** (leave clean; `<= 3` optional tweaks).

## Progressive Disclosure Router

| Task / Medium | Load Module |
| :--- | :--- |
| Greenfield direction, Loud Craft, World-Sync, placement laws | [`references/direction-matrix.md`](references/direction-matrix.md) |
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
1. **Brief & Deal:** Lock Surface Mode, Job, Material Truth, Signature Moment, and Banned Cliché. For greenfield builds, load `direction-matrix.md` and run `node scripts/d27-deal.mjs --prompt "<brief>" --surface <mode> --out .design27/brief.json`.
2. **Spatial Plan:** Load active medium module(s); map Focal Anchor #1, eye path, scale ratio, and alternating rhythm.
3. **Tokens & Build:** Freeze semantic tokens, spacing, and radius; build faithfully.
4. **Verify & Sign Off:** Run `node scripts/d27-check.mjs <target> --brief .design27/brief.json` (`--render` when Playwright is available), load `references/qa-and-critique.md`, fix all `[FLOOR]` fails, and output the evidence-backed Sign-Off.
