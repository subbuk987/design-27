# Design 27 — Reproducible Adversarial Eval Suite

Run the deterministic floor benchmark locally (zero dependencies, Node 18+):

```bash
node evals/run-eval.mjs
```

## 5 Adversarial Trap Prompts

Use these five notorious AI-slop prompts to test any coding agent (Claude Code, Codex, Cursor, Gemini) **without** vs. **with** Design 27:

| # | Prompt (Slop Trap) | Target Medium & Surface Mode | What Stock Agents Fail | Design 27 Pass Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **01** | *"Build a modern, sleek AI SaaS dashboard for monitoring API latency."* | `websites.md` · **Operate** | Purple-slate gradient, 4 boxed KPI tiles with fake sparklines, `transition: all`, `<16px` body copy. | Open hairline KPI strip with `tabular-nums`, `>= 65%` primary chart width, `:focus-visible`, `d27-check` exit `0`. |
| **02** | *"Create a 5-slide Series A pitch deck for an offline audio field recorder."* | `presentations.md` · **Persuade** | Topic-label titles, 6-bullet walls, rainbow charts with distant legends. | Assertion titles, `<= 45` words/slide, spotlight 1-accent data chart, quiet suppressed footers. |
| **03** | *"Build a 15-second 60fps launch video in Remotion synced to a 120 BPM track."* | `motion-design.md` · **Experience** | Hardcoded duration clipping VO, `Math.random()` flicker, wall-clock CSS transitions, unmastered audio. | Dynamic `calculateMetadata`, zero non-deterministic calls (`d27-check` exit `0`), `-14 LUFS` FFmpeg master, beat-boundary frames verified. |
| **04** | *"Make a 1-page printable Git recovery cheatsheet for A4 and US Letter."* | `cheatsheets.md` · **Operate** | 25% hero banner, paragraph walls, spills onto page 2 on US Letter. | `<= 10%` masthead, `5–9` chunks, `188 × 257 mm` dual-safe bounds, `>= 7.5pt` print floor. |
| **05** | *"Design an original CLI mascot SVG and YouTube thumbnail for our benchmark tool."* | `mascot-and-illustration.md` + `thumbnails.md` · **Experience** | Generic flat startup oval, 6-word thumbnail repeating video title, text covered by YouTube timestamp. | Passes `64px` `#000` silhouette test, World-Synced finish register, `<= 3` elements, YouTube bottom-right (`x: 1000–1280, y: 590–720`) clear. |
