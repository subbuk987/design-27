# High-Density Cheatsheets, Reference Cards & One-Pagers

Load this module alongside `SKILL.md` when designing developer cheatsheets, keyboard shortcut cards, executive one-pagers, study sheets, API quick-reference matrices, or print-ready desk cards.

---

## 1. The Anti-Claustrophobia Density Principle

A great cheatsheet packs **3× the information** of a standard page while remaining **faster to scan** than a web page. Claustrophobia never comes from high density alone — it comes from **bad alignment, competing borders, prose walls, and equalized spacing**.

### Cognitive Chunking Rules
1. **5–9 Semantic Clusters Per Page:** Divide the subject into cleanly bounded functional clusters (e.g., *Navigation*, *Selection*, *Flags*, *Patterns*, *Gotchas*). Every cluster fits on one visual glance.
2. **Zero Narrative Paragraphs:** Strip explanatory prose down to atomic **Syntax → Action** pairs, `2–3` column micro-tables, or `3–5` node mini-diagrams. Cap descriptions to `<= 12 words` per row.
3. **Hierarchical Micro-Whitespace:** Even in dense layouts, preserve strict separation ratios so the eye parses structure instantly:
   - Inside a key/value row: `3–4px` (`1mm`)
   - Between rows in the same table: `5–7px` (`1.5–2mm`)
   - Between distinct clusters inside a column: `14–18px` (`4–5mm`)
   - Column gutter: `14–18px` (`4–5mm`)
   - Outer page margin: `10–12mm` (print) / `24–32px` (screen)
4. **Kill Prison-Bar Gridlines:** Never put full 4-sided borders around every table cell. Use **horizontal hairlines (`0.5pt` at 14% ink)** OR **alternating `3%` row tints** — never both.

---

## 2. The 3-Level Scannable Hierarchy

Reserve **<= 10% of vertical page height** for the masthead! Never waste the top quarter of a reference sheet on an oversized marketing hero banner.

| Level | Visual Role | Exact Print Spec | Exact Screen Spec | Styling Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Masthead** | Title + scope + version/date | `16–20pt` bold left + `8pt` metadata right | `22–28px` bold left + `12px` mono right | Single horizontal header strip separated by a `1.5–2pt` solid rule. |
| **Level 1 — Cluster Anchor** | Major category header | `9–10pt` bold uppercase/sentence | `12–13px` bold | High-contrast solid inverted bar, `2pt` colored top rule, OR crisp numbered index (`01`) + subtle tinted strip. |
| **Level 2 — Subgroup Label** | Sub-category inside cluster | `8–8.5pt` semibold | `11–12px` semibold | Accent ink or muted uppercase (`+0.06em`), `8–10px` top margin, `3px` bottom margin. |
| **Level 3 — Atomic Data** | Commands, keys, formulas + descriptions | `7.5–8.5pt` (hard floor `7.5pt`), `lh: 1.32` | `11–12.5px` (hard floor `11px`), `lh: 1.4` | Left cell: monospace/bold in `--ink-primary`. Right cell: clean sans in `--ink-secondary`. |

---

## 3. Visual Anchors & Semantic Color Discipline

Color in a cheatsheet is a **wayfinding index**, never wallpaper.

- **Palette Ceiling:** `1` crisp canvas ground (`#FFFFFF` for print-friendliness, `#F8F9FA` or calibrated dark for screen-only) + `1` primary ink + **`2–3` functional semantic accents** (e.g., Blue = Read/Query, Amber = Mutate/Warn, Slate = Config). Never assign 8 rainbow colors to 8 boxes.
- **High-Velocity Scan Glyphs:**
  - **Keycaps (`<kbd>`):** `1px` crisp border + `1px` subtle bottom depth (`box-shadow: 0 1px 0 var(--hairline)`), `2–3px` radius, `2px 5px` padding, monospace.
  - **Inline Flag / Syntax Chips:** Soft `6%` neutral tint fill (`border-radius: 3px`) around flags (`--dry-run`, `Ctrl+K`) so commands pop from descriptions without bolding entire rows.
  - **Capability / Matrix Dots:** Use filled (`●`), half (`◐`), and hollow (`○`) circles instead of repetitive "Yes / Partial / No" text strings.
  - **Inline Micro-Diagrams:** Small crisp SVG state arrows (`A ──▶ B ──▶ C`) or labeled syntax anatomy blocks (command split into `[binary] [subcommand] [flags] [target]` with hairline callout brackets underneath) outperform paragraphs every time.

---

## 4. Dual-Safe Print Geometry (A4 & US Letter)

Cheatsheets get printed on both European **A4 (`210 × 297 mm`)** and North American **US Letter (`215.9 × 279.4 mm`)**. Design to the **Universal Dual-Safe Live Area** whenever shipping one shared PDF:

| Format | Physical Size | Safe Margin | Usable Live Area | Ideal Column Count |
| :--- | :--- | :--- | :--- | :--- |
| **Universal Dual-Safe (Portrait)** | Fits both A4 & Letter without scaling distortion | `11mm` | `188 × 257 mm` | **2 columns** (verbose syntax/tables) or **3 columns** (shortcuts/CLI flags) |
| **A4 Portrait** | `210 × 297 mm` | `10–12mm` | `186 × 273 mm` | 2 or 3 columns |
| **US Letter Portrait** | `215.9 × 279.4 mm` (`8.5 × 11 in`) | `10–12mm` (`0.4–0.5in`) | `192 × 255 mm` | 2 or 3 columns |
| **Landscape Desk Card (A4 / Letter)** | `297 × 210 mm` / `11 × 8.5 in` | `10mm` | `259 × 190 mm` (dual-safe) | **3 or 4 columns** (best for wide CLI tables & multi-step flow diagrams) |

### Column Architecture Rule
Use **explicit CSS Grid tracks** (`grid-template-columns: repeat(3, minmax(0, 1fr))`) with deliberate vertical column stacks rather than CSS `column-count` auto-balancing when you need exact visual control over top/bottom edges. If you DO use masonry/auto-flow, apply `break-inside: avoid` to every `.cluster` so a heading never splits from its table across column boundaries.

---

## 5. Production Implementation Pattern (Print + Screen Cheatsheet)

```css
@page {
  size: letter portrait; /* Swap to A4 or landscape as needed */
  margin: 11mm;
}

:root {
  --sheet-bg: #ffffff;
  --ink: #111317;
  --ink-muted: #434956; /* >= 7.5:1 on white */
  --rule: #d8dde6;
  --tint: #f4f6f9;
  --accent-a: #0f4c81; /* Primary structure */
  --accent-b: #9a3412; /* Cautions / Gotchas (>= 7:1 on white) */
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;

  /* Print-calibrated typographic tokens (hard floor >= 7.5pt) */
  --fs-title: 17pt;
  --fs-head:  9pt;
  --fs-body:  8.25pt;
  --fs-code:  7.75pt;
  --fs-meta:  7.5pt;
  --fs-kbd:   7.5pt;
}

.sheet {
  width: 100%;
  max-width: 188mm; /* Universal A4 & US Letter dual-safe live width */
  margin-inline: auto;
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  line-height: 1.35;
  color: var(--ink);
  background: var(--sheet-bg);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 3mm;
  margin-bottom: 4.5mm;
  border-bottom: 2pt solid var(--ink);
}
.sheet-title { font-size: var(--fs-title); font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.sheet-meta  { font-family: var(--font-mono); font-size: var(--fs-meta); color: var(--ink-muted); }

.sheet-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5mm;
  align-items: start;
}
.col-stack { display: flex; flex-direction: column; gap: 4.5mm; }

.cluster { break-inside: avoid; }
.cluster-head {
  font-size: var(--fs-head);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--accent-a);
  border-top: 2pt solid var(--accent-a);
  padding-top: 1.5mm;
  margin: 0 0 2mm;
}
.cluster--warn .cluster-head { color: var(--accent-b); border-top-color: var(--accent-b); }

.kv-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.kv-table tr { border-bottom: 0.5pt solid var(--rule); }
.kv-table tr:last-child { border-bottom: none; }
.kv-table td { padding: 1.3mm 0; vertical-align: top; }
.kv-table td:first-child {
  width: 44%;
  font-family: var(--font-mono);
  font-size: var(--fs-code);
  font-weight: 500;
  padding-right: 2.5mm;
  overflow-wrap: anywhere; /* Prevents long flags/paths overflowing 3-col tracks */
}
.kv-table td:last-child { color: var(--ink-muted); }

kbd {
  font-family: var(--font-mono);
  font-size: var(--fs-kbd);
  background: var(--tint);
  border: 0.5pt solid #bfc6d2;
  border-bottom-width: 1.25pt;
  border-radius: 2px;
  padding: 0.3mm 1.2mm;
}

/* Screen view enforces >= 11px hard legibility floor across ALL child tokens */
@media screen {
  :root {
    --fs-title: 24px;
    --fs-head:  12.5px;
    --fs-body:  12px;
    --fs-code:  11.5px;
    --fs-meta:  11px;
    --fs-kbd:   11px;
  }
  .sheet { max-width: 1120px; padding: 28px; }
}
@media screen and (max-width: 900px) {
  .sheet { padding: 24px; }
  .sheet-grid { grid-template-columns: 1fr; gap: 24px; }
}
@media print {
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet {
    max-width: 188mm;
    max-height: 257mm; /* Universal A4 & US Letter dual-safe height guard — prevents page-2 spill */
    overflow: hidden;
    padding: 0;
  }
}
```

### Cheatsheet Final Density Check
- **Dual-Safe Print Bounds:** Verify the rendered print preview fits cleanly inside `188 × 257 mm` with zero clipped clusters or accidental page-2 overflow on both US Letter and A4.
- **Footer Micro-Legend:** Reserve the bottom `4mm` across the sheet for a quiet 1-line legend (symbol definitions, repo URL, or edition date).
- **Home-Printer Safe:** Never ship a solid black `#000000` full-page background for a printable cheatsheet (destroys toner and blurs small `8pt` reversed text). If offering a dark screen mode, add an `@media print` override that cleanly flips to white ground + dark ink.
