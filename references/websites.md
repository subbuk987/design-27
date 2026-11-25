# Websites, Web Apps, Dashboards & Dual-Safe One-Pagers

Load this module alongside `SKILL.md` and `references/animations.md` whenever designing or building landing pages, marketing sites, editorial web articles, portfolios, documentation, web apps, dashboards, or dense dual-safe reference one-pagers.

---

## 1. Whole-Page Macrostructure Catalog (Anti-Template Architecture)

Never pour every brief into the same hero + `.ruled-row` `01/02/03` + table + footer mold. Choose ONE macrostructure matched to the brief's **Surface Mode** and physical craft, so two consecutive sites never share the same skeleton:

| Macrostructure | Best Fit (`Surface Mode`) | Spatial Skeleton & Signature Move | Hard Rules (What Makes It Distinct) |
| :--- | :--- | :--- | :--- |
| **1. `Interactive Instrument`** | Audio/video tools, developer utilities, calculators, hardware specs (*Persuade / Experience*) | Compact top utility bar → immediate live **interactive workbench stage** (`65%+` viewport height) with real-time dials/sliders/readouts → calibrated spec ledger below | The interactive proof widget IS the hero centerpiece; zero marketing-fluff intro stack above it. |
| **2. `Diegetic Artifact Stage`** | Cinema, hardware launches, physical goods, exhibitions, bespoke studios (*Persuade / Experience*) | Full-bleed physical world frame (film leader, caliper scale, sprocket border, specimen mount) → asymmetric `7/5` narrative plate → tactile spec/edition block | Derived from one authentic domain artifact; never uses generic SaaS rounded cards or floating blobs. |
| **3. `Editorial Broadsheet`** | Publications, research hubs, journals, essays, architectural portfolios (*Read / Persuade*) | Crisp top masthead + issue/date rule → `8-col` lead feature plate + `4-col` hairline-ruled index rail → alternating wide plates and sticky `64ch` prose columns | Multi-column newspaper/journal hierarchy; right rail carries titles + `tabular-nums` metadata only (zero card borders). |
| **4. `Product Workbench`** | SaaS apps, telemetry dashboards, internal tools, IDE/data consoles (*Operate*) | Fixed `220–248px` left rail (`1px` hairline divider) + `52px` top context bar → horizontal hairline KPI strip → `>= 65%`-width primary chart + dense sticky-header table | Flat surface hierarchy (`<= 1px` structural hairlines, zero drop-shadow card soup); complete empty/loading/error states. |
| **5. `Split Monograph`** | Case studies, technical docs, long-form product stories, design systems (*Read / Persuade*) | Sticky `4-col` chapter index / section title on left → scrolling `7-col` (`1-col` gap) narrative plates, inline code/diagrams, and `aside` margin notes on right | Left anchor stays pinned on desktop (`>= 1024px`) and releases cleanly on mobile; breaks prose every 2–3 screens with a `wide` plate. |
| **6. `Manifesto Ledger`** | Conferences, launches, open-source releases, opinionated brands (*Persuade / Experience*) | Full `12-col` monumental type statement (`6–9vw`, `<= 8` words) over `1–2px` solid rule → stark contrast-polarity band → dense numbered ledger or direct commitment CTA | Extreme typographic scale contrast (`>= 4:1`) does the heavy lifting; `>= 35%` calm negative-space counterweight. |

### 6 Distinct Section Grammars (Rotate — Never Repeat `.ruled-row` Blindly)
Even inside a macrostructure, alternate section mechanics down the page instead of repeating `01 / 02 / 03` ruled rows everywhere:
1. **Interactive Proof Stage:** Live zero-dep widget proving the core technical/value claim (Section 3).
2. **Perforated / Framed Artifact Strip:** Horizontal or grid strip of domain-framed plates (sprocket border, calibrated tick marks, specimen mount) with tight captions.
3. **Sticky Narrative Walkthrough:** `position: sticky` left thesis/diagram paired with scrolling step beats on the right.
4. **Asymmetric Editorial Plate:** `7/5` or `65/35` unboxed image/diagram bleeding toward one margin beside tight `52ch` copy.
5. **Spec Matrix / Ruled Ledger:** Clean editorial comparison table or `.ruled-row` index (`01 / 02 / 03`) — use at most **once** per page where indexed scanning is genuinely the best fit.
6. **Tactile Action / Checkout Block:** Direct commitment strip (validated form, tier selector, physical press button) anchored with generous breathing room.

---

## 2. Fluid Responsive Grid & 3-Track Editorial Canvas

Build every layout on an explicit, mathematically coupled grid — never ad-hoc pixel widths or nested mystery containers.

| Breakpoint Tier | Columns | Outer Page Margin | Column Gutter | Max Content Width |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop (`>= 1024px`)** | 12 columns | `clamp(32px, 5vw, 72px)` | `24px–32px` | `1280px–1440px` (`1600px` for dense app workspaces) |
| **Tablet (`640px–1023px`)** | 6 columns | `24px–32px` | `20px` | `100%` minus margins |
| **Mobile (`< 640px`)** | 4 columns | `16px–20px` | `16px` | `100%` minus margins |

```css
:root {
  /* Fluid Type Scale — tighten line-height inversely with size */
  --text-display: clamp(2.5rem, 5.5vw + 1.15rem, 5.25rem); /* 40px -> 84px; lh: 0.94–1.05, ls: -0.03em */
  --text-h1:      clamp(2.25rem, 3.6vw + 1rem, 3.5rem);    /* 36px -> 56px; lh: 1.05–1.12, ls: -0.025em */
  --text-h2:      clamp(1.5rem, 2.2vw + 0.7rem, 2.35rem);  /* lh: 1.15–1.22, ls: -0.015em */
  --text-h3:      clamp(1.125rem, 0.9vw + 0.85rem, 1.375rem); /* lh: 1.25–1.35 */
  --text-body:    clamp(1rem, 0.25vw + 0.95rem, 1.125rem); /* 16px -> 18px; lh: 1.58–1.68 */
  --text-meta:    0.75rem; /* 12px screen floor */

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

.editorial-canvas > *          { grid-column: prose; }
.editorial-canvas > .band-wide { grid-column: wide; }
.editorial-canvas > .band-full { grid-column: full; }
```

**Typography scaling law:** Never drop web body copy below `16px` (`1rem`), never drop web utility labels below `12px`, apply `text-wrap: balance` to `h1–h3`, and apply `text-wrap: pretty` to body paragraphs.

### Relational Luminance & OKLCH + APCA Mid-Tone Contrast Math
Derive surface and ink tokens from the brief's **Material World** (never copy a single house palette or blindly invert light hexes into dark mode):

| Token Role | Light UI (`Operate / Read`) | Dark UI (`Operate / Atmospheric`) | Mid-Tone / Saturated Ground (`Persuade / Experience`) | Contrast Floor |
| :--- | :--- | :--- | :--- | :--- |
| `--surface-canvas` | Lightness `94–99%` | Lightness `4–8%` (no `#000` reading) | Uncoated newsprint, `18%` concrete, film grey, cobalt, terracotta, or forest ground | 60% dominance |
| `--surface-elevated` | `+2–4%` lift | `+4–6%` lift (surface step, no glow) | Clean ink or paper plate (`>= 10%` tonal separation) | Crisp figure–ground |
| `--ink-primary` | Lightness `6–12%` | Lightness `90–95%` off-white | Pure paper white or deep carbon chosen strictly for polarity | **`>= 7:1`** reading (`>= 4.5:1` AA) |
| `--ink-secondary` | Lightness `28–36%` | Lightness `66–74%` | Tinted primary ink maintaining full AA legibility | **`>= 4.5:1`** hard floor |
| `--hairline` | Primary ink `10–16%` | Primary ink `10–14%` | Solid `1–2px` ink rule (`20–40%` opacity or `100%` Brutalist) | Quiet structural rule |
| `--accent-focal` | Deeper shade (`L 34–46%`) | Lifted shade (`L 62–76%`) | High-contrast complementary spot ink (acid chartreuse, bone, or signal ink) | **`>= 4.5:1`** vs canvas & `--accent-ink` |

**Mid-Tone Danger Band Contract (`OKLCH L ∈ [0.48, 0.74]` / sRGB `Y ∈ [0.14, 0.45]`):**
1. **Dual-Metric Gate:** Body/UI copy (`< 18px`) requires **`APCA |Lc| >= 75` AND `WCAG 2.1 >= 4.5:1`**; large display (`>= 32px, >= 600`) requires **`APCA |Lc| >= 60` AND `WCAG >= 3.0:1`**; borders/focus rings require `WCAG >= 3.0:1` AND `|ΔOKLCH_L| >= 0.20`.
2. **Achromatic Ink Lock:** Lock foreground text on Danger-Band grounds to near-achromatic extremes — **Deep Ink (`L <= 0.16, C <= 0.02`)** or **Pure Paper (`L >= 0.96, C <= 0.015`)**. Tinted mid-dark inks on mid-tones are banned.
3. **Zero Alpha-Opacity Text on Mid-Tones:** Never use `opacity < 1` or translucent `rgba()` for secondary text on mid-tone grounds (collapses contrast to `~2:1`). Keep `100%` opacity with `|ΔL| >= 0.48`, or place metadata inside a stepped ink-safe plate (`|ΔL| >= 0.24`).
4. **Chroma-Vibration Clamp:** If `surface C >= 0.05` inside the Danger Band, clamp text chroma to `C <= 0.025` — never set saturated accent text directly over a saturated mid-tone ground.

---

## 3. Mandatory Diegetic World + Zero-Dep Interactive Proof (`Persuade / Experience`)

Static screenshots and lifeless inline SVGs lose blind comparisons in two seconds. On every **Persuade** or **Experience** page:
1. **Commit to a Diegetic World:** Ground the page's chrome, rules, dividers, and numerals in the subject's physical craft (e.g., 16mm countdown leader + sprocket ticks for cinema, milled decibel scale + VU bar for audio, vernier caliper ticks for industrial hardware, terminal session buffer for devtools, specimen label + archival stamp for publishing).
2. **Ship 1 Genuine Zero-Dependency Interactive Proof Widget (`< 35` lines of JS/CSS):** Prove the product's core claim in the user's hands instead of drawing a static box — e.g., a **draggable gain/clipping comparator**, **live latency/cost scrubber**, **interactive before/after split lens**, **tactile spec/tier switcher**, or **accessible validated preorder/waitlist form** with `aria-live="polite"` feedback.
3. **Auto-Play Once, Hand Off Immediately:** Pair the interactive proof with a single `1.2–2.2s` opening demonstration that cancels on first `pointerdown` / `keydown` / `input` (exact pattern in `references/animations.md`).

### Copy-Ready Interactive Proof Pattern: Draggable Claim Scrubber (`< 30` Lines JS)
```html
<section class="proof-stage" aria-label="Dynamic range recovery proof">
  <div class="proof-readout">
    <label for="gain-scrub">Input Gain: <output id="gain-out">1.0x</output></label>
    <span id="clip-status" class="mono" aria-live="polite">0.0 dBFS — Headroom Intact</span>
  </div>
  <input id="gain-scrub" type="range" min="1" max="8" step="0.1" value="1">
  <canvas id="scope" width="640" height="160" aria-hidden="true"></canvas>
</section>
<script>
(() => {
  const input = document.getElementById("gain-scrub");
  const out = document.getElementById("gain-out");
  const status = document.getElementById("clip-status");
  const ctx = document.getElementById("scope").getContext("2d");
  const render = (g) => {
    out.textContent = `${g.toFixed(1)}x`;
    const db = (20 * Math.log10(g)).toFixed(1);
    status.textContent = g > 3.2
      ? `+${db} dB — 16-bit Clipped / 32-bit Float Recovered`
      : `+${db} dB — Clean Transient Capture`;
    ctx.clearRect(0, 0, 640, 160);
    ctx.beginPath();
    for (let x = 0; x < 640; x++) {
      const raw = Math.sin(x * 0.045) * Math.sin(x * 0.009) * g * 24;
      const y = 80 - Math.max(-68, Math.min(68, raw));
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = g > 3.2 ? "#d9411e" : "#111214";
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  input.addEventListener("input", () => render(parseFloat(input.value)));
  render(1.0);
})();
</script>
```

### Copy-Ready Accessible Validated Commitment Form (`aria-live`)
```html
<form id="preorder-form" novalidate>
  <label for="work-email">Reserve Batch 04 Allocation</label>
  <div class="form-row">
    <input id="work-email" name="email" type="email" required autocomplete="email" placeholder="you@studio.com">
    <button class="tactile-btn" type="submit">Reserve Unit</button>
  </div>
  <p id="form-msg" role="status" aria-live="polite"></p>
</form>
<script>
document.getElementById("preorder-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("work-email");
  const msg = document.getElementById("form-msg");
  if (!email.checkValidity()) {
    email.setAttribute("aria-invalid", "true");
    msg.textContent = "Enter a valid email address to lock your Batch 04 serial.";
    email.focus();
    return;
  }
  email.removeAttribute("aria-invalid");
  msg.textContent = `Batch 04 slot queued for ${email.value.trim()}.`;
});
</script>
```

---

## 4. Hero Composition Archetypes, Eyebrow Ban & Web CSS Floor

Ensure the primary headline, one-sentence deck, focal visual/interactive proof, and primary action sit inside the initial viewport at **`1280 × 800`**, **`1440 × 900`**, and **`390 × 844`** without scrolling.

| Archetype | Spatial Split & Placement | Best Fit | Pitfall to Avoid |
| :--- | :--- | :--- | :--- |
| **1. Asymmetric Editorial Split** | Left `7 cols`: display headline + 1-sentence deck (`<= 48ch`) + CTA anchored to lower baseline. Right `5 cols`: tall `4/5` photo or crisp interactive artifact bleeding to right edge. | Editorial brands, studios, architecture, B2B craft tools | Don't vertically center tiny text beside a giant empty void; align to a deliberate baseline or top rule. |
| **2. Monumental Type Statement** | Full `12 cols` oversized headline (`6–9vw`) across top half; hairline rule below; left `4 cols` sub-deck + CTA, right `8 cols` widescreen media strip peeking above the fold. | Bold launches, conferences, monographs | Don't exceed 6–9 words in a `7vw+` headline; avoid wrapping to 4+ lines. |
| **3. Full-Bleed Cinematic Stage** | `88svh–100svh` edge-to-edge photo/video; directional bottom-left scrim (`0%` → `78%` black/surface); headline + 1 CTA pinned to lower-left `6 cols` safe zone. | Hardware, cinema, hospitality, atmospheric dark products | Never center white text across the brightest center of a photo without a scrim. |
| **4. Utilitarian Product-First** | Compact top band (`22–26%` height): crisp 1-line title + 1-line value prop + primary CTA left-aligned. Bottom `65%+` height: live interactive app/canvas/instrument at real fidelity. | Devtools, SaaS apps, design tools, audio/video utilities | Don't bury the working instrument beneath three paragraphs of marketing copy. |
| **5. Swiss Masthead & Index** | Top publication masthead + date/issue rule; `8-col` lead feature with hero plate + `4-col` hairline-ruled index column of latest entries/chapters. | Magazines, research hubs, documentation portals, journals | Keep the right rail scannable (titles + timestamps only, zero mini-card borders). |

**Hero Restraint & Visual Anchor Law:** Maximum **1 primary CTA + 1 quiet secondary action** (text link or hairline button). Zero trust-logo carousels or 4-stat boxes jammed inside the hero unless explicitly requested. Commit to one unmistakable centerpiece in strict fallback order: **(1)** real media or a live interactive slice of the product/data, **(2)** monumental typographic architecture, a real data visualization, or precision schematic SVG primitives, or **(3)** an explicit art-directed asset slot ready for user media. **Outright banned:** fake lorem-ipsum dashboard mockups, generic CSS gradient blobs, and crooked freehand SVG clip-art.

### Eyebrow-Spam Ban (`no-eyebrow-spam`)
Stamping a tracked uppercase `.eyebrow` / `.meta` label above every `<h2>` is one of the loudest AI-slop tells on the web (`d27-check` `REFLEX` rule `no-eyebrow-spam` flags `>= 4` per page):
- **Hard Cap:** Use **at most `<= 2` tracked-uppercase eyebrow/meta landmarks** on an entire page (typically the masthead/issue line and hero tag).
- **What to use instead on interior sections:** Lead directly with a crisp `<h2>` assertion headline, pair an inline `tabular-nums` index (`01` beside the title, not stacked above in `11px` all-caps), or let a `1px` rule and scale jump establish hierarchy.

### Non-Negotiable Web CSS Floor & Nested Radius Law
- **Safe Horizontal Clipping:** Apply `overflow-x: clip` on `html, body` — **never `overflow-x: hidden`** (silently breaks `position: sticky`) and **never `width: 100vw`** (triggers horizontal scrollbars on Windows).
- **Grid Blowout Guards:** Every image-bearing or code-bearing grid track uses `minmax(0, 1fr)`; display headings carry `min-width: 0; overflow-wrap: break-word;`. At `1920px+`, cap and center the outer container so gutters grow while prose measure stays fixed.
- **Concentric Nested Radii:** Whenever a rounded element sits inside a rounded container, compute **`inner-radius = max(outer-radius - padding, 4px)`** (`calc(max(var(--r-outer) - var(--pad), 4px))`) so corners stay optically concentric instead of pinching.
- **Job-First Page Anatomy:** Structure sections around what the visitor came to *do* (try, inspect, book, buy, subscribe, read docs) rather than 3-icon cards + 4 stats + fake testimonials + email banner.
- **Zero `transition: all`:** Name explicit GPU-friendly properties (`transition: color, background-color, border-color, opacity, transform`) and style `:focus-visible` cleanly on every control.
- **Modern CSS Architecture Floor:** Prefer `@layer reset, tokens, layout, components, utilities;` for cascade hygiene, `@container` for module-level responsive shifts, `color-mix(in oklch, ...)` for derived hover/border states, and native `[popover]` + CSS Anchor Positioning (`position-anchor`) over brittle JS positioning.

---

## 5. Tactile Materiality Recipes (Zero External Assets)

Real physical presence comes from crisp micro-surfaces and mechanical feedback — not 40px blur shadows or external PNG textures.

```css
/* 1. Subtle Inline SVG Noise Grain (<= 0.05 opacity, zero network request) */
.surface-grain { position: relative; isolation: isolate; }
.surface-grain::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* 2. Brushed Anodized / Perforated Frame Strip (Zero external images) */
.film-sprocket-edge {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='18'%3E%3Crect x='6' y='4' width='12' height='10' rx='2' fill='%23111214' fill-opacity='0.22'/%3E%3C/svg%3E");
  background-repeat: repeat-x;
  background-size: 24px 18px;
  padding-top: 22px;
}

/* 3. Concentric Nested Radius Container */
.module-frame {
  --r-outer: 14px;
  --pad: 8px;
  border-radius: var(--r-outer);
  padding: var(--pad);
  border: 1px solid var(--hairline);
}
.module-frame > .module-inner {
  border-radius: max(calc(var(--r-outer) - var(--pad)), 4px);
}

/* 4. Tactile Physical Button (Ledge shadow + physical 2px travel) */
.tactile-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  background: var(--accent-focal);
  color: var(--accent-ink);
  border: 1px solid color-mix(in oklch, var(--ink-primary) 28%, transparent);
  border-radius: 6px;
  box-shadow: 0 3px 0 color-mix(in oklch, var(--ink-primary) 38%, transparent);
  transition: transform 140ms cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 140ms cubic-bezier(0.25, 1, 0.5, 1),
              background-color 140ms cubic-bezier(0.25, 1, 0.5, 1);
}
.tactile-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 0 color-mix(in oklch, var(--ink-primary) 38%, transparent); }
.tactile-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 color-mix(in oklch, var(--ink-primary) 38%, transparent); }
.tactile-btn:focus-visible { outline: 2px solid var(--accent-focal); outline-offset: 3px; }
```

### Open Strips, Editorial Tables & Alternating Rhythm
- **Macro vs. Micro Spacing Ratio:** `--section-gap` (`72px–144px`) >= `3×` internal element gaps (`8px–16px`), with `32px–48px` between section header and content.
- **Open Canvas Over Card Soup:** Default to open-canvas typography, horizontal hairline strips (`tabular-nums` KPIs over crisp `12px` labels), and clean border-bottom editorial tables. Reserve enclosed boxes strictly for heterogeneous, independently interactive modules.
- **Optional `.ruled-row` Index Grammar (Use Deliberately, Not Everywhere):**
  ```css
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
  @media (max-width: 768px) { .ruled-row { grid-template-columns: 1fr; gap: 0.5rem; } }
  ```

---

## 6. Responsive Image Aspect, Navigation & Scroll Pacing

1. **Lock Aspect Ratios Explicitly:** Every media container declares `aspect-ratio` (`16/9`, `3/2`, `4/5`, `1/1`) plus `width: 100%; height: 100%; object-fit: cover;`. Switch container aspect across breakpoints (e.g., `21/9` desktop → `4/3` or `4/5` mobile) and set `object-position` (`50% 22%` for portraits, `left top` for UI).
2. **Scrim Pattern for Text Over Media (Explicit Stacking Context):**
   ```css
   .media-stage { position: relative; overflow: hidden; isolation: isolate; }
   .media-stage > img, .media-stage > video { position: relative; z-index: 0; width: 100%; height: 100%; object-fit: cover; }
   .media-stage::after {
     content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
     background: linear-gradient(to top, rgba(10, 11, 14, 0.82) 0%, rgba(10, 11, 14, 0.34) 45%, rgba(10, 11, 14, 0) 75%);
   }
   .media-stage > .media-content { position: relative; z-index: 2; }
   ```
3. **Top Navigation Bar:** Height `56px–68px`; max **4–5 top-level links** + **1 primary CTA**. Sticky left-column anchors (`position: sticky; top: 5.5rem; align-self: start;`) on `>= 1024px`, releasing cleanly on mobile. Never hijack native scroll velocity, and gate scroll-linked reveals strictly through `references/animations.md` so content never stalls at `opacity: 0`.
4. **Mobile Collapse Discipline:** Reorder split columns intentionally on `< 768px` so the headline and focal visual appear before secondary prose; keep all interactive tap targets `>= 44×44px`.

---

## 7. Web App Shells, Dashboards & Data Visualization

Operational apps and analytics dashboards collapse quickly into bloated bento card soup. Apply the same flat, crisp discipline:
- **Workspace Shell Anatomy:** Fixed `220–248px` left navigation rail (collapsible to `60px` icons on tablet / drawer on mobile) separated by `1px solid var(--hairline)` — never floating rounded sidebar boxes with drop shadows. Top workspace bar (`52–56px`) carries breadcrumb context left and time-range/filter controls + 1 primary action right.
- **Open KPI Strip Over Bento Tiles:** Render top-level metrics as a single horizontal hairline-divided strip (`border-block: 1px solid var(--hairline)`) with `tabular-nums` values (`1.75–2.25rem`), crisp `12px` uppercase labels, and restrained delta cues (`+4.2%`).
- **Primary Chart Dominance (`>= 65%` Width):** Give the primary diagnostic chart generous horizontal span (`8–12 cols` desktop, full width mobile) and `280–380px` height. Use subtle `8–12%` horizontal-only gridlines, direct series labels, `<= 4` distinct non-rainbow semantic hues, and crisp hover crosshairs.
- **Dense Operational Tables:** Sticky headers (`position: sticky; top: 0`), `1px` bottom row hairlines, left-aligned text, right-aligned `tabular-nums` numbers, subtle `3–4%` row hover tint, and `6px` status dots + plain text instead of heavy pill tags on every cell.
- **Complete Interactive States:** Design explicit **empty states** (1-line explanation + 1 clear next action), **loading skeletons** matching exact row geometry, **inline error states**, and unmistakable **`:focus-visible`** rings (`2px solid var(--accent-focal); outline-offset: 2px`).

---

## 8. Dense Reference Sheets & Dual-Safe One-Pagers

When the brief asks for a quick-reference sheet, shortcut map, field card, or printable technical one-pager (distinct from multi-page manuals or books):

1. **Miller's Law Semantic Clustering (`5–9` Clusters):** Partition the entire sheet into **`5–9` distinct functional clusters** (e.g., *Navigation*, *Selection*, *Editing*, *Search*, *Terminal*). Above 9 clusters, merge closely related commands rather than shrinking font size below legible limits.
2. **Masthead Budget (`<= 10%` Height):** Dedicate `<= 10%` of sheet height to the title bar (tool name, version/scope, 1-line legend). Zero hero illustrations or narrative intros.
3. **Dual-Safe Universal Print Bounds (`188 × 257 mm`):** To print cleanly on BOTH **A4 (`210 × 297 mm`)** and **US Letter (`215.9 × 279.4 mm`)** without clipping or scaling surprises, target a **`188 × 257 mm` live safe box** (`11mm` minimum margin on A4 width and US Letter height!).
4. **`@media print` Ink-Safe Polarity Flip:** Even if the screen view defaults to dark mode, `@media print` MUST flip to deep carbon ink (`#111214`) on pure white (`#FFFFFF`), hide screen-only filter/search toolbars (`.no-print`), strip box shadows, and lock clusters against page splits (`break-inside: avoid`).
5. **Scannable `<kbd>` Glyphs & Compact Table Floors:** Style keyboard shortcuts with physical `<kbd>` keycaps (`font-family: var(--font-mono)`, `1px` border, `2px` bottom ledge), keep screen reference tables `>= 12px` (`9.5pt` minimum in `@media print`), and preserve `>= 10px` cluster gaps.

```css
/* Universal A4 + US Letter Dual-Safe Reference Sheet Shell */
@page { size: auto; margin: 11mm; }

.ref-sheet {
  max-width: 1160px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
  gap: 1.25rem;
}
.ref-cluster {
  border-top: 2px solid var(--ink-primary);
  padding-top: 0.65rem;
  break-inside: avoid;
}
kbd {
  display: inline-block;
  padding: 0.1em 0.4em;
  font: 600 0.8em/1.2 var(--font-mono);
  border: 1px solid var(--hairline);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--surface-elevated);
}

@media print {
  :root {
    --surface-canvas: #ffffff;
    --surface-elevated: #f5f6f7;
    --ink-primary: #111214;
    --ink-secondary: #3f434a;
    --hairline: #c8ccd2;
  }
  body { background: #ffffff !important; color: #111214 !important; font-size: 9.5pt; }
  .no-print { display: none !important; }
  .ref-sheet {
    width: 188mm;
    max-width: 188mm;
    max-height: 257mm;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4mm;
  }
}
```

---

## 9. Empirical Research & Perception Grounding

- **Polarity-Aware APCA (`Lc`) Over Legacy WCAG 2.x on Dark/Mid-Tones:** Target `|Lc| >= 90` preferred (`>= 75` min) for body text, `>= 60` for UI copy, and `>= 45` (`<= 90` halation cap) for display headlines; avoid `-webkit-font-smoothing: antialiased` on `<= 18px` body text outside high-DPI queries ([Smashing Magazine / Andrew Somers](https://www.smashingmagazine.com/2022/09/realities-myths-contrast-color/), [APCA in a Nutshell](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html)).
- **Oklab/OKLCH Mixing:** Author palettes in Oklab (`L RMS = 0.20` vs. CIELAB `1.70`) and derive state tints with `color-mix(in oklab, ...)` so mixes stay in-gamut without blue-to-purple shifts ([Björn Ottosson — Oklab](https://bottosson.github.io/posts/oklab/), [Gamut Clipping](https://bottosson.github.io/posts/gamutclipping/)).
- **Fold Attention & Layer-Cake Scanning:** Users spend **57%** of viewing time above the fold and **74%** within the first two screenfuls; front-loaded subheadings induce layer-cake scanning instead of F-pattern skipping ([NN/g Scrolling & Attention](https://www.nngroup.com/articles/scrolling-and-attention/), [NN/g Layer-Cake Pattern](https://www.nngroup.com/articles/layer-cake-pattern-scanning/)).
- **Measure, Forms & Wrapping:** Keep body prose within **50–70 ch** (`64ch` target, `75ch` hard ceiling) with `line-height >= 1.5`, default to single-column forms with inline validation ([Baymard](https://baymard.com/research-articles/line-length-readability)), apply `text-wrap: balance` only on short `<= 4–6` line headings ([Chrome](https://developer.chrome.com/docs/css-ui/css-text-wrap-balance)), and `text-wrap: pretty` on prose ([WebKit](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)).
