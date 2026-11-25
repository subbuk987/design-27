# UI & Interactive Web Choreography

Load this module alongside `SKILL.md`, `references/websites.md`, or `references/mascot-creation.md` whenever building interactive controls, overlays, state transitions, scroll reveals, or web-based SVG character motion. *(For timeline-scrubbed launch films, 2.5D camera rigs, Remotion, HyperFrames, Manim, and FFmpeg mastering, load `references/motion-design.md`.)*

---

## 1. The Frequency & Intent Gate

Animation earns its pixels only when it clarifies spatial cause-and-effect or provides tactile confirmation. Gate duration strictly by **how often a user triggers the action**:

| Interaction Tier | Examples | Duration Budget | Hard Rule |
| :--- | :--- | :--- | :--- |
| **High-Frequency / Keyboard (`100×/day`)** | `Cmd+K` palette open/filter, arrow-key list navigation, tab switches, autocomplete, typing feedback | **`0ms–80ms`** (`0ms` for selection moves) | **Never animate keyboard-driven focus or list selection.** Slow transitions on `100×/day` shortcuts feel like input lag. |
| **Direct Micro-Feedback** | Button hover/press, toggle switch, checkbox tick, segmented pill, chip press | **`120–200ms`** | Use `--ease-out-quart` + tactile `:active` (`scale(0.97)` or `translateY(2px)`). Never block repeated clicks. |
| **Contextual Overlays** | Popovers, dropdown menus, tooltips, dialogs, drawers, toasts | **`180–280ms`** (`< 300ms` hard cap) | Scale `0.95 → 1.0` + `opacity` from trigger `transform-origin`. Exits run **25–30% faster** (`130–190ms`). |
| **Signature Load / Proof Moment** | Initial waveform/meter sweep, `pathLength="1"` diagram/mascot trace | **`1.2–2.2s` once** | Auto-plays once on first paint, **cancels immediately** on any user input, and skips under `prefers-reduced-motion: reduce`. |

---

## 2. Sub-300ms UI Ceiling & Easing Law (`no-ease-in-ui-entrance`)

1. **Hard UI Ceiling (`< 300ms`):** Every modal, popover, dropdown, drawer, and tab panel MUST finish entering in **`180–280ms`**. Above `300ms`, interfaces feel sluggish and unresponsive.
2. **Never Use `ease-in` on UI Entrances (`no-ease-in-ui-entrance`):** `ease-in` starts near zero velocity, making taps feel broken before slamming abruptly at the end (`d27-check` `REFLEX` rule flags `ease-in` on UI animations/transitions `> 220ms`). Always enter with a strong initial velocity that decelerates cleanly (`--ease-out-expo` or `--ease-out-quart`).
3. **Asymmetric Exits (25–30% Faster):** Departing surfaces leave attention behind; dismiss menus/dialogs in **`130–190ms`** using `--ease-in-exit` or a tighter `--ease-out-quart`.

```css
:root {
  --ease-out-expo:     cubic-bezier(0.16, 1, 0.3, 1);     /* Crisp UI panels, drawers, masked reveals */
  --ease-out-quart:    cubic-bezier(0.25, 1, 0.5, 1);     /* Fast micro-feedback, toggles, hovers */
  --ease-in-out-quint: cubic-bezier(0.65, 0, 0.35, 1);    /* Shared-element morphs, deliberate layout shifts */
  --ease-in-exit:      cubic-bezier(0.4, 0, 1, 1);        /* Dismissals & exits (25–30% faster than enter) */
}
```

---

## 3. Trigger-Anchored `transform-origin` & Zero `scale(0)` (`no-scale-zero-entrance`)

- **Ban `scale(0)` Entrances (`no-scale-zero-entrance`):** Scaling a menu or modal from `0 → 1` distorts typography and feels like an amateur pop-in (`d27-check` `REFLEX` rule flags `scale(0)` in UI animations).
- **The `0.95 → 1.0` Origin Contract:** Enter popovers, dropdowns, and dialogs from **`scale(0.95)` + `opacity: 0`** (plus an optional `4–8px` directional nudge) with **`transform-origin` pinned to the exact trigger corner or edge** (`top right`, `top left`, `bottom center`, etc.).

```css
/* Trigger-Anchored Popover (Zero scale(0), < 300ms, Native @starting-style) */
.popover-panel {
  --origin: top right;
  transform-origin: var(--origin);
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  transition:
    opacity 160ms var(--ease-in-exit),
    transform 160ms var(--ease-in-exit),
    display 160ms allow-discrete;
}

.popover-panel[data-open="true"],
.popover-panel:popover-open {
  transition:
    opacity 220ms var(--ease-out-expo),
    transform 220ms var(--ease-out-expo),
    display 220ms allow-discrete;
}

@starting-style {
  .popover-panel[data-open="true"],
  .popover-panel:popover-open {
    opacity: 0;
    transform: translate3d(0, -6px, 0) scale(0.95);
  }
}

.popover-panel[data-side="top"]    { --origin: bottom center; }
.popover-panel[data-side="bottom"] { --origin: top center; }
.popover-panel[data-align="start"] { --origin: top left; }
.popover-panel[data-align="end"]   { --origin: top right; }
```

---

## 4. Signature Load Moment ("Auto-Play Once, Then Hand Off")

On *Persuade* and *Experience* pages, give the primary interactive proof or hero SVG diagram **one `1.2–2.2s` opening demonstration** on initial load so visitors immediately see what moves and why it matters. **Never trap user input:** cancel the demo cleanly on the very first `pointerdown`, `keydown`, or `input`, and jump straight to the informative resting state when `prefers-reduced-motion: reduce` is active.

```html
<!-- Pattern A: SVG Signature Stroke Trace (pathLength="1") -->
<svg viewBox="0 0 240 48" class="sig-trace" aria-hidden="true">
  <path class="trace-line" pathLength="1" d="M4,24 L64,24 L82,8 L98,40 L114,18 L128,24 L236,24" />
</svg>
<style>
  .trace-line {
    fill: none; stroke: var(--accent-focal); stroke-width: 2;
    stroke-dasharray: 1; stroke-dashoffset: 1;
    animation: trace-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) 150ms forwards;
  }
  @keyframes trace-in { to { stroke-dashoffset: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .trace-line { animation: none; stroke-dashoffset: 0; }
  }
</style>

<!-- Pattern B: Auto-Play Once Interactive Demo With Instant User Handoff -->
<script>
function runOnceDemo(slider, onUpdate, { from = 1.0, peak = 5.2, settle = 3.4, duration = 1600 } = {}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    slider.value = settle;
    onUpdate(settle);
    return;
  }
  let rafId = 0;
  let cancelled = false;
  const start = performance.now();
  const stop = () => { cancelled = true; cancelAnimationFrame(rafId); };

  ["pointerdown", "keydown", "input", "wheel"].forEach((evt) =>
    slider.addEventListener(evt, stop, { once: true, passive: true })
  );

  const tick = (now) => {
    if (cancelled) return;
    const p = Math.min(1, (now - start) / duration);
    // Out-and-settle curve: rise to peak at 55%, settle to informative resting value at 100%
    const val = p < 0.55
      ? from + (peak - from) * (1 - Math.pow(1 - p / 0.55, 3))
      : peak + (settle - peak) * (1 - Math.pow(1 - (p - 0.55) / 0.45, 3));
    slider.value = val.toFixed(2);
    onUpdate(val);
    if (p < 1) rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}
</script>
```

---

## 5. Interruptible Physics, View Transitions & Scroll Timelines

### 1. Copy-Ready Zero-Dep RK4 Spring Helper (`stepSpring`) & CSS `linear()` Presets
For simple non-interruptible spring transitions (`< 280ms`), prefer zero-JS CSS `linear()` easing (`--spring-crisp: linear(0, 0.36 12%, 0.78 28%, 0.96 48%, 1.01 70%, 1);`). During interactive dragging, dial scrubbing, or mid-flight reversals, use **true 4th-order Runge-Kutta (RK4)** integration with `dt` clamping so high-stiffness springs never diverge or stall:

```js
// Zero-dep interruptible RK4 damped spring for interactive sliders, dials, and drawers
export function stepSpring(state, target, rawDt, { stiffness = 360, damping = 30, mass = 0.9 } = {}) {
  const dt = Math.min(Math.max(rawDt, 0), 0.032);
  const accel = (x, v) => (-stiffness * (x - target) - damping * v) / mass;

  const k1x = state.v;
  const k1v = accel(state.x, state.v);

  const k2x = state.v + 0.5 * k1v * dt;
  const k2v = accel(state.x + 0.5 * k1x * dt, k2x);

  const k3x = state.v + 0.5 * k2v * dt;
  const k3v = accel(state.x + 0.5 * k2x * dt, k3x);

  const k4x = state.v + k3v * dt;
  const k4v = accel(state.x + k3x * dt, k4x);

  state.x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
  state.v += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);

  const done = Math.abs(state.x - target) < 0.001 && Math.abs(state.v) < 0.001;
  if (done) { state.x = target; state.v = 0; }
  return done;
}

export function createSpring(initial, onUpdate, opts) {
  const state = { x: initial, v: 0 };
  let target = initial, raf = 0, last = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tick = (now) => {
    const done = stepSpring(state, target, (now - last) / 1000, opts);
    last = now; onUpdate(state.x);
    raf = done ? 0 : requestAnimationFrame(tick);
  };
  return {
    set(next, kick = 0) {
      target = next;
      if (reduced) { state.x = target; state.v = 0; onUpdate(state.x); return; }
      state.v += kick;
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }
  };
}
```

### 2. View Transitions API (`document.startViewTransition()`) With Graceful Fallback
Use native View Transitions for filter tabs, layout toggles, and state morphs without extra libraries:

```js
function morphState(mutateDom) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !document.startViewTransition) {
    mutateDom();
    return;
  }
  document.startViewTransition(mutateDom);
}
```
```css
/* Pair with unique view-transition-name on the shared element */
.active-pill { view-transition-name: tab-pill; }
::view-transition-group(tab-pill) {
  animation-duration: 240ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 3. FLIP Layout Delta Pattern (Zero-Thrash Reorder / Expand)
When reordering cards, moving an active indicator, or expanding a thumbnail without View Transitions:
```js
function flipElement(el, mutate) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { mutate(); return; }
  const first = el.getBoundingClientRect();
  mutate();
  const last = el.getBoundingClientRect();
  const dx = first.left - last.left, dy = first.top - last.top;
  const sx = first.width / last.width, sy = first.height / last.height;
  el.animate(
    [{ transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})` },
     { transform: "translate3d(0, 0, 0) scale(1, 1)" }],
    { duration: 240, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
  );
}
```

### 4. Progressive Scroll-Linked Reveals (Never Trap Content at `opacity: 0`)
Gate native CSS scroll timelines inside BOTH `@supports (animation-timeline: view())` AND `@media (prefers-reduced-motion: no-preference)`. Unsupported browsers and reduced-motion users stay at full `opacity: 1` automatically:

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .scroll-reveal {
      animation: plate-enter linear both;
      animation-timeline: view();
      animation-range: entry 5% cover 28%;
    }
    @keyframes plate-enter {
      from { opacity: 0; transform: translate3d(0, 20px, 0); }
      to   { opacity: 1; transform: translate3d(0, 0, 0); }
    }
  }
}
```

---

## 6. Stagger Cap (`<= 350ms`), GPU-Only Compositing & Reduced Motion

1. **Total Stagger Cap (`<= 350ms`):** For any list, grid, or menu with `count >= 2` items, cap total stagger span to **`350ms` maximum** using `Math.min(350 / Math.max(count - 1, 1), 45)` milliseconds per item (or cap CSS `--i` index at `7` with `45ms` steps). Long lists must never trickle in 2 seconds late.
2. **GPU-Only Compositing:** Animate ONLY **`transform`**, **`opacity`**, and **`clip-path`**. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`, or `font-size`. Never write `transition: all`.
3. **Zero `will-change` Spam:** Never sprinkle permanent `will-change: transform` across dozens of static cards or rows (exhausts GPU tile memory). Modern browsers promote active `transform`/`opacity` keyframes automatically; apply `will-change` strictly during an active pointer drag and clear it on `pointerup`.
4. **`prefers-reduced-motion: reduce` Floor:** Replace spatial translation/scaling sweeps with instant swaps (`0ms`) or subtle `150ms` opacity crossfades. Never strip functional state feedback (focus rings, error states, progress bars, or checked indicators).

---

## 7. Empirical Perception & Fluid Gesture Physics

- **Human Latency Budgets:** Anchor interaction timing to Jakob Nielsen's thresholds (`100ms` instantaneous, `1,000ms` unbroken flow, `10,000ms` attention ceiling; [NN/g Response Time Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)) and the **`< 400ms` Doherty Threshold** ([Laws of UX](https://lawsofux.com/doherty-threshold/)).
- **Fluid Gesture Formulas ([WWDC18 *Designing Fluid Interfaces*](https://developer.apple.com/videos/play/wwdc2018/803/), [Holko](https://holko.pl/2014/07/06/inertia-bouncing-rubber-banding-uikit-dynamics/)):**
  - *Momentum projection:* `project(v, d) = (v / 1000) * d / (1 - d)` (projects flick release velocity to resting target).
  - *Edge rubber-banding:* `f(x, d, c) = (x * d * c) / (d + c * x)` (`c = 0.55`, `x` = overscroll distance, `d` = viewport dimension).
  - *Design-facing springs:* Convert `(damping, response)` to physics via `stiffness = (2π / response)²`, `damp = 4π * damping / response` (`mass = 1`); use closed-form springs for fixed targets and reserve RK4 (`stepSpring`) for pointer-tracked or mid-flight retargeted springs; enforce `10pt` swipe hysteresis.
- **Instant-Subsequent Tooltips & CSS `linear()` Discipline:** Set `transition-duration: 0ms` (`[data-instant]`) for subsequent hovers within a tooltip group ([Emil Kowalski](https://emilkowal.ski/ui/7-practical-animation-tips); [Rauno Freiberg](https://every.to/p/invisible-details-of-interaction-design)), and never apply overshooting `linear()` springs to `opacity` (clips/flickers past `1.0`; [Josh W. Comeau](https://www.joshwcomeau.com/animation/linear-timing-function/)).
