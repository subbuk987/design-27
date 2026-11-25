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
1. **Tokens & Type:** `:root`/theme OKLCH or hex tokens; `<= 2` primary fonts + `1` mono; `60/30/10` dominance.
2. **Contrast:** WCAG `>= 4.5:1` + APCA `Lc >= 75` for body and secondary ink (`>= 7:1` reading/print), `>= 3.0:1` large text (`>= 24px`, or `18.66px` bold) and controls (`websites.md` §2).
3. **Zero Fabrication & Anti-AI-Prose:** No invented metrics, quotes, customers or logos—inventory **Real / Pictures / Absent**. Prose and copy avoid AI slop vocabulary, negative parallelisms, self-answered questions and throat-clearing openers (`book-writing.md` §3).
4. **Accessibility:** `:focus-visible` (never `outline: none` without a replacement), `prefers-reduced-motion`, `alt` on every `<img>`, `lang` on `<html>`, accessible names on controls, keyboard + no-drag operation for any widget (WCAG 2.2).
5. **Medium Floors:** `overflow-x: clip`, `minmax(0, 1fr)`, `inner-radius = max(outer - pad, 4px)`; GPU UI motion (`< 300ms` popovers, no `scale(0)`/`ease-in` entrances, no `transition: all`); deterministic video (no `Date.now`/`Math.random`/`rAF`/`setTimeout`/wall-clock CSS); mascots use `--m-fill`/`--m-cut` or `<mask>` (no blind `brightness(0)`); thumbnails `0–4` words, clear of `x: 1000–1280, y: 590–720`.
6. **Opt-Outs & `--render`:** Intentional bleed/overlap uses `data-d27-allow="overflow|overlap|safe-zone"` or `/* d27-allow: <rule> — <reason> */`. Run `d27-check.mjs --render` (Playwright or `chrome-cdp.mjs`; pages load from a jailed `127.0.0.1` server that serves only their own folder) — `renderAudit.ran === false` or `samplesChecked === 0` is unverified.

**Tier 2 defaults (waivable on record):** a Diegetic Artifact and an Interactive Proof on *Persuade/Experience* (`direction-matrix.md` §3), world fidelity to `brief.json` (`brief-world-drift`), the Emotional Target band, and no AI-default convergence (`convergence-signature`).

## Surface Modes & Triage
- **Persuade** *(landing pages, launches, thumbnails)* & **Experience** *(portfolios, motion films, mascot showcases)*: bold POV, proof of the SMP, display scale per `direction-matrix.md` §2.
- **Operate** *(dashboards, apps, dual-safe one-pagers)* & **Read** *(books, monographs, web-books, docs)*: quiet chrome, neutral surfaces, scanability & measure first (layout-breaking tension banned).
- **Triage:** Check `DESIGN.md`/tokens → **Heavy Slop** (redesign), **Light Slop** (polish), or **No Slop** (`<= 3` tweaks).

## Progressive Disclosure Router
> **Compound Load:** Interactive **websites** and **mascot** builds MUST load BOTH their medium module AND `references/animations.md`.

| Task / Medium | Load Module(s) |
| :--- | :--- |
| Greenfield direction, 19 Material Worlds, campaigns, Headline Law, scale table, `M·I·H·C·R` | [`references/direction-matrix.md`](references/direction-matrix.md) |
| **Emotional Target (ALL tasks):** target bands, lever summary, Grade-C myths to never claim | [`references/emotion-science.md`](references/emotion-science.md) (+ [`emotion-evidence.md`](references/emotion-evidence.md) only to justify a lever) |
| Steerable verbs (`polish`, `bolder`, `quieter`, `distill`, `clarify`, `harden`, `redesign`, `critique`) | [`references/verbs.md`](references/verbs.md) |
| Websites, apps, dashboards, dual-safe one-pagers | [`references/websites.md`](references/websites.md) + [`references/animations.md`](references/animations.md) |
| UI animations, Frequency Test, sub-300ms physics, springs | [`references/animations.md`](references/animations.md) |
| Launch motion & code video (`window.__d27Seek`, GSAP, Remotion, HyperFrames, Manim) | [`references/motion-design.md`](references/motion-design.md) |
| Nonfiction/tech books, anti-AI prose, web-books, Typst & `@page` | [`references/book-writing.md`](references/book-writing.md) |
| Brand mascots, 2-noun anatomy, cutout silhouettes & SVG rigging | [`references/mascot-creation.md`](references/mascot-creation.md) + [`references/animations.md`](references/animations.md) |
| YouTube, podcast & social thumbnails (`Title+Thumb`, `160×90` previewer) | [`references/thumbnails.md`](references/thumbnails.md) |
| **Mandatory Stage 4 QA & 8-Line Sign-Off (ALL tasks)** | [`references/qa-and-critique.md`](references/qa-and-critique.md) |

## Execution Loop
0. **Idea Lock (before any visual decision):** Write **Audience · Insight** (a true tension, in the audience's words) **· Single-Minded Proposition** (`<= 12` words) **· Concept** (one sentence with no colour, font or widget) **· Line**. Draft **3 routes** from different insights (name · insight · idea · world · headline); kill 2 with a one-line reason, and show all 3 when the user is present. Name **3 real competitors** and the visual code they share; that code is banned. **Existing brand?** Skip the deal: extract tokens, 3 brand codes and voice (3 adjectives + 1 "we never say").
1. **Preflight & Deal:** Run `node scripts/d27-check.mjs --doctor --json` once/session. Lock Surface Mode, Diegetic Artifact, Proof and **Emotional Target** (`calm|focused|trust|inviting|playful|awe|energetic|urgent`: what the audience feels when the SMP lands; peak = SMP lands, end = Line lands; `emotion-science.md` §0). Run `node scripts/d27-deal.mjs --prompt "<brief>" --medium <medium> --surface <mode> --emotion <target> --out .design27/brief.json`. Later mediums of the same campaign add `--campaign .design27/brief.json` (one campaign = one world). Use `primary` or `alternate`, or log a one-line override.
2. **Spatial & Behavioral Plan:** Load medium module(s); map Macrostructure, Focal Anchor #1, eye path, scale ratio, and physics.
3. **Pre-Emit `D27-Lock` & `M·I·H·C·R` Gate:** Emit top lock (`/* D27-Lock: Idea (SMP) | Mode | World | Macrostructure | Diegetic Metaphor | Proof | Tension Axis | Emotion: target · peak · end | M:x I:x H:x C:x R:x */`) scoring `1–5` on **Metaphor carries the idea | Proof (Appeal for mascots) | Hierarchy | Contrast | Rhythm**. If `M < 4` or `I < 4` on *Persuade/Experience*, mutate before coding.
4. **Verify & Sign Off:** Run `node scripts/d27-check.mjs <target> --medium <medium> --brief .design27/brief.json --render --json` (add `--snapshots .d27/snapshots`), inspect snapshots, load `qa-and-critique.md` (Pass 0 first), fix `[FLOOR]`/`[REFLEX]` findings, and output the 8-line Sign-Off.

## When a Command Fails
Apply each finding's `fix` (and `suggestedColor`, when present) from `--json`. Special cases:

| Symptom | Fix |
| :--- | :--- |
| `render-unavailable` | Run `--doctor --json` (`playwright` / `chrome-cdp`); run static + `--brief`, mark visual QA unverified |
| `suggestedColor: null` | No ink lightness passes on that canvas: change `--surface-canvas`, not the ink |
| `brief-world-drift` | Use the dealt `primary`/`alternate` tokens and display face, or log `/* d27-allow: brief-world-drift — reason */` |
| `brief-emotion-chroma-mismatch` | Move accent relative chroma into `emotion.accentChroma` (keep L and H), or re-deal with a better-fitting `--emotion` |
| Intentional bleed/overlap flagged | Add `data-d27-allow="..."` on the element and re-run `d27-check.mjs` |
