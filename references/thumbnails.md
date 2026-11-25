# YouTube, Social & Cover Thumbnails Engineered for Instant Legibility

Load this module alongside `SKILL.md` whenever designing YouTube thumbnails, Open Graph share cards, Shorts/Reels covers, podcast artwork, newsletter headers, or editorial video covers. A thumbnail is not a print broadsheet or dense landing page — it is a single sub-second visual punchline.

---

## 1. Title + Thumbnail Curiosity-Gap Loop

Never design a thumbnail in isolation. Always pair and output the **Complementary Video / Article Title** alongside the artwork so the two form an interlocking curiosity-gap loop instead of repeating the same sentence twice:

- **The Thumbnail's Job:** Deliver the **visceral visual anomaly, before-after tension, or `0–4` word punchline** that stops a thumb mid-scroll.
- **The Title's Job:** Supply the **specific subject, constraint, and stakes** that explain *why* the visual tension matters.

### Hard Overlap & Word-Ceiling Laws
1. **Repeat `< 50%` of Title Words:** Thumbnail hook words must overlap with **fewer than half** of the paired title's words (`0%` overlap — zero shared content words — is strongest).
2. **`0–4` Word Ceiling (`thumbnail-word-ceiling`):** Use **`0` words** when the visual metaphor is self-explanatory, or **`1–4` punchy words max**. Hard fail at **`> 5` visible words** inside the primary thumbnail stage.

| Channel / Format | Weak (Repeats Title / Bloated) | Strong Paired Title (Context & Stakes) | Strong Thumbnail Hook (`< 50%` Overlap) | Overlap |
| :--- | :--- | :--- | :--- | :--- |
| **Engineering Benchmark** | *"How We Made Our Node CLI 14x Faster With Zero Dependencies"* | *Why I Rebuilt Our Build Pipeline in Pure Node (11s → 0.8s)* | **`ZERO BLOAT.`** + zoomed `11.2s → 0.8s` flamegraph | `0%` (`0/2` words) |
| **System Postmortem** | *"The Database Outage That Cost Us 4 Hours"* | *One Missing Index Took Down Checkout on Black Friday* | **`4 HOURS DOWN`** + red lock icon over `300%` CPU spike | `0%` (`0/3` words) |
| **Hardware Teardown** | *"Testing Three Budget Field Recorders Side by Side"* | *Can a $99 Field Recorder Beat a $1,200 Cinema Rig?* | **`$99` vs `$1,200`** + clean split waveform verdict | `25%` (`1/4` words) |
| **Visual Essay / Podcast** | *"Why Modern Software Feels Slower Than 1995"* | *The Latency Tax: Why Modern Apps Feel Sluggish on M4 Chips* | **`0` words** (1995 CRT cursor vs. spinning 2026 loader) | `0%` |

---

## 2. Sub-Second Comprehension, Gaze Vector & Separation

Viewers judge a thumbnail in **`200–500 milliseconds`** while scanning a mobile feed where the frame shrinks to **`160 × 90 px`** (`12.5%` scale).

### Hard 3-Element Ceiling & `160px` Squint Test
Count every distinct object inside the frame — you get **at most 3**:
1. **Element 1 — Primary Subject / Focal Artifact:** Tight face/mascot crop or macro-zoomed UI/hardware proof.
2. **Element 2 — Crisp Hook (`0–4` words) OR Graphic Contrast Cue:** Stacked power phrase, `× / ✓` split bar, or single directional callout.
3. **Element 3 — Simplified High-Contrast Background:** Clean studio gradient, blurred environment, or solid tonal field.
*(Delete any 4th object: extra company logos, secondary badges, bullet lists, or watermarks.)*

### Foreground–Background Separation & Macro Zoom
- **`>= 60%` Luminance Delta (or Warm/Cool Split):** Darken or lighten the background opposite your subject's tonal value, or split warm key tones against cool deep slates.
- **Directional `3–6px` Rim Light:** Carve a crisp colored edge highlight along the subject's shoulder, hair, or hardware bezel facing a contrasting backdrop. Avoid thick flat white "sticker borders" outside deliberate zine collage work.
- **Depth-of-Field Simplification:** Blur noisy environments (`Gaussian 8–14px`), drop background saturation `20–35%`, and seat a subtle radial spotlight behind the subject's upper third.
- **`250–400%` Macro UI / Waveform / Diff Zoom:** **Ban `1:1` full desktop screenshots** — full browser windows turn into unreadable grey lint at `160px`. Zoom `250–400%` onto ONE decisive metric, code diff, oscilloscope wave, or terminal output.

### Gaze Vector & Framing
- **Chest-Up / Tight Framing:** Faces and mascots fill **`30–45%`** of vertical frame height. Full-body standing figures shrink into unrecognizable dots in feeds.
- **Eyes on Upper Third (`y ≈ 33%`):** Align eyes along the top horizontal Rule-of-Thirds line.
- **Follow the Gaze Vector:** When the subject looks left or right rather than into the lens, place the `0–4` word hook or focal anomaly **directly along that line of sight**.
- **Calibrated Expression:** Match intensity to the brand — quiet shock, analytical focus, or crisp disbelief. Never default to exaggerated screaming faces on technical, documentary, or editorial channels.

### Thumbnail Typography Rules
| Metric | Hard Rule |
| :--- | :--- |
| **Word Count** | `0` words (pure visual metaphor) or **`1–4` words**. Hard fail **`> 5` words** (`thumbnail-word-ceiling`). |
| **Type Size** | Each line measures **`>= 16–24%`** of canvas height (`115–175px` tall on a `1280×720` stage). |
| **Face & Weight** | Heavy geometric/neo-grotesk sans (`800–900` weight) or condensed display. Zero light/thin weights (`<= 400`) or scripts. |
| **Leading & Accent** | Tight `line-height: 0.90–1.0`, max `1–2` stacked lines, **1 power word** highlighted in `--accent-focal`. |
| **Backing Contrast** | **`>= 7:1`** contrast via directional dark scrim, crisp solid block fill, or tight contact shadow (`0 6px 24px rgba(0,0,0,0.65)`). Never fuzzy neon blurs. |

---

## 3. Platform Dimensions & Hard Dead Zones

Platform UI overlays ruthlessly cover corner pixels. Treat dead zones as **unusable negative space**:

| Platform / Format | Canvas Size | Aspect | Hard Dead Zones & Safe Margins |
| :--- | :--- | :--- | :--- |
| **YouTube Standard** | `1280 × 720 px` (`<= 2 MB`) | `16:9` | **HARD DEAD ZONE — Bottom-Right (`x: 1000–1280, y: 590–720`, i.e. `x >= 78%` & `y >= 82%`)**: obscured by the `14:28` duration pill, queue/hover buttons, and bottom `14px` progress bar. Keep all text and focal subjects clear of this box (enforced by `thumbnail-deadzone-collision`) and inside a `64px` (`5%`) outer margin. |
| **Open Graph / X / LinkedIn** | `1200 × 630 px` | `1.91:1` | Keep subject + headline inside the central **`1040 × 510 px`** safe box to survive square and rounded feed crops. |
| **Shorts / Reels / TikTok** | `1080 × 1920 px` | `9:16` | Anchor subject + text inside the central **`1080 × 1080 px`** grid-safe square (`y: 420–1500`); leave `260px` clear at top and `360px` clear at bottom for player controls. |
| **Podcast / Substack Square** | `3000 × 3000 px` (min `1400px`) | `1:1` | Must read unmistakably at **`64 × 64 px`** app-icon scale (`0–3` bold words or single iconic emblem). |

---

## 4. High-Converting Spatial Archetypes

Choose **one** spatial split per thumbnail:
1. **Left Hook / Right Subject (`45% / 55%`):** Stacked `1–3` word headline anchored left (`x: 64–640`), chest-up subject/mascot or macro UI plate on right (`y: 64–565`) facing/pointing left toward the hook, leaving `x: 1000–1280, y: 590–720` quiet.
2. **Split Verdict (`50% / 50%` Before → After):** Crisp `4px` vertical divider (`×` vs. `✓`). Left half desaturated/warm-red failure state; right half high-contrast luminous solution. `0–2` words total.
3. **Hero Macro Artifact (`70%` Stage):** One `300%`-zoomed hardware dial, diff, or mascot filling upper/right stage + ONE 2-word top-left callout.
4. **Pure Visual Metaphor (`0` Words):** Stark object juxtaposition with dramatic studio lighting and zero typography.

---

## 5. Live Feed-Context Proof Blueprint (HTML `1280×720` + `160×90` Previewer)

Always verify HTML thumbnails inside real feed context before shipping. The blueprint below renders:
1. **Export-Ready `.yt-thumb[data-thumbnail]` Stage:** Uses `container-type: inline-size` (`1cqw = 12.8px` at `1280px` width) so it exports cleanly at exact **`1280 × 720 px`** while scaling proportionally on smaller screens, keeping both the headline and `300%`-zoomed terminal proof well clear of `x: 1000–1280, y: 590–720`.
2. **Live `160×90px` Mobile / Sidebar Feed Context Strip:** Clones the exact `.thumb-layers` into real **`160 × 90 px`** Dark (`#0F0F0F`) and Light (`#FFFFFF`) YouTube cards overlaid with the **`14:28` duration pill**, bottom red progress bar, and **paired video title** — proving squint legibility and dead-zone clearance at a glance.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thumbnail Feed-Context Proof</title>
<style>
  :root {
    --page-bg: #14171D;
    --page-ink: #F2F4F8;
    --page-muted: #9BA3B4;
    --yt-dark: #0F0F0F;
    --yt-dark-ink: #F1F1F1;
    --yt-dark-sub: #AAAAAA;
    --yt-light: #FFFFFF;
    --yt-light-ink: #0F0F0F;
    --yt-light-sub: #606060;
    --accent-focal: #FFB020;
    --display: "Inter Tight", "Avenir Next", system-ui, sans-serif;
    --mono: ui-monospace, "SF Mono", Menlo, monospace;
  }
  * { box-sizing: border-box; margin: 0; }
  html { overflow-x: clip; }
  body {
    background: var(--page-bg);
    color: var(--page-ink);
    font-family: var(--display);
    padding: clamp(20px, 4vw, 48px);
    -webkit-font-smoothing: antialiased;
  }
  .workspace { max-width: 1280px; margin: 0 auto; display: grid; gap: 36px; }
  .workspace > * { min-width: 0; }

  .meta-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 12px; }
  .meta-head h1 { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
  .meta-head p { font: 500 0.875rem/1.4 var(--mono); color: var(--page-muted); }

  /* 1. Export-Ready 1280x720 Stage (container-scaled via cqw; 100cqw = 1280px at full export width) */
  .yt-thumb {
    position: relative;
    width: 100%;
    max-width: 1280px;
    aspect-ratio: 16 / 9;
    container-type: inline-size;
    overflow: hidden;
    border-radius: 14px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  }
  .thumb-layers {
    position: relative;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 74% 42%, rgba(255, 176, 32, 0.24), transparent 46%),
      linear-gradient(108deg, #0B0F17 50%, #162133 100%);
    font-family: var(--display);
  }
  /* Left Hook: x = 64..640 (5cqw..50cqw), completely clear of bottom-right dead zone */
  .text-zone {
    position: absolute;
    left: 5cqw;
    top: 50%;
    transform: translateY(-50%);
    max-width: 45cqw;
    z-index: 2;
  }
  .thumb-hook {
    margin: 0;
    font-size: 12.65cqw; /* 162px at 1280px = 22.5% of 720px height */
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -0.035em;
    color: #F7F7F5;
    display: flex;
    flex-direction: column;
    text-shadow: 0 0.5cqw 2cqw rgba(0, 0, 0, 0.72);
  }
  .thumb-hook .accent { color: var(--accent-focal); }

  /* Right 300% Macro Artifact: x = 716..1216, y = 64..563 (clears y >= 590 dead zone) */
  .macro-plate {
    position: absolute;
    right: 5cqw;
    top: 5cqw;
    width: 39cqw;
    height: 39cqw;
    z-index: 1;
    border-radius: 2.2cqw;
    background: #101724;
    border: 0.32cqw solid var(--accent-focal); /* 4px directional rim separation */
    box-shadow: 0 2cqw 4cqw rgba(0, 0, 0, 0.65);
    padding: 3cqw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .macro-metric { font: 800 6.4cqw/0.95 var(--mono); color: #6EF3C5; font-variant-numeric: tabular-nums; }
  .macro-sub { font: 600 2.4cqw/1.2 var(--mono); color: #9FB0C9; }
  .macro-bars { display: grid; gap: 1.8cqw; }
  .bar-old { height: 2.6cqw; width: 92%; border-radius: 1cqw; background: #4B5567; }
  .bar-new { height: 2.6cqw; width: 14%; border-radius: 1cqw; background: var(--accent-focal); }

  /* Optional Safe-Zone Debug Guide (hidden by default; toggleable) */
  .deadzone-box {
    display: none;
    position: absolute;
    left: 78.125%;
    top: 81.94%;
    right: 0;
    bottom: 0;
    border: 2px dashed #FF4D4F;
    background: rgba(255, 77, 79, 0.18);
    z-index: 5;
    pointer-events: none;
  }
  .yt-thumb.show-dz .deadzone-box { display: block; }

  .controls { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .controls button {
    font: 600 0.85rem/1 var(--mono);
    color: var(--page-ink);
    background: #202633;
    border: 1px solid #3A4356;
    border-radius: 8px;
    padding: 10px 14px;
    cursor: pointer;
  }
  .controls button:hover, .controls button:focus-visible { border-color: var(--accent-focal); }

  /* 2. Live 160x90 Mobile / Sidebar Feed Context Strip */
  .feed-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 20px; }
  .feed-card {
    border-radius: 14px;
    padding: 16px;
    display: grid;
    grid-template-columns: 160px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }
  .feed-card.dark { background: var(--yt-dark); color: var(--yt-dark-ink); border: 1px solid #272727; }
  .feed-card.light { background: var(--yt-light); color: var(--yt-light-ink); }

  .feed-thumb {
    position: relative;
    width: 160px;
    height: 90px;
    container-type: inline-size;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .feed-pill {
    position: absolute;
    right: 5px;
    bottom: 6px;
    background: rgba(15, 15, 15, 0.88);
    color: #FFFFFF;
    font: 600 11px/1.1 system-ui, sans-serif;
    font-variant-numeric: tabular-nums;
    padding: 2px 5px;
    border-radius: 4px;
    z-index: 4;
  }
  .feed-progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.28);
    z-index: 4;
  }
  .feed-progress::before {
    content: "";
    display: block;
    width: 38%;
    height: 100%;
    background: #FF0033;
  }
  .feed-meta h2 { font-size: 0.95rem; font-weight: 700; line-height: 1.3; margin-bottom: 6px; }
  .feed-meta p { font-size: 0.8rem; line-height: 1.35; }
  .feed-card.dark .feed-meta p { color: var(--yt-dark-sub); }
  .feed-card.light .feed-meta p { color: var(--yt-light-sub); }
</style>
</head>
<body>
<main class="workspace">
  <header class="meta-head">
    <h1>Paired Title: Why I Rebuilt Our Build Pipeline in Pure Node (11s → 0.8s)</h1>
    <p>Hook: ZERO BLOAT. (2 words · 0% title overlap)</p>
  </header>

  <!-- Primary 1280x720 Export Stage (3 visual elements max: hook + macro bar plate + clean backdrop) -->
  <div class="yt-thumb" id="thumbnail-canvas" data-thumbnail data-title="Why I Rebuilt Our Build Pipeline in Pure Node (11s to 0.8s)">
    <div class="thumb-layers" id="thumb-master">
      <div class="text-zone">
        <p class="thumb-hook"><span>ZERO</span><span class="accent">BLOAT.</span></p>
      </div>
      <div class="macro-plate" aria-hidden="true">
        <div class="macro-bars">
          <div class="bar-old"></div>
          <div class="bar-new"></div>
        </div>
        <div class="macro-metric">0.8s</div>
      </div>
    </div>
    <div class="deadzone-box" aria-hidden="true"></div>
  </div>

  <div class="controls">
    <button type="button" id="toggle-dz">Toggle 1000–1280 × 590–720 Dead-Zone Overlay</button>
  </div>

  <!-- Live 160x90 Mobile / Sidebar Feed Context Strip -->
  <section class="feed-strip" aria-label="160 by 90 feed context previews">
    <article class="feed-card dark">
      <div class="feed-thumb" data-feed-thumb>
        <span class="feed-pill">14:28</span>
        <span class="feed-progress" aria-hidden="true"></span>
      </div>
      <div class="feed-meta">
        <h2>Why I Rebuilt Our Build Pipeline in Pure Node (11s → 0.8s)</h2>
        <p>Systems Lab · 142K views · Dark Feed (#0F0F0F)</p>
      </div>
    </article>

    <article class="feed-card light">
      <div class="feed-thumb" data-feed-thumb>
        <span class="feed-pill">14:28</span>
        <span class="feed-progress" aria-hidden="true"></span>
      </div>
      <div class="feed-meta">
        <h2>Why I Rebuilt Our Build Pipeline in Pure Node (11s → 0.8s)</h2>
        <p>Systems Lab · 142K views · Light Feed (#FFFFFF)</p>
      </div>
    </article>
  </section>
</main>

<script>
  const master = document.getElementById('thumb-master');
  document.querySelectorAll('[data-feed-thumb]').forEach((slot) => {
    const clone = master.cloneNode(true);
    clone.removeAttribute('id');
    slot.prepend(clone);
  });
  document.getElementById('toggle-dz').addEventListener('click', () => {
    document.getElementById('thumbnail-canvas').classList.toggle('show-dz');
  });
</script>
</body>
</html>
```

---

## 6. Image-Generation Prompt Pattern (Zero-Text Photographic / Illustrated Plate)

Generate photographic or 3D-illustrated subject plates **without baked-in AI text**, then composite razor-sharp vector typography inside the left or upper safe zone:

```text
[COMPOSITION] 16:9 widescreen thumbnail frame, tight chest-up framing of [SUBJECT] anchored on the right third (x: 55%–94%, y: 10%–78%), eyes aligned on the upper third line (y ≈ 33%), looking left toward open negative space.
[EXPRESSION]  Authentic focused curiosity or calibrated disbelief (no default open-mouthed screaming).
[SEPARATION]  Crisp warm key light on subject face, directional 4px cool cyan rim light separating shoulder and hair contour from a simplified deep charcoal backdrop (f/1.8 shallow bokeh, uncluttered left half).
[STYLE]       Editorial studio photography, 50mm lens, crisp eye catchlights, >= 60% foreground-background luminance separation.
[CONSTRAINTS] Zero baked-in text, zero watermarks, zero extra icons; keep bottom-right corner (x: 78%–100%, y: 82%–100%) quiet dark negative space for the duration pill.
```

---

## 7. Cognitive Psychology & Empirical CTR Grounding

- **13 ms Gist & 50 ms Aesthetic Gate:** Humans extract conceptual scene meaning at **13 ms** ([Potter et al., 2014](https://pubmed.ncbi.nlm.nih.gov/24374558/)), and **50 ms** aesthetic judgments tightly track **500 ms** evaluations ([Lindgaard et al., 2006](https://www.tandfonline.com/doi/abs/10.1080/01449290500330448)). Always audit downscaled at `160×90`–`320×180`.
- **2-of-3 Pre-Attentive Saliency Channels:** Separate the focal subject from ground on at least **2 of 3** visual saliency channels—**intensity (luminance)**, **color opponency**, and **orientation** ([Itti, Koch, & Niebur, 1998](https://www.cse.psu.edu/~rtc12/CSE597E/papers/Itti_etal98pami.pdf); [Itti & Koch, 2001](https://pubmed.ncbi.nlm.nih.gov/11256080/)).
- **Reflexive Gaze Cueing (`105–300 ms`):** Nonpredictive eye gaze shifts viewer attention involuntarily within **105 ms** and triggers stronger right-TPJ attentional expectation than symbolic arrows ([Friesen & Kingstone, 1998](http://wexler.free.fr/library/files/friesen%20(1998)%20the%20eyes%20have%20it!%20reflexive%20orienting%20is%20triggered%20by%20nonpredictive%20gaze.pdf); [Callejas et al., 2014](https://academic.oup.com/scan/article/10/2/294/1656170)).
- **Optimal Information Gap & Expression Data:** Pair Title + Thumbnail with `< 40%` Jaccard token overlap so neither closes the curiosity gap alone ([Loewenstein, 1994](https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf); [Veritasium](https://youtu.be/S2xHZPH5Sng)); closed-mouth expressions beat open-mouth **30/30** times in MrBeast A/B testing ([Social Media Today](https://www.socialmediatoday.com/news/youtube-shares-insights-mrbeasts-team-creates-compelling-thumbnail/709817/)).
