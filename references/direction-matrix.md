# Design 27 — Adaptive Direction Matrix & Spatial Placement Laws

Load this module during **Stage 1–2** for greenfield designs or full redesigns. Skip it for narrow refinements (`polish`, `clarify`, `harden`) where the existing brand system stays intact.

---

## 1. Anti-Convergence & The Diegetic Physical Artifact Law

Do not pick a direction by habit, and never converge on dark `#090B10` charcoal + `Geist` + `#FF5B1F` safety orange (or warm beige `#F7F6F2` + vermilion boilerplate) across unrelated briefs. Before choosing a Material World below, lock **4 axes + 1 explicit ban**:

1. **Diegetic Physical Artifact (Mandatory on Persuade & Experience):** Anchor the palette, framing, and Viewport-1 Signature in a **real physical artifact from the subject's craft** — e.g., *16mm Academy film leader + sprocket holes* for cinema, *milled anodized aluminum + decibel scope* for field audio, *phosphor CRT trace + BNC bezel* for telemetry, *archival vellum + iron-gall marginalia* for monographs, or *halftone newsprint + registration marks* for independent publishing.
2. **Typographic Voice:** Structural contrast between display authority and reading utility (e.g., *tight condensed grotesk + raw mono*, *high-contrast editorial serif + tracked sans*, *humanist grotesque + tabular mono*).
3. **Macrostructure & Structural Tension:** Choose a whole-page skeleton — **Interactive Instrument**, **Diegetic Artifact Frame**, **Editorial Broadsheet**, **Split Monograph**, **Technical Spec Sheet**, **Manifesto Ledger**, or **Product Workbench** — instead of repeating `.ruled-row` `01/02/03` stacks.
4. **Banned Category Cliché:** Explicitly name **one overused trope** in the subject's industry forbidden in this build (e.g., *"No 3-column bento cards"*, *"No charcoal + safety-orange SaaS hero"*, *"No tracked eyebrow above every heading"*).

*Deterministic dealing:* Run `node scripts/d27-deal.mjs --prompt "<brief>" --medium <medium> --surface <mode> --out .design27/brief.json` to deal two contrast-verified Material Worlds and a Macrostructure clear of recent history, then pass `--brief .design27/brief.json` into `scripts/d27-check.mjs` at Stage 4.

---

## 2. Universal Craft Laws (Loud Craft, Scale, Headlines & Tension)

- **Assertion Headline Law:** Write primary headlines as **concrete, falsifiable claims or tension-bearing propositions**, never vague topic labels. *(Example: `"32-bit float never clips a whisper or a jet engine"` instead of `"Next-Generation Field Audio"`; `"The 14ms tax hiding inside your state store"` instead of `"Understanding State Management"`.)*
- **Extreme Display Scale Contrast:** Enforce **`4:1–10:1`** display-to-body ratio with tight display leading (**`0.86–0.96`**) on *Experience*, *Thumbnails*, and *Motion* builds (`2.5:1–4:1` on *Persuade* websites; `1.8:1–2.5:1` on *Operate/Read* surfaces).
- **Typeface-Class Conditional Display Tracking:**
  - *Neo-grotesk / geometric lowercase:* `-0.025em` to `-0.045em`
  - *High-contrast display serifs:* `-0.01em` to `0em`
  - *Condensed display & ALL-CAPS:* `0em` to `+0.04em`
- **Loud Craft Discipline:** Pair **ONE dominant focal screamer** per viewport with **`>= 30%` calm negative-space counterweight**. Cap tracked-uppercase section eyebrows to **`<= 2` structural landmarks** per page (`no-eyebrow-spam`).
- **1 Intentional Tension Contract (Single-Axis Lock):** Declare **exactly ONE** Tension Axis (`Type` | `Scale` | `Color` | `Material`) and lock the other three to World-Sync Coherence:
  1. **Type Voice Collision:** High-contrast editorial serif or condensed grotesk paired with clinical mono metadata (`<= 2` primary fonts + `1` optional mono).
  2. **Scale Rupture:** One focal element at `>= 4×` body size breaking the primary gutter or frame edge while secondary modules obey strict rhythm *(BANNED on `Operate` and `Read` surfaces)*.
  3. **Chromatic Signal Shock:** `>= 85%` disciplined neutral/mid-tone world interrupted by ONE unblended high-chroma signal (`OKLCH C >= 0.16`) reserved strictly for primary action/state.
  4. **Tactile-Digital Friction:** Precision geometric grid interrupted by ONE authentic physical-material layer (subtle `<= 0.05` opacity `feTurbulence` grain, sprocket/registration frame, or full-bleed plate) — never repeated across every card.
- **Banned Fake Tensions (Hard Floor):** Single italic word inside a roman display heading (`<h1>Build <em>faster</em></h1>`), rotated pill badges (`rotate(±1–5deg)`), decorative pulsing status dots, gratuitous gradient-filled headings, or mixed border-radius families.

---

## 3. Pre-Emit `M·I·H·C·R` Gate, Mirror Test & Interactive Proof

Before writing HTML/CSS/SVG/typographic code, run two sanity checks and record the outcome in a top comment lock (`/* D27-Lock: ... */`):

1. **Mirror Test:** *"If I swapped the brand name to a direct competitor, would this exact layout, Material World, and Signature still fit?"* If **YES**, mutate the macrostructure or Diegetic Artifact before emitting code.
2. **Interactive Proof Requirement (*Persuade & Experience*):** Static pages lose in the first 2 seconds. Include **1 genuine zero-dependency interactive proof widget** proving the brief's central claim (draggable gain/comparison scrubber, live parameter dial, unit/cost calculator, `#group` anatomy isolator, or scrubbable timeline), seeded with a **`1.2s–2.4s` auto-play-once load demonstration** that yields immediately on pointer/keyboard input.
3. **Pre-Emit `M·I·H·C·R` Score (`1–5` per axis):**
   - **`M` (Metaphor Specificity):** Is the aesthetic rooted in a concrete physical artifact from the subject's domain?
   - **`I` (Interactive Proof):** Does the user *feel or test* the claim on-page without external dependencies? *(Score `>= 4` mandatory on Persuade/Experience; N/A only on static print/thumbnail exports.)*
   - **`H` (Hierarchy):** Is there one unmistakable `#1` Focal Anchor and an Assertion Headline?
   - **`C` (Contrast & Material Math):** Do all ink/surface pairs clear `>= 4.5:1` (`>= 7:1` reading) without dark-mode halation or Convergence defaults?
   - **`R` (Rhythm & Macrostructure):** Do sections alternate structural grammar without `.ruled-row` or 3-card repetition?
   - **Gate Rule:** If `M < 4` or `I < 4` on a *Persuade* or *Experience* build, **STOP and mutate the concept** before emitting code.

```css
/* D27-Lock: Persuade | 35mm Film Leader | Interactive Instrument | 16mm cue-countdown + sprocket plate | Live 1.0x-8.0x gain oscilloscope | Color | M:5 I:5 H:5 C:5 R:4 */
```

---

## 4. Adaptive Material Worlds Matrix (16 OKLCH + Hex Worlds)

*Every Material World below maintains `>= 4.5:1` WCAG AA contrast for both primary and secondary ink against its canvas. Always load open web fonts (or explicit `@font-face`) so builds never fall back to Arial or Times.*

| Material World | Canvas & Elevated (`OKLCH` / `Hex`) | Primary / Secondary Ink & Focal Accent | Typography Pairing | Grid, Radius & Surface Craft | Imagery, Mascot & Motion Tempo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. 35mm Film Leader** | Mid-olive grey `oklch(81% 0.015 110)` `#C9CBC0` · `#D6D8CE` | `#161714` / `#3E4039` · Cue vermilion `#B82818` (`accentInk: #FFFFFF`) | `Oswald` or `Syne` + `IBM Plex Mono` | Perforated sprocket frame, `0px` corners, `1.5px` emulsion rules | Countdown targets, high-contrast film stills; crisp `180ms` gate snaps |
| **2. Anodized Instrument** | Milled aluminum `oklch(86% 0.01 240)` `#CFD4D9` · `#E2E6EA` | `#11161D` / `#3B4452` · Calibrated cobalt `#0B56B8` (`#FFFFFF`) | `Space Grotesk` + `JetBrains Mono` | Precision dial/matrix layout, `2–4px` chamfered radii, brushed hairlines | Knurled hardware crops, SVG scopes; quart-out `140–220ms` detents |
| **3. Cast Formwork** | Raw concrete `oklch(74% 0.008 80)` `#B9B8B2` · `#C8C7C0` | `#141412` / `#353530` · Signal blue `#0E3FD1` (`#FFFFFF`) | `Oswald` + `IBM Plex Sans` + `Space Mono` | Brutalist structural bands, `0px` corners, `2–3px` solid tie-rod rules | Monolithic geometry, `<= 0.04` grain; snappy `160–240ms` architectural cuts |
| **4. Vellum Monograph** | Archival vellum `oklch(95% 0.016 85)` `#F4F0E6` · `#EBE5D8` | `#191714` / `#4A433B` · Oxblood rubric `#8C241E` (`#FFFBF5`) | `Newsreader` or `Cormorant Garamond` + `IBM Plex Mono` | Wide measure + Tufte sidenote rail, `0px` corners, `0.5–1px` rules | Ink etchings, botanical/diagram plates; poised `320–480ms` quintic settle |
| **5. Phosphor Oscilloscope** | Deep CRT glass `oklch(16% 0.018 155)` `#0B110E` · `#121C17` | `#DCEEE4` / `#97B8A6` · Phosphor green `#38E57A` (`#071A0E`) | `JetBrains Mono` + `Space Grotesk` | Graticule grid (`6%` reticle), `4px` bezel radii, recessed trace frames | Vector waveforms, `>_` rigs; instant `100–180ms` beam sweeps |
| **6. Swiss Editorial** | Chalk `oklch(100% 0 0)` `#FFFFFF` · `#F2F3F5` | `#111214` / `#4B4E57` · International cobalt `#1746D1` (`#FFFFFF`) | `Inter Tight` + `Newsreader` italic + `IBM Plex Mono` | Strict 12-col modular grid, `0–2px` corners, `1px` structural rules | Uncropped architectural plates, diagrams; expo-out `220–320ms` |
| **7. Industrial Monolith** | Stark bone `oklch(96% 0.012 85)` `#F4F2EA` · `#E8E4D8` | `#111110` / `#3F3E39` · Vermilion signal `#C83214` (`#FFFFFF`) | `Anton` or `Archivo Black` + `Space Mono` | Asymmetric scale-rupture grid, `0px` razor edges, `2–4px` ink bars | Duotone/halftone crops, bold SVG silhouettes; hard `150–220ms` snaps |
| **8. Tactile Workshop** | Warm oat `oklch(96.5% 0.015 78)` `#FAF5EC` · `#F1E9DA` | `#1E1726` / `#4E4359` · Kiln terracotta `#B83B0A` (`#FFFFFF`) | `Bricolage Grotesque` + `Plus Jakarta Sans` | Open asymmetric blocks, `12–20px` concentric radii, `2px` offset ink shadow | Tactile cutout mascots, clay/vinyl stills; damped spring `240–340ms` |
| **9. Risograph Zine** | Uncoated newsprint `oklch(93% 0.024 85)` `#F1EAD8` · `#E6DEC8` | `#1E1B18` / `#4C453D` · Riso teal `#0F6B73` (`#FFFFFF`) | `Fraunces` + `DM Sans` + `IBM Plex Mono` | Collage-informed grid, `0–2px` die-cut stamps, crop/registration marks | 2-tone spot illustrations, woodcut grain; stepped `12–15fps` or `200ms` cuts |
| **10. Railway Enamel** | Enamel ivory `oklch(92% 0.015 88)` `#EAE6DA` · `#DFD9C9` | `#111824` / `#3B4454` · Racing green `#14532D` (`#FFFFFF`) | `Archivo` + `IBM Plex Mono` | Timetables & route ledgers, `2px` enamel borders, `tabular-nums` | Wayfinding arrows, isometric plaques; clean mechanical `160–240ms` |
| **11. Darkroom Silver** | Bath slate `oklch(16% 0.005 260)` `#0E0F11` · `#17191D` | `#ECEEF0` / `#A3AAB2` · Safelight amber `#E88B28` (`#120B02`) | `Instrument Serif` + `Plus Jakarta Sans` + `IBM Plex Mono` | Contact-sheet plates & wide margins, `0–2px` film rebates | Silver-gelatin monochrome plates, quiet pools; expo-out `280–420ms` |
| **12. Botanical Herbarium** | Sage rag `oklch(93% 0.016 135)` `#E7ECE4` · `#DAE2D6` | `#11241B` / `#354F42` · Ochre ink `#8F510D` (`#FFFFFF`) | `Lora` or `Fraunces` + `IBM Plex Mono` | Specimen-label layout, `0–2px` corners, fine double borders | Botanical/anatomical plates, fine linework; organic `260–380ms` |
| **13. Blueprint Cyanotype** | Prussian cyan `oklch(28% 0.06 245)` `#102A43` · `#163859` | `#F0F6FC` / `#B4CBE0` · Drafting gold `#F4C430` (`#102030`) | `IBM Plex Sans` + `IBM Plex Mono` | Orthographic CAD grid (`5%` white rules), `0–2px` corners, title block | Schematic exploded views, crisp `1.5px` strokes; `160–220ms` |
| **14. Editorial Broadsheet** | Cool newsprint `oklch(93% 0.006 105)` `#E9EAE6` · `#DFE1DC` | `#141513` / `#444741` · Press burgundy `#7F1D1D` (`#FFFFFF`) | `Playfair Display` or `Instrument Serif` + `IBM Plex Sans` | Multi-column broadsheet + drop caps, `0px` corners, column hairlines | Documentary photography, ruled tables; brisk `200–280ms` |
| **15. Ceramic Studio** | Stoneware clay `oklch(90% 0.02 72)` `#E8DFD1` · `#DDD2C1` | `#1C1917` / `#4D4742` · Cobalt glaze `#1D4ED8` (`#FFFFFF`) | `Cormorant Garamond` + `Plus Jakarta Sans` | Asymmetric gallery plates (`45–60%` air), `0–4px` soft corners | Studio object lighting, matte surfaces; unhurried `300–450ms` |
| **16. Midnight Telemetry** | Calibrated obsidian `oklch(15% 0.015 260)` `#0B0E14` · `#141A24` | `#ECEEF2` / `#9BA5B8` · Ice cyan `#38BDF8` (`#071824`) | `Plus Jakarta Sans` + `JetBrains Mono` | Hairline shell rail + open KPI strip, `4–8px` crisp radii, `1px` rules | Rim-lit dark hardware/UI crops, SVG telemetry; quart-out `140–220ms` |

---

## 5. Image, Heading & Copy Placement Laws

1. **Monumental Stack vs. Asymmetric Split:** Place full-bleed or full-width imagery above/below headlines when the visual carries atmospheric weight or detailed UI. Use asymmetric splits (`60/40`, `65/35`, or `7/5`) when pairing concise copy with a vertical/square subject — avoid timid `50/50` splits.
2. **Never Suffocate Visuals or Diagrams:** Charts, product interfaces, maps, and illustrations demand `>= 65%` desktop container width (full width on mobile). Never cram data visuals into narrow sidebars or nested cards.
3. **Open-Canvas Composition Over Card Soup:** Group related items via alignment, whitespace proximity (inter-group gap `>= 2×` intra-group gap), typographic hierarchy, and `1px` hairlines before reaching for bordered boxes. Reserve enclosed cards strictly for heterogeneous, independently clickable objects.
4. **Measure & Optical Line Hygiene:** Cap continuous body prose at `45–70ch` (sweet spot `58–65ch`). Balance display headlines (`text-wrap: balance` in CSS; manual breaks in video/print) for zero single-word orphans.
5. **Uncompromising Figure–Ground Separation:** Whenever type sits over photography, illustration, or video, guarantee `>= 4.5:1` contrast at the *noisiest* pixel via a directional gradient scrim (`rgba(0,0,0,0)` → `rgba(0,0,0,0.72–0.85)`), a solid editorial panel, or a quiet negative-space crop.

---

## 6. Rationalization Red Flags — Stop and Re-Direct

| Rationalization | Reality |
| :--- | :--- |
| *"It's just a quick draft — skip Stage 1 and `d27-deal.mjs`."* | Skipping calibration produces dark charcoal + orange boilerplate and misses hard math (contrast, safe zones, CSS floor). |
| *"A clean dark hero with `#FF5B1F` accents works for any tech product."* | Uncalibrated `#090B10 + Geist + #FF5B1F` is a convergence failure. Derive a Diegetic Physical Artifact and deal a Material World. |
| *"The landing page already looks crisp — no need for JS interactivity."* | Static Persuade pages lose on first contact. Add 1 honest Interactive Proof widget + an auto-play-once signature load demo. |
| *"I checked my code mentally — no need to run `d27-check.mjs --render`."* | Mental checks hallucinate passes on contrast traps, `scale(0)` entrances, and clipped edges. Run the checker and inspect snapshots every time. |
