# Design 27 — Adaptive Direction Matrix & Spatial Placement Laws

Load this module during **Stage 1–2** for greenfield designs or full redesigns. Skip it for narrow refinements (`polish`, `clarify`, `harden`) where the existing brand system stays intact.

---

## 1. Anti-Convergence & The Diegetic Physical Artifact Law

Do not pick a direction by habit, and never converge on dark `#090B10` charcoal + `Geist` + `#FF5B1F` safety orange (or warm beige `#F7F6F2` + vermilion boilerplate) across unrelated briefs (`convergence-signature` warns on both). The idea comes first (SKILL.md Stage 0: Audience · Insight · SMP · Concept · Line); the world then has to *express* it. Lock **4 axes + 1 explicit ban**:

1. **Diegetic Physical Artifact (default on Persuade & Experience; waive on record for purely emotional or brand concepts):** Anchor the palette, framing, and Viewport-1 Signature in a **real physical artifact from the subject's craft** — e.g., *16mm Academy film leader + sprocket holes* for cinema, *enamel timetable board + platform clock* for a ferry service, *phosphor CRT trace + BNC bezel* for telemetry, *archival vellum + iron-gall marginalia* for monographs, or *halftone newsprint + registration marks* for independent publishing.
2. **Typographic Voice:** Structural contrast between display authority and reading utility (e.g., *tight condensed grotesk + raw mono*, *high-contrast editorial serif + tracked sans*, *humanist grotesque + tabular mono*).
3. **Macrostructure & Structural Tension:** Choose a whole-page skeleton — **Interactive Instrument**, **Diegetic Artifact Frame**, **Editorial Broadsheet**, **Split Monograph**, **Technical Spec Sheet**, **Manifesto Ledger**, or **Product Workbench** — instead of repeating `.ruled-row` `01/02/03` stacks.
4. **Banned Category Cliché:** Name **3 real competitors**, write down the visual code they share (e.g., *"all three use dark hero + product render + gradient glow"*), and ban that code for this build. The dealt `bannedCliche` is only a fallback when no competitors are known.

*Dealing (subject before chance):* Run `node scripts/d27-deal.mjs --prompt "<brief>" --medium <medium> --surface <mode> --emotion <target> --out .design27/brief.json`. The dealer scores the 19 worlds against the brief's subject words, hashes only among the best matches, and tunes the accent's chroma to the Emotional Target. Use `primary`, switch to `alternate`, or override with one logged line of reasoning; `d27-check --brief` warns on unlogged drift (`brief-world-drift`).

*One campaign = one world:* for the launch film, thumbnail, or mascot of the same campaign, run `d27-deal ... --medium <m> --campaign .design27/brief.json` so every medium reuses the same world and emotion. The film's end lockup = the web hero line; the thumbnail hook = the film's Beat 1.

*Existing brand (`DESIGN.md`, tokens, live site):* skip the deal. Extract the tokens, 3 brand codes (shape, colour, type habit), and the voice (3 adjectives + 1 "we never say"). Write them into the D27-Lock instead of a World.

---

## 2. Universal Craft Laws (Loud Craft, Scale, Headlines & Tension)

- **Headline Law:** The headline dramatizes the Single-Minded Proposition as a **claim, a tension, or a line** — never a topic label. Spec products need a falsifiable claim (*`"The 6:40 ferry leaves on time 97 days in 100"`* instead of *`"Smarter Ferry Travel"`*). Brand, fashion, charity and humour work may use a line (*`"Seeds outlive empires"`* for a seed bank). Test: a competitor could not print it unchanged.
- **One Scale System (display ÷ body, modular ratio, 4px baseline):**

  | Surface | Display ÷ body | Modular ratio | Display leading |
  | :--- | :--- | :--- | :--- |
  | *Experience*, *Thumbnail*, *Motion* | `4:1–10:1` | `1.5` (perfect fifth) | `0.86–0.96` |
  | *Persuade* web | `2.5:1–4:1` | `1.333` (perfect fourth) | `0.92–1.05` |
  | *Operate* / *Read* | `1.8:1–2.5:1` | `1.2` (minor third) | `1.05–1.2` |

  Snap every vertical space and line-height to a `4px` baseline.
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

1. **Mirror Test:** *"If I swapped the brand name for each of the 3 named competitors, would this headline, layout, world and Signature still fit?"* If **YES** for any of them, mutate the concept before emitting code.
2. **Proof = the SMP made tangible (default on *Persuade & Experience*, Tier 2):** When the claim can be shown by interaction, include **1 zero-dependency interactive proof** (comparison scrubber, parameter dial, cost calculator, `#group` anatomy isolator, scrubbable timeline) with a **`1.2s–2.4s` auto-play-once demo** that yields on any pointer, wheel, touch or key input. It must work by keyboard and without dragging (WCAG 2.5.7; `websites.md` §3). When the claim is emotional or brand-led, the proof is a story, demo film, stunt or real evidence; log the waiver in the lock.
3. **Pre-Emit `M·I·H·C·R` Score (`1–5` per axis):**
   - **`M` (Metaphor carries the Idea):** Does the artifact *dramatize the SMP*, not just skin the page in a domain texture?
   - **`I` (Proof):** Does the user *feel or test* the SMP (interactive proof, or a logged story/evidence waiver)? *(Mascots score **Appeal** here instead: silhouette, expression, would someone draw it from memory?)*
   - **`H` (Hierarchy):** Is there one unmistakable `#1` Focal Anchor and an Assertion Headline?
   - **`C` (Contrast & Material Math):** Do all ink/surface pairs clear `>= 4.5:1` (`>= 7:1` reading) without dark-mode halation or Convergence defaults?
   - **`R` (Rhythm & Macrostructure):** Do sections alternate structural grammar without `.ruled-row` or 3-card repetition?
   - **Gate Rule:** If `M < 4` or `I < 4` on a *Persuade* or *Experience* build, **STOP and mutate the concept** before emitting code.

```css
/* D27-Lock: Idea: "Seeds outlive empires" (SMP: our vault keeps 40,000 varieties alive for the next farmer) | Persuade | Botanical Herbarium | Split Monograph | Specimen drawer + germination label | Year scrubber: varieties saved vs lost since 1900 | Color | Emotion: awe · peak=1900→today scrub · end=adopt-a-seed CTA | M:5 I:5 H:4 C:5 R:4 */
```

---

## 4. Material Worlds (19, dealt by `d27-deal.mjs`)

Exact tokens, fonts (1 display + 1 body + 1 mono), OKLCH notes, motion tempo and subject keywords live in `scripts/d27-deal.mjs` and arrive in `brief.json`: read them there, not from memory. Every world passes WCAG `>= 7:1` / APCA `Lc >= 75` for primary ink, `>= 4.5:1` / `Lc >= 75` for secondary ink, and `Lc >= 60` for accent-button text (eval #32). Always load the open web fonts the brief names.

**Light grounds:** 35mm Film Leader · Anodized Instrument · Cast Formwork · Vellum Monograph · Swiss Editorial · Industrial Monolith · Tactile Workshop · Risograph Zine · Railway Enamel · Botanical Herbarium · Editorial Broadsheet · Ceramic Studio · Photo-Led Gallery Wall.
**Dark grounds:** Phosphor Oscilloscope · Darkroom Silver · Blueprint Cyanotype · Midnight Telemetry.
**Coloured grounds:** Riso Flamingo Two-Spot (pink stock + riso blue) · Transit Signal Yellow (wayfinding panel + navy).

Gallery Wall is the image-led world: photography carries all colour and the UI stays achromatic (see `websites.md` §6 Picture Plan).

---

## 5. Image, Heading & Copy Placement Laws

1. **Monumental Stack vs. Asymmetric Split:** Place full-bleed or full-width imagery above/below headlines when the visual carries atmospheric weight or detailed UI. Use asymmetric splits (`60/40`, `65/35`, or `7/5`) when pairing concise copy with a vertical/square subject — avoid timid `50/50` splits.
2. **Never Suffocate Visuals or Diagrams:** Charts, product interfaces, maps, and illustrations demand `>= 65%` desktop container width (full width on mobile). Never cram data visuals into narrow sidebars or nested cards.
3. **Open-Canvas Composition Over Card Soup:** Group related items via alignment, whitespace proximity (inter-group gap `>= 2×` intra-group gap), typographic hierarchy, and `1px` hairlines before reaching for bordered boxes. Reserve enclosed cards strictly for heterogeneous, independently clickable objects.
4. **Measure & Optical Line Hygiene:** Cap continuous body prose at `50–75ch` (sweet spot `58–65ch`). Balance display headlines (`text-wrap: balance` in CSS; manual breaks in video/print) for zero single-word orphans.
5. **Uncompromising Figure–Ground Separation:** Whenever type sits over photography, illustration, or video, guarantee `>= 4.5:1` contrast at the *noisiest* pixel via a directional gradient scrim (`rgba(0,0,0,0)` → `rgba(0,0,0,0.72–0.85)`), a solid editorial panel, or a quiet negative-space crop.

---

## 6. Rationalization Red Flags — Stop and Re-Direct

| Rationalization | Reality |
| :--- | :--- |
| *"It's just a quick draft — skip Stage 1 and `d27-deal.mjs`."* | Skipping calibration produces dark charcoal + orange boilerplate and misses hard math (contrast, safe zones, CSS floor). |
| *"A clean dark hero with `#FF5B1F` accents works for any tech product."* | Uncalibrated `#090B10 + Geist + #FF5B1F` is a convergence failure. Derive a Diegetic Physical Artifact and deal a Material World. |
| *"The landing page already looks crisp — no need for JS interactivity."* | If the claim can be shown by interaction, show it: 1 honest Interactive Proof. If it cannot (brand, charity, fashion), make the proof a story, demo video or real evidence instead, and log the waiver. |
| *"I checked my code mentally — no need to run `d27-check.mjs --render`."* | Mental checks hallucinate passes on contrast traps, `scale(0)` entrances, and clipped edges. Run the checker and inspect snapshots every time. |
