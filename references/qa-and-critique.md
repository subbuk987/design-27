# Post-Build Art Director Critique & Anti-Slop Quality Audit

Load and run this module at **Stage 4** of every Design 27 task before declaring work complete. Treat every item as a **pass/fail sign-off gate** — if a check fails, fix the artifact immediately and re-verify. Do not rationalize defects as "minor polish."

---

## Pass 1 — The 3-Second Squint Test (Hierarchy & Focal Point)

Zoom out to `25%` (or view the rendered image/page through squinted eyes / mobile thumbnail scale) for 3 seconds:

- [ ] **Unmistakable #1 Focal Anchor:** Exactly ONE primary headline, visual artifact, or hero figure dominates instantly. If two elements fight equally for attention, demote the weaker element by `>= 35%` in scale, contrast, or chromatic saturation.
- [ ] **Clear 1 → 2 → 3 Eye Path:** The eye travels smoothly from Focal Anchor (#1) → Supporting Context (#2) → Action / Metadata (#3) without bouncing randomly across boxes.
- [ ] **Intentional Negative Space:** Calm open ground actively frames the subject (`>= 25–45%` breathing room for editorial/posters/websites; crisp micro-gutters for dense cheatsheets). Zero anxious void-filling.
- [ ] **Aesthetic Fidelity:** The finished piece genuinely embodies the Stage 1 Aesthetic Direction and cultural anchors — never quietly drifted back to generic SaaS styling during implementation.

---

## Pass 2 — Color, Contrast & Accessibility Audit

Verify actual foreground/background luminance pairs — never eyeball low-contrast greys:

- [ ] **Body Copy Contrast:** `>= 4.5:1` (WCAG AA hard floor) for all body copy, labels, and captions (`< 24px` normal / `< 18.66px` bold). Target **`>= 7:1` (WCAG AAA)** for books, editorial articles, and cheatsheets.
- [ ] **Display & UI Component Contrast:** `>= 3.0:1` minimum for oversized display headlines (`>= 24px`), primary icons, active inputs, and focus rings.
- [ ] **Zero Dark-Mode Halation:** Avoid harsh pure `#FFFFFF` reading copy on pure `#000000` for extended reading; prefer calibrated off-white (`#ECEEF2` / `#F2F0EB`) on deep obsidian/graphite (`#0B0C10` / `#121210`).
- [ ] **Text-Over-Media Legibility:** Check contrast against the *brightest or noisiest* pixel behind text. Apply a directional scrim (`rgba(0,0,0,0.72–0.85)`), solid editorial panel, or quiet negative-space crop if any letter blurs into the photo.
- [ ] **Grayscale / Colorblind Resilience:** Convert mentally or via filter to grayscale — hierarchy, charts, status indicators, and CTAs still remain clear without relying exclusively on red/green hue differences.
- [ ] **60 / 30 / 10 Palette Discipline:** Surface ground dominates, ink reads crisply, and `--accent-focal` remains disciplined (`<= 10%` of visual area) rather than tinting every heading, border, and background alike.

---

## Pass 3 — Typography Hygiene Audit

- [ ] **Typeface Cap:** Strictly `<= 2` primary font families + `1` optional monospace utility face.
- [ ] **Scale Tension:** Headline-to-body ratio meets medium target: `>= 2.5×` desktop websites/editorial (`>= 2.2×` mobile display), `>= 5×` posters, `1.8×–2.5×` dense cheatsheets. *(Thumbnails have no body copy; enforce `16–24%` canvas height per hook line.)*
- [ ] **Body Measure Control:** Continuous prose stays within **`45–70ch`** (ideal `58–65ch`; `36–48ch` for multi-column magazines). Zero 100ch wall-to-wall lines.
- [ ] **Zero Headline Orphans & Column Widows:** All display headings and pull quotes wrap cleanly (`text-wrap: balance` or manual line breaks — zero dangling single short words on the final line). Multi-page print/PDF blocks enforce `widows >= 2`, `orphans >= 2`, and `break-after: avoid` on headings.
- [ ] **Minimum Legibility Floors Enforced:**
  - Websites: Body `>= 16px`, utility labels/captions `>= 12px`.
  - Books / Reports: Print body `9.5–11pt` (screen PDF `10.5–11.5pt`), footnotes/captions `>= 7.5pt`.
  - Presentations / Pitch Decks: Live keynote body `>= 24px` (`18pt`), read-ahead body `>= 18px` (`13.5–14pt`), footers `>= 14px`.
  - Cheatsheets: Print `>= 7.5pt`, screen `>= 11px`.
  - Posters: 1-ft details `>= 10pt`.
  - Thumbnails: Display hook `>= 16–24%` of canvas height (`0–4` words max).
- [ ] **Tabular Numerals & Proper Punctuation:** `font-variant-numeric: tabular-nums` applied to tables, KPIs, prices, timestamps, and folios. True em-dashes (`—`), en-dashes (`–`), curly quotes (`“ ” ‘ ’`), and proper `×` multiplication signs replace ASCII hacks (`--`, `"`, `x`).

---

## Pass 4 — Spatial Alignment, Rhythm & Edge-Clipping Check

Inspect desktop (`1440px`), tablet (`768px`), mobile (`390px`), or print trim margins:

- [ ] **Zero Edge Clipping or Overflow:** No horizontal scrollbars on mobile, no clipped descenders inside masked containers, no elements touching container edges (`padding` respected), no overlapping chart axis labels or truncated legends.
- [ ] **Honest Media Proportions:** Every photograph, video, and diagram uses an explicit `aspect-ratio` + clean crop (`object-fit: cover`, focal-aware `object-position`). Zero stretched, squished, or pixelated assets; zero data charts strangled in narrow sidebars.
- [ ] **Alternating Section Rhythm:** No two consecutive sections share the exact same grid column split, card pattern, or visual density.
- [ ] **The Deletion Test (Open-Canvas Check):** Inspect every border, card box, background pill, shadow, and divider. If removing a box or shadow makes alignment clearer and calmer, **delete it**.
- [ ] **Macro vs. Micro Proximity:** Section separation is `>= 3×` internal element spacing; captions sit tighter to their own figure (`6–8px`) than to surrounding paragraphs (`>= 20px`).

---

## Pass 5 — Motion & Performance Critique (Skip Only for Static Print/Images)

- [ ] **Zero Robotic Curves & Single Motion Personality:** No `linear` or default browser `ease` on UI/video entrances, exits, or layout morphs (linear reserved exclusively for continuous progress bars/tickers/spinners). One cohesive easing/spring family governs the entire piece.
- [ ] **Inside Duration Budgets:** Micro-interactions `120–200ms`; UI transitions `250–450ms` (exits `~0.7×` enter); hero choreography `500–900ms`; total list stagger capped at `<= 350ms`.
- [ ] **60fps GPU-Composited Properties Only:** Animations mutate `transform`, `opacity`, or `clip-path` — zero frame-dropping layout thrash (`width`, `height`, `top`, `left`, `margin`, `padding`), zero scroll-jacking, and zero scroll reveals that leave content permanently stuck at `opacity: 0`.
- [ ] **Reduced Motion Respected:** `@media (prefers-reduced-motion: reduce)` (or `gsap.matchMedia()`) replaces sweeping motion with instant settles or minimal opacity crossfades.
- [ ] **Video Storyboard, Cuts & Reading Hold:** Stage 2 Beat Sheet locked; every typographic beat stays legible for `>= 1.2s + 0.35s × wordCount`; major visual cuts land `0–2 frames` ahead of or exact on audio transients; zero banned cross-dissolve mud, 3D spins, or page curls.

---

## Pass 6 — Medium-Specific Sign-Off Gates

Confirm every row matching your active medium(s):

| Medium | Mandatory Final Checks |
| :--- | :--- |
| **Websites & Landing Pages** | Above-the-fold hero holds focal message + visual + max 1 primary CTA cleanly at `1440×900` and `390×844`; mobile tap targets `>= 44×44px`; nav `<= 5` top links. |
| **Web Apps & Dashboards** | Hairline-separated shell rail (`220–248px`) + open horizontal KPI strip (zero bento KPI card soup); primary chart spans `>= 65%` desktop width with muted gridlines & `<= 4` semantic series; tables right-align `tabular-nums`; empty/loading/error/`:focus-visible` states complete. |
| **Books & Editorial** | Inner binding gutter generous (`>= 18–22mm` for print); facing baselines aligned; running headers suppressed on chapter openers, blank versos & full-bleed plates; hyphenation enabled on justified prose; zero mixed indent + blank-line paragraphs. |
| **Presentations & Decks** | `16:9` stage (`1920×1080px` / `80px` safe zone); one claim per slide with assertion titles; `<= 45` words live (`<= 65` async); no 3 consecutive identical slide layouts; data charts `>= 65%` width with direct labels; footer suppressed on covers/dividers; native clickable links. |
| **Cheatsheets** | Masthead `<= 10%` of page height; zero narrative paragraphs; fits cleanly inside A4/Letter dual-safe printable bounds (`188×257mm`) without overflow; print view uses light ink-saving ground. |
| **Posters** | Passes 10ft / 3ft / 1ft distance test; `<= 3` inks; bleed (`+3mm` / `+5mm`) extends past trim; all non-bleeding details & QR codes sit inside safe zone; 1 intentional grid-break max. |
| **Thumbnails** | Passes `160px` wide (`12.5%`) squint test; `<= 3` visual elements total; `0–4` words max (never repeats full video title); **YouTube bottom-right timestamp dead zone (`x: 1000–1280, y: 590–720`) completely clear** of text/faces/logos. |
| **Mascots & Illustration** | Passes solid `#000` silhouette test at `64px`; locked to 3–4 brand-aligned colors (`>= 3:1` body/secondary delta); consistent stroke weight & key-light angle across all assets; animation-ready grouped SVG (`transform-box: view-box`) or locked character prompt template provided. |

---

## Pass 7 — The Anti-AI-Slop Kill Switch

If ANY of these 7 patterns survived into the artifact, **STOP — revise before delivering**:

1. Default purple-blue/pink AI gradient (`#6366f1` → `#a855f7` → `#ec4899`) on uncalibrated dark slate.
2. Repetitive 3-column icon-in-a-tinted-square card soup.
3. Unprompted sparkle badges (`✨ AI-Powered`, `New`, `Beta`) floating above headlines.
4. Fake macOS red/yellow/green dots framing non-terminal content.
5. Washed-out medium-grey body copy failing `4.5:1` contrast.
6. Unmotivated floating glass blobs, confetti, or linear hover animations.
7. Default uncalibrated Inter + Tailwind blue layout ignoring the subject's cultural soul.

---

## Mandatory Studio Sign-Off Block

Include this compact 5-line **Art Director Sign-Off** at the end of Stage 4 (both when building new artifacts and when reviewing existing work) to confirm every gate was verified:

```markdown
### Art Director Sign-Off — Design 27
- **Direction & Brief Alignment:** [Pass / Revised] — [1-line rationale]
- **3-Second Squint & Focal Path:** [Pass / Revised] — [Focal #1 → #2 → #3]
- **Contrast & Typography Hygiene:** [Pass / Revised] — [Min contrast ratio, measure, scale ratio, orphans checked]
- **Spatial Rhythm & Medium Gate:** [Pass / Revised] — [Key medium-specific check verified]
- **Anti-Slop Audit:** [Clean — 0 redlines triggered / Fixed: ...]
```
