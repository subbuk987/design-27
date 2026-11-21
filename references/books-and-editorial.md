# Books, Magazines, Long-Form Reports & Multi-Page Publications

Load this module alongside `SKILL.md` when designing books, print or digital magazines, whitepapers, annual reports, monographs, zines, or multi-page PDFs (CSS Paged Media, Typst, LaTeX, Figma, or InDesign specs).

---

## 1. Page & Spread Architecture

Design print publications as **facing spreads (verso left + recto right)** and screen-first PDFs as **balanced single pages**. Never treat a book page like a stretched webpage.

### Classical & Editorial Margin Systems

| Publication Type | Inner (Gutter) | Top (Head) | Outer (Fore-edge) | Bottom (Foot) | Spatial Logic |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Trade / Monograph Book** (Tschichold 2:3:4:6 progression) | `18–22mm` | `20–24mm` | `28–34mm` | `36–46mm` | Generous thumb room outside and deep optical anchor at bottom; add `+4–6mm` inner gutter for perfect-bound books >200 pages. |
| **Editorial Magazine Spread** (A4 `210×297mm` / `8.5×11in`) | `18–20mm` | `18–22mm` | `16–20mm` | `22–26mm` | 6-col or 12-col modular grid with `4–5mm` column gutters; clean outer margins for bleed plates and margin captions. |
| **Tufte-Style Technical Book / Report** | `20mm` | `20mm` | `64–72mm` (incl. sidenote track) | `24mm` | Primary prose spans ~62% width (`58–65ch`); outer 32% margin anchors sidenotes, citations, and sparklines directly beside their references. |
| **Screen-First PDF Report** (A4 / US Letter) | `20–24mm` (symmetric) | `22mm` | `20–24mm` (symmetric) | `22–26mm` | Zero spine loss; symmetric left/right margins feel poised inside single-page PDF viewers. *(For `16:9` slide and pitch decks, load [`references/presentations.md`](presentations.md).)* |

### Baseline Grid Discipline
Lock body copy, subheadings, captions, and adjacent columns to one shared **baseline grid** (equal to body leading, typically `12pt`, `13.5pt`, or `14pt`):
- Facing columns across the center gutter MUST sit on identical horizontal baselines.
- Heading line-height AND vertical margins must each be multiples of the baseline unit so even multi-line wrapped headings keep following prose on-grid (e.g., for a `14pt` baseline, an `18pt` `H2` uses `line-height: 28pt` [2× baseline] + `margin-top: 28pt` + `margin-bottom: 14pt`, OR step on a `7pt` half-baseline grid).

---

## 2. Chapter Opener Drama & Spread Pacing

A long publication succeeds on **pacing** — alternating quiet reading spreads with structural landmarks and visual breath.

### Chapter / Major Feature Opener Recipe
1. **Recto Start (Print Books):** Start major chapters on the right-hand (`recto`, odd-numbered) page; leave the preceding verso intentionally blank (suppress running header/folio) or place a full-bleed photographic plate on the verso.
2. **Vertical Sinkage:** Start the chapter title **25%–38% down the page** (`sinkage`). That deliberate empty expanse at the top signals authority and gives the reader a clean transition.
3. **Structured Opener Stack:**
   - **Chapter Numeral / Eyebrow:** Oversized light display numeral (`48–72pt`) OR crisp tracked small caps (`9pt`, `+0.14em`).
   - **Chapter Title:** High-contrast display (`28–42pt`, tight leading `1.02–1.1`, balanced lines with zero single-word orphans).
   - **Standfirst / Deck (Magazines & Reports):** 1–3 sentence framing summary at `1.25×–1.4×` body size in secondary weight or italic serif (`max 55ch`).
   - **Opening Paragraph:** Zero first-line indent! Distinguish the opening with either a 2–3 line **drop cap** (aligned optically to top cap-height and bottom baseline) OR **first 3–4 words set in true small caps** (`font-variant-caps: small-caps`).
   - **Subsequent Paragraphs:** Commit to EITHER classic book indent (`1.25em–1.5em` first-line indent, `0pt` vertical paragraph gap) OR modern report block spacing (`0em` indent, `0.65×–0.85×` baseline gap). **Never combine both** (indented paragraphs with blank lines between them is an amateur tell).

### Spread Pacing Variety (Magazines & Reports)
Never stack 8+ identical text walls consecutively. Alternate across:
- **Full-Bleed Plate Spread** — edge-to-edge photograph or diagram with crisp corner caption.
- **Feature Text + Sidenote Spread** — main reading column paired with outer-margin pull quotes, definitions, or small charts.
- **Structured Data / Table Spread** — full-width editorial comparison table or visual timeline spanning across columns.
- **Section Divider Pause** — tinted solid paper page carrying a section numeral and single-sentence thesis.

---

## 3. Running Headers, Folios & Apparatus

Navigation chrome must whisper, never compete with prose.

- **Typography:** `7.5pt–9pt`, secondary ink that still clears `>= 4.5:1` contrast against paper ground (typically `70–75%` primary ink luminance, never washed-out low-contrast grey), set in small caps or uppercase with `+0.08em–0.12em` tracking.
- **Verso / Recto Pairing (Books & Reports):**
  - Left page (`verso`): Book or publication title aligned flush left (outer edge).
  - Right page (`recto`): Current chapter or section title aligned flush right (outer edge).
  - Folios (page numbers): Consistently placed at the **outer bottom corner** or **outer top margin** flush with the text block edge, set in `tabular-nums`.
- **Mandatory Suppression:** Suppress running headers and folios on **cover, half-title, title page, blank verso pages, and full-bleed photographic plates**. On chapter openers, suppress the running header (optionally keep a quiet centered bottom folio).

---

## 4. Pull Quotes, Callouts, Captions & Footnotes

| Element | Size Relative to Body | Leading | Styling & Spatial Anchor |
| :--- | :--- | :--- | :--- |
| **Body Prose** | `9.5pt–11pt` (print) / `10.5pt–11.5pt` (screen PDF) | `1.38–1.50` (`13.5–16pt`) | Measure `55–68` chars (1-col) or `36–48` chars (2–3 col). |
| **Pull Quote** | `1.45×–1.9×` body (`15–20pt`) | `1.2–1.3` | Editorial serif italic or bold display; cap at **15–25 words**; framed by `0.75pt–1pt` top/bottom hairlines or hung `20%` into the outer margin. |
| **Callout / Sidebar** | `0.9×–0.95×` body (`9–10pt`) | `1.35–1.42` | Subtle `4–6%` paper tint fill OR a single `2pt` left accent rule + `12–16pt` internal padding. Zero heavy 4-sided boxes or drop shadows. |
| **Figure Caption** | `0.78×–0.85×` body (`8–9pt`) | `1.25–1.35` | Distinct family/weight from body (e.g., crisp sans caption under serif body) + bold label (`Figure 2.4 —`). Keep `6–8pt` tight to figure, `>= 18pt` away from surrounding prose. |
| **Footnotes / Sidenotes** | `0.75×–0.82×` body (`7.5–8.5pt`) | `1.22–1.32` | Separated from body text by a short `35–50mm` `0.5pt` hairline rule (footnotes) or baseline-aligned in outer margin (sidenotes). |

---

## 5. Widow, Orphan, Rag & Justification Hygiene

Enforce these rules mechanically across every multi-page layout engine:

1. **Widows & Orphans:** Minimum `2` lines (`3` preferred for trade books) at top or bottom of any page/column. Never strand a heading at the bottom of a page without at least 2 lines of following body copy (`break-after: avoid`).
2. **Atomic Blocks:** Never split figures from their captions, callouts, or compact tables across page breaks (`break-inside: avoid`). On multi-page tables, repeat `<thead>` cleanly on each continued page.
3. **Justification vs. Ragged-Right:**
   - **Justified text REQUIRES hyphenation** (`hyphens: auto; hyphenate-limit-chars: 6 3 2; hyphenate-limit-lines: 2`). Never justify narrow columns (`< 45` chars) without hyphenation — it creates distracting white "rivers".
   - **Ragged-right (left-aligned)** outperforms justified text for technical reports, narrow 3-column magazine layouts, and modern screen PDFs; audit line endings to eliminate jagged stair-step rags.
4. **Micro-Typography:** Use true em-dashes (`—`), en-dashes for numeric ranges (`2024–2026`), typographic quotes (`“ ” ‘ ’`), non-breaking spaces before units (`12 mm`, `45 %`), and `tabular-nums` in tables and tables of contents.

---

## 6. Print-Ready vs. Screen-PDF Specifications

| Parameter | Commercial Print PDF | Screen-First Digital PDF |
| :--- | :--- | :--- |
| **Color Space** | CMYK (`FOGRA39` EU / `GRACoL` US); body prose in **100% K only** (`C0 M0 Y0 K100`) to avoid registration blur; large dark fills in **Rich Black** (`C40 M30 Y30 K100`) | sRGB; calibrated off-black (`#141518`) on warm/clean ground (`#FAF9F6` or `#FFFFFF`) |
| **Bleed & Trim** | `3mm` (`0.125in`) bleed on all outer edges for any full-bleed image or tint; crop/trim marks enabled | `0mm` bleed; flush to digital page edge |
| **Resolution** | `300 DPI` at 100% print scale; vector SVG/PDF for charts and typography | `150–200 DPI` for crisp, lightweight sharing; vector graphics |
| **Pagination & Interactivity** | Facing spreads (`@page :left` / `@page :right`); total page count divisible by `4` (saddle-stitch) or `16` (book signatures) | Single-page continuous flow; interactive PDF bookmarks/outline and clickable TOC links |

### Production Pattern — CSS Paged Media & Typst

```css
/* CSS Paged Media (WeasyPrint / Prince / Paged.js) */
@page {
  size: 152mm 229mm; /* 6 x 9 in trade book */
  margin: 20mm 28mm 38mm 22mm; /* top right bottom left (default recto fallback) */
  bleed: 3mm;
  marks: crop;
}
@page :left {
  margin: 20mm 22mm 38mm 28mm; /* inner right 22mm, outer left 28mm */
  @top-left    { content: string(book-title); font-size: 8pt; letter-spacing: 0.1em; text-transform: uppercase; color: #4A4D55; }
  @bottom-left { content: counter(page); font-size: 8.5pt; font-variant-numeric: tabular-nums; }
}
@page :right {
  margin: 20mm 28mm 38mm 22mm; /* outer right 28mm, inner left 22mm */
  @top-right    { content: string(chapter-title); font-size: 8pt; letter-spacing: 0.1em; text-transform: uppercase; color: #4A4D55; }
  @bottom-right { content: counter(page); font-size: 8.5pt; font-variant-numeric: tabular-nums; }
}
/* Suppress headers/folios on auto-generated blank versos and ONLY the first page of each chapter */
@page :blank {
  @top-left { content: none; } @top-right { content: none; }
  @bottom-left { content: none; } @bottom-right { content: none; }
}
@page chapter-section:first {
  @top-left { content: none; }
  @top-right { content: none; }
}

.book-title      { string-set: book-title content(); }
.chapter         { page: chapter-section; break-before: right; }
.chapter-opener  { padding-top: 64mm; } /* Explicit ~28% vertical sinkage on 229mm height (never %) */
.chapter-title   { string-set: chapter-title content(); }

h1, h2, h3           { break-after: avoid; text-wrap: balance; }
figure, .table-compact { break-inside: avoid; }
thead                { display: table-header-group; } /* Repeats headers on multi-page tables */
p                    { margin: 0; widows: 3; orphans: 3; hyphens: auto; }
p + p                { text-indent: 1.4em; } /* Classic book indent with zero blank line between paragraphs */
```

```typst
// Typst Equivalent — Facing Book Spread Setup (Zero Double-Signaled Paragraphs)
#set page(
  width: 152mm, height: 229mm,
  margin: (inside: 22mm, outside: 28mm, top: 20mm, bottom: 38mm),
  header: context {
    let here-page = here().page()
    let on-chapter-start = query(heading.where(level: 1)).any(h => h.location().page() == here-page)
    if here-page > 1 and not on-chapter-start {
      let chapters = query(selector(heading.where(level: 1)).before(here()))
      let current-ch = if chapters.len() > 0 { chapters.last().body } else { [] }
      set text(size: 8pt, tracking: 0.08em, fill: luma(74))
      if calc.odd(here-page) { align(right, upper(current-ch)) }
      else { align(left, upper[Book Title]) }
    }
  },
  footer: context {
    let here-page = here().page()
    if here-page > 1 {
      set text(size: 8.5pt, number-type: "lining", number-width: "tabular")
      if calc.odd(here-page) { align(right, counter(page).display()) }
      else { align(left, counter(page).display()) }
    }
  }
)
// Match par.spacing == par.leading so indented paragraphs never add blank gaps
#set par(leading: 0.68em, spacing: 0.68em, first-line-indent: 1.4em, justify: true)
#show heading: set block(sticky: true) // Prevents orphaned headings
```
