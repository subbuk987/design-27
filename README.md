# Design 27

**An adaptive Senior Creative Art Director, Editorial Designer, and Motion Director skill for AI agents.**

Design 27 transforms AI agents from generic template assemblers into disciplined studio art directors—with deep command over visual hierarchy, image/headline/copy placement, typographic tension, color psychology, mascot character craft, print geometry, and kinetic motion choreography.

Unlike opinionated theme packs that trap every project in one house look, **Design 27 calibrates mood, palette, typography, illustration, and pacing to fit the project's soul**—while enforcing uncompromising spatial craft and zero-tolerance anti-AI-slop redlines.

---

## Quick Install

Install via the [Agent Skills CLI](https://skills.sh):

```bash
npx skills add Subbuk987/design-27
```

### Manual / Cross-Runtime Installation

Clone or copy this repository into your agent's skills directory (supported across Claude Code, Codex, Antigravity, Cursor, and Copilot CLI):

```bash
git clone https://github.com/Subbuk987/design-27.git ~/.agents/skills/design-27
```

Or drop it into a project workspace at `.agents/skills/design-27/` to share Design 27 across your team.

---

## Why Design 27?

Left unguided, AI agents converge on the same predictable defaults: purple-blue gradients on dark slate, repetitive 3-column icon-in-a-box card grids, sparkle badges above every heading, washed-out grey copy, cramped charts, and robotic `linear` animations.

Design 27 replaces vague advice (*"make it clean and modern"*) with **measurable studio craft**:

- **4 Surface Modes + Steerable Studio Verbs:** Calibrates ambition by surface (*Persuade, Operate, Read, Experience*) and supports surgical steering (`polish`, `bolder`, `quieter`, `distill`, `clarify`, `harden`, `redesign`, `critique`) plus Honest Slop Triage (*Heavy Slop / Polish Mode / No Slop*).
- **Mandatory 4-Stage Creative Workflow & 3-Tier QA Gates:** Enforces Aesthetic Calibration (with Zero-Fabrication Material Truth & Mirror Test) → Spatial Placement Architecture → Visual System Tokens → 3-Tier Art Director Critique (*Floor / Reflex / Finish*) before signing off.
- **Open-Canvas Spatial & CSS Floor Mastery:** Teaches full-bleed vs. asymmetric splits (`60/40`, `65/35`), `45–70ch` prose measure, balanced headline wrapping, nested radius math (`max(outer - padding, 4px)`), `overflow-x: clip`, figure–ground scrims, and hairline/whitespace grouping over card soup.
- **8 Full Creative Mediums in Zero-Dependency Markdown:** Covers websites/dashboards, books/editorial, 16:9 presentations, high-density cheatsheets, deterministic motion/video (CSS, GSAP, Remotion, HyperFrames, Manim), posters, YouTube thumbnails, and SVG/AI mascots — with zero binaries or runtime lock-in.

---

## Repository Architecture (Progressive Disclosure)

Design 27 is engineered for **context efficiency**. Agents load only `SKILL.md` first, pull in the exact medium-specific handbook(s) required for the active brief, and always execute `references/qa-and-critique.md` before finishing.

```text
design-27/
├── README.md                              # Overview, philosophy, install guide & examples
├── SKILL.md                               # Core Art Director brain (workflow, placement, style matrix, routing)
└── references/
    ├── websites.md                        # Fluid responsive grids, hero archetypes, rhythm, dual themes & web UI
    ├── books-and-editorial.md             # Spreads, margins/gutters, chapter openers, folios & print/screen PDF
    ├── presentations.md                   # 16:9 slide systems, one-claim law, 7 archetypes, data slides & pacing
    ├── cheatsheets.md                     # High-density chunking, 3-level hierarchy & A4/Letter dual-safe grids
    ├── motion-design.md                   # Disney principles for UI/video, easing/springs, kinetic type & beat sync
    ├── posters.md                         # 3-distance readability, extreme scale contrast, grid-breaking & print bleed
    ├── thumbnails.md                      # 3-element ceiling, 160px squint test, gaze vectors & YouTube safe zones
    ├── mascot-and-illustration.md         # Silhouette test, shape psychology, 3–4 color tokens, model sheets & SVG
    └── qa-and-critique.md                 # Mandatory post-build Art Director critique & anti-slop kill switch
```

### Reference Module Index

| Module | Scope & Concrete Craft Included |
| :--- | :--- |
| [`SKILL.md`](SKILL.md) | 4-Stage Workflow, image/heading/copy placement laws, 7-direction Adaptive Style Matrix, Anti-AI-Slop Redlines & routing table |
| [`references/websites.md`](references/websites.md) | 12/6/4-col fluid grids, named CSS Grid editorial tracks, `clamp()` fluid type, dual-theme token parity, 5 hero archetypes, open strips vs. cards |
| [`references/books-and-editorial.md`](references/books-and-editorial.md) | Tschichold & Tufte margin systems, baseline grids, recto chapter openers, sinkage, running headers/folios, widow/orphan rules, CSS `@page` + Typst |
| [`references/presentations.md`](references/presentations.md) | `16:9` widescreen grid (`1920×1080` / `80px` safe zone), one-claim action titles, 7 slide archetypes, spotlight data slides, HTML/Slidev & `python-pptx` |
| [`references/cheatsheets.md`](references/cheatsheets.md) | 5–9 semantic chunks, zero-prose micro-tables, keycap/matrix visual anchors, A4/US Letter universal dual-safe print geometry (`188×257mm`) |
| [`references/motion-design.md`](references/motion-design.md) | Easing cubic-beziers & spring physics, duration & stagger budgets (`<= 350ms` cap), masked kinetic type, beat/audio sync math, CSS / GSAP / Remotion / Manim |
| [`references/posters.md`](references/posters.md) | 10ft / 3ft / 1ft hierarchy, `5:1–12:1` scale contrast, single intentional grid-break, 2–3 ink color blocking, bleed/trim/safe-zone SVG specs |
| [`references/thumbnails.md`](references/thumbnails.md) | `<= 3` element ceiling, `0–4` word rule, rim-light separation, gaze-line composition, YouTube bottom-right timestamp dead-zone blueprint & prompt template |
| [`references/mascot-and-illustration.md`](references/mascot-and-illustration.md) | Solid `#000` silhouette test, circle/square/triangle shape psychology, 3–4 color brand palette, 6-expression model sheets, animation-ready SVG & AI prompt locks |
| [`references/qa-and-critique.md`](references/qa-and-critique.md) | 7-pass sign-off gate: 3-second squint test, WCAG AA/AAA contrast, typography hygiene, edge clipping, 60fps motion audit, medium gates & anti-slop kill switch |

---

## The 4-Stage Creative Workflow

Every time an agent invokes **Design 27**, it follows a strict studio discipline before shipping:

1. **Stage 1 — Creative Brief & Aesthetic Calibration:** Locks audience, medium constraints, 3 sharp tonal adjectives, cultural references, and an explicit Aesthetic Direction from the Style Matrix.
2. **Stage 2 — Spatial Composition & Placement Architecture:** Maps Focal Anchor #1, eye-tracking trajectory, negative space, scale ratios, and an alternating section rhythm before styling.
3. **Stage 3 — Visual System Tokens:** Freezes 3-role typography (`<= 2` primary families + optional mono), 60/30/10 semantic color tokens, spacing scale, corner-radius grammar, and mascot/motion rules.
4. **Stage 4 — Build & Art Director Critique:** Executes the build, then runs [`references/qa-and-critique.md`](references/qa-and-critique.md) line by line—catching contrast traps, headline orphans, edge clips, or slop patterns before final output.

---

## Example Prompts (Design 27 in Action)

### 1. Editorial Product Website
> *"Design and build the launch landing page for **Kestrel**, an offline-first audio field recorder built for documentary filmmakers. Make it feel like Braun hardware meets Monocle magazine."*

**How Design 27 directs the agent:**
- Loads `SKILL.md` → `references/websites.md` + `references/motion-design.md` → `references/qa-and-critique.md`.
- Calibrates to **Swiss Editorial × Utilitarian Technical** (warm uncoated paper `#F5F3EE`, carbon ink `#111214`, signal vermilion `#C9350D` passing WCAG AA on both paper and with white ink, `0–2px` razor corners).
- Rejects 3-column SaaS feature cards in favor of an asymmetric 7/5 hero split, hairline-divided metric strip with `tabular-nums`, wide full-column waveform diagram, and sticky-left editorial specification rows.
- Choreographs crisp `320ms` UI snaps and a restrained `520ms cubic-bezier(0.16, 1, 0.3, 1)` masked headline reveal with `prefers-reduced-motion` fallback and passes WCAG AA/AAA critique.

### 2. High-Density Print & Screen Cheatsheet
> *"Create a 1-page printable Git rebase & recovery cheatsheet PDF that looks sharp on both US Letter and A4 paper."*

**How Design 27 directs the agent:**
- Loads `SKILL.md` → `references/cheatsheets.md` → `references/qa-and-critique.md`.
- Targets the **Universal Dual-Safe Print Box (`188 × 257 mm`)**, caps masthead at `8%` page height, eliminates narrative paragraphs, structures 7 cognitive clusters across 3 crisp columns with `0.5pt` horizontal rules, `<kbd>` chips, semantic blue/amber accents, and an inline SVG commit-graph schematic—never dipping below `7.5pt` type.

### 3. 20-Second Remotion Product Launch Film
> *"Storyboard and code a 20-second kinetic typography & UI showcase launch video in Remotion at 60fps synced to a 120 BPM track."*

**How Design 27 directs the agent:**
- Loads `SKILL.md` → `references/motion-design.md` → `references/qa-and-critique.md`.
- Authors a frame-accurate **Beat Sheet** (`30 frames/beat` @ `60fps`), lands cuts `1–2 frames` ahead of transients, replaces flat fades with match cuts and `overflow: hidden` baseline reveals powered by weighted editorial springs (`stiffness: 220, damping: 30`), and verifies every typographic beat satisfies the `1.2s + 0.35s/word` optical hold floor.

### 4. Brand Mascot & YouTube Thumbnail System
> *"Design an original geometric mascot for our CLI benchmarking tool **Bolt**, deliver an animation-ready SVG, and build a reusable YouTube thumbnail template."*

**How Design 27 directs the agent:**
- Loads `SKILL.md` → `references/mascot-and-illustration.md` + `references/thumbnails.md` → `references/qa-and-critique.md`.
- Designs a **triangle-led geometric companion** that passes the solid `#000` `64px` silhouette test, locks a 4-color brand-synced palette, structures semantic SVG `<g>` transform pivots (`#head`, `#eyes`, `#body`) plus a reusable AI prompt-lock template, and builds a `1280×720` thumbnail with `<= 3` visual elements, a 2-word left hook, and complete clearance over YouTube's bottom-right timestamp dead zone.

---

## Tool & Stack Compatibility

Design 27 is intentionally **tool-agnostic** and directly actionable across:
- **Web & UI:** HTML/CSS, Tailwind CSS, React, Next.js, Svelte, Vue, Radix, Figma design specs
- **Print & Editorial:** CSS Paged Media (WeasyPrint, Prince, Paged.js), Typst, LaTeX, SVG print masters
- **Presentations & Decks:** Google Slides, Keynote, PowerPoint (`python-pptx`), Slidev, Marp, Reveal.js, HTML-to-PDF
- **Motion & Video:** CSS Keyframes, GSAP, Framer Motion, Remotion, HyperFrames, Manim, After Effects beat sheets
- **Illustration & Assets:** Hand-crafted animation-ready SVG, locked prompts for Midjourney / Imagen / Flux / GPT Image

---

## License

[MIT](LICENSE) © 2026 Subramanyam Kandlagunta (Sigma & Silicon) — use freely in personal, studio, and commercial agent workflows.
