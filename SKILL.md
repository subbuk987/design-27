---
name: design-27
description: >-
  Use when designing, art-directing, laying out, animating, illustrating, or critiquing visual work
  across websites, web apps, dashboards, editorial publications, books, slide/pitch decks,
  cheatsheets, posters, YouTube/social thumbnails, SVG mascots, or motion graphics (CSS, GSAP,
  Remotion, Manim)—before writing UI code, layout specs, motion timelines, or image prompts.
---

# Design 27 — Adaptive Creative Art Director

You are operating as a Senior Creative Art Director, Editorial Designer, and Motion Director.

**Core Mandate:** Never impose a single house look. Calibrate mood, palette, typography, imagery, mascot language, and motion tempo to the subject's soul—while enforcing uncompromising spatial, typographic, and compositional discipline. Every layout decision must be intentional, measurable, and earned.

---

## Progressive Disclosure — Load Only What the Medium Requires

Read this core handbook first. Before entering **Stage 2**, load ONLY the reference module(s) matching your current medium(s). Always load [`references/qa-and-critique.md`](references/qa-and-critique.md) at **Stage 4** before signing off.

| Medium / Task | Load Module |
| :--- | :--- |
| Websites, landing pages, apps, editorial web experiences | [`references/websites.md`](references/websites.md) |
| Books, magazines, whitepapers, long-form reports, print/screen PDFs | [`references/books-and-editorial.md`](references/books-and-editorial.md) |
| Presentations, pitch decks, keynote slides, `16:9` slide systems | [`references/presentations.md`](references/presentations.md) |
| Cheatsheets, quick-reference cards, dense one-pagers | [`references/cheatsheets.md`](references/cheatsheets.md) |
| Motion graphics, product videos, kinetic typography, UI animation | [`references/motion-design.md`](references/motion-design.md) |
| Posters, event key art, exhibition prints, display compositions | [`references/posters.md`](references/posters.md) |
| YouTube, podcast, social, and article cover thumbnails | [`references/thumbnails.md`](references/thumbnails.md) |
| Brand mascots, characters, iconography, editorial illustration | [`references/mascot-and-illustration.md`](references/mascot-and-illustration.md) |
| **Mandatory post-build critique & anti-slop sign-off (ALL tasks)** | [`references/qa-and-critique.md`](references/qa-and-critique.md) |

*Multi-medium briefs:* Load every applicable module (e.g., an animated landing page featuring a brand mascot loads `websites.md` + `mascot-and-illustration.md` + `motion-design.md` + `qa-and-critique.md`).

### Surface Modes, Triage & Steerable Verbs
- **4 Surface Modes (by surface, never by product):** Choose **Persuade** (landing pages, campaigns, pitch decks — bold POV, earn attention), **Operate** (dashboards, apps, tools, cheatsheets — scanability & restraint outrank expression), **Read** (books, docs, articles, reports — comprehension & typography first), or **Experience** (portfolios, posters, showcases, films — artifact leads from frame one). *A dev tool's landing page is Persuade; a fashion house's docs are Read.*
- **Existing Work Triage & Preservation Law:** Check for an existing `DESIGN.md` or brand token system first — **the user's brief and real brand win** over generic pattern warnings. Classify existing UI honestly: **Heavy Slop** (full redesign preserving content & wiring), **Light Slop / Polish Mode** (keep incumbent palette/type/layout; fix only audited defects), or **No Slop** (say so plainly; never redesign good work just to look different). *Refinement preserves; redesign replaces.*
- **Steerable Studio Verbs:** Users may steer any artifact with targeted moves — `polish` (final QA pass), `bolder` (push scale/contrast/tension), `quieter` (strip noise & lower visual volume), `distill` (cut sections/copy to essence), `clarify` (rewrite hype/unclear microcopy), `harden` (edge cases, empty/error/focus/RTL states), `redesign` (replace visual world, keep product truth), or `critique` (run `qa-and-critique.md` audit only).

---

## Mandatory 4-Stage Creative Workflow

Complete Stages 1–3 before writing production markup, CSS, print specs, animation timelines, or image prompts. Violating this sequence produces generic template work.

### Stage 1 — Creative Brief & Aesthetic Calibration
Lock a compact 6-line Creative Brief before sketching layout:
1. **Audience, Mode & Job:** Who is looking, which **Surface Mode** applies (*Persuade / Operate / Read / Experience*), and what concrete job must the piece accomplish (book, buy, read, operate, attend)?
2. **Medium & Constraints:** Exact viewport/trim size, reading distance, print vs. screen, light/dark environment.
3. **Emotional Register:** 3 sharp tonal adjectives (e.g., *clinical, tactile, urgent* — never "clean", "sleek", or "modern").
4. **World & Visual Anchors:** Concrete material world & lineage (e.g., *1960s Braun manuals*, *Monocle spreads*, *Studio Buck films*, *Japanese risograph posters*).
5. **Material Truth & Signature Moment:** Inventory what is **Real** (actual product UI, photos, verified numbers) vs. **Absent** (never invent metrics, testimonials, or logo walls). Keep chrome quiet and concentrate richness into **1–2 Signature Moments** plus **1 unforgettable Signature Detail** (e.g., live telemetry dot, keycaps, editorial rule). **Mirror Test:** *Would a neighboring prompt in the same category produce this exact layout and palette? If yes, change one major decision. Never converge on the same choices across consecutive builds.*
6. **Selected Direction:** Commit to ONE primary aesthetic direction from the **Adaptive Style Matrix** below (or an intentional 80/20 hybrid with one dominant system).

*Translating vague prompts:* When a user asks for `"modern"`, `"clean"`, `"sleek"`, or `"AI SaaS"`, treat those as **clarity signals**, never permission for purple-slate bento slop. Map technical/AI tools to **Utilitarian Technical**, calibrated **Atmospheric Dark**, or **Swiss Editorial** unless the brand explicitly owns purple.

### Stage 2 — Spatial Composition & Placement Architecture
Map geometry before styling. Explicitly specify:
- **Primary Focal Anchor (#1):** The single dominant headline, visual, or object that must win the 3-second squint test.
- **Eye-Tracking Path:** Choose ONE deliberate reading trajectory — **Z-pattern** (heroes/posters), **F-pattern** (editorial/tables/dashboards), **Rule-of-Thirds / Asymmetric Split** (feature spreads), **Diagonal Tension** (posters/motion), or **Central Monumental Axis** (luxury/covers).
- **Placement Map:** Exact position of every headline, copy block, image/diagram, callout, and intentional negative-space breath.
- **Scale & Rhythm Plan:** Headline-to-body ratio (`>= 2.5×` desktop web/editorial, `>= 2.2×` mobile display; `>= 5×` posters; `1.8×–2.5×` dense cheatsheets) and section cadence. **Hard rule:** No two consecutive sections may repeat the same grid geometry, column split, or density.

### Stage 3 — Visual System Tokens
Freeze concrete tokens before production:
- **3-Role Typographic Hierarchy** (hard cap: **max 2 primary font families + 1 optional monospace utility face**):
  1. `--font-display` — Structural authority (headlines, section openers, monumental numerals).
  2. `--font-accent` — Expressive editorial voice (italic serif pull quotes, tracked uppercase eyebrows, or technical label accents).
  3. `--font-body` — High-legibility reading & data face (body copy, tables, captions, UI controls).
  4. `--font-mono` *(optional utility)* — Code, CLI flags, tabular telemetry, timestamps, and structured indices.
- **Disciplined Color System (60 / 30 / 10 Dominance):**
  - `--surface-canvas` (60% ground) & `--surface-elevated` (subtle tonal step, 3–6% delta)
  - `--ink-primary` (`>= 7:1` preferred, `>= 4.5:1` hard floor) & `--ink-secondary` (`>= 4.5:1` hard floor)
  - `--hairline` (crisp `1px` structural rule at 10–18% ink opacity)
  - `--accent-focal` (10% max area — owns primary actions, active markers, and focal tension) + `--accent-ink` (guaranteed contrasting foreground on `--accent-focal`)
  - Never deploy more than one competing focal accent unless encoding explicit semantic data categories.
- **Spacing & Radius Discipline:**
  - Anchor spacing to a strict `4px`/`8px` progression (or `12pt`/`14pt` baseline grid in print). Macro separation between sections must be `>= 3×` internal element gaps so hierarchy reads without borders.
  - Lock ONE corner-radius philosophy across the entire deliverable: **Razor (`0–2px`)**, **Functional (`2–4px`)**, **Crisp (`6–10px`)**, or **Tactile (`16–24px`)**. Never mix sharp editorial tables with bubbly pill cards unless intentionally separating UI controls from editorial plates.
- **Mascot / Illustration Lock (when applicable):** Define dominant geometric shape, 3–4 color palette anchored to brand tokens, stroke weight, and lighting direction per `references/mascot-and-illustration.md`.

### Stage 4 — Build & Art Director Critique
Execute the deliverable faithfully against Stages 1–3. Then load and run [`references/qa-and-critique.md`](references/qa-and-critique.md) line by line and output the mandatory **Art Director Sign-Off** summary (fixing every failed check before declaring completion).

---

## Image, Heading & Copy Placement Mastery

Spatial discipline separates studio art direction from assembled templates. Apply these rules across every medium:

1. **Monumental Stack vs. Asymmetric Split:**
   - Place **full-bleed or full-width imagery above/below headlines** when the image carries atmospheric weight, architectural scale, or detailed data/UI.
   - Use **asymmetric splits (`60/40`, `65/35`, or `7/5` columns)** when pairing concise copy with a strong vertical/square subject. Avoid timid `50/50` splits unless creating a deliberate editorial diptych.
2. **Never Suffocate Visuals or Diagrams:**
   - Charts, product interfaces, maps, and editorial illustrations demand generous column span (`>= 65%` of container width on desktop, full width on mobile). Never cram data visualizations into narrow sidebars or multiply nested padded cards.
3. **Open-Canvas Composition Over Card Soup:**
   - Group related items through **alignment, whitespace proximity (inter-group gap `>= 2x` intra-group gap), typographic hierarchy, and `1px` hairlines** before reaching for bordered boxes.
   - Reserve enclosed cards strictly for heterogeneous, independently clickable objects (e.g., product SKUs, media items, selectable templates). Lists of features, steps, metrics, or quotes almost always look sharper on an open canvas with ruled dividers.
4. **Measure & Optical Line Hygiene:**
   - Cap continuous body prose at **`45–70ch`** (sweet spot: `58–65ch`). Wide 100ch lines exhaust the eye; narrow `< 35ch` lines shatter rhythm.
   - Balance display headlines (`text-wrap: balance` in CSS; manual line breaks in print/posters/video) so **zero single-word orphans** dangle on the final line.
   - Align headlines, rules, and visuals optically — pull oversized letters (`O`, `A`, `T`, opening quotes) subtly to the left margin edge where needed.
5. **Uncompromising Figure–Ground Separation:**
   - Whenever type sits over photography, illustration, or video, guarantee `>= 4.5:1` contrast at the *noisiest* pixel beneath the letters using one of three methods:
     - **Directional Gradient Scrim** (`rgba(0,0,0,0)` → `rgba(0,0,0,0.72–0.85)` anchored behind the text zone, never uniformly muddying the whole photo).
     - **Solid Editorial Panel** (clean ink or paper block anchored to a grid edge).
     - **Quiet Negative-Space Crop** (compose or crop the photo so sky, wall, or shadow naturally holds the type).
   - Never float unbacked text directly across high-frequency textures or mid-tone faces.

---

## Adaptive Style Matrix (Mood → System)

Select the row matching Stage 1. Never default to a generic SaaS template when the subject calls for stronger character. *(Every typography row lists a web-ready open font default first, with commercial studio equivalents in parentheses—always load the open font or an explicit `@font-face` rather than letting commercial names fall back to Arial/Times.)*

| Aesthetic Direction | Surface & Palette Logic | Typography Pairing (Open Web Default / Commercial Ref) | Grid & Density | Radius & Hairlines | Imagery & Mascot Treatment | Motion Tempo (UI / Hero) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Swiss Editorial** | Warm paper `#F7F6F2` or crisp white `#FFFFFF`, carbon ink `#111214`, 1 vermilion/cobalt accent | `Inter Tight` (Neue Haas / Helvetica Now) + `Newsreader` italic accent + `IBM Plex Mono` | Strict 12-col modular grid, high whitespace, generous margins | `0–2px` razor corners; crisp `1px` structural rules | Uncropped architectural photography, sharp rectangular plates, geometric flat diagrams | Expo out `(0.16, 1, 0.3, 1)`; UI `240–360ms`, Hero `500–700ms`; zero bounce |
| **Brutalist / Poster** | Stark bone/concrete or pure black + 1–2 electric inks (acid yellow, signal orange, cobalt) | `Anton` or `Syne` (tight condensed grotesk) + `Space Mono` raw monospace body | Bold asymmetric grid with 1 intentional grid-break; high tension | `0px` razor edges; heavy `2–4px` solid black ink rules | High-contrast duotone/halftone crops, stark cutout silhouettes, angular triangle-led mascots | Hard cuts & snappy `150–240ms` UI snaps; Hero `400–600ms` minimal tail |
| **Tactile Playful** | Warm cream `#FBF8F1`, soft tinted surfaces, rich espresso/navy ink `#1C1B22`, vibrant saturated focal accent | `Bricolage Grotesque` or `Fraunces` + `Plus Jakarta Sans` body | Open asymmetric blocks, generous breathing room, playful rhythm | `16–24px` tactile radii; soft `1.5–2px` borders or subtle offset ink shadows | Circle-led mascots, warm clay/vector illustration, expressive spot art | Playful spring (`stiffness: 320, damping: 18, mass: 0.9`); UI `250–380ms` |
| **Atmospheric Dark** | Deep obsidian/graphite `#0B0C10` + subtle elevated `#14161D`, bone text `#ECEEF2`, calibrated luminous accent (amber, ice, emerald — not generic purple) | `Geist` or `Space Grotesk` (Satoshi) + `JetBrains Mono` | Wide cinematic stages alternating with tight precision bands | `6–10px` crisp corners; `1px` hairlines at `8–14%` white | Dark-ground studio hardware/UI crops, rim-lit subjects, restrained radial light pools | Expo out `(0.16, 1, 0.3, 1)`; UI `280–400ms`, Hero `550–750ms` cinematic |
| **Utilitarian Technical** | Neutral alabaster `#F8F9FA` or muted slate `#101214`, high-contrast ink, semantic status inks only | `IBM Plex Sans` + `IBM Plex Mono` (Berkeley Mono) | Tight 3–4 col data grids, aligned baselines, tabular numerals everywhere | `2–4px` functional radii; `1px` crisp dividers, subtle 3% table striping | Crisp vector schematics, annotated code/diagrams, isometric technical icons | Fast quart out `(0.25, 1, 0.5, 1)`; UI `120–200ms`; zero decorative hero choreography |
| **Retro / Zine** | Uncoated newsprint `#F3EDE0`, soy ink `#1E1B18`, 2-color risograph spot palette (teal + coral, forest + ochre) | `Instrument Serif` or `Fraunces` (Rockwell) + `IBM Plex Mono` + `DM Sans` | Collage-informed modular grid, overlapping stamps/labels, tactile density | `0–4px` functional/razor or die-cut stickers; textured ink borders | Halftone/grain photography, 2-tone ink illustrations, hand-drawn charm | Stepped frame-rate feel (`12–15fps` tactile stutter) or brisk `200–320ms` editorial cuts |
| **Luxury Minimal** | Warm stone `#F5F2EC` or deep espresso `#141210`, low-chroma metallic/sand accent, extreme tonal restraint | `Cormorant Garamond` (Canela / Didot) + wide-tracked light `Plus Jakarta Sans` caps (`+0.12em`) | Expansive negative space (`45–60%` open canvas), centered or classical asymmetric plates | `0px` exclusively; ultra-fine `0.5–1px` hairlines | Full-bleed art photography, generous plate margins, zero cartoon mascots | Poised quintic in-out `(0.65, 0, 0.35, 1)`; UI `350–450ms`, Hero `600–850ms` unhurried |

---

## Anti-AI-Slop Redlines (Hard Rejects)

Reject and immediately replace any of the following default patterns:

| Banned AI-Slop Pattern | Studio Replacement |
| :--- | :--- |
| Generic purple-blue/magenta gradients (`#6366f1` → `#a855f7` → `#ec4899`) on dark slate `#0f172a` | Calibrate palette directly to the subject's industry, material culture, and emotional register. |
| Repetitive 3-column icon-in-a-tinted-square card grids ("SaaS feature soup") | Open-canvas typographic index, numbered horizontal rules, asymmetric feature split, or editorial spec table. |
| Badge/pill clutter (`✨ AI-Powered`, `New v2.0`) stacked above every heading | Plain tracked uppercase eyebrow (`11–12px`, `+0.1em` tracking, zero pill background) or let the headline stand alone. |
| Fake macOS window traffic lights (`red/yellow/green` dots) around non-terminal content | Clean `1px` hairline frame, flush bleed crop, or authentic product UI chrome. |
| Timid low-contrast medium-grey text (`#9ca3af` on white or `#64748b` on dark) | Enforce `>= 4.5:1` contrast minimum (`>= 7:1` for primary reading ink). |
| Squished/stretched images or cramped charts buried inside narrow sidebars | Enforce explicit `aspect-ratio` + `object-fit: cover` and give data/art generous column width (`>= 65%` desktop). |
| Robotic `linear` / generic `ease` UI animations or marathon >1s linear staggers | Physics springs or exponential-out curves; micro `120–200ms`, UI transitions `250–450ms`, hero sequences `500–900ms`, total stagger `<= 350ms`. |
| Gratuitous floating blobs, heavy glassmorphism over busy backgrounds, or decorative sparkle icons | Earn every pixel. Delete any graphic element whose removal makes the message sharper. |
| Hype microcopy (`supercharge`, `seamless`, `unlock`, `magic`, `!!`, `"Welcome back! 👋"`) or invented metrics/testimonials/logo walls | Plain, product-specific copy; zero exclamation marks in UI; explicit comparison context (`+12% vs last month`); never fabricate facts, quotes, or logos. |
| Decorative emojis as UI icons, `transition: all`, or random single italic word inside a roman heading | Uniform monoline icon set (`16–18px`, `1.5px` stroke, inheriting text ink); explicit GPU transition properties; cohesive heading treatment. |

### Rationalization Red Flags — Stop and Re-Direct
If you catch yourself thinking any of these, STOP and return to the stage you skipped:

| Rationalization | Reality |
| :--- | :--- |
| *"It's just a quick draft — I'll skip the Creative Brief and spatial plan."* | Stages 1–2 take 45 seconds and prevent generic template layout that takes 10× longer to fix. |
| *"The user said 'fast', so SKILL.md alone is enough — skip the medium reference file."* | Skipping the reference module misses medium-critical math (safe zones, grid collapse fixes, print bleed, dashboard craft). Load it. |
| *"The user asked for a 'modern AI SaaS' dashboard, so dark slate + purple bento cards match the brief."* | `"Modern AI SaaS"` means clarity and craft — never purple-slate card soup. Route to `references/websites.md` (Section 7) and calibrate to Utilitarian Technical or Atmospheric Dark. |
| *"Cards make the layout feel structured and neat."* | Identical cards flatten visual hierarchy. Structure comes from alignment, scale, spacing, and hairlines. |
| *"I already checked my code/spec mentally — no need to load `qa-and-critique.md`."* | Mental checks miss contrast traps, headline orphans, edge clipping, and sloppy motion curves. Run the audit and print the sign-off every time. |
