# Motion Graphics, Product Videos, Kinetic Typography & UI Choreography

Load this module alongside `SKILL.md` whenever animating interfaces, directing product launch videos, building kinetic typography, designing interactive micro-transitions, or coding scenes in CSS, GSAP, Framer Motion, Remotion, or Manim.

---

## 1. Translating Disney's Principles into Digital & Editorial Motion

Animation is **choreographed meaning**, never decorative jitter. Translate classic physical principles into crisp contemporary UI and motion-graphics discipline:

| Principle | Studio Translation (UI & Motion Graphics) | Avoid (Slop) |
| :--- | :--- | :--- |
| **Staging** | One focal action commands the frame at a time. Dim, blur, or freeze peripheral elements during a primary reveal so the eye never splits. | Five sections fading, sliding, and bouncing simultaneously on load. |
| **Anticipation** | Subtle `2–4%` press compression (`80–100ms`) on tap/click, or a tiny `6–10px` counter-shift before a decisive whip-in. | Abrupt teleporting or exaggerated cartoon wind-ups on serious enterprise UI. |
| **Squash & Stretch** | Reserve elastic volume deformation (`scale(1.05, 0.95)`) strictly for **Tactile Playful** brands and mascots. Use zero-overshoot deceleration for Swiss, Technical, Dark, and Luxury directions. | Rubbery bouncing modals on a financial terminal or editorial essay. |
| **Follow-Through & Overlap** | Lead object arrives first (`t = 0`), supporting headline lands `+45ms` later, hairline/meta resolves `+90ms` later. Gives weight without feeling slow. | Rigid cardboard blocks moving together as one welded slab. |
| **Slow In / Slow Out** | Physical objects accelerate and decelerate. Never use `linear` easing for spatial movement, scale, or fades (reserve `linear` strictly for continuous progress bars, timers, tickers, and infinite spinners). | `transition: all 0.3s linear` or generic browser `ease`. |
| **Arcs** | Floating badges, cursors, mascots, and shared-element morphs travel on gentle curved trajectories rather than mechanical horizontal-then-vertical L-paths. | Stiff robotic X/Y axis stepping. |
| **Secondary Action** | Tiny reinforcing beats — an arrow nudging `+3px` on hover, a `1px` rule drawing left-to-right under a landed headline — never louder than the hero beat. | Confetti explosions or floating particles competing with the core message. |

---

## 2. Easing Curve & Spring Physics Library

Lock **one primary motion personality** per project from Stage 1's Aesthetic Direction. Never mix bouncy cartoon springs with luxury slow-drifts in the same product.

### CSS / GSAP Cubic-Bezier Tokens
| Token Name | Curve | Feel & Best Use |
| :--- | :--- | :--- |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | **Workhorse entrance & reveal.** Explosive decisive launch, silky precision settle. Fits Swiss, Atmospheric Dark, Editorial, Technical. |
| `--ease-in-out-quint` | `cubic-bezier(0.65, 0, 0.35, 1)` | **Camera pans, layout morphs, luxury transitions.** Poised S-curve acceleration and deceleration. |
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` | **Fast utilitarian UI controls** (dropdowns, hover states, tabs). Crisp with shorter tail than expo. |
| `--ease-in-exit` | `cubic-bezier(0.4, 0, 1, 1)` | **Exits & dismissals.** Accelerates cleanly out of frame; run **20–30% faster** than the corresponding entrance. |
| `--ease-overshoot` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | **Tactile playful accents & mascot pops only.** Use sparingly at small travel distances (`<= 16px`). |

### Spring Physics Presets (Framer Motion / Remotion / SwiftUI)
| Preset | Parameters (`stiffness`, `damping`, `mass`) | Feel |
| :--- | :--- | :--- |
| **Crisp UI Snap** | `stiffness: 400, damping: 32, mass: 0.8` | Zero mush, immediate tactile feedback for toggles, pills, micro-panels. |
| **Weighted Editorial** | `stiffness: 220, damping: 30, mass: 1.0` | Critically damped authority for drawers, sheets, full cards, Remotion hero stages. |
| **Playful Mascot** | `stiffness: 320, damping: 18, mass: 0.9` | Controlled lively settle with subtle bounce for characters, tactile UI pops, and celebratory beats. |

---

## 3. Duration Budgets & Stagger Cadence

Speed signals competence. Sluggish `1.2s` UI fades feel broken; frantic `60ms` flashes feel glitchy.

| Interaction / Motion Tier | Duration Budget | Hard Rules |
| :--- | :--- | :--- |
| **Micro-Interactions** (hover, focus, press, toggle, tooltip) | `120–200ms` | Instant response; never block user input waiting for animation to finish. |
| **UI Transitions** (modals, drawers, tab switches, route morphs) | `250–450ms` | Exits run at `0.7×` enter duration (e.g., `320ms` in → `220ms` out). Keep travel distance tight (`12–28px`, never `200px` fly-ins across the viewport). |
| **Hero Choreography & Editorial Reveals** | `500–900ms` total sequence | Overlap steps (`-40%` to `-60%` offset) so the whole hero finishes feeling unified under `0.9s`. |
| **Stagger Cadence** | `30–60ms` per item | **Hard Total Stagger Cap: `350ms`!** For any `count >= 2`, cap interval with `Math.min(350 / Math.max(count - 1, 1), 45)ms` (or stagger only visible viewport items) so long lists never trail in seconds late. |

---

## 4. Kinetic Typography Rules

Type in motion must stay **effortlessly legible** while expressing physical cadence:

1. **Masked Baseline Reveals Over Generic Fades:** Wrap each text line in an `overflow: hidden` mask and lift characters/lines upward (`translateY(108%) → 0%`) using `--ease-out-expo`. Crisp, architectural, zero floaty ghosting.
2. **Optical Reading Hold Floor (Video):** Keep every headline or typographic beat cleanly legible for at least **`1.2s + 0.35s × wordCount`** (e.g., a 4-word punchline needs `>= 2.6s` on screen including settle hold). Never flash unreadable 0.4-second sentences unless deliberately building a rapid rhythmic montage of single words.
3. **GPU-Composited Properties Only:** Animate ONLY `transform` (`translate3d`, `scale`, `rotate`), `opacity`, and `clip-path`. Never animate `width`, `height`, `top`, `left`, `margin`, `font-size`, or `letter-spacing` on live browser text (causes layout thrash and subpixel jitter).
4. **Motion Blur & Contrast Discipline:** In video renders (Remotion/After Effects), apply subtle shutter-angle blur (`90°–120°`) on rapid whip pans only — keep resting kinetic type razor sharp.

---

## 5. Scene-Transition Grammar & Beat / Audio Sync (Product Videos)

Edit product films like a Buck or Apple launch spot — every cut earns its existence through spatial continuity or rhythmic contrast.

### Transition Grammar
- **Hard Cut:** Primary tool (70%+ of cuts). Creates confident pace when cutting between distinct scales (macro UI → close-up detail) or contrasting color surfaces.
- **Match Cut (Highest Craft):** Align the shape, position, or velocity of an element leaving Scene A with the incoming focal point of Scene B (e.g., a button expands cleanly into the next screen's frame).
- **Scale-Through / Z-Axis Push:** Zoom seamlessly into a focused UI card or diagram node to reveal its internal mechanics.
- **Directional Mask / Rule Wipe:** A clean vertical or horizontal hairline sweeps across the canvas, revealing the inverted dark/light state behind it.
- **Banned transitions:** Generic cross-dissolves between busy screens (creates muddy ghost frames), 3D cube spins, page curls, or random slide directions.

### Audio, Beat Sync & Broadcast Safe Zones (`Frame.md` Discipline)
- **Frames Per Beat:** **`framesPerBeat = (60 / BPM) × FPS`** (e.g., `120 BPM` at `30fps` = `15 frames/beat`; at `60fps` = `30 frames/beat`).
- **Pre-Hit Lead Rule:** Land major visual impacts **`1–2 frames` (~16–33ms) BEFORE or exact ON the audio transient**. Visuals slightly leading sound feel razor-tight; visuals lagging `2+ frames` behind sound feel sloppy.
- **J-Cuts & L-Cuts:** Let audio lead (`J-cut`, `4–10 frames` early) or trail (`L-cut`) across scene cuts on dedicated audio tracks so edits feel cinematic instead of abruptly chopped on visual boundaries.
- **Breathing Beats:** Insert `0.4–0.7s` of clean visual hold ("visual silence") right before the product hero reveal so the climax hits with contrast.
- **Broadcast Safe Boxes (`1920 × 1080`):** Web design tokens must adapt for the camera — keep active visuals inside the **90% Action-Safe Box** (`96px` horizontal / `54px` vertical inset) and all kinetic titles/captions inside the **80% Title-Safe Box** (`192px` horizontal / `108px` vertical inset).

### Deterministic Code-Video Render Contract (Remotion / HyperFrames / Manim)
When rendering programmatic video frame-by-frame in headless browsers or render engines, every frame MUST be a pure, deterministic function of timeline time:
- **Zero Non-Deterministic State:** Never use `Date.now()`, unseeded `Math.random()`, `setInterval`, `requestAnimationFrame` drift, live network fetches, or infinite CSS/GSAP `repeat: -1` loops.
- **No Transform Collisions:** Never combine a CSS `transform` rule with GSAP/JS transforms on the same DOM element, and never tween `display` or `visibility` on timed clip wrappers (animate a child element instead).
- **Pre-Measure Dynamic Text:** Measure dynamic headings and captions against container bounds before rendering (e.g., Remotion text measurement or explicit `max-width` + `text-wrap: balance`) so variable-length copy never overflows safe zones mid-render.
- **Pre-Production Discipline (>15s Films):** Pitch 2–3 concise structural angles in words first, then lock a frame-accurate Beat Sheet (`SPEC`) where every adjective is translated into a concrete number (BPM, frame count, easing curve, pixel inset).
- **Dynamic Duration Probing:** Never blindly hardcode `durationInFrames` or `data-duration` when driving off voiceover or video clips — compute timeline duration dynamically from probed media metadata (e.g., Remotion `calculateMetadata` + audio duration) so narration never clips mid-word or hangs on dead frames.

### Audio Mix, Captions & Camera Pacing Budgets
- **Loudness & VO Ducking:** Master web/YouTube exports to **`-14 LUFS`** (`-16 LUFS` mobile/social) with **`-1 dBTP`** true-peak ceiling. Duck music beds **`-12` to `-18 dB`** underneath voiceover with `150–300ms` attack/release envelopes on dedicated audio tracks.
- **Executable Two-Pass Linear FFmpeg Mastering & Full Rec.709 Export (`1-1-1` Color Tags):**
  ```bash
  # Pass 1: Duck music under VO (-14dB sidechain) & measure integrated loudness JSON (no pumping)
  ffmpeg -i render.mp4 -i vo.wav -i music.wav \
    -filter_complex "[2:a][1:a]sidechaincompress=threshold=0.03:ratio=6:attack=180:release=280[bed];[1:a][bed]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11:print_format=json" \
    -f null -

  # Pass 2: Apply measured linear gain + full 1-1-1 Rec.709 tags + GOP/VBV + CFR (-fps_mode cfr)
  ffmpeg -y -i render.mp4 -i vo.wav -i music.wav \
    -filter_complex "[2:a][1:a]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=350[bed];[1:a][bed]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9:measured_I=<I>:measured_TP=<TP>:measured_LRA=<LRA>:measured_thresh=<TH>:linear=true[aout]" \
    -map 0:v -map "[aout]" -fps_mode cfr -r 30 -c:v libx264 -profile:v high -level 4.1 -crf 16 \
    -g 60 -keyint_min 60 -sc_threshold 0 -maxrate 10M -bufsize 20M -pix_fmt yuv420p \
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart \
    -c:a aac -b:a 192k -ar 48000 -shortest master.mp4

  # Transparent editing intermediate (ProRes 4444 alpha)
  ffmpeg -y -framerate 30 -i frames/%05d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -vendor apl0 overlay.mov
  ```
- **Caption Timing, Styled ASS Burn-In & `9:16` Vertical Safe Zones:** Run `node scripts/d27-captions.mjs words.json --fps 30 --aspect 9:16 --format ass --validate` (or `--format srt` / `json`) to turn Whisper/ElevenLabs word-level JSON into frame-locked cues with active-word accent highlights, CPS (`<= 17`) & reading-hold (`0.5s + 0.3s * words`, final line `>= 2.0s`) validation, and burn in via `ffmpeg -i in.mp4 -vf "ass=captions.ass" -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a copy out.mp4`.
- **Beat-Boundary Contact Sheets & `sweep_static` QC:** Run `node scripts/d27-frames.mjs sheet master.mp4 --beats 0,1.5,3.0 --out sheet.png` and `node scripts/d27-frames.mjs audit master.mp4 --max-static 3.0` to mechanically fail frozen 3s+ holds and blank frames.
- **Anti-Slop Motion Banlist & Seam-Ease Contract:** Ban idle breathing/floating/pulsing loops on titles/UI, post-land title creep, elastic bounce on UI cards, synthetic click rings, and uniform fade-up-on-every-scene. Mirror eases across matched cuts (`power3.in` exit → `power3.out` entry) and always use `gsap.fromTo()` inside seekable scenes so backward scrubbing never drifts.
- **Shot-Duration Pacing, Overlap Math & FPS-Scaled Settle Budgets:** Land the visual hook inside **`0–2.0s`**, hold primary shots **`1.5–4.0s`**, and stage **at most 1 primary focal motion per beat**. Compensate overlapping transitions explicitly: **`totalFrames = sum(sceneFrames) - sum(overlapFrames)`**. Scale spring settle budgets by frame rate — **`>= 0.8–1.1s` (`Math.round(fps * 0.9)` frames)** before any hard cut so 24fps, 30fps, and 60fps never clip mid-overshoot.
- **Multi-Aspect Reflow Topology (`16:9` ↔ `9:16` ↔ `1:1`):** Never just shrink a `16:9` split-screen with `Math.min(w, h)` — define explicit **topology swaps**: `16:9` horizontal asymmetric split reflows to a `9:16` vertical stack (visual anchored in upper 55%, headline + captions inside central safe zone clear of `260px` top / `360px` bottom / `140px` right social chrome) with focal-point `object-position` cropping.

### Modern Web Motion Primitives (CSS & React)
- **CSS Scroll-Driven Reveals:** Gate native scroll progress with `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)` so unsupported browsers render cleanly at full opacity.
- **View Transitions & Interruptible Physics:** Use `document.startViewTransition()` for crisp route/state morphs and Framer Motion (`AnimatePresence` + `layoutId`) for interruptible UI transitions. Never scatter permanent `will-change: transform` across static containers (wastes GPU memory).

---

## 6. Storyboard-to-Implementation Patterns

Always draft a compact **Beat Sheet** in Stage 2 before writing animation code *(example synced to `120 BPM` at `30fps` = `15 frames/beat`, `60 frames` per 4/4 bar)*:

| Beat / Bar | Time / Frame (`30fps`) | Visual Action & Framing | Kinetic Type | Transition | Audio Cue |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01 Hook** (Bar 1, 4 beats) | `0.0s–2.0s` (`0–60`) | Full dark canvas; single `1px` rule draws across center | Masked 2-word tension hook rises from rule (`1.9s` hold) | Hard cut on Bar 2 (`f59`) | Deep sub-pulse + crisp click |
| **02 Reveal** (Bars 2–3, 8 beats) | `2.0s–6.0s` (`60–180`) | Rule expands vertically into live product window (`scaleY` + `clip-path`) | Eyebrow + 4-word value prop locks top-left (`2.8s` hold) | Match cut into hero card (`f179`) | Soft airy rise + chime |
| **03 Proof** (Bars 4–5, 8 beats) | `6.0s–10.0s` (`180–300`) | Camera pushes `1.45×` into core interaction; cursor arcs to button, clicks with `90ms` anticipation | Callout highlights result (`tabular-nums` counter) | Directional rule wipe (`f299`) | Tactile mechanical click |
| **04 End Card** (Bars 6–7, 8 beats) | `10.0s–14.0s` (`300–420`) | Clean inverted paper surface; logo mark + wordmark settle with `45ms` overlap | Single URL / CTA holds `2.8s` | Crisp expo settle | Clean tail resonance |

### Implementation Patterns

**1. CSS Masked Kinetic Reveal (Descender-Safe + Reduced Motion Gate)**
```css
/* Padding/negative-margin pair protects g, j, p, q, y descenders at tight 0.96–1.05 display leading */
.line-mask {
  overflow: hidden;
  display: block;
  padding-bottom: 0.14em;
  margin-bottom: -0.14em;
}
.line-inner {
  display: block;
  transform: translate3d(0, 110%, 0);
  animation: line-rise 680ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms) forwards;
}
@keyframes line-rise {
  to { transform: translate3d(0, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .line-inner { animation: none; transform: none; }
}
```

**2. GSAP Choreographed Hero Timeline (Strictly Under `900ms` Budget + Reduced Motion)**
```js
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // Total sequence completes at 0.85s (within 500–900ms hero choreography budget)
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from(".hero-rule",  { scaleX: 0, transformOrigin: "left center", duration: 0.42 }, 0)
    .from(".hero-line",  { yPercent: 112, duration: 0.56, stagger: 0.045 }, 0.08)
    .from(".hero-deck",  { y: 16, opacity: 0, duration: 0.48 }, 0.24)
    .from(".hero-media", { clipPath: "inset(10% 0% 0% 0%)", scale: 1.03, duration: 0.62 }, 0.23);
});
```

**3. Remotion Frame-Accurate Masked Baseline Reveal (Spring-Driven, Zero Linear Fade)**
```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const BeatReveal = ({ startFrame = 15 }: { startFrame?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Critically damped Weighted Editorial spring; leave extrapolateRight unclamped if reusing with overshoot springs
  const progress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { stiffness: 220, damping: 30, mass: 1 },
  });

  const translatePercent = interpolate(progress, [0, 1], [112, 0]);

  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em" }}>
      <h1 style={{ margin: 0, transform: `translate3d(0, ${translatePercent}%, 0)` }}>
        Design with Intent.
      </h1>
    </div>
  );
};
```

**4. Manim Editorial Mathematical Choreography**
```python
from manim import *

class EditorialReveal(Scene):
    def construct(self):
        self.camera.background_color = "#0B0C10"
        rule = Line(LEFT * 5, RIGHT * 5, stroke_width=1.5, color="#2D313B")
        title = Text("ZERO CLUTTER", font="IBM Plex Sans", weight=BOLD).scale(1.2).next_to(rule, UP, buff=0.45)  # Open font default; swap to Stage 3 --font-display
        items = VGroup(*[Dot(radius=0.08, color="#E85D2A") for _ in range(5)]).arrange(RIGHT, buff=0.6).next_to(rule, DOWN, buff=0.6)

        self.play(Create(rule), run_time=0.55, rate_func=rate_functions.ease_out_expo)
        self.play(FadeIn(title, shift=UP * 0.35), run_time=0.6, rate_func=rate_functions.ease_out_expo)
        self.play(LaggedStart(*[GrowFromCenter(d) for d in items], lag_ratio=0.12), run_time=0.55)
        self.wait(1.9)
```

**5. HyperFrames Seekable HTML + GSAP Composition (Deterministic Frame-by-Frame Video)**
```html
<!-- 1920x1080 @ 30fps | Paused timeline registered on window.__timelines for deterministic seeks -->
<div id="stage" data-composition-id="launch" data-start="0" data-duration="4" data-width="1920" data-height="1080">
  <!-- 80% Title-Safe Box: inset 108px 192px -->
  <div class="clip" id="title-wrap" data-start="0" data-duration="4" data-track-index="0"
       style="position:absolute; inset:108px 192px; display:flex; align-items:center; overflow:hidden;">
    <h1 id="title-inner" style="margin:0; font:800 84px/1.02 'Inter Tight', sans-serif; color:#ECEEF2;">
      DESIGN WITH INTENT.
    </h1>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    // Animate child (#title-inner), never display/visibility on .clip; zero repeat: -1
    tl.from("#title-inner", { yPercent: 112, duration: 0.65, ease: "expo.out" }, 0.2);
    window.__timelines = window.__timelines || {};
    window.__timelines.launch = tl;
  </script>
</div>
```
