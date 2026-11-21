# Design 27 — Adaptive Direction Matrix & Spatial Placement Laws

Load this module during **Stage 1–2** for greenfield designs or full redesigns. Skip it for narrow refinements (`polish`, `clarify`, `harden`) where the existing brand system stays intact.

---

## 1. 3-Axis Calibration + Banned-Cliché Gate (Anti-Convergence)

Never pick a direction by habit or default to warm-paper Swiss minimalism on neutral prompts. Before choosing a row below, lock three axes + one explicit ban:

1. **Surface World:** Physical material the subject belongs to (e.g., *anodized aluminum & telemetry glass*, *uncoated newsprint & riso ink*, *darkroom silver gelatin*, *matte ceramic & linen*, *architectural concrete*).
2. **Typographic Voice:** Structural contrast between display authority and reading utility (e.g., *tight condensed grotesk + raw mono*, *high-contrast editorial serif + tracked sans*, *humanist grotesque + tabular mono*).
3. **Structural Tension:** Where the eye feels energy (e.g., *asymmetric 7/5 split*, *monumental type-as-image*, *single 45° diagonal break*, *wide full-bleed plate over tight ruled index*).
4. **Banned Category Cliché:** Explicitly name **one overused trope** in the subject's industry that you forbid in this build (e.g., *"No 3-column bento cards"*, *"No warm-beige + vermilion editorial cosplay"*, *"No dark-slate neon SaaS hero"*).

*Optional deterministic anti-convergence:* When Node is available, run `node scripts/d27-deal.mjs --prompt "<brief>" --surface <mode> --out .design27/brief.json` to deal two World-Synced directions clear of recent history, then pass `--brief .design27/brief.json` into `scripts/d27-check.mjs` at Stage 4.

### Loud Craft Mechanics & World-Sync Coherence
- **How to Execute Loud Design Well (*Persuade / Experience / Posters / Thumbnails / Motion*):** Permission to use `700–900` display weights, saturated color blocking, and grid-breaking is NOT license for Canva soup. Enforce: **(a)** aggressive display-to-body scale contrast (`>= 4:1`), **(b)** **typeface-class conditional display tracking** (*neo-grotesk/geometric lowercase:* `-0.025em` to `-0.045em`; *high-contrast display serifs:* `-0.01em` to `0em`; *condensed display & ALL-CAPS:* `0em` to `+0.04em` — never crush serifs or all-caps), **(c)** tight display leading (`0.88–1.02`), **(d)** exactly ONE dominant focal screamer per viewport, and **(e)** `>= 30%` calm negative-space counterweight.
- **World-Sync Binding (With 1 Intentional Tension Rule):** Default UI chrome, illustration finish, and motion physics to one coherent physical world (*Risograph / Woodcut* → paper grain + ink rules + snappy cuts; *Tactile 3D Clay* → soft elevation + springs; *Technical Axonometric* → `1px` hairlines + quart-out). You may introduce **at most ONE deliberate, named creative friction** (e.g., woodcut spot art on a stark brutalist grid) when the Stage 1 brief calls for authored tension — never accidental style soup.

---

## 2. Adaptive Style Matrix (Mood → System)

*Every color hex and font below is an illustrative **non-default starting point**, never a mandatory house palette. Always load open web fonts (or explicit `@font-face`) so commercial references never fall back to Arial/Times.*

| Aesthetic Direction | Surface & Palette Logic *(Examples — Rotate Freely)* | Typography Pairing (Open Default / Studio Ref) | Grid & Density | Radius & Hairlines | Imagery & Mascot Treatment | Motion Tempo (UI / Hero) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Swiss Editorial** | Chalk white `#FFFFFF` or cool archival grey `#F2F3F5`, ink `#111214`, 1 cobalt `#1746D1` or forest `#14532D` accent | `Inter Tight` (Neue Haas) + `Newsreader` italic + `IBM Plex Mono` | Strict 12-col modular grid, generous margins | `0–2px` razor corners; `1px` structural rules | Uncropped architectural photography, sharp plates, geometric diagrams | Expo out `(0.16, 1, 0.3, 1)`; UI `240–360ms`, Hero `500–700ms`; zero bounce |
| **Brutalist / Poster** | Stark bone `#F4F2EA` or jet `#0A0A0A` + 1–2 electric inks (acid chartreuse `#D8F238`, cobalt `#0E3FD1`, signal orange `#F04E23`) | `Anton` or `Syne` + `Space Mono` raw body | Bold asymmetric grid with 1 intentional grid-break | `0px` razor edges; heavy `2–4px` solid ink rules | High-contrast duotone/halftone crops, stark silhouettes, angular mascots | Hard cuts & snappy `150–240ms` snaps; Hero `400–600ms` minimal tail |
| **Tactile Playful** | Warm oat `#FAF5EC`, sage/terracotta tinted surfaces, deep plum-ink `#1E1726`, saturated coral or marigold focal | `Bricolage Grotesque` or `Fraunces` + `Plus Jakarta Sans` | Open asymmetric blocks, playful breathing room | `16–24px` tactile radii; `1.5–2px` borders or offset ink shadows | Circle-led mascots, matte 3D clay/vinyl or riso spot art | Playful spring (`stiffness: 320, damping: 18, mass: 0.9`); UI `250–380ms` |
| **Atmospheric Dark** | Deep obsidian `#090B10` + elevated `#131722`, bone text `#ECEEF2`, calibrated luminous accent (ice cyan `#38BDF8`, emerald `#34D399`, amber `#F59E0B`) | `Geist` or `Space Grotesk` (Satoshi) + `JetBrains Mono` | Wide cinematic stages alternating with precision bands | `6–10px` crisp corners; `1px` hairlines at `8–14%` white | Rim-lit studio hardware/UI crops, restrained radial light pools | Expo out `(0.16, 1, 0.3, 1)`; UI `280–400ms`, Hero `550–750ms` |
| **Utilitarian Technical** | Neutral alabaster `#F8F9FA` or carbon slate `#101214`, high-contrast ink, semantic status inks only | `IBM Plex Sans` + `IBM Plex Mono` (Berkeley Mono) | Tight 3–4 col data grids, aligned baselines, `tabular-nums` | `2–4px` functional radii; `1px` dividers, `3%` table striping | Crisp vector schematics, annotated code/diagrams, axonometric icons | Fast quart out `(0.25, 1, 0.5, 1)`; UI `120–200ms`; zero decorative hero fluff |
| **Retro / Zine** | Uncoated newsprint `#F1EAD8`, soy ink `#1E1B18`, 2-color risograph spot palette (teal + vermilion, plum + ochre) | `Instrument Serif` or `Fraunces` + `IBM Plex Mono` + `DM Sans` | Collage-informed modular grid, overlapping stamps/labels | `0–4px` or die-cut stickers; textured ink borders | Halftone/grain photography, 2-tone ink illustrations, woodcut charm | Stepped frame-rate feel (`12–15fps` tactile stutter) or brisk `200–320ms` cuts |
| **Luxury Minimal** | Warm limestone `#F4F1EA` or deep espresso `#141210`, low-chroma bronze/sand accent, extreme tonal restraint | `Cormorant Garamond` (Canela / Didot) + light `Plus Jakarta Sans` | Expansive negative space (`45–60%`), centered or classical asymmetric plates | `0px` exclusively; ultra-fine `0.5–1px` hairlines | Full-bleed art photography, generous plate margins, zero cartoon mascots | Poised quintic in-out `(0.65, 0, 0.35, 1)`; UI `350–450ms`, Hero `600–850ms` |

---

## 3. Image, Heading & Copy Placement Laws

1. **Monumental Stack vs. Asymmetric Split:** Place full-bleed or full-width imagery above/below headlines when the image carries atmospheric weight or detailed UI. Use asymmetric splits (`60/40`, `65/35`, or `7/5`) when pairing concise copy with a vertical/square subject — avoid timid `50/50` splits.
2. **Never Suffocate Visuals or Diagrams:** Charts, product interfaces, maps, and illustrations demand `>= 65%` desktop container width (full width on mobile). Never cram data visuals into narrow sidebars or nested cards.
3. **Open-Canvas Composition Over Card Soup:** Group related items via alignment, whitespace proximity (inter-group gap `>= 2×` intra-group gap), typographic hierarchy, and `1px` hairlines before reaching for bordered boxes. Reserve enclosed cards strictly for heterogeneous, independently clickable objects.
4. **Measure & Optical Line Hygiene:** Cap continuous body prose at `45–70ch` (sweet spot `58–65ch`). Balance display headlines (`text-wrap: balance` in CSS; manual breaks in print/posters/video) for zero single-word orphans.
5. **Uncompromising Figure–Ground Separation:** Whenever type sits over photography, illustration, or video, guarantee `>= 4.5:1` contrast at the *noisiest* pixel via a directional gradient scrim (`rgba(0,0,0,0)` → `rgba(0,0,0,0.72–0.85)`), a solid editorial panel, or a quiet negative-space crop.

---

## 4. Rationalization Red Flags — Stop and Re-Direct

| Rationalization | Reality |
| :--- | :--- |
| *"It's just a quick draft — skip Stage 1 and the medium module."* | Skipping the brief and medium guide misses hard math (safe zones, print bleed, CSS floor) that takes 10× longer to fix later. |
| *"The user asked for 'modern AI SaaS', so dark slate + purple bento cards match."* | `"Modern AI SaaS"` means clarity and craft — never purple-slate card soup. Calibrate to Utilitarian Technical or Atmospheric Dark with a real product visual. |
| *"I'll use warm paper `#F7F6F2` + vermilion + hairline strips because it looks editorial."* | Defaulting to beige Swiss-editorial on every brief is just a new flavor of template slop. Run the 3-Axis Calibration and Banned-Cliché Gate. |
| *"I checked my code mentally — no need to run `d27-check.mjs` or `qa-and-critique.md`."* | Mental checks hallucinate passes on contrast traps, `transition: all`, and clipped edges. Run the checker and cold audit every time. |
