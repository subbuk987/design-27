# Showcase Benchmark — Results

> **Read this first.** `d27-check` measures **Design 27's own static floor**: its rules, written by the Design 27 author. It does **not** measure subjective visual quality or preference. A contender that passes `d27-check` is not "better looking". Judge the visuals yourself in `index.html` with **Blind Mode** on.

- Contender model: `claude-sonnet-5-5`, effort `high` (verified per transcript). Date: 2026-11-21. Protocol: [PROMPTS.md](PROMPTS.md).
- `unslop` is not installed on the run machine → `NOT_INSTALLED` in every category, no file.

## Scoring method

- Command: `node scripts/d27-check.mjs <file> --json` (static tier, no `--brief`, no `--render`). The same flags apply to every contender.
- **Neutral path.** `d27-check` enables video-only rules when the *file path* matches `remotion|hyperframes|timeline|scene|video|motion` (`scripts/d27-check.mjs:395`). That would punish the `hyperframes` and `remotion-skills` contenders for their folder names only. So each file is copied unchanged to a neutral path (`…/neutral/<category>/entry/index.html`) before the check. In `motion`, the path contains `motion` on purpose, so video rules apply to every contender.
- Exit `0` = pass, `2` = at least one floor fail.

## Web

### d27-check (static floor)

| Contender | Exit | Floor fails | Reflex warns | Lines | Rules hit |
|---|---:|---:|---:|---:|---|
| `none` | 0 | 0 | 2 | 166 | R:no-fake-italic-heading, R:no-freehand-svg-clipart |
| `design-27` | 0 | 0 | 0 | 245 | — |
| `hyperframes` | 0 | 0 | 0 | 178 | — |
| `impeccable` | 0 | 0 | 0 | 207 | — |
| `hallmark` | 0 | 0 | 0 | 181 | — |
| `unslop` | — | — | — | — | NOT_INSTALLED |
| `remotion-skills` | 0 | 0 | 0 | 179 | — |
| `frontend-design` | 0 | 0 | 0 | 172 | — |

`design-27` also passes with its own brief (`--brief /tmp/d27-web-brief.json`): exit 0.

### Time, tokens, cost

Cost is computed from each subagent transcript with first-party API rates for Sonnet 5.5 ($2 in / $10 out / $0.10 cache read / 1.25× input for 5-minute cache writes per 1M tokens). Script: [usage.mjs](usage.mjs). `impeccable` includes its own `impeccable-finish-reviewer` helper agent (Sonnet 5.5). These are API-equivalent costs; a Claude subscription bills differently.

| Contender | Model | Wall time | Input | Output | Cache read | Cache write | Total tokens | Cost (USD) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `none` | claude-sonnet-5-5 | 1m 31s | 16 | 7,626 | 286,852 | 64,272 | 358,766 | $0.27 |
| `design-27` | claude-sonnet-5-5 | 3m 12s | 32 | 17,122 | 1,116,680 | 98,667 | 1,232,501 | $0.53 |
| `hyperframes` | claude-sonnet-5-5 | 1m 43s | 12 | 7,667 | 224,051 | 67,519 | 299,249 | $0.27 |
| `impeccable` | claude-sonnet-5-5 | 6m 24s | 62 | 36,814 | 2,262,083 | 172,397 | 2,471,356 | $1.03 |
| `hallmark` | claude-sonnet-5-5 | 3m 31s | 50 | 18,978 | 1,451,587 | 111,464 | 1,582,079 | $0.61 |
| `remotion-skills` | claude-sonnet-5-5 | 2m 3s | 20 | 9,071 | 416,511 | 70,711 | 496,313 | $0.31 |
| `frontend-design` | claude-sonnet-5-5 | 3m 3s | 24 | 13,292 | 520,266 | 77,020 | 610,602 | $0.38 |

### Run notes (web)

- **Isolation audit:** each transcript was scanned for shared-browser MCP calls, local servers, repo paths, and sibling workspaces. All 7 are clean. Each contender loaded only its own skill(s). `../index.html` appears only in iframe wrappers that screenshot the contender's own file.
- **Mobile check widths differ.** Headless Chrome's minimum window is 500px. `hyperframes`, `design-27`, `impeccable` and `hallmark` checked 390px through an iframe. `none`, `remotion-skills` and `frontend-design` checked only 500px.
- **`design-27` self-attested an asset.** It added `data-asset="verified"` to its own hand-drawn device SVG to clear `no-freehand-svg-clipart`. The checker's own fix text suggests this, but nobody verified the SVG independently.
- **`hallmark` skipped part of its workflow:** its hero/finish reviewer agents and the `sloplint --render` tier (`puppeteer-core` not installed). Its static `sloplint` was clean.
- **`hyperframes`** did not run its `check`/`snapshot` CLI (video-only, needs `npx`).
- **`impeccable`** ran its finish reviewer and detector. It did not run the documenter step and did not embed fonts.
- **Not run for anyone:** `d27-check --render` (Node Playwright not installed).

## Illustration

### d27-check (static floor)

| Contender | Exit | Floor fails | Reflex warns | Lines | Rules hit |
|---|---:|---:|---:|---:|---|
| `none` | 0 | 0 | 1 | 184 | R:no-freehand-svg-clipart |
| `design-27` | 0 | 0 | 1 | 137 | R:no-freehand-svg-clipart |
| `hyperframes` | 0 | 0 | 1 | 114 | R:no-freehand-svg-clipart |
| `impeccable` | 0 | 0 | 1 | **227 (over 200)** | R:no-freehand-svg-clipart |
| `hallmark` | 0 | 0 | 1 | **245 (over 200)** | R:no-freehand-svg-clipart |
| `unslop` | — | — | — | — | NOT_INSTALLED |
| `remotion-skills` | 0 | 0 | 1 | 145 | R:no-freehand-svg-clipart |
| `frontend-design` | 0 | 0 | 1 | 179 | R:no-freehand-svg-clipart |

`design-27` also passes with its own brief (`--brief /tmp/d27-illustration-brief.json`): exit 0, 1 reflex warn.

### Time, tokens, cost

| Contender | Model | Wall time | Input | Output | Cache read | Cache write | Total tokens | Cost (USD) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `none` | claude-sonnet-5-5 | 1m 8s | 8 | 8,073 | 170,355 | 46,474 | 224,910 | $0.21 |
| `design-27` | claude-sonnet-5-5 | 2m 8s | 16 | 14,007 | 471,947 | 74,060 | 560,030 | $0.37 |
| `hyperframes` | claude-sonnet-5-5 | 1m 14s | 10 | 7,638 | 235,078 | 51,426 | 294,152 | $0.23 |
| `impeccable` | claude-sonnet-5-5 | 13m 9s | 54 | 28,485 | 1,783,444 | 204,825 | 2,016,808 | $0.98 |
| `hallmark` | claude-sonnet-5-5 | 2m 55s | 22 | 20,530 | 724,102 | 79,503 | 824,157 | $0.48 |
| `unslop` | — | — | — | — | — | — | — | NOT_INSTALLED |
| `remotion-skills` | claude-sonnet-5-5 | 1m 25s | 12 | 9,060 | 277,754 | 51,319 | 338,145 | $0.25 |
| `frontend-design` | claude-sonnet-5-5 | 1m 35s | 6 | 11,443 | 111,766 | 52,453 | 175,668 | $0.26 |

### Run notes (illustration)

- **Isolation audit:** all 7 transcripts clean. `impeccable` listed the session `tasks/` folder (file names only) and then polled its own reviewer's transcript to wait for it; it read no other agent's content. Its wall time includes about 6 minutes of this waiting. It again spawned its own `impeccable-finish-reviewer` (Sonnet 5.5, inside its own workspace); its tokens are included above.
- **Line limit (`<= 200`) broken by 2 contenders:** `hallmark` (245) and `impeccable` (227). Files are published unchanged; judges decide on a penalty or disqualification.
- **`no-freehand-svg-clipart` fires on every contender.** The brief asks for a hand-made vector mascot, so this reflex rule cannot separate contenders here. No contender used `data-asset="verified"` in this category.
- **`hallmark`** waived its own lint "gate 80" to reach a clean `sloplint` result, and skipped its finish review and `--render` tier.
- **`impeccable`** has no reviewer ship verdict: the reviewer asked for a recapture, and the fixed crop was not sent back for a second review.
- **Mobile:** most contenders checked desktop only. `impeccable` also checked 600px.
