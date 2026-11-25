# Motion Design: Launch Films, 2.5D Camera Rigs & Deterministic Code Video (`v4.0.0`)

Load this module alongside `SKILL.md` whenever directing product launch videos, building standalone HTML scrubbable motion pieces, authoring kinetic typography, or rendering deterministic code video in Remotion, HyperFrames, GSAP, or Manim.

> **Emotion levers ([`emotion-science.md`](emotion-science.md) §0; study codes in [`emotion-evidence.md`](emotion-evidence.md)):** Lock the Emotional Target first. Kinematics carry the emotion (M1); one peak per scene, and the lockup hold is the designed end (S3, M2).

> **Scope Boundary — Live App UI vs. Launch Motion:** For live web/app UI micro-interactions, `<300ms` popover physics, trigger-anchored `transform-origin`, Frequency Test budgets, and `document.startViewTransition()` state morphs, load [`references/animations.md`](references/animations.md). This module is dedicated 100% to **programmatic launch films, kinetic typography, 2.5D camera choreography, and deterministic frame-accurate rendering**.

---

## 1. Standalone HTML Scrubbable Motion Contract (`index.html` Launch Pieces)

Every standalone HTML motion piece MUST run as a **pure, deterministic, zero-dependency timeline**—never a loose pile of CSS keyframe timers or `setInterval` loops. Every visual property on screen is a pure mathematical function `renderAt(frame)` of the discrete integer frame `0..TOTAL_FRAMES`.

### Hard Architectural Rules
1. **Zero Non-Deterministic State:** Never call `Math.random()`, `Date.now()`, `performance.now()` inside visual calculation, or unpaused infinite CSS/GSAP `repeat: -1` loops. Use a seeded PRNG (`mulberry32(seed)`) so frame `142` renders identically on every seek, refresh, and headless capture.
2. **Studio Player Chrome:** Every standalone HTML motion piece includes a compact bottom studio bar with:
   - `Play / Pause` toggle (`Space` shortcut + `aria-pressed`)
   - Draggable `<input type="range">` timeline scrubber (`0..TOTAL_FRAMES`)
   - `0.00s / 5.00s` `font-variant-numeric: tabular-nums` timecode readout
   - `←` / `→` single-frame stepping (`Shift + ←/→` jumps `10` frames)
3. **Reduced-Motion Hero Lockup:** When `matchMedia("(prefers-reduced-motion: reduce)").matches` is true on load, start **paused directly on `HERO_LOCKUP_FRAME`** (inside the final resting lockup) so the viewer sees the crisp final composition immediately while still retaining manual scrubber control.
4. **Headless Frame-Stepping Hook (`window.__d27Seek`):** Expose `window.__d27Seek = (sec) => ...` (alongside `window.__d27Meta`) so `scripts/d27-frames.mjs` can step the timeline in headless Chrome and stitch exact beat-boundary PNG contact sheets before any `.mp4` render.
5. **Mandatory Final Lockup Hold (`>= 1.2s` / Final `20–25%`):** Reserve at least the final `20–25%` of the timeline (minimum `1.2s`, e.g., frames `225–300` of a `300`-frame `60fps` piece) where the brand mark, primary headline, and CTA rest rock-steady with **zero late drift, zero breathing loops, and zero layout shifts**.

### Copy-Ready Reference Contract (`300` Frames @ `60fps` = `5.00s`)

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Deterministic Launch Piece</title>
  <style>
    :root {
      --bg: #0c0e12;
      --surface: #151922;
      --ink: #f3f5f8;
      --muted: #98a2b3;
      --accent: #38bdf8;
      --rule: rgba(243, 245, 248, 0.14);
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0; height: 100%; background: #07080b; color: var(--ink);
      font-family: "IBM Plex Sans", system-ui, sans-serif;
      display: grid; grid-template-rows: 1fr auto; overflow: hidden;
    }
    .viewport {
      position: relative; width: 100%; height: 100%; overflow: hidden;
      background: var(--bg); perspective: 1200px;
      display: grid; place-items: center;
    }
    .camera-rig {
      position: relative; width: min(92vw, 1120px); aspect-ratio: 16 / 9;
      transform-style: preserve-3d;
    }
    .plane { position: absolute; inset: 0; transform-style: preserve-3d; }
    .plane-bg {
      border: 1px solid var(--rule);
      background: radial-gradient(circle at 50% 42%, rgba(56, 189, 248, 0.12), transparent 62%);
    }
    .plane-hero {
      display: grid; place-content: center; text-align: center; padding: 6%;
    }
    .plane-fg {
      pointer-events: none; display: flex; justify-content: space-between;
      align-items: flex-start; padding: 24px 28px;
      font: 500 12px/1 "IBM Plex Mono", ui-monospace, monospace;
      letter-spacing: 0.08em; color: var(--muted);
    }
    .line-mask { overflow: hidden; padding-bottom: 0.14em; margin-bottom: -0.14em; }
    .hero-title {
      margin: 0; font-size: clamp(2.2rem, 5.4vw, 4.5rem);
      font-weight: 700; line-height: 0.96; letter-spacing: -0.03em;
    }
    .rule-wipe {
      width: 240px; height: 2px; margin: 20px auto; background: var(--accent);
      transform-origin: left center;
    }
    .lockup-cta {
      display: inline-block; margin-top: 8px; padding: 10px 20px;
      border: 1px solid var(--accent); color: var(--ink); font-size: 14px;
      font-weight: 600; letter-spacing: 0.04em; text-decoration: none;
    }
    .wave-canvas { width: 100%; height: 76px; display: block; margin-top: 18px; }
    .studio-bar {
      display: grid; grid-template-columns: auto 1fr auto; align-items: center;
      gap: 16px; padding: 12px 20px; background: var(--surface);
      border-top: 1px solid var(--rule);
    }
    .studio-btn {
      background: transparent; color: var(--ink); border: 1px solid var(--rule);
      padding: 6px 14px; font: 600 12px/1.2 inherit; cursor: pointer;
    }
    .studio-scrubber { width: 100%; accent-color: var(--accent); cursor: pointer; }
    .lockup-cta:focus-visible,
    .studio-btn:focus-visible,
    .studio-scrubber:focus-visible {
      outline: 2px solid var(--accent-focal, var(--accent));
      outline-offset: 2px;
    }
    .studio-readout {
      font: 500 12px/1 "IBM Plex Mono", ui-monospace, monospace;
      font-variant-numeric: tabular-nums; color: var(--muted); min-width: 12ch; text-align: right;
    }
  </style>
</head>
<body>
  <main class="viewport" aria-label="Launch motion canvas">
    <div class="camera-rig" id="cameraRig">
      <div class="plane plane-bg" id="planeBg"></div>
      <div class="plane plane-fg" id="planeFg">
        <span>CH-01 // DETERMINISTIC</span>
        <span id="telemetryTime">T+0.000</span>
      </div>
      <div class="plane plane-hero" id="planeHero">
        <div class="line-mask"><h1 class="hero-title" id="heroTitle">ZERO DRIFT AUDIO.</h1></div>
        <div class="rule-wipe" id="ruleWipe"></div>
        <svg class="wave-canvas" id="waveSvg" viewBox="0 0 640 76" aria-hidden="true"></svg>
        <div id="ctaWrap"><a class="lockup-cta" href="#start">START CAPTURE</a></div>
      </div>
    </div>
  </main>

  <footer class="studio-bar" aria-label="Motion playback controls">
    <button class="studio-btn" id="playBtn" type="button" aria-pressed="true">Pause</button>
    <input class="studio-scrubber" id="scrubber" type="range" min="0" max="300" step="1" value="0" aria-label="Timeline scrubber" />
    <div class="studio-readout" id="readout">0.00s / 5.00s</div>
  </footer>

  <script>
    const FPS = 60;
    const TOTAL_FRAMES = 300;        // 5.00s @ 60fps
    const LOCKUP_START_FRAME = 225;  // Final 25% (1.25s) rock-steady lockup hold
    const DURATION_SEC = TOTAL_FRAMES / FPS;

    // Seeded deterministic PRNG (zero Math.random / Date.now)
    function mulberry32(seed) {
      let a = seed >>> 0;
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp01(t)));
    const easeInOutQuint = (t) => {
      const x = clamp01(t);
      return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    };
    const seg = (frame, start, end) => clamp01((frame - start) / Math.max(1, end - start));

    // Pre-generate deterministic organic waveform amplitudes once from fixed seed
    const rng = mulberry32(270400);
    const BAR_COUNT = 48;
    const barSeeds = Array.from({ length: BAR_COUNT }, (_, i) => {
      const env = Math.sin((i / (BAR_COUNT - 1)) * Math.PI);
      return 0.18 + env * (0.35 + rng() * 0.47);
    });

    const waveSvg = document.getElementById("waveSvg");
    const waveBars = barSeeds.map((_, i) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(16 + i * 12.8));
      rect.setAttribute("width", "6");
      rect.setAttribute("rx", "2");
      rect.setAttribute("fill", "#38bdf8");
      waveSvg.appendChild(rect);
      return rect;
    });

    const els = {
      rig: document.getElementById("cameraRig"),
      bg: document.getElementById("planeBg"),
      fg: document.getElementById("planeFg"),
      title: document.getElementById("heroTitle"),
      rule: document.getElementById("ruleWipe"),
      cta: document.getElementById("ctaWrap"),
      telemetry: document.getElementById("telemetryTime"),
      playBtn: document.getElementById("playBtn"),
      scrubber: document.getElementById("scrubber"),
      readout: document.getElementById("readout"),
    };

    let currentFrame = 0;
    let playing = false;
    let lastTs = null;
    let accMs = 0;

    function renderAt(rawFrame) {
      const f = Math.max(0, Math.min(TOTAL_FRAMES, Math.round(rawFrame)));
      currentFrame = f;
      const sec = f / FPS;

      // Motion finishes by LOCKUP_START_FRAME (f225); f225..300 is rock-steady hold
      const camDolly = easeInOutQuint(seg(f, 0, LOCKUP_START_FRAME));
      const scale = lerp(1.0, 1.12, camDolly);
      const rotY = lerp(-2.2, 0, camDolly);
      const rotX = lerp(1.4, 0, camDolly);

      els.rig.style.transform = `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1) rotateX(${rotX.toFixed(3)}deg) rotateY(${rotY.toFixed(3)}deg)`;
      els.bg.style.transform = `translate3d(${(rotY * 4).toFixed(2)}px, ${(rotX * -3).toFixed(2)}px, -140px)`;
      els.fg.style.transform = `translate3d(${(rotY * -7).toFixed(2)}px, ${(rotX * 5).toFixed(2)}px, 70px)`;

      // Beat 1: Title masked rise (f12..f68)
      const titleP = easeOutExpo(seg(f, 12, 68));
      els.title.style.transform = `translate3d(0, ${lerp(112, 0, titleP).toFixed(2)}%, 0)`;

      // Beat 2: Rule draw (f54..f108)
      const ruleP = easeOutExpo(seg(f, 54, 108));
      els.rule.style.transform = `scaleX(${ruleP.toFixed(4)})`;

      // Beat 3: Deterministic waveform swell & lock (f80..f205)
      const waveP = easeOutExpo(seg(f, 80, 170));
      const settleP = easeOutExpo(seg(f, 170, LOCKUP_START_FRAME));
      waveBars.forEach((bar, i) => {
        const harmonic = f >= LOCKUP_START_FRAME ? 1 : 0.85 + 0.15 * Math.sin((f * 0.14) + i * 0.42);
        const h = Math.max(4, barSeeds[i] * 68 * waveP * lerp(harmonic, 1, settleP));
        bar.setAttribute("y", ((76 - h) / 2).toFixed(2));
        bar.setAttribute("height", h.toFixed(2));
      });

      // Beat 4: CTA entrance before hold (f175..f225)
      const ctaP = easeOutExpo(seg(f, 175, LOCKUP_START_FRAME));
      els.cta.style.opacity = ctaP.toFixed(3);
      els.cta.style.transform = `translate3d(0, ${lerp(14, 0, ctaP).toFixed(2)}px, 0)`;

      els.telemetry.textContent = `T+${sec.toFixed(3)}`;
      els.scrubber.value = String(f);
      els.readout.textContent = `${sec.toFixed(2)}s / ${DURATION_SEC.toFixed(2)}s`;
    }

    function setPlaying(next) {
      playing = next;
      els.playBtn.textContent = playing ? "Pause" : "Play";
      els.playBtn.setAttribute("aria-pressed", String(playing));
      lastTs = null;
    }

    function tick(ts) {
      if (playing) {
        if (lastTs !== null) {
          accMs += ts - lastTs;
          const stepMs = 1000 / FPS;
          while (accMs >= stepMs) {
            accMs -= stepMs;
            if (currentFrame >= TOTAL_FRAMES) {
              setPlaying(false);
              break;
            }
            renderAt(currentFrame + 1);
          }
        }
        lastTs = ts;
      }
      /* d27-disable-next-line: no-nondeterministic-video — interactive preview transport only; renderAt(frame) + __d27Seek are pure frame functions */
      requestAnimationFrame(tick);
    }

    els.playBtn.addEventListener("click", () => {
      if (!playing && currentFrame >= TOTAL_FRAMES) renderAt(0);
      setPlaying(!playing);
    });
    els.scrubber.addEventListener("input", (e) => {
      setPlaying(false);
      renderAt(Number(e.target.value));
    });
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target !== els.playBtn) {
        e.preventDefault();
        if (!playing && currentFrame >= TOTAL_FRAMES) renderAt(0);
        setPlaying(!playing);
      } else if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        const delta = (e.code === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 1);
        renderAt(currentFrame + delta);
      }
    });

    // Headless contact-sheet contract for scripts/d27-frames.mjs
    window.__d27Meta = { fps: FPS, totalFrames: TOTAL_FRAMES, duration: DURATION_SEC };
    window.__d27Seek = (sec) => {
      setPlaying(false);
      const clamped = Math.max(0, Math.min(DURATION_SEC, Number(sec) || 0));
      const frame = Math.round(clamped * FPS);
      renderAt(frame);
      return { frame, sec: frame / FPS };
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderAt(reduced ? LOCKUP_START_FRAME : 0);
    setPlaying(!reduced);
    /* d27-disable-next-line: no-nondeterministic-video — interactive preview transport only; renderAt(frame) + __d27Seek are pure frame functions */
    requestAnimationFrame(tick);
  </script>
</body>
</html>
```

---

## 2. 2.5D Camera Rig & Multi-Plane Parallax

Never build launch pieces as flat static boxes fading in and out on a `z = 0` pancake. Give scenes physical lens depth with a 3-plane `<div class="camera-rig">`.

### Rig Geometry & Safe Tilt Bounds
- **Stage Perspective:** Set `perspective: 1200px` on `.viewport` (`overflow: hidden`). Values under `700px` warp typography excessively; values over `2000px` flatten parallax.
- **Z-Axis Dolly Push:** Drive `.camera-rig` smoothly from `scale3d(1.0, 1.0, 1)` to `scale3d(1.22–1.36, 1.22–1.36, 1)` during hero product beats using `--ease-in-out-quint` or deterministic `easeInOutQuint`.
- **Subtle Camera Drift:** Limit `rotateX` / `rotateY` to **`±1.5°` to `±3.5°`** so text remains crisp and readable without nausea.
- **3 Depth Planes (Differential Parallax):**

| Plane | Z-Offset | Parallax Multiplier | Contents |
| :--- | :--- | :--- | :--- |
| **Background** (`.plane-bg`) | `translateZ(-180px)` | `0.45×` camera translation | Subtle radial gradient, grid rules, atmospheric watermark |
| **Hero Artifact** (`.plane-hero`) | `translateZ(0px)` | `1.0×` (locked to rig) | Primary product window, kinetic headline, focal waveform/diagram |
| **Foreground Telemetry** (`.plane-fg`) | `translateZ(+90px)` | `1.35×` camera translation | Framing reticles, corner timecode, callout pills (kept outside title-safe center) |

### Directional `clip-path` Rule Wipes & Velocity-Matched Cuts
- **Rule-Synchronized Wipe:** Sweep a `1px–2px` accent hairline across the frame (`scaleX(0 → 1)` or `translateX(-100% → 0%)`) while revealing the incoming layer via `clip-path: inset(0 (1-p)*100% 0 0)` on the exact same progress curve `p`. The eye reads a single physical mechanical shutter.
- **Velocity-Matched Cuts (Match Cuts):** When cutting from Scene A to Scene B at frame `f_cut`:
  1. Exit Scene A with an accelerating curve (`easeInQuad` / `power3.in`) over `6–10` frames.
  2. Enter Scene B on the same vector/scale axis with a decelerating curve (`easeOutExpo` / `power3.out`) over `12–18` frames.
  3. Match outgoing and incoming instantaneous velocity at `f_cut` so motion feels continuous across the cut.

---

## 3. Translation Principles, Easing Tokens & Kinetic Typography

### Studio Translation of Classic Motion Principles

| Principle | Launch Film & Motion-Graphics Execution | Avoid (Slop) |
| :--- | :--- | :--- |
| **Staging** | One focal action commands the frame at a time. Dim or freeze peripheral layers during a primary reveal. | Five panels fading, sliding, and scaling simultaneously. |
| **Anticipation** | A tight `6–10px` counter-shift or `80–100ms` `2–4%` compression right before a decisive whip-in. | Abrupt teleporting or cartoonish rubber wind-ups on technical brands. |
| **Follow-Through & Overlap** | Lead object lands at `t = 0`, supporting headline lands `+45ms` later, hairline/telemetry resolves `+90ms` later. | Rigid blocks welded together moving on identical keyframes. |
| **Slow In / Slow Out** | Never use `linear` for spatial motion, scale, or fades. Reserve `linear` strictly for continuous timecodes, progress bars, and constant camera pans. | `transition: all 0.3s linear` or default browser `ease`. |
| **Arcs** | Cursors, callout badges, and shared-element morphs travel along gentle quadratic arcs instead of stepped X-then-Y L-paths. | Robotic Manhattan right-angle jumps. |

### Easing & Spring Library
| Token / Preset | Definition | Use Case |
| :--- | :--- | :--- |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Workhorse headline and mask reveals; decisive launch, silky settle. |
| `--ease-in-out-quint` | `cubic-bezier(0.65, 0, 0.35, 1)` | Camera dolly pushes, pan transitions, full-frame morphs. |
| `--ease-in-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Outgoing cuts; run `20–30%` faster than corresponding entrances. |
| **Weighted Editorial Spring** | `stiffness: 220, damping: 30, mass: 1.0` | Critically damped authority for Remotion hero stages and cards. |
| **Playful Mascot Spring** | `stiffness: 320, damping: 18, mass: 0.9` | Controlled lively settle for character pops only. |

### Kinetic Typography Rules
1. **Masked Baseline Reveals Over Generic Fades:** Wrap each text line in an `overflow: hidden` mask with `padding-bottom: 0.14em; margin-bottom: -0.14em;` (protects `g, j, p, q, y` descenders at `0.94–1.05` display leading) and lift `translate3d(0, 110%, 0) → translate3d(0, 0, 0)`.
2. **Optical Reading Hold Floor:** Keep every kinetic headline legible for at least **`1.2s + 0.35s × wordCount`** (e.g., a 4-word claim requires `>= 2.6s` on screen including its settle hold).
3. **GPU-Composited Properties Only:** Animate only `transform`, `opacity`, and `clip-path`. Never animate `width`, `height`, `top`, `left`, `margin`, `font-size`, or `letter-spacing` on live text.
4. **Resting Sharpness:** Apply directional shutter blur (`90°–120°`) only during fast whip pans inside video renders; keep resting type razor sharp.

---

## 4. Beat Sync, Safe Zones, Overlap Math & Reflow Topology

### Audio, Beat Sync & Broadcast Safe Boxes
- **Frames Per Beat:** **`framesPerBeat = (60 / BPM) × FPS`** (e.g., `120 BPM` at `30fps` = `15 frames/beat`; at `60fps` = `30 frames/beat`).
- **Pre-Hit Lead Rule:** Land major visual impacts **`1–2 frames` (~16–33ms) BEFORE or exact ON the audio transient**. Visuals lagging `2+ frames` behind sound feel sloppy.
- **J-Cuts & L-Cuts:** Let audio lead (`J-cut`, `4–10 frames` early) or trail (`L-cut`) across scene cuts on dedicated tracks so edits flow cinematically.
- **Breathing Beats:** Insert `0.4–0.7s` of clean visual silence before the product climax so contrast hits hard.
- **Broadcast Safe Boxes (`1920 × 1080`):** Keep active visuals inside the **90% Action-Safe Box** (`96px` horizontal / `54px` vertical inset) and all kinetic titles inside the **80% Title-Safe Box** (`192px` horizontal / `108px` vertical inset).

### Story Spine & Script (before any keyframe)
- **Four-beat spine:** Beat 1 shows the viewer's broken status quo, the hook. Beat 2 is the turn, where the product enters. Beat 3 is the proof: the SMP shown, not said. Beat 4 is the new world, with a one-verb CTA on the lockup. Surprise lives *inside* a beat (an anomaly, a reveal). The order itself stays predictable, so viewers can anticipate (`emotion-evidence.md` S1).
- **VO and super budget:** at most `2.5` spoken words per second, and one claim per beat. On-screen supers must not repeat the VO word for word.
- **Campaign line:** the lockup line is the web hero line. The thumbnail hook is Beat 1 (`d27-deal --campaign`).

### Shot Pacing, Overlap Math & Anti-Slop Banlist
- **Hook & Hold Floors:** Land the visual hook inside **`0–2.0s`**, hold primary shots **`1.5–4.0s`**, and stage **at most 1 primary focal motion per beat**.
- **Overlap Compensation:** Always compute timeline length from scene overlaps:
  **`totalFrames = sum(sceneFrames) - sum(overlapFrames)`**
- **FPS-Scaled Settle Budget:** Allocate **`>= Math.round(fps * 0.9)` frames (`~0.8–1.1s`)** before any hard cut so `24fps`, `30fps`, and `60fps` renders never clip mid-overshoot.
- **Anti-Slop Motion Banlist:** Ban idle breathing/floating/pulsing loops on titles or UI, post-land title creep during the final lockup hold, elastic bounce on serious UI frames, synthetic mouse-click rings, and repeating uniform fade-ups on every scene.

### Multi-Aspect Topology Swaps (`16:9` ↔ `9:16` ↔ `1:1`)
Never shrink a `16:9` horizontal split-screen with `Math.min(w, h)`. Define explicit **topology swaps**:
- **`16:9` Landscape → `9:16` Vertical (`1080 × 1920`):** Reflow horizontal splits into a vertical stack with the primary visual anchored in the **upper `55%`** (`y: 260px–1050px`), headline and captions centered inside the **social-safe box** clear of **`260px` top**, **`360px` bottom**, and **`140px` right** platform UI chrome, and focal-point `object-position` cropping on video/UI plates.
- **`16:9` → `1:1` Square (`1080 × 1080`):** Tighten horizontal margins to `96px`, swap 3-column callouts to `1` dominant visual + `1` bottom-anchored headline mask.

---

## 5. Multi-Engine Deterministic Patterns (Remotion, HyperFrames, GSAP, Manim)

Always lock a **Beat Sheet** before writing code *(example at `120 BPM`, `30fps` = `15 frames/beat`)*:

| Beat / Bar | Time / Frame (`30fps`) | Visual Action & Camera | Kinetic Type | Transition | Audio Cue |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01 Hook** (Bar 1) | `0.0s–2.0s` (`0–60`) | Dark canvas; `1px` rule draws across center, `1.05×` Z-push | Masked 2-word tension hook rises from rule (`1.9s` hold) | Hard cut (`f59`) | Deep sub-pulse + click |
| **02 Reveal** (Bars 2–3) | `2.0s–6.0s` (`60–180`) | Rule expands via `clip-path` wipe into live product instrument | 4-word claim locks top-left (`2.8s` hold) | Match cut (`f179`) | Airy riser + chime |
| **03 Proof** (Bars 4–5) | `6.0s–10.0s` (`180–300`) | Camera pushes `1.36×` into active control; foreground telemetry tracks | `tabular-nums` metric counter settles | Directional rule wipe (`f299`) | Tactile switch click |
| **04 Lockup** (Bars 6–7) | `10.0s–14.0s` (`300–420`) | Clean inverted paper surface; mark + wordmark settle with `45ms` overlap | Single URL/CTA rests rock-steady (`>= 2.8s` hold) | Final hold (`f335–420`) | Clean tail resonance |

### A. Remotion (`spring` + Dynamic `calculateMetadata`)
Never hardcode `durationInFrames` when driving off voiceover or video assets—probe media duration dynamically in `calculateMetadata`:

```tsx
import { CalculateMetadataFunction, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const calculateMetadata: CalculateMetadataFunction<{ voDurationSec: number }> = async ({ props }) => {
  const fps = 30;
  // Add 1.5s lockup hold after voiceover tail
  return { durationInFrames: Math.ceil((props.voDurationSec + 1.5) * fps), fps, width: 1920, height: 1080 };
};

export const BeatReveal = ({ startFrame = 15 }: { startFrame?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { stiffness: 220, damping: 30, mass: 1 },
  });
  const yPercent = interpolate(progress, [0, 1], [112, 0]);

  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em" }}>
      <h1 style={{ margin: 0, transform: `translate3d(0, ${yPercent}%, 0)` }}>ZERO DRIFT AUDIO.</h1>
    </div>
  );
};
```

### B. HyperFrames Seekable HTML + GSAP Composition
Register paused timelines on `window.__timelines` and always use `gsap.fromTo()` so backward frame seeks never drift. Never mix CSS `transform` rules with GSAP transforms on the same element, and never tween `display` or `visibility` on `.clip` wrappers.

```html
<div id="stage" data-composition-id="launch" data-start="0" data-duration="5" data-width="1920" data-height="1080">
  <!-- 80% Title-Safe Box: inset 108px 192px -->
  <div class="clip" id="title-wrap" data-start="0" data-duration="5" data-track-index="0"
       style="position:absolute; inset:108px 192px; display:flex; align-items:center; overflow:hidden;">
    <h1 id="title-inner" style="margin:0; font:800 84px/1.02 'Inter Tight', sans-serif; color:#ECEEF2;">
      DESIGN WITH INTENT.
    </h1>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#title-inner", { yPercent: 112 }, { yPercent: 0, duration: 0.65, ease: "expo.out" }, 0.2);
    window.__timelines = window.__timelines || {};
    window.__timelines.launch = tl;
  </script>
</div>
```

### C. Manim Mathematical Choreography
```python
from manim import *

class LaunchFormula(Scene):
    def construct(self):
        self.camera.background_color = "#0B0C10"
        rule = Line(LEFT * 5, RIGHT * 5, stroke_width=1.5, color="#2D313B")
        title = Text("ZERO CLUTTER", font="IBM Plex Sans", weight=BOLD).scale(1.2).next_to(rule, UP, buff=0.45)
        items = VGroup(*[Dot(radius=0.08, color="#38BDF8") for _ in range(5)]).arrange(RIGHT, buff=0.6).next_to(rule, DOWN, buff=0.6)

        self.play(Create(rule), run_time=0.55, rate_func=rate_functions.ease_out_expo)
        self.play(FadeIn(title, shift=UP * 0.35), run_time=0.6, rate_func=rate_functions.ease_out_expo)
        self.play(LaggedStart(*[GrowFromCenter(d) for d in items], lag_ratio=0.12), run_time=0.55)
        self.wait(1.9)  # >= 1.2s final lockup hold
```

---

## 6. Two-Pass Linear FFmpeg Mastering, Captions & Frame QC

### Executable Two-Pass Linear Audio Mastering + Rec.709 `1-1-1` Export
Master web/YouTube exports to **`-14 LUFS`** (`-16 LUFS` mobile/social) with **`-1 dBTP`** true-peak ceiling, ducking music beds **`-12` to `-18 dB`** beneath voiceover:

```bash
# Pass 1: Sidechain-duck music under VO & measure true integrated loudness JSON (no dynamic pumping)
ffmpeg -i render.mp4 -i vo.wav -i music.wav \
  -filter_complex "[2:a][1:a]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=350[bed];[1:a][bed]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11:print_format=json" \
  -f null -

# Pass 2: Apply measured linear gain + yuv420p + full bt709 (1-1-1) tags + CFR +faststart
ffmpeg -y -i render.mp4 -i vo.wav -i music.wav \
  -filter_complex "[2:a][1:a]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=350[bed];[1:a][bed]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=11:measured_I=<I>:measured_TP=<TP>:measured_LRA=<LRA>:measured_thresh=<TH>:linear=true[aout]" \
  -map 0:v -map "[aout]" -fps_mode cfr -r 30 -c:v libx264 -profile:v high -level 4.1 -crf 16 \
  -g 60 -keyint_min 60 -sc_threshold 0 -maxrate 10M -bufsize 20M -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart \
  -c:a aac -b:a 192k -ar 48000 -shortest master.mp4

# Transparent editing intermediate (ProRes 4444 alpha)
ffmpeg -y -framerate 30 -i frames/%05d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -vendor apl0 overlay.mov
```

### Word-Level `.ass` Captions (`d27-captions.mjs`)
Generate frame-locked `.ass` subtitles with active-word accent highlights, CPS (`<= 17`) checks, and reading-hold validation (`0.5s + 0.3s * words`, final cue `>= 2.0s`):

```bash
node scripts/d27-captions.mjs words.json --fps 30 --aspect 9:16 --format ass --validate > captions.ass
ffmpeg -y -i master.mp4 -vf "ass=captions.ass" -c:v libx264 -crf 16 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart -c:a copy captioned.mp4
```

### Beat-Boundary Contact Sheets & `sweep_static` QC (`d27-frames.mjs`)
Verify every render visually with beat-boundary contact sheets and static-frame/blank-frame signal audits before shipping:

```bash
# Extract contact sheet directly from standalone HTML via window.__d27Seek(sec) in headless Chrome
node scripts/d27-frames.mjs sheet motion/index.html --beats 0,1.2,2.5,3.8 --out sheet-html.png

# Extract contact sheet from mastered MP4
node scripts/d27-frames.mjs sheet master.mp4 --beats 0,1.5,3.0,4.5 --out sheet-mp4.png

# Fail mechanically on frozen >= 3.0s holds or blank black/white runs
node scripts/d27-frames.mjs audit master.mp4 --max-static 3.0
```

---

## 7. Broadcast Standards & Empirical Timing Grounding

- **Keyframe Weight & Curved Arcs:** Naïve auto-splines drift through rest planes; route hero translations along quadratic Bézier arcs with 2–4 frame follow-through stagger ([John Lasseter, SIGGRAPH 1987](https://www.semanticscholar.org/paper/Principles-of-traditional-animation-applied-to-3D-Lasseter/fce3c119ef190fca49c054afb1c0a5e5f9de52fa)).
- **Broadcast Safe Areas & Loudness:** Enforce **93% Action Safe** (3.5% inset) and **90% Title Safe** (`96×54px` at 1080p, `192×108px` at 4K; [SMPTE ST 2046-1 / EBU R95](https://postproduction.studio/en/tools/safe-areas)), plus [ITU-R BS.1770-4 / EBU R128](https://audio.js.org/modules/loudness/) (`-14 LUFS` web / `-23 LUFS` broadcast, `-1.0 dBTP` ceiling).
- **Netflix Timed Text Pacing:** Enforce **`833ms` (`5/6s`) min** and **`7.0s` max** cue duration, **`<= 20 CPS`** adult (`<= 17` kids), **`>= 2 frames`** inter-cue gap (chaining `< 0.5s` gaps to 2 frames), and `0.5s` shot-change snaps ([Netflix Timing Guidelines](https://partnerhelp.netflixstudios.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines), [Szarkowska & Gerber-Morón, PLOS ONE 2018](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0199331)).
- **Subpixel Anti-Jitter & Rec.709 `1-1-1`:** Apply `transform: perspective(100px)` during slow Chromium text pans to eliminate integer pixel snapping ([Remotion Subpixel Rendering](https://www.remotion.dev/docs/troubleshooting/subpixel-rendering)), and keep strict NCLC `1-1-1` Rec.709 tags ([CineD](https://www.cined.com/quicktime-gamma-shift-bug-what-is-it-and-how-to-combat-it/)).

---

## Final Medium Gate (Stage 4, with `qa-and-critique.md`)

Deterministic timeline (`window.__d27Seek(t)` or Remotion/HyperFrames/Manim frame math); 2.5D camera rig + depth planes; seeded waveforms/particles; `d27-frames.mjs sheet` contact sheet verified at Frame 0 and beat boundaries; `d27-check.mjs` verifies `.mp4` `ffprobe` / `-14..-16 LUFS` / `yuv420p`; final `>= 1.2s` lockup hold intact.
