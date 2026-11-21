# Websites, Editorial Pages & Interactive Product Experiences

Load this module alongside `SKILL.md` whenever designing or building landing pages, marketing sites, editorial web articles, portfolios, documentation, or interactive web apps.

---

## 1. Fluid Responsive Grid Architecture

Build every layout on an explicit, mathematically coupled grid — never ad-hoc pixel widths or nested mystery containers.

| Breakpoint Tier | Columns | Outer Page Margin | Column Gutter | Max Content Width |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop (`>= 1024px`)** | 12 columns | `clamp(32px, 5vw, 72px)` | `24px–32px` | `1280px–1440px` (`1600px` for dense app workspaces) |
| **Tablet (`640px–1023px`)** | 6 columns | `24px–32px` | `20px` | `100%` minus margins |
| **Mobile (`< 640px`)** | 4 columns | `16px–20px` | `16px` | `100%` minus margins |

### The 3-Track Editorial Canvas (Named CSS Grid Tracks)
For editorial pages and narrative marketing sites, define three nested widths inside one parent grid so full-bleed plates, wide diagrams, and `65ch` prose align cleanly without wrapper div soup:

```css
:root {
  /* Fluid Type Scale — tighten line-height inversely with size */
  --text-display: clamp(2.5rem, 5.5vw + 1.15rem, 5.25rem); /* 40px mobile -> 84px desktop (2.5x–4.6x body); lh: 0.96–1.05, ls: -0.03em */
  --text-h1:      clamp(2.25rem, 3.6vw + 1rem, 3.5rem);    /* 36px mobile -> 56px desktop (2.25x–3.1x body); lh: 1.05–1.12, ls: -0.025em */
  --text-h2:      clamp(1.5rem, 2.2vw + 0.7rem, 2.35rem);  /* lh: 1.15–1.22, ls: -0.015em */
  --text-h3:      clamp(1.125rem, 0.9vw + 0.85rem, 1.375rem); /* lh: 1.25–1.35 */
  --text-body:    clamp(1rem, 0.25vw + 0.95rem, 1.125rem); /* 16px -> 18px; lh: 1.58–1.68 */
  --text-meta:    0.75rem; /* 12px hard floor; uppercase eyebrows: +0.09em tracking */

  /* Rhythm & Layout Tokens */
  --page-gutter:  clamp(1.25rem, 4.5vw, 4.5rem);
  --section-gap:  clamp(4.5rem, 10vw, 9rem);
  --measure:      64ch;
  --wide-max:     82rem; /* 1312px */
}

/* Prose track claims priority via min(), collapsing side tracks cleanly before shrinking prose */
.editorial-canvas {
  display: grid;
  grid-template-columns:
    [full-start] minmax(var(--page-gutter), 1fr)
    [wide-start] minmax(0, calc((var(--wide-max) - var(--measure)) / 2))
    [prose-start] min(100% - 2 * var(--page-gutter), var(--measure)) [prose-end]
    minmax(0, calc((var(--wide-max) - var(--measure)) / 2)) [wide-end]
    minmax(var(--page-gutter), 1fr) [full-end];
}

.editorial-canvas > *           { grid-column: prose; }
.editorial-canvas > .band-wide  { grid-column: wide; }
.editorial-canvas > .band-full  { grid-column: full; }
```

**Typography scaling law:** Never allow body copy below `16px` (`1rem`) on desktop or mobile reading views, and never drop utility labels/captions below `12px`. Apply `text-wrap: balance` to all headings (`h1–h3`) and `text-wrap: pretty` to body paragraphs.

### Relational Luminance & Surface Polarity Contract (Light / Dark / Mid-Tone)
Never copy a fixed sample palette across projects, and never blindly invert light hexes into dark mode. Derive tokens from Stage 1's **Surface World** — supporting light UI, dark UI, AND mid-tone/saturated editorial or poster grounds:

| Token Role | Light UI (`Operate / Read`) | Dark UI (`Operate / Atmospheric`) | Mid-Tone / Saturated Ground (`Persuade / Experience / Posters`) | Contrast Floor |
| :--- | :--- | :--- | :--- | :--- |
| `--surface-canvas` | Lightness `94–99%` | Lightness `4–8%` (no `#000` reading) | Uncoated newsprint, `18%` charcoal, deep cobalt, terracotta, or forest ground | 60% dominance |
| `--surface-elevated` | `+2–4%` lift | `+4–6%` lift (surface step, no glow) | Clean ink or paper plate (`>= 10%` tonal separation) | Crisp figure–ground |
| `--ink-primary` | Lightness `6–12%` | Lightness `90–95%` off-white | Pure paper white or deep carbon chosen strictly for contrast polarity | **`>= 7:1`** reading (`>= 4.5:1` AA) |
| `--ink-secondary` | Lightness `28–36%` | Lightness `66–74%` | Tinted primary ink maintaining full AA legibility | **`>= 4.5:1`** hard floor |
| `--hairline` | Primary ink `10–16%` | Primary ink `10–14%` | Solid `1–2px` ink rule (`20–40%` opacity or `100%` Brutalist) | Quiet structural rule |
| `--accent-focal` | Deeper shade (`L 34–46%`) | Lifted shade (`L 62–76%`) | High-contrast complementary spot ink (acid chartreuse, bone, or signal ink) | **`>= 4.5:1`** vs canvas & `--accent-ink` |

### Mid-Tone Contrast Math Contract (Hard Floor)
Whenever a surface enters the **Mid-Tone Danger Band (`OKLCH L ∈ [0.48, 0.74]` / sRGB `Y ∈ [0.14, 0.45]`)**:
1. **Dual-Metric Gate:** Body/UI copy (`< 18px`) requires **`APCA |Lc| >= 75` AND `WCAG 2.1 >= 4.5:1`**; large display (`>= 32px, >= 600`) requires **`APCA |Lc| >= 60` AND `WCAG >= 3.0:1`**; borders/focus rings require `WCAG >= 3.0:1` AND `|ΔOKLCH_L| >= 0.20`.
2. **Achromatic Ink Lock:** Lock foreground text on Danger-Band grounds to near-achromatic extremes — either **Deep Ink (`L <= 0.16, C <= 0.02`)** or **Pure Paper (`L >= 0.96, C <= 0.015`)**. Tinted mid-dark inks on mid-tones are banned.
3. **Zero Alpha-Opacity Text on Mid-Tones:** Never use `opacity < 1` or translucent `rgba()` for secondary text on mid-tone surfaces (collapses contrast to `2:1`). Keep `100%` opacity with `|ΔL| >= 0.48`, or place metadata inside a stepped ink-safe plate (`|ΔL| >= 0.24`).
4. **Chroma-Vibration Clamp:** If `surface C >= 0.05` inside the Danger Band, clamp text chroma to `C <= 0.025` — never put saturated accent text directly over a saturated mid-tone ground.

---

## 2. Hero Composition Archetypes

Choose ONE hero archetype matching the Creative Brief. Ensure the primary message, focal visual, and primary CTA sit decisively inside the initial viewport (`1440×900` desktop and `390×844` mobile) without vertical clutter.

| Archetype | Spatial Split & Placement | Best Fit | Pitfall to Avoid |
| :--- | :--- | :--- | :--- |
| **1. Asymmetric Editorial Split** | Left `7 cols`: display headline + 1-sentence deck (`<= 48ch`) + CTA anchored to lower baseline. Right `5 cols`: tall `4/5` photo or crisp interactive artifact bleeding to right edge. | Editorial brands, studios, architecture, B2B craft tools | Don't vertically center tiny text beside a giant empty void; align to a deliberate baseline or top rule. |
| **2. Monumental Type Statement** | Full `12 cols` oversized headline (`6–9vw`) across top half; hairline rule below; left `4 cols` sub-deck + CTA, right `8 cols` widescreen media strip peeking above the fold. | Bold launches, agencies, conferences, monographs | Don't exceed 6–9 words in a `7vw+` headline; avoid wrapping to 4+ lines. |
| **3. Full-Bleed Cinematic Stage** | `88svh–100svh` edge-to-edge photo/video; directional bottom-left scrim (`0%` → `78%` black/surface); headline + 1 CTA pinned to lower-left `6 cols` safe zone. | Hardware, cinema, hospitality, games, atmospheric dark products | Never center white text across the brightest center of a photo without a scrim. |
| **4. Utilitarian Product-First** | Compact top band (`25%` height): crisp 1-line title + 1-line value prop + primary CTA left-aligned. Bottom `65%+` height: live interactive app/canvas/code artifact at real fidelity. | Devtools, SaaS apps, design tools, calculators | Don't hide the actual product beneath three paragraphs of marketing fluff. |
| **5. Swiss Masthead & Index** | Top publication masthead + date/issue rule; `8-col` lead feature with hero image + `4-col` hairline-ruled index column of latest entries/chapters. | Magazines, research hubs, documentation portals, journals | Keep the right rail scannable (titles + timestamps only, zero mini-card borders). |

**Hero restraint rule:** Maximum **1 primary CTA + 1 quiet secondary action** (text link or hairline button). Zero trust-logo carousels or 4-stat boxes jammed inside the hero unless the brief explicitly mandates above-the-fold proof. **Fold floor:** The hero's headline, one-sentence deck, and primary action must all be visible without scrolling at **`1280 × 800`** (as well as `1440 × 900` and `390 × 844`). **Visual Anchor Law & Asset-Reality Fallback Ladder:** On *Persuade* and *Experience* surfaces, never hide behind "empty hairline-strip minimalism" as a hero crutch — commit to one unmistakable centerpiece in strict fallback order: **(1)** real user photography or a live interactive slice of the actual product/data, **(2)** monumental typographic architecture, a real data visualization, or strict grid/schematic SVG primitives (never freehand LLM clip-art), or **(3)** an explicit art-directed asset slot ready for the user's media. **Outright banned:** fake lorem-ipsum dashboard mockups, generic CSS gradient blobs, and crooked freehand SVG clip-art.

### Non-Negotiable Web CSS Floor & Nested Radius Law
Enforce these mechanical invariants on every web build:
- **Safe Horizontal Clipping:** Apply `overflow-x: clip` on `html, body` — **never `overflow-x: hidden`** (which silently breaks `position: sticky`) and **never `width: 100vw`** (which triggers horizontal scrollbars on Windows).
- **Grid Blowout Guards:** Every image-bearing or code-bearing grid track uses `minmax(0, 1fr)`; display headings carry `min-width: 0; overflow-wrap: break-word;`. At ultra-wide `1920px+` viewports, cap and center the outer container so gutters grow while prose measure stays fixed.
- **Nested Radius Formula:** Whenever a rounded element sits inside a rounded container, compute **`inner-radius = max(outer-radius - padding, 4px)`** (e.g., `16px` outer card with `12px` padding → `4px` inner element) so corners stay optically concentric instead of pinching.
- **Job-First Page Anatomy:** Structure sections around what the visitor came to *do* (book, buy, subscribe, try, inspect docs, attend) rather than an automatic SaaS stack of 3-icon cards + 4 stats + fake testimonials + email banner.
- **Zero `transition: all`:** Always name explicit GPU-friendly properties (`transition: color, background-color, border-color, opacity, transform`) and style `:focus-visible` cleanly on every interactive control.

---

## 3. Alternating Section Rhythm (Anti-Monotony Grammar)

A page fails when every vertical scroll feels like the same container repeated five times. Choreograph an alternating sequence across three axes: **Density (airy ↔ compact)**, **Geometry (asymmetric ↔ full-width ↔ multi-column)**, and **Surface Polarity (canvas ↔ elevated tint ↔ inverted ink band)**.

**Example 7-Section Editorial Cadence:**
1. **Hero** — Asymmetric Editorial Split (`canvas` surface)
2. **Proof / Metric Strip** — Horizontal 4-item hairline strip with oversized `tabular-nums` figures (open canvas, zero boxes)
3. **Core Story** — Full-width (`wide`) interactive diagram or `16/9` product plate with short caption below (breaks text monotony)
4. **Deep Dive** — Sticky `4-col` section title on left + scrolling `7-col` (with `1-col` breathing gap) numbered editorial items on right
5. **Contrast Band** — Inverted dark/tinted full-bleed band for a single monumental quote, benchmark comparison, or case-study highlight
6. **Specification / Comparison** — Clean open editorial table (ruled rows, zero card chrome)
7. **Closing CTA & Footer** — Generous negative space, single direct prompt, compact hairline-divided directory footer

**Macro vs. Micro Spacing Law:**
- Space between sections (`--section-gap`): `72px–144px` (`clamp(4.5rem, 10vw, 9rem)`).
- Space between section header and its content: `32px–48px`.
- Space inside an individual group (heading → copy): `8px–16px`.
- Ratio check: section separation must be `>= 3x` internal group gaps.

---

## 4. Open Strips & Editorial Tables vs. Cards

Default to **open-canvas typography and hairline rules**. Reach for boxed cards only when items are heterogeneous, self-contained interactive objects.

| Content Type | Use This (Studio Standard) | Avoid This (Slop) |
| :--- | :--- | :--- |
| 3–6 product capabilities / steps | Numbered `01 / 02 / 03` open rows with `border-top: 1px solid var(--hairline)`, bold title left (`4 cols`), crisp `52ch` explanation right (`7 cols`) | 3-column grid of rounded shadow cards each with a 40px tinted icon box |
| Key metrics / KPIs | Open horizontal strip separated by vertical `1px` hairlines; oversized figure (`3rem`, `tabular-nums`) over tight `12px` uppercase label | Individual bordered white tiles with tiny upward green arrows inside badges |
| Pricing / Technical specs | Clean editorial comparison table: crisp header underline, `border-bottom: 1px solid var(--hairline)` rows, subtle `3%` tint column highlight for recommended tier | Giant floating cards with 14 green checkmarks and bouncing "MOST POPULAR" ribbons |
| Articles / Portfolio / SKUs | Clean borderless media cards: sharp or calibrated-radius image on top (`aspect-ratio: 3/2` or `4/5`), zero box border, metadata + title directly below on canvas | Padded box-shadow cards trapping the image inside an awkward `16px` white frame |

```css
/* Open-Canvas Ruled Feature List */
.ruled-list { border-top: 1px solid var(--hairline); }
.ruled-row {
  display: grid;
  grid-template-columns: 3.5rem minmax(12rem, 4fr) minmax(0, 6fr);
  gap: 1.5rem 2rem;
  padding-block: clamp(1.5rem, 3vw, 2.5rem);
  border-bottom: 1px solid var(--hairline);
  align-items: baseline;
}
.ruled-index { font-family: var(--font-mono); font-variant-numeric: tabular-nums; color: var(--ink-secondary); }
@media (max-width: 768px) {
  .ruled-row { grid-template-columns: 1fr; gap: 0.5rem; }
}
```

---

## 5. Responsive Image Aspect, Cropping & Art Direction

Images carry 50%+ of perceived quality. Sloppy crops instantly break editorial authority.

1. **Lock Aspect Ratios Explicitly:** Every image container declares `aspect-ratio` (`16/9` cinematic/UI, `3/2` editorial landscape, `4/5` portrait/mobile feature, `1/1` avatars/icons) plus `width: 100%; height: 100%; object-fit: cover;`. Never let intrinsic image dimensions arbitrarily stretch columns or cause CLS shifts.
2. **Art-Direct Across Breakpoints:** A wide `21/9` desktop banner shrinks to an unreadable sliver on `390px` mobile. Switch container ratio (`aspect-ratio: 4/3` or `4/5` below `640px`) or use `<picture><source media="(min-width: 768px)" ...>` with a tighter mobile crop.
3. **Preserve Subject Focal Point:** Set explicit `object-position` (e.g., `50% 22%` for portraits so eyes never get cropped off; `left top` for UI screenshots so navigation anchors cleanly).
4. **Scrim Pattern for Text Over Media (Explicit Stacking Context):**
   ```css
   .media-stage { position: relative; overflow: hidden; isolation: isolate; }
   .media-stage > img,
   .media-stage > video { position: relative; z-index: 0; width: 100%; height: 100%; object-fit: cover; }
   .media-stage::after {
     content: "";
     position: absolute;
     inset: 0;
     z-index: 1;
     background: linear-gradient(
       to top,
       rgba(10, 11, 14, 0.82) 0%,
       rgba(10, 11, 14, 0.34) 45%,
       rgba(10, 11, 14, 0) 75%
     );
     pointer-events: none;
   }
   .media-stage > .media-content { position: relative; z-index: 2; }
   ```
5. **UI & Chart Showcases:** Present screenshots at honest resolution with `1px solid var(--hairline)` and soft, wide-spread realistic elevation (`0 24px 60px -16px rgba(0,0,0,0.18)`), never cramped inside fake tilted phone mockups unless demonstrating mobile-specific ergonomics.

---

## 6. Navigation & Scroll-Pacing Hierarchy

- **Top Navigation Bar:** Height `56px–68px`. Maximum **4–5 top-level links** plus **1 primary CTA** (and optional theme/search utility). Keep navigation translucent with subtle backdrop blur (`blur(12px)`) and a crisp `1px` bottom hairline only once scrolled, or crisp opaque matching `--surface-canvas`.
- **Sticky Editorial Anchors:** On desktop (`>= 1024px`), sticky left-column section headings (`position: sticky; top: 5.5rem; align-self: start;`) anchor long multi-item sections cleanly. Release sticky behavior cleanly on mobile so it never steals vertical viewport space.
- **Scroll Pacing:** Keep above-the-fold chrome uncluttered. Never hijack native scroll velocity ("scroll-jacking"). Use scroll-linked reveals strictly to accentuate hierarchy (see `references/motion-design.md`), never to hide critical content behind invisible opacity-0 traps if scripts lag.
- **Mobile Collapse Discipline:** Reorder split columns intentionally on mobile (`order` or grid placement) so the headline and primary visual establish context before long secondary copy; preserve `>= 44×44px` tap targets on all interactive controls.

---

## 7. Web App Shells, Dashboards & Data Visualization

Operational apps and analytics dashboards are the #1 place agents collapse into bloated bento card soup. Apply the same open-canvas discipline to product UI:

- **Workspace Shell Anatomy:** Use a fixed `220–248px` left navigation rail (collapsible to `60px` icons on tablet / drawer on mobile) separated by a crisp `1px solid var(--hairline)` — never floating rounded sidebar boxes with drop shadows. Top workspace bar (`52–56px`) carries breadcrumb context left, time-range / filter controls and 1 primary action right.
- **Open KPI Strip Over Bento Tiles:** Render top-level metrics as a single horizontal hairline-divided strip (`border-block: 1px solid var(--hairline)`) with `tabular-nums` values (`1.75–2.25rem`), crisp `12px` uppercase labels, and restrained delta cues (`+4.2%`) — not 4 thick shadowed boxes with redundant icons and fake sparkline confetti.
- **Primary Chart Dominance (`>= 65%` Width):** Give the primary time-series or diagnostic chart generous horizontal span (`8–12 cols` on desktop, full width on mobile) and clean height (`280–380px`). Use subtle `8–12%` horizontal-only gridlines, direct series labels instead of distant color legends where possible, `<= 4` distinct non-rainbow semantic series hues, and crisp hover crosshairs. Never cramp charts into narrow 3-column tiles.
- **Dense Operational Tables:** Sticky table headers (`position: sticky; top: 0`), `1px` bottom row hairlines, left-aligned text, right-aligned `tabular-nums` numbers, subtle row hover tint (`3–4%`), and restrained status dots (`6px` dot + plain text label instead of heavy colored pill tags on every cell).
- **Complete Interactive States:** Explicitly design **empty states** (concise 1-line explanation + 1 clear next action), **loading skeletons** matching exact row geometry, **inline error states**, and unmistakable **`:focus-visible`** keyboard rings (`2px solid var(--accent-focal); outline-offset: 2px`).
