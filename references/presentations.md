# Presentations, Pitch Decks & 16:9 Slide Systems

Load this module alongside `SKILL.md` whenever designing keynote presentations, investor pitch decks, executive reviews, product demos, or workshop slide systems (Google Slides, Keynote, PowerPoint/`python-pptx`, Slidev, Marp, Reveal.js, or HTML-to-PDF decks).

---

## 1. The One-Claim-Per-Slide Law & Stage Geometry

A slide is a **visual anchor for an idea**, never a printed document projected onto a wall. If an audience has to choose between reading your slide or listening to you, the slide has failed.

### 16:9 Widescreen Canvas & Safe Grid
| Parameter | Screen / CSS Spec (`16:9`) | Slides / `python-pptx` Spec (`16:9`) | Rule |
| :--- | :--- | :--- | :--- |
| **Canvas Dimensions** | `1920 × 1080 px` | `13.333 × 7.5 in` | Native widescreen everywhere; never design `4:3` unless a venue projector forces it. |
| **Outer Safe Margin** | `80 px` all sides | `0.55 in` all sides | Keeps headlines, charts, and footers safe from projector overscan and Zoom/Meet overlays. |
| **Usable Live Area** | `1760 × 920 px` | `12.233 × 6.4 in` | Anchor all grids, rules, and visuals strictly inside this live frame (except intentional full-bleed plates). |
| **Modular Grid** | `12 columns`, `24 px` gutter | `12 columns`, `0.17 in` gutter | Align every text block, KPI strip, and chart rail to explicit column boundaries. |

### Action Titles & Word Ceilings
1. **Assertion Over Topic Label:** Write slide titles as **crisp, falsifiable takeaways** (*"Enterprise renewals rose 38% after self-serve onboarding"*) rather than empty labels (*"Q3 Retention Overview"*). Reserve short 1–3 word labels strictly for section dividers and cover slides.
2. **Strict Word Budgets:**
   - **Live Keynote / Demo Slides:** `<= 35–45` words per slide; `<= 3` short bullets max (zero multi-sentence paragraphs).
   - **Async / Investor Read-Ahead Decks:** `<= 65` words per slide, structured into crisp scannable chunks with bold lead-ins and generous open canvas (`>= 30–40%` negative space).
3. **Speaker Notes Carry the Script:** Move caveats, extended citations, and verbatim talking points into speaker notes — never cram paragraphs onto the visible slide.

---

## 2. Projection Typography & Scale Floors

Back-of-room and split-screen Zoom legibility is non-negotiable.

| Element | Live Keynote Size | Read-Ahead Deck Size | Styling & Hygiene |
| :--- | :--- | :--- | :--- |
| **Cover / Monumental Stat** | `96–140 px` (`72–105 pt`) | `72–112 px` (`54–84 pt`) | Tight leading `0.94–1.02`, tracking `-0.03em`; `tabular-nums` on figures. |
| **Slide Action Title** | `44–64 px` (`33–48 pt`) | `36–48 px` (`27–36 pt`) | Max 2 balanced lines (`text-wrap: balance`, zero single-word orphans); leading `1.06–1.14`. |
| **Section Eyebrow** | `16–18 px` (`12–13.5 pt`) | `14–16 px` (`10.5–12 pt`) | Plain tracked uppercase (`+0.1em`), `--ink-secondary` (`>= 4.5:1`), zero pill clutter. |
| **Body Copy & Callouts** | **`>= 24 px`** (`18 pt` hard floor) | **`>= 18 px`** (`13.5–14 pt` floor) | Leading `1.38–1.50`; cap line measure at `45–60 ch`. |
| **Table Cells & Chart Labels** | `18–22 px` (`13.5–16.5 pt`) | `15–18 px` (`11.5–13.5 pt`) | Right-align `tabular-nums` values; left-align text. |
| **Footer / Source Line** | `14–15 px` (`10.5–11 pt`) | `13–14 px` (`10–10.5 pt`) | Muted ink still clearing `>= 4.5:1`; single quiet bottom rail. |

**Scale tension check:** Maintain a **`>= 2.2×–3.5×`** headline-to-body scale ratio across every content slide.

---

## 3. 7 Studio Slide Archetypes & Anti-Monotony Deck Rhythm

Never ship a 15-slide deck where every slide is *"Headline top + 3 bullet points left + stock image right."* Alternate layout geometry, density, and surface polarity intentionally.

| Archetype | Spatial Split & Purpose | Best Use |
| :--- | :--- | :--- |
| **1. Cover / Title Plate** | Asymmetric `7/5` split or full-bleed photographic plate with directional scrim; bold title, 1-line subtitle, author/date metadata rail. | Opening slide only; zero logo clutter. |
| **2. Thesis Pause (Inverted Band)** | Full-bleed inverted dark/accent canvas; single monumental 8–14 word statement or section numeral (`02`). | Every 4–6 slides to reset audience attention and mark narrative chapters. |
| **3. Asymmetric Split (`7/5` or `60/40`)** | Left `5 cols`: eyebrow + action title + 2–3 crisp points. Right `7 cols`: full-height product UI, diagram, or cropped photograph. | Product walkthroughs, problem/solution framing, customer stories. |
| **4. Monumental Metric Strip** | Open horizontal 3-column strip separated by `1px` vertical hairlines; oversized `tabular-nums` figures (`88–120px`) over 1-line captions. | Traction, benchmarks, financial highlights (zero boxed KPI tiles). |
| **5. Data / Chart Dominance** | Top action title + **`>= 65%` canvas width** dedicated to ONE chart with direct inline series labels and a single annotated inflection callout. | Revenue trends, cohorts, market sizing, performance benchmarks. |
| **6. Clean Comparison Matrix** | Open editorial table (`<= 5` cols × `<= 6` rows), `1px` horizontal hairlines, subtle `3–4%` highlight on recommended column/row, `● / ◐ / ○` dots over verbose text. | Competitive landscape, architecture trade-offs, pricing tiers. |
| **7. Closing / Decision Slide** | Generous negative space (`45%+`), single clear ask or 3 numbered next steps with owners/dates, contact/link anchored cleanly at bottom left. | Final slide — never end on a generic clipart "Thank You!" slide. |

**Pacing rule:** Never run **3 consecutive slides** with the exact same column split or density.

---

## 4. Data Slides, Charts & Visual Restraint

Slides are where cluttered charts kill credibility fastest:

1. **One Chart, One Thesis:** Never cram 3 tiny charts onto one slide. Give the primary chart `>= 65%` of slide width (`>= 1140 px` on `1920 px` canvas) and crisp height (`520–620 px`).
2. **Spotlight Highlighting (Anti-Rainbow Rule):** Render comparison/baseline series in calm neutral ink (`25–35%` opacity) and reserve **`--accent-focal` exclusively for the series that proves the slide's title**. Hard cap: `<= 4` series per chart.
3. **Direct Labels Over Distant Legends:** Place series names directly at the right end of lines or inside/above bars so the audience never ping-pongs between a color legend and the plot.
4. **Annotated Callout:** Pin ONE crisp `1px` callout line + bold `tabular-nums` figure directly onto the chart's key inflection point.
5. **Kill Chart Junk:** Remove 3D effects, heavy outer borders, vertical gridlines, redundant axis boxes, and 6-decimal-place tick labels. Keep horizontal gridlines subtle (`8–12%` ink).

---

## 5. Running Apparatus, Links & Transitions

- **Quiet Footer Rail:** Anchor inside the `80px` bottom safe zone (`y: 1020–1040 px`): deck/section title flush left, source citation center-left (clickable native hyperlink), `tabular-nums` slide number flush right.
- **Mandatory Suppression:** Suppress the footer rail and slide number on **Cover**, **Thesis Pause / Section Dividers**, and **full-bleed visual plates**.
- **Clickable Citations:** In Google Slides, Keynote, PowerPoint (`python-pptx`), and HTML decks, attach **native clickable hyperlinks** to source labels or entity names rather than dumping raw unclickable `https://...` URL strings across the slide.
- **Transition Discipline:** Use **hard cuts** for 80%+ of slide advances. Where continuity helps (e.g., expanding a chart or shifting a diagram state), use a restrained `240–320 ms` `--ease-out-expo` morph or subtle opacity crossfade. **Banned:** 3D cube spins, blinds, swoosh flying bullets, and click-by-click bullet reveals that drag pacing.

---

## 6. Production Implementation Patterns

### 1. HTML / CSS / Slidev / Marp `1920 × 1080` Slide Master (Print-to-PDF Ready)

```css
@page {
  size: 1920px 1080px;
  margin: 0;
}

.slide {
  position: relative;
  width: 1920px;
  height: 1080px;
  padding: 80px; /* Exact 80px safe margin -> 1760x920 live area */
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 40px;
  background: var(--surface-canvas);
  color: var(--ink-primary);
  font-family: var(--font-body);
  overflow: hidden;
  break-after: page;
}

.slide-header { max-width: 1320px; }
.slide-eyebrow {
  font-family: var(--font-mono);
  font-size: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-secondary);
  margin: 0 0 12px;
}
.slide-title {
  font-family: var(--font-display);
  font-size: 54px; /* >= 2.25x 24px body floor */
  line-height: 1.08;
  letter-spacing: -0.025em;
  text-wrap: balance;
  margin: 0;
}

.slide-body {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
  align-items: center;
  font-size: 24px; /* Hard keynote body floor */
  line-height: 1.42;
}
.slide-body .col-copy  { grid-column: span 5; max-width: 48ch; }
.slide-body .col-stage { grid-column: span 7; height: 100%; }

.slide-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 16px;
  border-top: 1px solid var(--hairline);
  font-size: 14px;
  color: var(--ink-secondary);
  font-variant-numeric: tabular-nums;
}
.slide--divider {
  background: var(--ink-primary);
  color: var(--surface-canvas);
}
.slide--divider .slide-footer { display: none; }
```

### 2. Programmatic Deck Constants (`python-pptx` / Google Slides Geometry)

```python
from pptx import Presentation
from pptx.util import Inches, Pt

# 16:9 Widescreen Stage + Safe Margins (matches 1920x1080 @ 144px/in scale)
SLIDE_W, SLIDE_H = Inches(13.333), Inches(7.5)
MARGIN_X, MARGIN_Y = Inches(0.55), Inches(0.55)
LIVE_W = SLIDE_W - 2 * MARGIN_X   # 12.233 in
LIVE_H = SLIDE_H - 2 * MARGIN_Y   # 6.400 in

# Typography Floors (Live Keynote)
PT_HERO, PT_TITLE, PT_BODY, PT_META = Pt(72), Pt(36), Pt(18), Pt(11)

prs = Presentation()
prs.slide_width, prs.slide_height = SLIDE_W, SLIDE_H
```
