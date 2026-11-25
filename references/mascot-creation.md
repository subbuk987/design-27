# Mascot Creation, Silhouette Cutouts & Character Rigging

Load this module alongside `SKILL.md` (and `references/animations.md` for interactive web motion) whenever creating original brand mascots, product character systems, SVG emblem rigs, or AI character sheets.

---

## 1. The 2-Noun Domain Metaphor Matrix (Anti-Cloning Law)

Never graft generic animal tropes — pointed fox or cat ears, notched ear triangles, orange-fox bellies, or default rosy cheeks — onto technical or non-animal products unless the brief explicitly calls for that animal. Generic ears destroy domain specificity and make unrelated tools look like clones of the same template.

Instead, fuse **Noun A (Physical / Technical Medium)** + **Noun B (Kinetic / Expressive Cue)** directly into the character's core anatomy so the product's real craft drives both its face and its outer silhouette:

| Product Domain | Noun A — Physical / Technical Medium | Noun B — Kinetic / Expressive Cue | Resulting Character Anatomy (Zero Generic Ears) |
| :--- | :--- | :--- | :--- |
| **CLI Benchmark** | Dual-inline IC chip package + brass DIP pins | `>_` terminal prompt-chevron & cursor eyes + ECG pulse mouth | Rectangular chamfered chip chassis, 8 articulated brass pin arms, lightning-bolt pinhead antenna, `>_` OLED visor eyes, sweeping heartbeat line |
| **Encrypted Backup** | Brass & slate padlock housing + hardened U-shackle | Periscope keyhole eye + ready-state dash + checksum wave | Asymmetric unlocked shackle crown (`30%` silhouette hook), key-tooth shoulder bolts, keyhole + status-bar eyes, stepped verification pulse |
| **Audio Field Recorder** | Milled XLR field body + furry deadcat windscreen | Dual analog VU-meter pupils + coiled TRS cable tail | Fluffy asymmetrical windscreen crest (ear-free silhouette hook), recessed meter-dial face with bouncing needle pupils, coiled spring tail |
| **Graph Database** | Faceted geodesic polyhedron + magnetic node sockets | Orbital satellite hands + directional edge-beam gaze | Isometric hexagonal prism head/torso, floating orbital node spheres for hands, connected vertex constellation eyes |
| **Culinary App** | Enameled cast-iron cocotte + brass lid knob | Rising steam-curl brow + wooden ladle-hook arm | Squat rounded pot torso with asymmetric loop handles, billowing asymmetric steam plume crest, expressive arched steam brows |

### Metaphor Gate Before Drawing
Before placing a single `<path>`, write down your **2-Noun Fusion** in plain text:
- What physical hardware, vessel, or artifact does the user's product inhabit? (**Noun A**)
- Which living gesture, instrument readout, or kinetic signal turns that artifact into a character? (**Noun B**)
- If you swapped the product name to a competitor in a different industry, would the silhouette still belong *only* to this product? If not, replace generic appendages with domain geometry.

---

## 2. Negative-Space Cutout Silhouette Gate (`64px / 32px / 16px`)

A mascot fails as a brand mark if its eyes, mouth, and signature glyph vanish into a solid black blob at favicon (`16px`) and avatar (`32px–64px`) sizes.

### Hard Rule: `no-blind-silhouette-filter`
**BANNED:** `.sil { filter: brightness(0); }` and `.sil.inv { filter: brightness(0) invert(1); }`. Applying CSS `brightness(0)` crushes every interior color channel to `#000000`, erasing eyes, screens, and expressions on small tiles.

### Required Architecture: CSS Custom-Property Cutouts (or `<mask>`)
Drive every fill and stroke inside the hero `<svg>` from semantic CSS custom properties with brand defaults, then invert **only the interior face/glyph cutout token** (`--m-cut`) to match the tile background (`--sil-bg`) while collapsing decorative bevels and shadows to `transparent`:

```css
/* Hero stage defaults */
.m-fill   { fill: var(--m-fill, #E5A93B); }
.m-shade  { fill: var(--m-shade, #B47819); }
.m-screen { fill: var(--m-screen, #0E131B); }
.m-cut    { fill: var(--m-cut, #7CE8C4); }
.m-cut-s  { stroke: var(--m-cut, #7CE8C4); fill: none; }
.m-hi     { stroke: var(--m-hi, #FFD88A); fill: none; }
.m-glint  { stroke: var(--m-glint, #EEFFF8); fill: none; }
.m-shadow { fill: var(--m-shadow, rgba(0, 0, 0, 0.42)); }

/* Negative-space silhouette override (light or dark tile) */
.sil {
  --m-fill: var(--sil-ink);
  --m-shade: var(--sil-ink);
  --m-screen: var(--sil-ink);
  --m-cut: var(--sil-bg);      /* Eyes, mouth & signature glyph punch clean negative space */
  --m-hi: transparent;
  --m-glint: transparent;
  --m-shadow: transparent;
}
```

#### Two Safe Cloning Techniques
1. **DOM Clone with Stripped IDs (Recommended):** Clone `<g id="mascot">` into each `[data-sil]` SVG via `cloneNode(true)` and remove all `id` attributes on the clone. This guarantees zero drift from the hero artwork, inherits CSS variables seamlessly across every browser without Shadow DOM `<use>` boundaries, and keeps hero `#id` animations static on small silhouettes.
2. **SVG `<mask>` Boolean Cutout:** When a silhouette sits over a textured gradient, photograph, or non-solid surface where `--sil-bg` is not a flat hex, place `#eyes` and `#signal` inside `<mask id="cutout-mask">` with `fill="black"` / `stroke="black"` over a `fill="white"` outer silhouette so the underlying background shows straight through.

### Minimum Cutout Stroke & Gap Math for `16px`
Inside a `viewBox="0 0 400 400"`, `16px` renders at **`0.04×` scale** (`25 SVG units = 1 CSS pixel`). To keep cutouts razor-sharp on `1×` displays without sub-pixel grey collapse:
- Interior eye shapes: `>= 36 units` diameter/width (`>= 1.44px` rendered at `16px`).
- Cutout strokes (mouth waves, prompt chevrons, dials) & gaps between outer chassis and interior cutouts: `>= 25 units` (`>= 1.0px` at `16px`).
- Interactive `<g id>` groups wired for keyboard anatomy isolation MUST include `tabindex="0"`, `role="button"`/`aria-label` (or paired `<button>` controls), and `:focus-visible` outlines.

---

## 3. Constructive Vector Craft, Palette & Finish Registers

### Shape Language & Line of Action
- **`70 / 30` Mass-to-Hook Ratio:** Dedicate `70%` of the visual footprint to one bold, calm primary mass (chassis, vessel, polyhedron, body) and `30%` to asymmetric silhouette hooks (unlocked shackle, articulated limbs, coiled cable, steam plume, antenna) that establish unmistakable facing direction.
- **C / S-Curve Line of Action:** Avoid rigid T-pose symmetry. Tilt the primary mass `3°–6°`, stagger limb heights, or bend one arm into an active gesture so the character carries weight and momentum even in a static SVG.
- **Semantic Rigging (`require-svg-named-groups`):** Group every logical part inside `>= 4` (ideally `6–8`) semantic `<g id="...">` layers (`#ground-shadow`, `#limbs`, `#chassis`, `#screen`, `#eyes`, `#signal`) and include `data-mascot` on the root `<svg>` with an explicit `viewBox="0 0 400 400"`.

### Token-Locked Palette Discipline (`3–4` Colors Max)
- Pull surface, ink, and focal tokens from `scripts/d27-deal.mjs` (never default to dark slate `#090B10` + safety orange `#FF5B1F`).
- Lock strictly **`3–4` functional colors**:
  1. **Primary Body (`--m-fill`):** Domain material hue (anodized cobalt, warm brass, ceramic sage, terracotta).
  2. **Body Shade / Bevel (`--m-shade`):** `12–18%` darker value for grounded underside depth.
  3. **Face / Visor Plate (`--m-screen`):** High-contrast neutral dark or light field (`>= 3:1` non-text contrast against `--m-fill`).
  4. **Expression / Cutout Ink (`--m-cut`):** Crisp luminous or deep ink (`>= 7:1` contrast against `--m-screen`).

### Five Material Finish Registers
Match the mascot's vector rendering grammar to the Material World dealt for the project:

1. **Crisp Geometric Vector:** Clean solid fills, `stroke-linecap="round"`, one sharp `6–8px` specular edge arc (`--m-hi`), zero muddy blurs. Ideal for developer tools, fintech, and hardware dashboards.
2. **Risograph Overprint:** Two or three flat soy-ink fills offset by `2–4` viewBox units on secondary planes, paired with a subtle `feTurbulence` paper grain overlay (`opacity: 0.04`).
3. **Tactile Clay / Vinyl:** Generous rounded radii (`rx="34–48"`), soft inner rim highlight, warm elliptical ground shadow, and matte low-chroma pastel/earth body tones.
4. **Editorial Woodcut:** Stark 2-ink positive/negative contrast (`90%+` solid ink vs. paper ground) with bold parallel hatch strokes (`stroke-width: 8–10`) clipped inside the shadow side.
5. **Technical Axonometric:** `45°` chamfered corners, `2px` hairline blueprint ticks/reticles around the stage, and `tabular-nums` coordinate annotations (`viewBox 0 0 400 400`).

---

## 4. Multi-State Pose & Expression Matrix

Never redraw the whole character per UI state. Keep `#chassis` and `#limbs` fixed and swap transforms or visibility on `#eyes` and `#signal`:

| State | `#eyes` Geometry / Transform | `#signal` Geometry / Motion | Use Case |
| :--- | :--- | :--- | :--- |
| **Idle** | Neutral open state + `4.8s` subtle `scaleY(0.1)` blink (`transform-box: fill-box`) | Calm steady pulse line with `pathLength="1"` glint sweep | Hero landing, model sheet |
| **Focused / Working** | Slightly narrowed `scaleY(0.75)` + `translateX(4px)` toward active UI target | Accelerated pulse frequency or active progress arc | Loading, syncing, verifying |
| **Alert / Error** | High-contrast warning chevron or raised asymmetric brow tilt | Sharp jagged peak wave + brief `180ms` horizontal micro-shake | Validation error, blocked check |
| **Verified / Success** | Upward happy arc (`^`) + wide catchlight | Smooth flatline-to-crest sweep ending in settled lock tick | Confirmation, completed build |

---

## 5. Interactive Model-Sheet HTML Showcase & Rigging Blueprint

This complete, zero-dependency blueprint demonstrates **Keykeep** (an *Encrypted Backup Sentry* built from a brass padlock housing + unlocked shackle crown + periscope keyhole eye — zero animal ears):
- Interactive `#groups` anatomy buttons isolate each `<g id="...">` on hover/focus (`opacity: 0.15` on sibling groups).
- Restrained character-true micro-motion (`transform-box: fill-box` eye blink + `pathLength="1"` signal glint) gated by `prefers-reduced-motion: reduce` and stripped on silhouettes.
- `64px / 32px / 16px` light & dark negative-space silhouette ladder using `--m-cut: var(--sil-bg)`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Keykeep — Mascot Model Sheet</title>
<style>
  :root {
    --stage-bg: #11161D;
    --panel-bg: #F3EFE6;
    --panel-tile: #E6DFD1;
    --ink: #151922;
    --muted: #505868;
    --muted-dark: #9BA5B4;
    --brass: #E5A93B;
    --mint: #7CE8C4;
    --display: "Avenir Next", "Inter", system-ui, sans-serif;
    --mono: ui-monospace, "SF Mono", Menlo, monospace;
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
  }
  * { box-sizing: border-box; margin: 0; }
  html { overflow-x: clip; }
  body {
    font-family: var(--display);
    background: var(--stage-bg);
    color: var(--panel-bg);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  :focus-visible { outline: 3px solid var(--brass); outline-offset: 3px; border-radius: 6px; }

  .sheet { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, 480px); min-height: 100vh; }
  .sheet > * { min-width: 0; }

  /* Hero Stage */
  .stage {
    position: relative;
    display: grid;
    place-items: center;
    padding: clamp(24px, 5vw, 56px);
    background-color: var(--stage-bg);
    background-image: radial-gradient(rgba(155, 165, 180, 0.16) 1.2px, transparent 1.4px);
    background-size: 28px 28px;
  }
  .stage svg.hero { width: min(100%, 74vh, 560px); height: auto; display: block; overflow: visible; }
  .stage figcaption {
    position: absolute; left: 24px; bottom: 18px;
    font: 500 12px/1 var(--mono); color: var(--muted-dark);
  }

  /* Token-Driven Mascot Paint */
  .m-fill   { fill: var(--m-fill, #E5A93B); }
  .m-fill-s { stroke: var(--m-fill, #E5A93B); fill: none; }
  .m-shade  { fill: var(--m-shade, #B47819); }
  .m-screen { fill: var(--m-screen, #0E131B); }
  .m-cut    { fill: var(--m-cut, #7CE8C4); }
  .m-cut-s  { stroke: var(--m-cut, #7CE8C4); fill: none; }
  .m-hi     { stroke: var(--m-hi, #FFD88A); fill: none; }
  .m-glint  { stroke: var(--m-glint, #EEFFF8); fill: none; }
  .m-shadow { fill: var(--m-shadow, rgba(0, 0, 0, 0.45)); }

  /* Character-True Micro-Motion (Hero only; IDs stripped from silhouette clones) */
  #eyes {
    transform-box: fill-box;
    transform-origin: center;
    animation: eye-blink 4.8s infinite;
  }
  @keyframes eye-blink {
    0%, 92%, 100% { transform: scaleY(1); }
    96% { transform: scaleY(0.12); }
  }
  #signal-glint {
    stroke-dasharray: 0.16 0.84;
    animation: signal-sweep 2.4s linear infinite;
  }
  @keyframes signal-sweep {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: -1; }
  }
  @media (prefers-reduced-motion: reduce) {
    #eyes, #signal-glint { animation: none; }
  }

  /* Interactive Anatomy Focus */
  .stage[data-focus] #mascot > g { opacity: 0.15; transition: opacity 220ms var(--ease); }
  .stage[data-focus="ground-shadow"] #ground-shadow,
  .stage[data-focus="limbs"] #limbs,
  .stage[data-focus="chassis"] #chassis,
  .stage[data-focus="screen"] #screen,
  .stage[data-focus="eyes"] #eyes,
  .stage[data-focus="signal"] #signal { opacity: 1; }
  .stage[data-focus="screen"] #eyes,
  .stage[data-focus="screen"] #signal { opacity: 0.35; }

  /* Model-Sheet Inspection Panel */
  .panel {
    background: var(--panel-bg);
    color: var(--ink);
    padding: clamp(24px, 4vw, 48px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 28px;
  }
  h1 { font-size: clamp(2.4rem, 4.5vw, 3.6rem); font-weight: 800; letter-spacing: -0.035em; line-height: 0.95; }
  .lede { margin-top: 10px; font-size: 1rem; line-height: 1.5; color: var(--muted); max-width: 36ch; }
  h2 { font-size: 0.95rem; font-weight: 800; margin-bottom: 12px; }
  .note { margin-top: 10px; font-size: 0.85rem; line-height: 1.45; color: var(--muted); }

  /* Negative-Space Cutout Silhouette Ladder */
  .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  .tile {
    --sil-ink: var(--ink);
    --sil-bg: var(--panel-tile);
    background: var(--sil-bg);
    color: var(--muted);
    border-radius: 14px;
    padding: 16px 12px 12px;
  }
  .tile.dark { --sil-ink: var(--panel-bg); --sil-bg: var(--stage-bg); color: var(--muted-dark); }
  .ladder { display: flex; align-items: flex-end; justify-content: center; gap: 14px; }
  .ladder figure { display: grid; justify-items: center; gap: 8px; }
  .ladder figcaption { font: 500 12px/1 var(--mono); font-variant-numeric: tabular-nums; }
  .sil {
    display: block;
    --m-fill: var(--sil-ink);
    --m-shade: var(--sil-ink);
    --m-screen: var(--sil-ink);
    --m-cut: var(--sil-bg);
    --m-hi: transparent;
    --m-glint: transparent;
    --m-shadow: transparent;
  }

  /* Anatomy Group Buttons */
  .groups { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
  .groups button {
    font: 600 12.5px/1 var(--mono);
    color: var(--ink);
    background: transparent;
    border: 1.5px solid var(--ink);
    border-radius: 999px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 180ms var(--ease), color 180ms var(--ease);
  }
  .groups button:hover,
  .groups button:focus-visible { background: var(--ink); color: var(--panel-bg); }

  @media (max-width: 880px) {
    .sheet { grid-template-columns: minmax(0, 1fr); }
    .stage svg.hero { width: min(100%, 84vw, 420px); }
  }
</style>
</head>
<body>
<main class="sheet">
  <figure class="stage" id="stage">
    <svg class="hero" viewBox="0 0 400 400" data-mascot role="img" aria-labelledby="m-title m-desc">
      <title id="m-title">Keykeep mascot</title>
      <desc id="m-desc">A brushed-brass padlock sentry with an unlocked U-shackle crown, key-tooth shoulder bolts, and a recessed slate visor displaying a keyhole eye, status bar, and checksum wave.</desc>
      <g id="mascot">
        <g id="ground-shadow">
          <ellipse class="m-shadow" cx="200" cy="370" rx="108" ry="11"/>
        </g>
        <g id="limbs">
          <!-- Spring-clip feet -->
          <rect class="m-shade" x="130" y="314" width="50" height="46" rx="14"/>
          <rect class="m-shade" x="220" y="314" width="50" height="46" rx="14"/>
          <!-- Asymmetric key-tooth arms -->
          <path class="m-fill" d="M96 196 H54 C44 196 40 206 44 216 L54 252 C58 262 72 262 76 250 L82 228 H96 Z"/>
          <path class="m-fill" d="M304 186 H342 C354 186 360 174 356 162 L344 128 C340 116 324 118 320 130 L314 156 H304 Z"/>
        </g>
        <g id="chassis">
          <!-- Asymmetric unlocked U-shackle (30% silhouette hook) -->
          <path class="m-fill-s" d="M140 122 V78 A60 60 0 0 1 260 78 V94" stroke-width="28" stroke-linecap="round"/>
          <!-- Primary chamfered lock body (70% mass) -->
          <rect class="m-shade" x="92" y="120" width="216" height="206" rx="34"/>
          <rect class="m-fill"  x="92" y="110" width="216" height="206" rx="34"/>
          <path class="m-hi" d="M104 164 V148 A26 26 0 0 1 130 122 H178" stroke-width="6" stroke-linecap="round"/>
        </g>
        <g id="screen">
          <rect class="m-screen" x="118" y="138" width="164" height="148" rx="24"/>
        </g>
        <g id="eyes">
          <!-- Left: periscope keyhole; Right: blinking ready bar -->
          <circle class="m-cut" cx="166" cy="184" r="18"/>
          <path class="m-cut" d="M159 196 L154 222 H178 L173 196 Z"/>
          <rect class="m-cut" x="214" y="176" width="38" height="16" rx="8"/>
        </g>
        <g id="signal">
          <path class="m-cut-s" d="M136 252 H172 L186 234 L200 266 L214 242 L226 252 H264" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
          <path id="signal-glint" class="m-glint" pathLength="1" d="M136 252 H172 L186 234 L200 266 L214 242 L226 252 H264" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    </svg>
    <figcaption>viewBox 0 0 400 400 · 6 semantic groups · cutout-ready</figcaption>
  </figure>

  <aside class="panel">
    <header>
      <h1>Keykeep</h1>
      <p class="lede">Encrypted backup sentry: brass padlock body, unlocked shackle hook, and a negative-space keyhole visor that holds crisp at 16 px.</p>
    </header>

    <section aria-labelledby="h-sil">
      <h2 id="h-sil">Negative-space silhouette ladder</h2>
      <div class="tiles">
        <div class="tile">
          <div class="ladder">
            <figure><svg class="sil" data-sil width="64" height="64" viewBox="0 0 400 400" role="img" aria-label="Keykeep dark silhouette at 64px"></svg><figcaption>64</figcaption></figure>
            <figure><svg class="sil" data-sil width="32" height="32" viewBox="0 0 400 400" aria-hidden="true"></svg><figcaption>32</figcaption></figure>
            <figure><svg class="sil" data-sil width="16" height="16" viewBox="0 0 400 400" aria-hidden="true"></svg><figcaption>16</figcaption></figure>
          </div>
        </div>
        <div class="tile dark">
          <div class="ladder">
            <figure><svg class="sil" data-sil width="64" height="64" viewBox="0 0 400 400" role="img" aria-label="Keykeep light silhouette at 64px"></svg><figcaption>64</figcaption></figure>
            <figure><svg class="sil" data-sil width="32" height="32" viewBox="0 0 400 400" aria-hidden="true"></svg><figcaption>32</figcaption></figure>
            <figure><svg class="sil" data-sil width="16" height="16" viewBox="0 0 400 400" aria-hidden="true"></svg><figcaption>16</figcaption></figure>
          </div>
        </div>
      </div>
      <p class="note">Eyes and signal wave invert via <code>--m-cut: var(--sil-bg)</code> — zero blind <code>brightness(0)</code> blobs.</p>
    </section>

    <section aria-labelledby="h-groups">
      <h2 id="h-groups">Anatomy groups</h2>
      <ul class="groups" id="groups">
        <li><button type="button" data-g="ground-shadow">#ground-shadow</button></li>
        <li><button type="button" data-g="limbs">#limbs</button></li>
        <li><button type="button" data-g="chassis">#chassis</button></li>
        <li><button type="button" data-g="screen">#screen</button></li>
        <li><button type="button" data-g="eyes">#eyes</button></li>
        <li><button type="button" data-g="signal">#signal</button></li>
      </ul>
      <p class="note">Hover or focus any pill to isolate that group on the stage.</p>
    </section>
  </aside>
</main>

<script>
  const src = document.getElementById('mascot');
  document.querySelectorAll('[data-sil]').forEach((svg) => {
    const clone = src.cloneNode(true);
    clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    clone.removeAttribute('id');
    svg.replaceChildren(clone);
  });

  const stage = document.getElementById('stage');
  document.querySelectorAll('#groups button').forEach((btn) => {
    const focus = () => { stage.dataset.focus = btn.dataset.g; };
    const clear = () => { delete stage.dataset.focus; };
    btn.addEventListener('pointerenter', focus);
    btn.addEventListener('focus', focus);
    btn.addEventListener('pointerleave', clear);
    btn.addEventListener('blur', clear);
  });
</script>
</body>
</html>
```

---

## 6. AI Image-Generation Character Lock Template (6-Block Slot Spec)

When generating raster mascot renders or 3D clay/vinyl turnarounds with an image model, keep all 6 slots strictly parameterized from the brief — never leave hardcoded animal species or fixed color hexes inside the template:

```text
[1. SPECIES / ARTIFACT]  Original brand character embodying [SPECIES/ARTIFACT] (fused from [NOUN_A_MEDIUM] + [NOUN_B_CUE], zero generic animal ears unless specified by brief).
[2. SIGNATURE HOOK]      Asymmetric [SIGNATURE HOOK] forming 30% of the outer silhouette so the character reads instantly facing right or left at 16px.
[3. MATERIAL FINISH]     [MATERIAL FINISH] surface treatment (e.g., matte molded vinyl / anodized metal / risograph soy ink), clean crisp edges, studio contact shadow.
[4. CORE PALETTE]        Strictly 3-4 locked colors: [PRIMARY_BODY_HEX], [SECONDARY_SHADE_HEX], [VISOR_PLATE_HEX], and [CUTOUT_ACCENT_HEX] with >= 3:1 body/face separation.
[5. EXPRESSION & POSE]   [POSE_ACTION] on a subtle 4-degree C-curve line of action, [EXPRESSION_MOOD] eyes and mouth, generous readable facial contrast.
[6. FRAMING & LIMITS]    Centered full-body three-quarter view inside a square 1:1 studio backdrop in [BACKDROP_TONE], crisp rim light, no text, no watermarks, no cluttered props.
```

---

## 7. Gestalt Perception, Optical Overshoot & `16px` Crispness Research

- **Gestalt Silhouette Parsing & Anti-Tangents:** Vision segments silhouettes at **negative minima of curvature**, favors **convex** figure regions (`57%–89%` of trials), and relies on proximity for `~75%` of grouping (`< 1.5×` competing gap ratio, `<= 90°` implied-closure turns; [Wagemans et al., 2012, *Psychological Bulletin*](https://pmc.ncbi.nlm.nih.gov/articles/PMC3482144/)). Eliminate kissing tangents with deliberate overlap ([Walt Stanchfield, *Drawn to Life*](https://thekeypoint.org/2025/10/12/drawn-to-life-20-golden-years-of-disney-master-classes/)).
- **Optical Weight Overshoot & Centroid Centering:** A circle requires **`112.84%`** ($\sqrt{4/\pi}$) of a square's width to match visual weight; equalize **convex hull area** and center asymmetric marks by **geometric centroid** rather than bounding box ([Bjango, *Formulas for Optical Adjustments*](https://bjango.com/articles/opticaladjustments/)).
- **Dedicated `16×16` Pixel-Grid Marks:** Downscaling a `24px` (`2px`-stroke) outline icon to `16px` spikes partial-alpha blur pixels from `37.9%–46.5%` to **`81.1%–98.4%`**; author dedicated `16×16` variants with odd strokes (`1px`) snapped to `.5` coordinates and even strokes (`2px`) on whole integers ([Icony](https://iconyapp.com/blog/fix-blurry-svg-icons); [Material System Icons](https://m2.material.io/design/iconography/system-icons.html)). Verified via `partialAlphaRatio` and `inkComponents` in `scripts/lib/pixel-audit.mjs`.
