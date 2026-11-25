# Design 27 `v4.0.0` — Principal Final Review Report (Neon High Audit)

**Reviewer:** Neon High (`pro`) Principal Final Reviewer  
**Date:** 2026-11-25  
**Target Repository:** `/Users/subramanyam/Documents/Design27`  
**Spec & Contracts Audited:**
- [`docs/v4-research-and-action-plan.md`](file:///Users/subramanyam/Documents/Design27/docs/v4-research-and-action-plan.md)
- [`docs/v4-implementation-plan.md`](file:///Users/subramanyam/Documents/Design27/docs/v4-implementation-plan.md)

---

## Final Sign-Off Verdict (Round 2 Independent Re-Verification)

- **Final Sign-Off Verdict:** `APPROVED` *(with 4 non-blocking minor follow-up notes below)*
- **Spec & Contract Compliance:** `PASS` — `node scripts/d27-cli.mjs eval` passes **`14/14`**, `node scripts/d27-cli.mjs doctor` reports `version: "4.0.0"` and `chromeCdp.available: true`, scope hygiene confirms `0` removed poster/presentation/legacy artifacts across active files, and every Round 1 finding (`C1–C4`, `I1–I5`, `M1–M4`) passed direct Round 2 CLI/code verification.

### Round 2 Re-Verification Matrix

| ID | Scope & Files Audited | Round 2 Direct Verification & Observed Evidence | Status |
| :--- | :--- | :--- | :--- |
| **Core** | `scripts/d27-cli.mjs`, `evals/run-eval.mjs`, `scripts/d27-check.mjs` | `node scripts/d27-cli.mjs eval` -> **`14/14` passed** (exit `0`). `doctor` -> `version: "4.0.0"`, `chromeCdp.available: true`, `capabilities: ["static","brief","sarif","github-annotations","render-dom","snapshots"]`. Scope grep confirms `0` banned poster/presentation/legacy files or tokens. | **PASS** |
| **C1** | `scripts/lib/ignores.mjs`, `scripts/d27-check.mjs` | Verified multi-rule & hyphenated waivers (`d27-disable: no-transition-all`, `d27-disable-next-line: no-overflow-x-hidden, no-100vw -- ...`, `d27-disable-next-line: no-nondeterministic-video`, XML `:` waivers) with `--report-unused-ignores --strict` -> exit `0`, `0` findings (`suppressed: 3` / `1` / `5`). *(Edge-case note below: `/` or `*` inside reason strings.)* | **PASS** |
| **C2** | `scripts/d27-deal.mjs`, `scripts/lib/chrome-cdp.mjs` | Ran `d27-deal.mjs` + `d27-check.mjs --brief <brief.json> --render --strict` on `evals/fixtures/design27-saas.html`, `docs/index.html`, `evals/fixtures/clean-mascot.html`, and `evals/fixtures/clean-thumb.html` -> all exit `0`, `0` findings, `renderAudit.engine: "chrome-cdp"`. | **PASS** |
| **C3** | `assets/*.svg` (`before-after-pillars.svg`, `before-after-web.svg`, `d27-cli-proof.svg`) | Python `xml.etree.ElementTree.parse` parsed `3/3` SVGs with zero XML errors; `d27-check.mjs assets --strict --report-unused-ignores` -> exit `0` (`floorFails: 0`, `reflexWarns: 0`, `suppressed: 5`). | **PASS** |
| **C4 & M2** | `references/motion-design.md`, `references/thumbnails.md`, `references/book-writing.md`, `references/mascot-creation.md`, `references/websites.md`, `references/animations.md` | Extracted all standalone HTML blueprints (`motion-design.md#0`, `thumbnails.md#0`, `book-writing.md#0`, `mascot-creation.md#1`) + all CSS/HTML/Typst snippets (`lines 328–398` of `book-writing.md`): all pass `d27-check.mjs --medium=<medium> [--render] --strict --report-unused-ignores` with exit `0` (`0` findings). `d27-frames.mjs sheet` captured 4 beat PNGs from `motion-design.md#0`. FFmpeg Pass 1 (`474`) & Pass 2 (`479`) share exact `sidechaincompress=threshold=0.03:ratio=6:attack=40:release=350` and `loudnorm=I=-14:TP=-1:LRA=11`. *(Note: `book-writing.md:327–398` lacks closing ```` ``` ```` at EOF.)* | **PASS** |
| **I1** | `scripts/lib/chrome-cdp.mjs` (`buildDomAuditFnSource`) | Verified negative vs positive `--render --strict` runs for all 3 `data-d27-allow` tokens: `overflow` clears `render-no-overflow-x`, `overlap` clears `assert-stays-in-frame` and `thumbnail-deadzone-collision`, and `safe-zone` clears `thumbnail-deadzone-collision`. | **PASS** |
| **I2 & I3** | `scripts/d27-check.mjs`, `scripts/d27-captions.mjs` | Verified `--target-lufs -16` both before and after target path (exit `0`), `d27-captions.mjs --validate` both flag-before-file and file-before-flag (exit `0`, ASS output valid), `--medium=web` inside `<tmp>/motion-app/index.html` under `--render --strict` (exit `0`, `medium: "web"`), and `d27-check.mjs docs --json` (`filesScanned: 1`, skips `.md`). | **PASS** |
| **I4** | `scripts/d27-deal.mjs` vs [`references/direction-matrix.md`](file:///Users/subramanyam/Documents/Design27/references/direction-matrix.md) | 16/16 Material Worlds match 1-to-1 across slugs/labels and all 6 hex tokens (`syncErrors: 0`, `geistHits: 0`). Verified `>= 4.5:1` for `inkPrimary`/`inkSecondary` vs `surfaceCanvas` & `surfaceElevated` and `accentInk` vs `accentFocal`, `>= 3.0:1` for `accentFocal` vs `surfaceCanvas`, `>= 7.0:1` primary contrast on all `read`-compatible worlds, and `24/24` medium × surface `d27-deal.mjs` matrix runs. | **PASS** |
| **I5** | `scripts/d27-check.mjs` (`blankMarkdownCodeFences`, `aiSlopRe`, openers) | Verified fenced ```` ```js ```` code identifiers (`delve_underscore_landscape`, `Moreover,`) are exempted (`0` hits on fence lines `1–4`), while prose hits all newly synced terms (`underscore`, `landscape`, `beacon`, `intricate`, `foster`, `garner`, `Crucially,`, `Interestingly,`) + negative parallelism. | **PASS** |
| **M1** | `scripts/d27-hook.mjs`, `scripts/d27-check.mjs` (`--tier=fast|deep`) | Verified `post-edit` (`PostToolUse`) followed by `stop` (`Stop`) on `evals/fixtures/slop-saas.html` cleanly separates fast rules from remaining deep rules (`PostToolUse` -> `Stop` with `"remaining issue(s)"`). | **PASS** |
| **M3** | `scripts/d27-check.mjs` (`font:` shorthand, `7.0:1` read/book floor) | Verified `font: 400 1rem/1.6 "Inter", sans-serif;` triggers `brief-banned-default-used` and `#666666` on `#FFFFFF` triggers `wcag-contrast-fail` (`5.74:1 < 7.0:1`) under `--medium=book`. | **PASS** |
| **M4** | `scripts/lib/reporters.mjs`, `evals/README.md`, `evals/run-eval.mjs` | Verified SARIF `$schema: "https://json.schemastore.org/sarif-2.1.0.json"` (`version: "2.1.0"`) and `evals/README.md` (`14-assertion` + Node 18+ + `--remote-debugging-pipe` CDP) matches `evals/run-eval.mjs`. | **PASS** |
| **CDP Pipe & Cleanup** | `scripts/lib/chrome-cdp.mjs` | Zero-socket `--remote-debugging-pipe` (fd 3/4) handles `--render`, `--snapshots` (`1440x900` + `390x844`), runtime exceptions (`runtime-error`), and `d27-frames.mjs sheet`; `terminateChrome` leaves `0` `d27-chrome-*` dirs in `TMPDIR`/`/tmp` and exits cleanly with zero open handles. | **PASS** |

### Round 2 Non-Blocking Observations (Minor / Informational)
1. **Unclosed Code Fence (`references/book-writing.md:327–398`):** The final ```` ```typst ```` block at line 327 has no closing ```` ``` ```` after line 398 (`fenceCount: 5`). The Typst code (`lines 328–398`) passes `d27-check.mjs --medium=book --strict --report-unused-ignores` cleanly, so adding the closing fence is a 1-line doc hygiene fix.
2. **Inline Ignore Reason Character Class (`scripts/lib/ignores.mjs:6`):** `DIRECTIVE_RE` uses `([^*/<>]*?)` for the optional reason text, which causes inline comments whose reason contains `/` or `*` (e.g., `/* d27-disable-next-line: no-transition-all — 64px/16px scale */`) not to match. All current repo waivers avoid `/` and `*` in reasons and pass cleanly.
3. **`chrome-cdp.mjs` Direct-API Edge Cases (`scripts/lib/chrome-cdp.mjs:357–359, 423–425`):** `d27-check.mjs` and `d27-frames.mjs` both check `fs.existsSync` before calling `chrome-cdp.mjs`, so normal CLI paths never hit missing files. If `auditHtmlWithCdp` or `captureHtmlFramesWithCdp` is imported directly with a nonexistent `file://` URL, `Page.navigate` returns `{ errorText: "net::ERR_FILE_NOT_FOUND" }` which is currently not inspected (causing Chrome's error page to fire `Page.loadEventFired`); additionally, if `send("Page.navigate")` ever rejected synchronously/early, the pre-created `onceEvent("Page.loadEventFired", timeoutMs)` timer would remain active until `timeoutMs` expires.
4. **Remaining Doc/Plate Sync & Showcase History (`README.md:5,109`, `assets/d27-cli-proof.svg:12`, `references/book-writing.md:123`, `evals/showcase/`):**
   - `README.md:5,109` still cites `"10-assertion"` (`evals/README.md` and `evals/run-eval.mjs` are now `14-assertion`).
   - `assets/d27-cli-proof.svg:12` displays `5 FLOOR fail(s), 3 REFLEX warning(s)` for `slop-saas.html`, whereas current `d27-check.mjs` reports `6 FLOOR fail(s), 5 REFLEX warning(s)`.
   - `references/book-writing.md#0` declares `:root, [data-theme="paper"]` with `--canvas` rather than `:root { --surface-canvas: ... }`; standalone `--medium=book --render --strict` passes (`0` findings), while passing `--brief` triggers `brief-require-tokens`.
   - `evals/showcase/` retains `2026-11-21` `v3.0.0` `web` and `illustration` outputs (`evals/showcase/illustration/design-27/index.html` still triggers `no-blind-silhouette-filter` when scanning `.`).

---

## Round 1 Audit Trail (Preserved)

### Final Verdicts (Post-Fix Re-Verification)

- **Overall Verdict:** `APPROVED`
- **Spec Compliance Verdict:** `PASS` *(Scope Removal Hygiene: `PASS`; `evals/run-eval.mjs`: `14/14 PASS`; all 4 Critical, 5 Important, and 4 Minor findings verified resolved)*

### Executive Summary
All 4 Critical (`C1–C4`), 5 Important (`I1–I5`), and 4 Minor (`M1–M4`) findings from the initial audit have been resolved and directly re-verified against live commands. In addition, [`scripts/lib/chrome-cdp.mjs`](file:///Users/subramanyam/Documents/Design27/scripts/lib/chrome-cdp.mjs) was upgraded from localhost WebSocket transport to Chrome's zero-socket `--remote-debugging-pipe` stdio transport (fd 3/4), enabling both `d27-check.mjs --render` and `d27-frames.mjs sheet` to execute end-to-end inside air-gapped, no-loopback sandboxes with zero npm dependencies.

---

## Re-Verification Status of Prior Findings

### Critical Findings — All Resolved
- **C1 (`scripts/lib/ignores.mjs:6`, `scripts/d27-check.mjs:141,551`) — FIXED:** `DIRECTIVE_RE` now cleanly parses hyphenated and multi-rule inline directives (`no-overflow-x-hidden`, `no-transition-all, no-100vw`) with `—`, `--`, `-`, or XML-safe `:` reason separators, while `STRIP_D27_COMMENT_RE` prevents comment directives from self-triggering `LINE_RULES`. Verified with `--report-unused-ignores --strict` (`suppressed: 3`, `findings: []`, exit `0`).
- **C2 (`scripts/d27-deal.mjs:481-507`, `scripts/lib/chrome-cdp.mjs:258-273`) — FIXED:** `web` `before` assertions now target `main a, main button, .hero a, .hero button` (skipping `<header><nav><a>`), and `animation`/`motion`/`mascot` drop the forced `before: h1 -> a, button` check. Verified `d27-check.mjs --brief <dealt> --render --strict` exits `0` (`0` findings) on [`docs/index.html`](file:///Users/subramanyam/Documents/Design27/docs/index.html), [`evals/fixtures/design27-saas.html`](file:///Users/subramanyam/Documents/Design27/evals/fixtures/design27-saas.html), [`evals/fixtures/clean-mascot.html`](file:///Users/subramanyam/Documents/Design27/evals/fixtures/clean-mascot.html), and [`evals/fixtures/clean-thumb.html`](file:///Users/subramanyam/Documents/Design27/evals/fixtures/clean-thumb.html).
- **C3 (`assets/before-after-pillars.svg:101`, `assets/before-after-web.svg:2`, `assets/d27-cli-proof.svg:2`) — FIXED:** Removed `--` inside the XML comment in `before-after-pillars.svg` and used XML-safe `:` separators in the other two SVGs. All 3 `assets/*.svg` files parse cleanly in Python `xml.etree.ElementTree.parse` and pass `d27-check.mjs assets --strict --report-unused-ignores` with exit `0` (`0` FLOOR, `0` REFLEX).
- **C4 (`references/motion-design.md`, `references/thumbnails.md`, `references/book-writing.md`) — FIXED:** Every standalone copy-ready HTML blueprint across `references/*.md` (`book-writing.md#0`, `mascot-creation.md#1`, `motion-design.md#0`, `thumbnails.md#0`, plus `websites.md#1–2`) now passes `d27-check.mjs --medium=<medium> --render --strict --report-unused-ignores` with exit `0` (`renderAudit.engine: "chrome-cdp"`). *(Partial code excerpts `animations.md#2` [SVG fragment] and `motion-design.md#1` [HyperFrames `gsap` fragment] are intentional sub-document snippets rather than standalone pages.)*

### Important Findings — All Resolved
- **I1 (`scripts/lib/chrome-cdp.mjs:239-319`) — FIXED:** `buildDomAuditFnSource()` now honors `data-d27-allow` (`overflow`, `overlap`, `safe-zone`) for root horizontal overflow, `staysInFrame`, and `thumbnailDeadzoneCollisions` (shared by both CDP and Playwright paths). Verified both `data-d27-allow="safe-zone"` and `data-d27-allow="overflow"` pass `--render --strict` with `0` findings.
- **I2 (`scripts/d27-check.mjs:271-289`, `scripts/d27-captions.mjs:11-27`) — FIXED:** `VALUE_FLAGS` parsing consumes negative numeric arguments (`--target-lufs -16`) and skips only value-taking flags when locating positional targets (`d27-captions.mjs --validate --aspect 9:16 words.json` exits `0`).
- **I3 (`scripts/d27-check.mjs:538-543`) — FIXED:** `isVideoFile` respects explicit non-motion `--medium` values and checks `path.basename(file)` rather than ancestor directory names (`<tmp>/motion-dashboard/index.html --medium=web` exits `0`).
- **I4 (`scripts/d27-deal.mjs:17-306`) — FIXED:** All 16 Material Worlds in `d27-deal.mjs` now match [`references/direction-matrix.md`](file:///Users/subramanyam/Documents/Design27/references/direction-matrix.md#L62-L79) 1-to-1 (`missingFromDeal: []`), contain `0` `Geist` worlds, and pass all contrast checks (`inkPrimary`/`inkSecondary` vs `surfaceCanvas` & `surfaceElevated` `>= 4.5:1`, `accentInk` vs `accentFocal` `>= 4.5:1`, and `accentFocal` vs `surfaceCanvas` `>= 3.0:1`, including `cast-formwork` `#0E3FD1` at `3.99:1`).
- **I5 (`scripts/d27-check.mjs:137-139,871-907`) — FIXED:** Added `blankMarkdownCodeFences()` and synced missing vocabulary/openers (`underscore`, `landscape`, `beacon`, `intricate`, `foster`, `garner`, `Crucially,`, `Interestingly,`). Verified prose flags hit while fenced ```` ```js ```` identifiers (`delve_underscore_landscape`) are ignored.

### Minor Findings — All Resolved
- **M1 (`scripts/d27-check.mjs:598,626,685,766,810,846`) — FIXED:** Deep structural checks now skip when `tierArg === "fast"`; verified `d27-hook.mjs` `post-edit` (`PostToolUse`) followed by `stop` (`Stop`) catches deep rules incrementally (`hasDeepFindings: true`).
- **M2 (`references/motion-design.md:474,479`) — FIXED:** FFmpeg Pass 1 & Pass 2 now use identical `sidechaincompress=threshold=0.03:ratio=6:attack=40:release=350` and `LRA=11` settings.
- **M3 (`scripts/d27-check.mjs:652,819`) — FIXED:** Added `font:` shorthand matching in `brief-banned-default-used` and `7.0:1` `--ink-primary` contrast floor for `book` / `read` targets (verified with `#666666` on `#FFFFFF` = `5.74:1 < 7.0:1`).
- **M4 (`scripts/lib/reporters.mjs:55`, `evals/run-eval.mjs`, `evals/README.md`) — FIXED:** Added SARIF `$schema: "https://json.schemastore.org/sarif-2.1.0.json"` and expanded `evals/run-eval.mjs` to 14 assertions (`14/14` passing).

---

## Informational / Non-Blocking Notes

1. **Doc Copy Sync (`README.md:5,109`, `evals/README.md:3`):** `README.md:5,109` still references `"10-assertion"` (now `14-assertion` in `evals/run-eval.mjs` and `evals/README.md`), and `evals/README.md:3` still mentions `Node 22+` / `WebSocket` despite `chrome-cdp.mjs` now supporting Node 18+ via `--remote-debugging-pipe`.
2. **Historical Showcase Runs (`evals/showcase/`):** `evals/showcase/index.html:42` and `evals/showcase/RESULTS.md` retain the `2026-11-21` `v3.0.0` `web` and `illustration` run entries (`thumbnail`, `motion`, `book` empty `[]`) until a fresh `v4.0.0` showcase benchmark batch is executed.

---

## Re-Verification Evidence Log

| Check / Command | Observed Result |
| :--- | :--- |
| `node scripts/d27-cli.mjs eval` *(sandboxed)* | **PASS (`14/14`)** — exit `0`, including #12 `render=true (chrome-cdp)` |
| `python3` XML parse on `assets/*.svg` + `d27-check.mjs assets --strict --report-unused-ignores` | **PASS** — 3/3 valid XML (`before-after-pillars.svg`, `before-after-web.svg`, `d27-cli-proof.svg`), exit `0` (`0` FLOOR, `0` REFLEX) |
| `d27-check.mjs --medium=... --render --strict --report-unused-ignores` on `references/*.md` blueprints *(sandboxed)* | **PASS (Exit `0`, `chrome-cdp`)** on `book-writing.md#0`, `mascot-creation.md#1`, `motion-design.md#0`, `thumbnails.md#0`, `websites.md#1–2`, and all CSS/Typst snippets |
| `d27-deal.mjs` 6 mediums × 4 surfaces (all 16 worlds) | **16/16 PASS** — 1-to-1 match with `direction-matrix.md`, `0` `Geist` worlds, `0` contrast failures |
| `d27-check.mjs --brief <dealt> --render --strict` *(sandboxed)* | **PASS (Exit `0`, `chrome-cdp`)** on `docs/index.html`, `design27-saas.html`, `clean-mascot.html`, `clean-thumb.html` |
| `data-d27-allow="safe-zone"` & `data-d27-allow="overflow"` under `--render --strict` *(sandboxed)* | **PASS (Exit `0`, `chrome-cdp`)** — `0` findings |
| `ignores.mjs` hyphenated + multi-rule (`--report-unused-ignores --strict`) | **PASS (Exit `0`)** — `suppressed: 3`, `findings: []` |
| `d27-captions.mjs --validate --aspect 9:16 words.json` & `d27-frames.mjs sheet` on `motion-design.md#0` *(sandboxed)* | **PASS (Exit `0`)** — valid JSON captions; `d27-frames` captured 4 beat PNGs via `chrome-cdp` |
| `d27-hook.mjs` `post-edit` → `stop` on `slop-saas.html` | **PASS (Exit `0`)** — `PostToolUse` then `Stop` with `hasDeepFindings: true` |
| Book prose slop + fenced code exemption + `7.0:1` contrast + `font:` shorthand | **PASS** — flagged all added slop words (`underscore`, `landscape`, `beacon`, `intricate`, `foster`, `garner`, `Crucially,`), ignored fenced code, flagged `5.74:1 < 7.0:1` and `Inter` in `font:` shorthand |
| SARIF output `$schema` check | **PASS** — `https://json.schemastore.org/sarif-2.1.0.json` |
| Post-run temp & process cleanup (`TMPDIR` + `/tmp` + `ps aux`) | **PASS** — `0` leftover `d27-chrome-*` dirs and `0` leaked Chrome processes |
