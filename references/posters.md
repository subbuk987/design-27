# Posters, Event Key Art, Print & Display Compositions

Load this module alongside `SKILL.md` whenever creating exhibition posters, conference key art, concert/event flyers, print announcements, vertical signage, or social display posters.

---

## 1. The 3-Distance Readability Hierarchy

A poster is NOT read from top to bottom like a document — it is **decoded across three physical distances**. If all text sits at middling sizes, the poster disappears into wall noise.

| Distance Tier | Viewing Time | Content Owned | Size & Area Rule |
| :--- | :--- | :--- | :--- |
| **10 ft / 3 m — The Hook** | `0.5 sec` | ONE monumental gesture: oversized headline, giant numeral, stark silhouette, or electric color field | Occupies **`40–65%` of visual energy**. Primary display type `>= 10–16%` of poster height (e.g., `180–320pt` on A2/18×24"). |
| **3 ft / 1 m — The Context** | `2 sec` | Subheadline, event/exhibition title, date, city, headliner/speaker | **`25–35%`** of Hook type size (`45–112pt` on A2). Anchored cleanly to a primary grid rail. |
| **1 ft / 30 cm — The Details** | `5+ sec` | Schedule, street address, ticketing URL, QR code, credits, partner marks | **`10–18pt`** in print (`>= 10pt` hard legibility floor). Locked cleanly into a single disciplined metadata strip/corner — never scattered across the poster. |

---

## 2. Extreme Typographic Scale Contrast

Posters thrive on **dramatic scale tension** that would feel reckless on a website:
- **Minimum Scale Ratio:** Push Hook-to-Detail size ratio to **`5:1`–`12:1`** (e.g., `240pt` monumental title paired with `18pt` event metadata).
- **Compressed Display Leading & Tracking:** Stack all-caps display headlines tightly at **`line-height: 0.82–0.94`** with slight negative tracking (`-0.02em` to `-0.05em`). Loose `1.3` leading makes giant display headlines fall apart into disconnected stripes.
- **Typeface Cap:** Max **2 font families** (often **1 single workhorse neo-grotesk or serif** across extreme weight/scale jumps looks strongest, à la Müller-Brockmann and Vignelli).
- **Edge-to-Edge Monumentality:** Let display headlines either lock cleanly to exact grid margins OR deliberately bleed off one or two edges — never leave awkward half-hearted `12mm` near-misses.

---

## 3. Intentional Grid-Breaking & Composition Archetypes

Chaos is breaking every rule. **Visual electricity is building a visible Swiss grid and breaking it in exactly ONE deliberate place.**

### Build the Grid, Then Break One Element
1. Lay out a visible underlying modular grid (e.g., `5 × 7` or `6 × 8` modules with uniform gutters).
2. Lock all metadata, rules, and secondary copy rigidly to grid intersections.
3. Introduce **ONE intentional disruption**:
   - A giant date numeral bleeding past the right and bottom trim edges.
   - A single `30°` or `45°` diagonal typographic axis slicing across orthogonal metadata.
   - A foreground photographic cutout overlapping ONE letter of the headline (depth sandwich: Background → Type → Subject edge).

### 5 Proven Poster Archetypes
| Archetype | Structure | Best Fit |
| :--- | :--- | :--- |
| **1. Swiss Asymmetric Grid** | Strict hairline-divided cells; massive bold title anchored top-left or middle band; dense tabular schedule cleanly slotted in bottom right. | Architecture talks, design symposia, tech conferences, museums |
| **2. Monumental Type-Only** | Zero imagery; typography *is* the illustration — stacked massive letterforms, negative-space counters, stark 2-ink palette. | Manifesto prints, lectures, typography exhibitions, cultural openings |
| **3. Subject Cutout + Graphic Field** | Single dramatic object/portrait silhouetted against a flat solid color block; headline layered partially behind the subject's upper edge. | Product launches, film key art, speaker spotlights, music releases |
| **4. Diagonal Tension** | Entire headline + geometric bars rotated `30°–45°` across canvas; horizontal metadata locked dead-level in corners to create dynamic friction. | Concerts, festivals, athletic events, avant-garde launches |
| **5. Risograph / Zine Overprint** | 2–3 vibrant spot inks overlapping with `multiply` blend mode, halftone photography, tactile grain, raw border stamps. | Indie gigs, community meetups, art book fairs, workshops |

---

## 4. Color Blocking, Focal Framing & QR Hygiene

- **2–3 Ink Rule:** Limit poster palettes to **paper ground + 1 primary ink + 1 electric accent ink** (e.g., uncoated bone `#F2EFE9` + carbon `#101012` + vermilion `#E53917`; or cobalt `#0D3B8E` + acid chartreuse `#D8F238` + paper white). Every extra color weakens 10-foot recognition.
- **Uninterrupted Color Fields:** Reserve at least `25–35%` of poster area as calm solid ground or clean graphic field so the focal subject hits hard across a cluttered bulletin board or social feed.
- **QR Code Discipline:** Place QR codes inside the **1-ft metadata grid** (bottom-right or bottom-left corner), minimum **`22×22mm`** in print (`>= 120×120px` digital), solid primary ink on high-contrast light ground with a `>= 4-module` quiet zone. Never drop a QR code over noisy photography.

---

## 5. Print Bleed, Safe Zones & Standard Poster Formats

Never ship print art without bleed and safe-zone math.

| Format | Trim Dimensions | Bleed (All 4 Sides) | Safe Zone Inset | Target Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **A3** | `297 × 420 mm` | `+3 mm` (`303 × 426 mm` doc) | `12 mm` inset | `300 DPI` |
| **A2** | `420 × 594 mm` | `+3 mm` (`426 × 600 mm` doc) | `15 mm` inset | `300 DPI` |
| **A1** | `594 × 841 mm` | `+5 mm` (`604 × 851 mm` doc) | `20 mm` inset | `150–200 DPI` (distance-viewed) |
| **US Tabloid** | `11 × 17 in` | `+0.125 in` (`11.25 × 17.25 in`) | `0.5 in` inset | `300 DPI` |
| **US Standard Poster** | `18 × 24 in` | `+0.125 in` (`18.25 × 24.25 in`) | `0.625 in` inset | `300 DPI` |
| **US Large Poster** | `24 × 36 in` *(US Movie One-Sheet: `27 × 40 in`)* | `+0.25 in` (`24.5 × 36.5 in`) | `0.75 in` inset | `150–200 DPI` |
| **Social Event Portrait** | `1080 × 1350 px` (`4:5`) / `1080 × 1920 px` (`9:16`) | `0 px` | `64 px` side inset (`260 px` top / `360 px` bottom on `9:16` Stories/Reels UI) | `72–144 DPI` sRGB |

### Print Pre-Flight Checklist
- Extend every background color fill, edge rule, or full-bleed photo all the way to the **outer bleed edge** (`+3mm` or `+5mm`), NEVER stopping at the trim line (guillotine cutters shift `±1mm` and leave ugly white slivers).
- Keep all non-bleeding text, dates, URLs, logos, and QR codes strictly inside the **Safe Zone**.
- Export print PDFs in CMYK (`FOGRA39` / `GRACoL`) with fonts embedded or converted to vector outlines.

### Production Pattern — SVG Swiss Poster Scaffold (A3 with 3mm Bleed)

```xml
<!-- A3 Trim: 297x420mm | Full Document with 3mm Bleed: 303x426mm | Safe Live Area: x 15..288mm (273mm), y 15..411mm -->
<svg xmlns="http://www.w3.org/2000/svg" width="303mm" height="426mm" viewBox="0 0 303 426">
  <!-- Full-bleed paper ground extending across bleed zone -->
  <rect x="0" y="0" width="303" height="426" fill="#F3EFE6" />

  <!-- Intentional single full-bleed color field at top half (carbon ink + vermilion accent edge) -->
  <rect x="0" y="0" width="303" height="224" fill="#111214" />
  <rect x="268" y="0" width="35" height="224" fill="#C9350D" />

  <!-- 10ft HOOK: 60mm tall (14.3% of trim height), tight leading, locked cleanly inside x: 15..256mm -->
  <g font-family="Inter Tight, Helvetica Neue, sans-serif" font-weight="800">
    <text x="15" y="114" font-size="60" letter-spacing="-2.2" fill="#F3EFE6">FORM</text>
    <text x="15" y="176" font-size="60" letter-spacing="-2.2" fill="#FF7A45">&amp; PULSE</text>
  </g>

  <!-- 3ft CONTEXT: 16mm (26.7% of 60mm Hook), wrapped cleanly inside 273mm safe live width -->
  <g font-family="Inter Tight, Helvetica Neue, sans-serif" font-weight="700" fill="#111214">
    <text x="15" y="264" font-size="16">ANNUAL SYMPOSIUM ON</text>
    <text x="15" y="284" font-size="16">KINETIC TYPOGRAPHY</text>
    <text x="15" y="310" font-size="11" font-weight="600" fill="#3B3D42">14–16 OCTOBER · KUNSTHALLE ZÜRICH</text>
  </g>

  <!-- Structural hairline anchoring 1ft metadata rail -->
  <line x1="15" y1="368" x2="288" y2="368" stroke="#111214" stroke-width="0.8" />

  <!-- 1ft DETAILS: 4.2mm (~12pt, > 10pt floor), locked cleanly inside bottom safe zone (y <= 411mm) -->
  <g font-family="IBM Plex Mono, monospace" font-size="4.2" fill="#3B3D42">
    <text x="15" y="388">DOORS 18:00 · KEYNOTE 19:00</text>
    <text x="15" y="396">LIMMATSTRASSE 270 · FORMANDPULSE.CH</text>
    <text x="288" y="396" text-anchor="end">EDITION 09 / 2026</text>
  </g>
</svg>
```
