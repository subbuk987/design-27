# Mascot Design, Brand Characters, Iconography & Visual Storytelling

Load this module alongside `SKILL.md` whenever creating a brand mascot, recurring character, editorial spot-illustration system, custom icon set, or animated companion across web, print, thumbnails, and video.

---

## 1. The Silhouette Test (Non-Negotiable Gate)

Before adding eyes, shading, textures, or clothes, fill the character's entire outer form in **solid `#000000` on `#FFFFFF`** and shrink it to **`64px` tall**:
- **PASS:** You recognize the character's species/object, personality, and action instantly from the black outline alone.
- **FAIL:** It collapses into a generic oval, featureless pill, or muddy sphere with tiny stuck-on limbs.
- **Fix failing silhouettes** by carving clear negative-space gaps between torso and arms, exaggerating ONE signature external hook (asymmetric ears, geometric crest, scarf tail, antenna, tool prop, distinct headgear), and pushing posture away from rigid vertical symmetry.

---

## 2. Primary Geometric Shape Language

Every iconic mascot communicates emotional DNA instantaneously through one **dominant primary shape (~70% of silhouette)** paired with one **contrasting accent shape (~30% for character tension)**:

| Dominant Shape | Psychological Signal | Classic Archetypes | Best Brand Fit |
| :--- | :--- | :--- | :--- |
| **Circle / Soft Oval** | Friendly, safe, approachable, warm, curious | Companions, helpers, owls, blobs, soft bots | Onboarding guides, education, consumer tools, wellness, community |
| **Square / Rounded Block** | Stable, honest, structured, dependable, grounded | Engineers, blocks, sturdy robots, archivists | Developer infra, finance, databases, productivity, utilitarian tools |
| **Triangle / Tapered Wedge** | Fast, energetic, sharp, witty, rebellious, ambitious | Foxes, sparks, lightning birds, nimble racers | Creative software, games, challenger brands, high-speed tooling |

*Hybrid craft example:* A developer-tool companion built on a **rounded square torso** (trustworthy engineering) topped with **two small triangular ear-tabs** (sharp intelligence) and **circular expressive eyes** (warmth). Never mash random shapes with no clear dominant hierarchy.

### Proportions & Line of Action
- **Head-to-Body Ratio Sets Tone:**
  - `1:1` to `1:1.5` — Chibi / pocket companion (maximum charm, excels at `32–64px` avatars & stickers).
  - `1:2` to `1:2.5` — Expressive brand mascot sweet spot (Duolingo / Slack / Mailchimp range — expressive hands + readable gestures).
  - `1:4` to `1:6` — Editorial storybook / human spot illustration.
- **Line of Action:** Sketch every active pose around a single sweeping **C-curve or S-curve spine** before attaching limbs. Static vertical symmetry reads like a cardboard cutout; even an "idle" stance deserves a subtle `4–6°` weight shift or head tilt.

---

## 3. 3-to-4 Color Character Palette Tied to Brand Tokens

Over-colored mascots fail to scale and clash with UI. Lock **exactly 3–4 colors** anchored directly to Stage 3's brand system:

| Slot | Area Share | Role | Token Alignment |
| :--- | :--- | :--- | :--- |
| **1. Primary Body** | `~60%` | Instant brand recognition from 20 feet away | Tied directly to `--accent-focal` OR a warm/cool signature neutral complementing `--surface-canvas`. |
| **2. Secondary Fill** | `~25%` | Belly, face mask, collar, or garment separation | Clean light tint or deep contrasting companion tone (`>= 3:1` against Primary Body). |
| **3. Feature / Outline Ink** | `~10%` | Eyes, brows, expressive contour, feet | Deep calibrated brand ink (e.g., `#15171C` — avoids harsh dead `#000000` unless Brutalist/Zine). |
| **4. Micro-Pop Accent** | `~5%` | Cheeks, beak, tiny badge, held spark/prop | High-energy focal pop (often warm coral/amber/vermilion). |

**Dual-Surface Verification:** Test the mascot over BOTH light (`--surface-canvas`) and dark surfaces. If the mascot's outline or primary fill blends into dark mode, define an explicit dark-mode placement rule (e.g., subtle `2px` warm rim highlight or calibrated light collar/halo — never an ugly smeared white outer glow).

---

## 4. Model Sheet — Turnaround, Expressions & Scale Degradation

Never invent character proportions fresh on every screen. Lock a compact **Model Sheet** before deploying across touchpoints:

1. **3-View Turnaround:** Draw/specify **Front**, **3/4 Hero View** (default placement angle), and **Side Profile** aligned across 5 horizontal proportion rails: *Crown / Top of Head → Eye Line → Chin / Jaw → Waist / Belt → Ground Plane*.
2. **Core 6-Expression Kit:** Drive emotion through **brow angle, eyelid squash, and body posture** (not merely swapping mouth curves!):
   - `Idle / Neutral` (relaxed open eyes, gentle posture, welcoming gaze)
   - `Delighted / Success` (upward cheek squash turning lower eyelids into crescents, raised gesture)
   - `Curious / Thinking` (10° head tilt, asymmetric brows, gaze shifted slightly up-right)
   - `Focused / Working` (slightly narrowed eyes, forward lean, hands engaged with prop)
   - `Alert / Surprised` (enlarged eyes with wide white sclera, brief vertical stretch)
   - `Gentle Oops / Error` (soft slanted brows, subtle slump, empathetic — never angry or mocking the user)
3. **3-Tier Scale Degradation Rules:**
   - **Hero (`>= 128px`):** Full silhouette, secondary garment/prop detail, subtle shading/highlights.
   - **UI Medium (`48–127px`):** Drop minor inner shading, simplify hands/fingers to clean mittens, slightly thicken eyes/key features for legibility.
   - **Micro Avatar / Favicon (`16–47px`):** Crop tightly to **head + signature silhouette ear/crest + eyes only**. Zero body, zero props, zero `0.5px` strokes.

---

## 5. Consistent Rendering, Stroke & Lighting Grammar

Select **ONE visual rendering grammar** matching Stage 1's Aesthetic Direction and hold it ruthlessly across all mascots, spot illustrations, and custom icons. Never mix flat vector icons, glossy 3D renders, and hand-drawn sketches on one surface.

| Rendering System | Line & Fill Specification | Lighting & Depth | Best Style Matrix Fit |
| :--- | :--- | :--- | :--- |
| **Flat Geometric Vector** | Clean filled shapes (`0px` stroke) OR uniform monoline stroke (`2.5px–3.5px` on `240px` viewBox, `stroke-linecap: round; stroke-linejoin: round`) | Zero gradients; depth via overlapping flat tonal planes (1 subtle shadow tint max) | Swiss Editorial, Utilitarian Technical, Tactile Playful |
| **Editorial Ink & Grain** | Expressive tapered ink outline (`1.5–4px`), 2–3 flat spot fills slightly offset inside linework | Subtle risograph/paper grain overlay (`5–8%` opacity); zero smooth airbrush | Retro / Zine, Editorial Publications |
| **Matte Tactile 3D / Clay** | Soft beveled geometry, high roughness (`0.75–0.88` matte ceramic/felt/clay), zero mirror plastic | Single soft key light top-left (`45°`), warm fill, crisp subtle contact ambient occlusion | Tactile Playful, Product Launch Videos |
| **Technical Axonometric** | Strict `30°` isometric projection, uniform `1.5px` structural strokes, crisp geometric primitives | Flat directional top/left/right 3-step value shading (`100% / 88% / 74%`) | Utilitarian Technical, Atmospheric Dark |

### Custom Iconography Alignment
When authoring companion UI icons alongside a mascot/illustration system:
- Build on a consistent **`24 × 24 px`** grid with `2px` live padding (`20 × 20 px` optical bounding box; circles span `20px`, squares span `18px` for equal optical mass).
- Match stroke weight (`1.5px` editorial/technical or `2px` playful), cap/join geometry (`round` vs. `miter`), and corner radius to the brand's exact `--radius` philosophy.

---

## 6. Reusable Animation-Ready SVG & AI Prompt-Lock Templates

### Animation-Ready Vector (SVG) Hierarchy
Structure mascot SVGs with semantic nested `<g>` layers and explicit `transform-origin` pivots so CSS, GSAP, or Remotion can immediately animate breathing, blinking, head tilts, and waves without re-exporting assets:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" role="img" aria-label="Brand mascot">
  <g id="mascot-root">
    <!-- Ground contact shadow (scales subtly opposite vertical bounce) -->
    <ellipse id="shadow" cx="120" cy="222" rx="58" ry="9" fill="#15171C" opacity="0.14" />

    <!-- Body group anchored at base center for subtle squash/stretch (transform-box locks SVG coords) -->
    <g id="body" style="transform-box: view-box; transform-origin: 120px 214px;">
      <!-- Stubby feet & raised left/right arms carved outside torso to pass 64px silhouette test -->
      <rect x="84" y="192" width="24" height="24" rx="11" fill="#15171C" />
      <rect x="132" y="192" width="24" height="24" rx="11" fill="#15171C" />
      <path id="left-arm" d="M72 138 C46 130, 36 112, 44 98 C50 88, 64 96, 74 114 Z" fill="#D9410B" />
      <path id="right-arm" d="M168 144 C194 152, 200 172, 188 182 C178 190, 166 178, 162 162 Z" fill="#D9410B" />

      <!-- Rounded-square engineering torso (#D9410B clears 4.2:1 vs #FFF7EE and 4.1:1 vs #F7F6F2) -->
      <rect x="70" y="112" width="100" height="88" rx="30" fill="#D9410B" />
      <rect x="88" y="134" width="64" height="54" rx="20" fill="#FFF7EE" />

      <!-- Slot 4 Micro-Pop Accent: dark collar + high-contrast ochre badge -->
      <rect x="82" y="112" width="76" height="12" rx="6" fill="#15171C" />
      <circle cx="120" cy="126" r="8" fill="#F2B705" stroke="#15171C" stroke-width="2.5" />
    </g>

    <!-- Head group anchored at neck pivot with intentional asymmetric ear notch & 4deg head tilt -->
    <g id="head" transform="rotate(-4 120 112)" style="transform-box: view-box; transform-origin: 120px 112px;">
      <!-- Left ear: tall intact triangle | Right ear: distinctly notched silhouette hook -->
      <path d="M74 68 L54 24 L100 50 Z" fill="#D9410B" />
      <path d="M166 68 L184 26 L168 42 L176 48 L142 50 Z" fill="#D9410B" />
      <rect x="64" y="46" width="112" height="74" rx="32" fill="#D9410B" />

      <!-- Eyes group anchored on eye line for clean scaleY(0.1) blinks -->
      <g id="eyes" style="transform-box: view-box; transform-origin: 120px 84px;">
        <circle cx="96" cy="84" r="8" fill="#15171C" />
        <circle cx="144" cy="84" r="8" fill="#15171C" />
        <circle cx="98.5" cy="81.5" r="2.5" fill="#FFFFFF" />
        <circle cx="146.5" cy="81.5" r="2.5" fill="#FFFFFF" />
      </g>
      <path id="mouth" d="M108 100 Q121 109 133 99" fill="none" stroke="#15171C" stroke-width="4" stroke-linecap="round" />
    </g>
  </g>
</svg>
```

### AI Image-Generation Character Lock Template (Cross-Touchpoint Consistency)
Keep blocks **1–4 and 6** **word-for-word identical** across every generated scene (hero, thumbnail, empty state, print cover); change ONLY block **5** (`[SCENE, BACKGROUND & POSE]`):

```text
[1. IDENTITY LOCK] Brand mascot "[NAME]": a compact geometric fox-companion character with a rounded-square torso, two sharp oversized triangular ears (right ear distinctly notched), expressive stubby arms separated cleanly from the torso, dark rounded feet, and a dark collar holding a tiny round ochre badge.
[2. PROPORTIONS] 1:2 head-to-body ratio, wide-set solid dark oval eyes with tiny crisp top-right white catchlights, small minimalist curved mouth, unmistakable asymmetric silhouette at 64px scale.
[3. LOCKED PALETTE] Primary body: Signal Vermilion (#D9410B); belly/cheek mask: Warm Paper (#FFF7EE); eyes, feet & collar ink: Deep Ink (#15171C); collar badge accent: Sun Ochre (#F2B705). Strictly 4 colors, zero rainbow gradients.
[4. RENDERING GRAMMAR] Flat-matte geometric vector-inspired illustration, crisp clean contours, zero photorealism, single soft top-left key light with minimal flat tonal shadow.
[5. SCENE, BACKGROUND & POSE] Three-quarter hero view on a clean solid #F7F6F2 paper background (swap surface color cleanly for dark thumbnails/heroes), dynamic C-curve curious lean forward, holding a tiny glowing amber compass, asymmetric raised brow, joyful focused expression.
[6. NEGATIVE CONSTRAINTS] No extra fingers, no human teeth, no complex fur texture, no glossy plastic sheen, no busy background props, no embedded text.
```
