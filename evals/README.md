# Design 27 `v4.0.0` — Reproducible Adversarial Eval Suite

Run the **14-assertion deterministic contract & floor suite** locally (zero dependencies, Node 18+; `--render` uses zero-socket headless Chrome `--remote-debugging-pipe` CDP automatically when Chrome/Chromium is present):

```bash
node evals/run-eval.mjs
```

## 6 Adversarial Trap Prompts (One Per Pillar)

Use these six notorious AI-slop prompts to test any coding agent (Claude Code, Codex, Cursor, Gemini) **without** vs. **with** Design 27 `v4.0.0`:

| # | Pillar | Prompt (Slop Trap) | Target Modules & Surface Mode | What Stock Agents Fail | Design 27 `v4.0.0` Pass Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Websites** | *"Build a modern, sleek AI SaaS landing page and latency telemetry monitor for our audio hardware tool."* | `websites.md` + `animations.md` · **Persuade / Operate** | Purple-slate gradient, 3-column icon-in-a-box cards, `transition: all`, `<16px` body copy, eyebrow above every `<h2>`, zero interactive proof. | Dealt OKLCH Material World + Macrostructure, diegetic artifact + 1 live interactive scrubber/proof widget, `<= 2` eyebrows, `:focus-visible`, `d27-check --render` exit `0`. |
| **02** | **UI Animations** | *"Add tactile popover, command-palette, and load-reveal animations to our interactive web workspace."* | `animations.md` · **Operate / Experience** | `scale(0)` bounces, `ease-in` entrances `> 220ms`, `450ms+` modal sluggishness, animating `Cmd+K` arrow selection, elements stuck at `opacity: 0`. | Frequency-gated timing (`0–100ms` keyboard, `<300ms` overlays), trigger-anchored `transform-origin`, `scale(0.95 → 1)`, zero `scale(0)`, `prefers-reduced-motion` parity. |
| **03** | **Motion Design** | *"Build a 5-second 60fps deterministic HTML/Remotion launch spot synced to a 120 BPM track."* | `motion-design.md` · **Experience** | `Math.random()` flicker, wall-clock CSS transitions, flat 2D slides, clipped VO, unmastered audio. | Pure `renderAt(frame)` / `window.__d27Seek(t)` contract, 2.5D camera rig, seeded PRNG, `>= 1.2s` final lockup hold, `-14 LUFS` master, beat-boundary frames verified via `d27-frames`. |
| **04** | **Book Writing** | *"Write and typeset Chapter 4 of an engineering book on why write-ahead logs stall under contention."* | `book-writing.md` · **Read** | Throat-clearing openers (*"Moreover,"*), AI slop words (*delve, tapestry, pivotal*), *"It's not just X — it's Y"* tics, double-signaled paragraphs (`text-indent` + `margin-bottom`). | Concrete cold-open timestamp/incident, sentence burstiness, zero AI prose tells (`d27-check --medium=book` exit `0`), Tufte sidenotes or Typst/`@page` spread geometry. |
| **05** | **Mascot Creation** | *"Design an original interactive SVG mascot for Pulsebit, a fast terminal CPU benchmark CLI, with a 64px silhouette check."* | `mascot-creation.md` + `animations.md` · **Experience** | Generic fox/cat ears grafted onto a chip, `.sil { filter: brightness(0); }` crushing details into a black blob, flat unnamed SVG paths. | 2-Noun domain metaphor (`>_` prompt eyes + IC pins + ECG mouth), `>= 4` named `<g id>` layers, `--m-fill` / `--m-cut` negative-space cutout silhouettes at `64px/32px`, `d27-check --medium=mascot` exit `0`. |
| **06** | **Thumbnails** | *"Create a 1280×720 YouTube thumbnail and paired video title for a Rust CPU profiler benchmark."* | `thumbnails.md` · **Persuade / Experience** | 9-word headline repeating the video title verbatim, text placed in the bottom-right `14:28` timestamp dead zone, unreadable at feed size. | Title+Thumbnail curiosity-gap pairing, `0–4` word hook (`<= 5` floor), `160×90` feed context preview, clear of `x: 1000–1280, y: 590–720`, `d27-check --medium=thumbnail` exit `0`. |
