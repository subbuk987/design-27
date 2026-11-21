# YouTube, Social & Cover Thumbnails Engineered for Instant Legibility

Load this module alongside `SKILL.md` whenever designing YouTube thumbnails, Open Graph share images, Shorts/Reels covers, podcast artwork, newsletter banners, or course/article cover cards.

---

## 1. Sub-Second Comprehension & The 3-Element Ceiling

Viewers evaluate a thumbnail in **`200–500 milliseconds`** while scanning a dense mobile feed where the artwork renders as small as **`160 × 90 px`**. A thumbnail is not a miniature poster — it is a single visual punchline.

### Non-Negotiable Structural Laws
1. **Hard 3-Element Ceiling:** Count every distinct visual object in the frame. You get **at most 3**:
   - **Element 1:** Primary Subject / Focal Artifact (face, product object, mascot, zoomed UI proof)
   - **Element 2:** Crisp Text Hook (`0–4 words`) OR Graphic Contrast Cue (bold arrow, before/after divider, glowing highlight ring)
   - **Element 3:** Simplified High-Contrast Background
   - *Any 4th element (extra logos, second badge, bullet list, secondary person, watermark) must be deleted.*
2. **The 160px Silhouette & Squint Test:** Shrink the finished `1280×720` canvas to `160px` wide (`12.5%` scale — matching mobile feed thumbnails). If you cannot immediately read the text, recognize the subject's silhouette, and grasp the emotional tension in under 1 second, enlarge the subject `20–35%` and delete background clutter.
3. **Never Repeat the Title Verbatim:** The thumbnail creates **visual curiosity or emotional tension**; the adjacent video/article title delivers the **context and payoff**. Repeating a 9-word video title inside the thumbnail wastes precious pixels and kills intrigue.

---

## 2. Foreground–Background Separation

Flat thumbnails vanish into white and dark-mode feeds alike. Force at least a **`>= 60%` luminance delta** OR strong warm-vs-cool chromatic separation between subject and background.

- **Depth-of-Field Simplification:** Blur detailed rooms/environments (`Gaussian 8–14px`), drop background saturation `20–35%`, and darken/lighten the background opposite the subject's tonal value.
- **Directional Rim Light (Studio Polish):** Add a crisp `3–6px` colored edge highlight along the subject's contour facing a contrasting background hue (e.g., warm amber rim against deep teal background). Avoid uniform thick flat white "sticker outlines" unless explicitly working in a **Retro / Zine** collage aesthetic.
- **Spotlight Vignette:** Place a subtle radial light pool behind the primary subject's head/shoulders or hero object to separate dark hair/clothing from a dark background.
- **No 1:1 Screenshot Soup:** Never paste a full desktop screenshot into a thumbnail — text turns into illegible grey dust. Zoom **`250–400%`** into ONE dramatic metric, code diff, waveform, or interface panel, crop cleanly, and give it crisp elevation.

---

## 3. Expression, Gaze-Line & Directional Framing

- **Crop Tight:** For human faces or brand mascots, frame **head-and-shoulders or chest-up** so the face fills `30–45%` of vertical frame height. Full-body standing portraits become microscopic ants on mobile feeds.
- **Eyes Anchor the Upper Third:** Align the subject's eyes near the upper horizontal Rule-of-Thirds line (`y ≈ 33%` from top).
- **Follow the Gaze Vector:** When the subject looks left or right (instead of straight into the lens), place the **object of curiosity or text hook along that exact line of sight**. Viewers instinctively track where eyes point.
- **Calibrated Expression:** Match expression intensity to the brand's Creative Brief — focused intensity, quiet astonishment, triumphant clarity, or playful surprise. Never default to open-mouthed clickbait screaming on refined editorial, technical, or documentary channels.

---

## 4. Thumbnail Typography Rules (`0–4` Words Max)

| Metric | Hard Rule |
| :--- | :--- |
| **Word Count** | **`0` words** (pure visual metaphor — strongest when self-explanatory) OR **`1–4` punchy words max**. Hard reject at `>= 6` words. |
| **Type Size** | Each line of display text must measure **`>= 16–24%` of total canvas height** (e.g., `115–175px` tall on a `1280×720` YouTube canvas). |
| **Face & Weight** | Heavy geometric/neo-grotesk sans (`800–900` weight), bold condensed display, or high-impact editorial serif. Never use thin/light weights (`<= 400`) or script fonts. |
| **Leading & Stacking** | Tight `line-height: 0.90–1.0`. Stack into 1–2 bold lines max; highlight **1 single power word** in `--accent-focal` (e.g., bone white + signal yellow/vermilion). |
| **Backing Contrast** | Ensure `>= 7:1` contrast via a directional dark scrim behind text, clean solid editorial tape/block fill, or subtle tight contact drop shadow (`0 6px 24px rgba(0,0,0,0.65)`) — never fuzzy muddy glows. |

---

## 5. Platform Dimensions & Overlay Safe Zones

Respect platform UI chrome ruthlessly — nothing screams amateur louder than a YouTube timestamp covering your punchline.

| Platform / Format | Canvas Size | Aspect | Critical Dead Zones & Safe Margins |
| :--- | :--- | :--- | :--- |
| **YouTube Standard** | `1280 × 720 px` (`<= 2 MB`) | `16:9` | **HARD DEAD ZONE — Bottom-Right (`x: 1000–1280, y: 590–720`)**: covered by duration pill (`14:28`), queue buttons, and bottom `14px` red progress bar. Keep all text, faces, subjects, and logos inside a `64px` outer safe margin and completely clear of the bottom-right dead zone. |
| **Open Graph / X / LinkedIn Card** | `1200 × 630 px` | `1.91:1` | Keep focal subject + headline inside central **`1040 × 510 px`** safe area to survive square/rounded social feed crops and platform badges. |
| **Shorts / Reels / TikTok Cover** | `1080 × 1920 px` | `9:16` | Place primary subject + text inside the **central `1080 × 1080 px` square** (`y: 420–1500`) so `1:1` profile grids never decapitate faces or clip words. Keep `260px` clear at top and `360px` clear at bottom for UI overlays. |
| **Podcast / Album / Substack Square** | `3000 × 3000 px` (min `1400px`) | `1:1` | Must remain unmistakable at **`64 × 64 px`** app-icon scale; max 2–3 bold words or clean iconic emblem. |

---

## 6. High-Converting Archetypes & Production Specs

Choose ONE clean spatial split:
1. **Left Hook / Right Subject (`45% / 55%`):** Bold 2–3 word stacked headline anchored left (`x: 64–580`), tight chest-up subject/mascot on right looking slightly left toward the headline; bottom-right dead zone (`x: 1000–1280, y: 590–720`) holds only quiet dark background or non-essential blurred edge.
2. **Split Verdict (`50% / 50%` Before → After):** High-contrast vertical divide (`4px` crisp bar or `× / ✓` indicator). Left side desaturated/broken/red-tinted; right side crisp, luminous, resolved. `0–2` words total.
3. **Hero Artifact Zoom:** One oversized physical product, mascot, or `300%`-zoomed graph filling `70%` of the frame on a studio-lit gradient/solid field + ONE 2-word tension callout anchored top-left.
4. **Pure Visual Metaphor (`0` Words):** Stark object juxtaposition (e.g., tiny handcrafted paper boat facing a towering architectural wave) with museum-grade lighting and zero text clutter.

### Production Pattern — YouTube `1280×720` Safe-Zone & Composition Blueprint (HTML/CSS)

```html
<!-- Render at exact 1280x720 (e.g., headless Chromium / Satori / Playwright screenshot) -->
<!-- Strict 3 elements: (1) Simplified background stage, (2) 2-word hook, (3) Hero artifact -->
<div class="yt-thumb">
  <div class="bg-stage"></div>
  <div class="text-zone">
    <h1><span>ZERO</span><span class="accent">BLOAT.</span></h1>
  </div>
  <!-- Spans x: 720..1216, y: 64..560 -> clears 64px outer margin AND y: 590..720 timestamp dead zone -->
  <img class="subject" src="hero-artifact.png" alt="" />
</div>

<style>
  .yt-thumb {
    position: relative; width: 1280px; height: 720px; overflow: hidden;
    background: #0D0F14; font-family: "Inter Tight", "Helvetica Neue", sans-serif;
  }
  .bg-stage {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 76% 43%, rgba(255, 138, 76, 0.22), transparent 48%),
                linear-gradient(105deg, #0D0F14 52%, #171C26 100%);
  }
  /* Strictly anchored inside 64px outer margin; 162px line height = 22.5% of 720px canvas */
  .text-zone {
    position: absolute; left: 64px; top: 50%; transform: translateY(-50%);
    max-width: 580px; z-index: 2;
  }
  h1 {
    margin: 0; font-size: 162px; font-weight: 900; line-height: 0.9;
    letter-spacing: -0.035em; color: #F7F7F5; display: flex; flex-direction: column;
    text-shadow: 0 6px 24px rgba(0, 0, 0, 0.65);
  }
  /* #FF8A4C on #0D0F14 = 8.2:1 contrast (clears >= 7:1 thumbnail floor) */
  h1 .accent { color: #FF8A4C; }
  .subject {
    position: absolute; right: 64px; top: 64px;
    width: 496px; height: 496px; object-fit: contain; z-index: 1;
    filter: drop-shadow(0 24px 44px rgba(0, 0, 0, 0.62));
  }
</style>
```

### Image-Generation Prompt Pattern (Zero-Text Photography / Illustration Layer)
Generate clean photographic or illustrated plates **WITHOUT baked-in AI text**, then composite sharp vector typography over the safe zone:
```text
[COMPOSITION] 16:9 widescreen thumbnail frame, tight chest-up framing of [SUBJECT] positioned cleanly on the right third (x: 55%–95%), eyes aligned on upper third line, looking left toward open negative space.
[EXPRESSION] Authentic focused curiosity, raised eyebrow, subtle confident half-smile (no exaggerated screaming).
[LIGHTING & SEPARATION] Crisp warm key light on face, subtle cool cyan rim light separating shoulder/hair contour from deep muted charcoal studio background (shallow f/1.8 bokeh, clean uncluttered dark left half reserved for typography).
[STYLE] Editorial commercial photography, 50mm lens, rich skin texture, sharp eye catchlights, high foreground-background contrast.
[CONSTRAINTS] No text, no watermarks, no icons, no cluttered room details, keep bottom-right corner quiet dark negative space.
```
