# Design 27

**The zero-dependency art director for coding agents — turns generic AI slop into editorial web UI, 16:9 pitch decks, and deterministic launch motion.**

Most design skills either give agents vague vibes (*"be bold"*) with zero enforcement, or lock you into a heavy Rust/Puppeteer framework for websites alone. **Design 27 (`v2.0.0`)** pairs an **8 KB progressive-disclosure router** with **zero-dependency Node checkers** (`scripts/d27-check.mjs`, `scripts/d27-deal.mjs`) so every build clears measurable spatial, typographic, contrast, and motion floors across Claude Code, Codex, Cursor, and OpenCode.

- **Built for what developers ship weekly:** Responsive web UI & dashboards, `16:9` pitch/keynote decks, and deterministic launch motion (CSS, GSAP, Remotion, HyperFrames, Manim).
- **Also covers:** Print/screen books & reports, A4/US Letter dual-safe cheatsheets, print posters, YouTube/social thumbnails, and animation-ready SVG/AI mascots.

---

## Quick Install

Install globally via the [Agent Skills CLI](https://skills.sh):

```bash
npx skills add Subbuk987/design-27 -g
```

### Multi-Harness Support

| Harness | Install Command | Invoke |
| :--- | :--- | :--- |
| **Claude Code** | `npx skills add Subbuk987/design-27 -g --agent claude-code` | `/design-27 <prompt>` |
| **Codex CLI** | `npx skills add Subbuk987/design-27 -g --agent codex` | `$design-27 <prompt>` |
| **Cursor** | `npx skills add Subbuk987/design-27 -g --agent cursor` | `/design-27 <prompt>` |
| **OpenCode / Antigravity** | `npx skills add Subbuk987/design-27 -g --agent opencode` | `/design-27 <prompt>` |

---

## Deterministic Tooling (Zero Dependencies)

Design 27 refuses pure-Markdown "sign-off theater." Two lightweight, zero-dependency Node ESM scripts enforce the floor mechanically:

### 1. Static Floor & Anti-Slop Checker (`scripts/d27-check.mjs`)
Catches `transition: all`, `overflow-x: hidden`, `100vw` overflow, missing `prefers-reduced-motion` / `:focus-visible`, `<16px` body copy, default purple-pink slop gradients, emoji UI icons, hype copy, and non-deterministic video calls (`Date.now()`, unseeded `Math.random()`, `repeat: -1`) with actionable `Fix:` lines and CI exit code `2`:

```bash
node scripts/d27-check.mjs ./src
node scripts/d27-check.mjs ./src --json
```

Drop into GitHub Actions in 3 lines:

```yaml
- name: Design 27 Floor Check
  run: node scripts/d27-check.mjs ./src
```

### 2. Anti-Convergence Direction Dealer (`scripts/d27-deal.mjs`)
Prevents consecutive builds from collapsing into the same palette or Swiss-beige house style by tracking recent runs in `.design27/history.json` and dealing two non-repeating directions plus a banned category cliché:

```bash
node scripts/d27-deal.mjs --prompt "Offline-first audio recorder launch page"
```

---

## Why Design 27?

- **8 KB Core Router + Lazy Progressive Disclosure:** `SKILL.md` stays ultra-lean (Rule Precedence, 12 unwaivable Floor laws, 4 Surface Modes, Triage, and Router) and loads only the active medium module(s) plus `qa-and-critique.md`.
- **4 Surface Modes + Loud/Quiet Scoping:** Calibrates ambition by *surface*, not product — **Operate / Read** enforce quiet-chrome restraint, while **Persuade / Experience** (plus posters, thumbnails, and motion) unlock bold `700–900` display scale and dramatic color blocking.
- **8 Steerable Studio Verbs:** Target existing code surgically with `polish`, `bolder`, `quieter`, `distill`, `clarify`, `harden`, `redesign`, or `critique` — honoring existing `DESIGN.md` systems and preserving clean screens.
- **3-Tier QA Gates + Cold Evidence:** Separates **Tier 1 Floor** (unwaivable, script-verified), **Tier 2 Reflex** (waivable on-record only), and **Tier 3 Finish** checks — plus a **5-Frame Contact-Sheet Protocol** for motion renders.

---

## Repository Architecture

```text
design-27/
├── README.md                              # Overview, 4-harness install & CLI usage
├── SKILL.md                               # 8 KB core router (precedence, Tier 1 Floor, modes, triage)
├── LICENSE                                # MIT License
├── scripts/
│   ├── d27-check.mjs                      # Zero-dep Floor & anti-slop static linter (JSON + Fix: lines, exit 2)
│   └── d27-deal.mjs                       # Zero-dep anti-convergence direction & cliché dealer
└── references/
    ├── direction-matrix.md                # 3-Axis Calibration, 7-row Style Matrix, placement laws & red flags
    ├── verbs.md                           # 8 steerable studio playbooks (polish, bolder, quieter, distill...)
    ├── websites.md                        # Fluid grids, dual-theme parity, CSS Floor, Visual Anchor Law & dashboards
    ├── presentations.md                   # 16:9 slide systems, 7 archetypes, spotlight data & progressive builds
    ├── motion-design.md                   # Easing/springs, LUFS/ducking, captions, 90%/80% safe boxes & 5 engines
    ├── books-and-editorial.md             # Spreads, margins/gutters, chapter openers, folios & CSS @page / Typst
    ├── cheatsheets.md                     # 5–9 chunks, micro-tables & A4/Letter dual-safe bounds (188×257mm)
    ├── posters.md                         # 3-distance readability, 5:1–12:1 scale contrast, grid-breaking & bleed
    ├── thumbnails.md                      # 3-element ceiling, 160px squint test & YouTube dead-zone blueprint
    ├── mascot-and-illustration.md         # 64px silhouette gate, 5 material finish registers, SVG & prompt locks
    └── qa-and-critique.md                 # 3-Tier QA audit, d27-check gate, 5-frame motion protocol & Sign-Off
```

---

## Tool & Stack Compatibility

- **Web & UI:** HTML/CSS, Tailwind CSS, React, Next.js, Svelte, Vue, Radix, CSS Scroll-Driven Animations, View Transitions, Figma specs
- **Presentations & Decks:** Google Slides, Keynote, PowerPoint (`python-pptx`), Slidev, Marp, Reveal.js, HTML-to-PDF
- **Motion & Video:** CSS Keyframes, GSAP, Framer Motion, Remotion, HyperFrames, Manim, After Effects beat sheets
- **Print & Editorial:** CSS Paged Media (WeasyPrint, Prince, Paged.js), Typst, LaTeX, SVG print masters
- **Illustration & Assets:** Animation-ready SVG (`transform-box: view-box`), locked prompts for Midjourney / Imagen / Flux / GPT Image

---

## License

[MIT](LICENSE) © 2026 Subramanyam Kandlagunta (Sigma & Silicon) — use freely in personal, studio, and commercial agent workflows.
