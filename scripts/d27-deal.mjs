#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Deterministic Anti-Convergence, World-Sync & Assertion Brief Dealer
 * Usage:
 *   node scripts/d27-deal.mjs --prompt "<brief>" [--medium web|animation|motion|book|mascot|thumbnail]
 *     [--surface persuade|operate|read|experience] [--out brief.json] [--history <file>] [--no-save]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const VERSION = "4.0.0";
const VALID_MEDIUMS = new Set(["web", "animation", "motion", "book", "mascot", "thumbnail"]);
const VALID_SURFACES = new Set(["persuade", "operate", "read", "experience"]);

const DIRECTIONS = [
  {
    slug: "academy-film-leader",
    label: "35mm Film Leader",
    surfaceWorld: "Mid-olive grey perforated sprocket frame + 0px corners + 1.5px emulsion rules",
    tokens: {
      surfaceCanvas: "#C9CBC0",
      surfaceElevated: "#D6D8CE",
      inkPrimary: "#161714",
      inkSecondary: "#3E4039",
      accentFocal: "#B82818",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Mid-olive grey oklch(81% 0.015 110); cue vermilion #B82818",
    fonts: { display: "Oswald", accent: "Syne", body: "IBM Plex Sans", mono: "IBM Plex Mono" },
    materialRegister: "35mm Film Leader / Sprocket Stock",
    motionPhysics: "Crisp 180ms gate snaps & countdown targets",
    compatibleSurfaces: ["persuade", "experience", "operate"],
  },
  {
    slug: "anodized-instrument",
    label: "Anodized Instrument",
    surfaceWorld: "Milled aluminum chassis + 2-4px chamfered radii + brushed hairlines",
    tokens: {
      surfaceCanvas: "#CFD4D9",
      surfaceElevated: "#E2E6EA",
      inkPrimary: "#11161D",
      inkSecondary: "#3B4452",
      accentFocal: "#0B56B8",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Milled aluminum oklch(86% 0.01 240); calibrated cobalt #0B56B8",
    fonts: { display: "Space Grotesk", accent: "JetBrains Mono", body: "IBM Plex Sans", mono: "JetBrains Mono" },
    materialRegister: "Milled Aluminum & Precision Dial Matrix",
    motionPhysics: "Quart-out 140-220ms detents",
    compatibleSurfaces: ["persuade", "operate", "experience"],
  },
  {
    slug: "cast-formwork",
    label: "Cast Formwork",
    surfaceWorld: "Raw concrete brutalist structural bands + 0px corners + 2-3px tie-rod rules",
    tokens: {
      surfaceCanvas: "#B9B8B2",
      surfaceElevated: "#C8C7C0",
      inkPrimary: "#141412",
      inkSecondary: "#353530",
      accentFocal: "#0E3FD1",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Raw concrete oklch(74% 0.008 80); signal blue #0E3FD1",
    fonts: { display: "Oswald", accent: "Space Mono", body: "IBM Plex Sans", mono: "Space Mono" },
    materialRegister: "Raw Concrete & Tie-Rod Ink",
    motionPhysics: "Snappy 160-240ms architectural cuts",
    compatibleSurfaces: ["persuade", "experience"],
  },
  {
    slug: "vellum-monograph",
    label: "Vellum Monograph",
    surfaceWorld: "Archival vellum + Tufte sidenote rail + 0px corners + 0.5-1px rules",
    tokens: {
      surfaceCanvas: "#F4F0E6",
      surfaceElevated: "#EBE5D8",
      inkPrimary: "#191714",
      inkSecondary: "#4A433B",
      accentFocal: "#8C241E",
      accentInk: "#FFFBF5",
    },
    oklchNote: "Archival vellum oklch(95% 0.016 85); oxblood rubric #8C241E",
    fonts: { display: "Newsreader", accent: "Cormorant Garamond", body: "Source Serif 4", mono: "IBM Plex Mono" },
    materialRegister: "Archival Vellum & Rag Monograph",
    motionPhysics: "Poised 320-480ms quintic settle",
    compatibleSurfaces: ["read", "persuade"],
  },
  {
    slug: "phosphor-oscilloscope",
    label: "Phosphor Oscilloscope",
    surfaceWorld: "Deep CRT glass + 6% graticule reticle + 4px bezel radii + recessed trace frames",
    tokens: {
      surfaceCanvas: "#0B110E",
      surfaceElevated: "#121C17",
      inkPrimary: "#DCEEE4",
      inkSecondary: "#97B8A6",
      accentFocal: "#38E57A",
      accentInk: "#071A0E",
    },
    oklchNote: "Deep CRT glass oklch(16% 0.018 155); phosphor green #38E57A",
    fonts: { display: "Space Grotesk", accent: "JetBrains Mono", body: "IBM Plex Sans", mono: "JetBrains Mono" },
    materialRegister: "CRT Graticule & Vector Trace",
    motionPhysics: "Instant 100-180ms beam sweeps",
    compatibleSurfaces: ["operate", "experience", "persuade"],
  },
  {
    slug: "swiss-editorial",
    label: "Swiss Editorial",
    surfaceWorld: "Chalk modular 12-col grid + 0-2px corners + 1px structural rules",
    tokens: {
      surfaceCanvas: "#FFFFFF",
      surfaceElevated: "#F2F3F5",
      inkPrimary: "#111214",
      inkSecondary: "#4B4E57",
      accentFocal: "#1746D1",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Chalk oklch(100% 0 0); international cobalt #1746D1",
    fonts: { display: "Inter Tight", accent: "Newsreader", body: "IBM Plex Sans", mono: "IBM Plex Mono" },
    materialRegister: "Modular Grid & Architectural Plates",
    motionPhysics: "Expo-out 220-320ms; zero bounce",
    compatibleSurfaces: ["persuade", "read", "operate"],
  },
  {
    slug: "industrial-monolith",
    label: "Industrial Monolith",
    surfaceWorld: "Stark bone asymmetric scale-rupture grid + 0px razor edges + 2-4px ink bars",
    tokens: {
      surfaceCanvas: "#F4F2EA",
      surfaceElevated: "#E8E4D8",
      inkPrimary: "#111110",
      inkSecondary: "#3F3E39",
      accentFocal: "#C83214",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Stark bone oklch(96% 0.012 85); vermilion signal #C83214",
    fonts: { display: "Anton", accent: "Archivo Black", body: "IBM Plex Sans", mono: "Space Mono" },
    materialRegister: "Stark Bone & Halftone Razor Ink",
    motionPhysics: "Hard 150-220ms mechanical snaps",
    compatibleSurfaces: ["persuade", "experience", "operate"],
  },
  {
    slug: "tactile-workshop",
    label: "Tactile Workshop",
    surfaceWorld: "Warm oat open asymmetric blocks + 12-20px concentric radii + 2px offset ink shadow",
    tokens: {
      surfaceCanvas: "#FAF5EC",
      surfaceElevated: "#F1E9DA",
      inkPrimary: "#1E1726",
      inkSecondary: "#4E4359",
      accentFocal: "#B83B0A",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Warm oat oklch(96.5% 0.015 78); kiln terracotta #B83B0A",
    fonts: { display: "Bricolage Grotesque", accent: "Fraunces", body: "Plus Jakarta Sans", mono: "IBM Plex Mono" },
    materialRegister: "Tactile Cutouts & Kiln Clay",
    motionPhysics: "Damped spring 240-340ms",
    compatibleSurfaces: ["persuade", "experience", "operate"],
  },
  {
    slug: "risograph-zine",
    label: "Risograph Zine",
    surfaceWorld: "Uncoated newsprint collage grid + 0-2px die-cut stamps + registration marks",
    tokens: {
      surfaceCanvas: "#F1EAD8",
      surfaceElevated: "#E6DEC8",
      inkPrimary: "#1E1B18",
      inkSecondary: "#4C453D",
      accentFocal: "#0F6B73",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Uncoated newsprint oklch(93% 0.024 85); riso teal #0F6B73",
    fonts: { display: "Fraunces", accent: "Syne", body: "DM Sans", mono: "IBM Plex Mono" },
    materialRegister: "Risograph Woodcut & Soy Overprint",
    motionPhysics: "Stepped 12-15fps or 200ms print cuts",
    compatibleSurfaces: ["persuade", "experience", "read"],
  },
  {
    slug: "railway-enamel",
    label: "Railway Enamel",
    surfaceWorld: "Enamel ivory timetables & route ledgers + 2px enamel borders + tabular-nums",
    tokens: {
      surfaceCanvas: "#EAE6DA",
      surfaceElevated: "#DFD9C9",
      inkPrimary: "#111824",
      inkSecondary: "#3B4454",
      accentFocal: "#14532D",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Enamel ivory oklch(92% 0.015 88); racing green #14532D",
    fonts: { display: "Archivo", accent: "Oswald", body: "IBM Plex Sans", mono: "IBM Plex Mono" },
    materialRegister: "Vitreous Enamel Wayfinding Plaque",
    motionPhysics: "Clean mechanical 160-240ms",
    compatibleSurfaces: ["persuade", "operate", "read"],
  },
  {
    slug: "darkroom-silver",
    label: "Darkroom Silver",
    surfaceWorld: "Bath slate contact-sheet plates + wide margins + 0-2px film rebates",
    tokens: {
      surfaceCanvas: "#0E0F11",
      surfaceElevated: "#17191D",
      inkPrimary: "#ECEEF0",
      inkSecondary: "#A3AAB2",
      accentFocal: "#E88B28",
      accentInk: "#120B02",
    },
    oklchNote: "Bath slate oklch(16% 0.005 260); safelight amber #E88B28",
    fonts: { display: "Instrument Serif", accent: "Space Grotesk", body: "Plus Jakarta Sans", mono: "IBM Plex Mono" },
    materialRegister: "Silver-Gelatin Monochrome Plates",
    motionPhysics: "Expo-out 280-420ms",
    compatibleSurfaces: ["persuade", "experience", "operate"],
  },
  {
    slug: "botanical-herbarium",
    label: "Botanical Herbarium",
    surfaceWorld: "Sage rag specimen-label layout + 0-2px corners + fine double borders",
    tokens: {
      surfaceCanvas: "#E7ECE4",
      surfaceElevated: "#DAE2D6",
      inkPrimary: "#11241B",
      inkSecondary: "#354F42",
      accentFocal: "#8F510D",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Sage rag oklch(93% 0.016 135); ochre ink #8F510D",
    fonts: { display: "Lora", accent: "Fraunces", body: "Plus Jakarta Sans", mono: "IBM Plex Mono" },
    materialRegister: "Herbarium Specimen Folio",
    motionPhysics: "Organic 260-380ms settle",
    compatibleSurfaces: ["persuade", "read", "experience"],
  },
  {
    slug: "blueprint-cyanotype",
    label: "Blueprint Cyanotype",
    surfaceWorld: "Prussian cyan orthographic CAD grid (5% white rules) + 0-2px corners + title block",
    tokens: {
      surfaceCanvas: "#102A43",
      surfaceElevated: "#163859",
      inkPrimary: "#F0F6FC",
      inkSecondary: "#B4CBE0",
      accentFocal: "#F4C430",
      accentInk: "#102030",
    },
    oklchNote: "Prussian cyan oklch(28% 0.06 245); drafting gold #F4C430",
    fonts: { display: "IBM Plex Sans", accent: "Space Mono", body: "IBM Plex Sans", mono: "IBM Plex Mono" },
    materialRegister: "Cyanotype Orthographic CAD Plate",
    motionPhysics: "Crisp 1.5px stroke reveals 160-220ms",
    compatibleSurfaces: ["persuade", "operate", "experience"],
  },
  {
    slug: "editorial-broadsheet",
    label: "Editorial Broadsheet",
    surfaceWorld: "Cool newsprint multi-column broadsheet + drop caps + 0px corners + column hairlines",
    tokens: {
      surfaceCanvas: "#E9EAE6",
      surfaceElevated: "#DFE1DC",
      inkPrimary: "#141513",
      inkSecondary: "#444741",
      accentFocal: "#7F1D1D",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Cool newsprint oklch(93% 0.006 105); press burgundy #7F1D1D",
    fonts: { display: "Playfair Display", accent: "Instrument Serif", body: "Inter", mono: "IBM Plex Mono" },
    materialRegister: "Multi-Column Broadsheet & Documentary Plates",
    motionPhysics: "Brisk 200-280ms",
    compatibleSurfaces: ["persuade", "read", "operate"],
  },
  {
    slug: "ceramic-studio",
    label: "Ceramic Studio",
    surfaceWorld: "Stoneware clay asymmetric gallery plates (45-60% air) + 0-4px soft corners",
    tokens: {
      surfaceCanvas: "#E8DFD1",
      surfaceElevated: "#DDD2C1",
      inkPrimary: "#1C1917",
      inkSecondary: "#4D4742",
      accentFocal: "#1D4ED8",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Stoneware clay oklch(90% 0.02 72); cobalt glaze #1D4ED8",
    fonts: { display: "Cormorant Garamond", accent: "Newsreader", body: "Plus Jakarta Sans", mono: "IBM Plex Mono" },
    materialRegister: "Matte Stoneware & Cobalt Glaze",
    motionPhysics: "Unhurried 300-450ms settle",
    compatibleSurfaces: ["persuade", "read", "experience"],
  },
  {
    slug: "midnight-telemetry",
    label: "Midnight Telemetry",
    surfaceWorld: "Calibrated obsidian hairline shell rail + open KPI strip + 4-8px crisp radii + 1px rules",
    tokens: {
      surfaceCanvas: "#0B0E14",
      surfaceElevated: "#141A24",
      inkPrimary: "#ECEEF2",
      inkSecondary: "#9BA5B8",
      accentFocal: "#38BDF8",
      accentInk: "#071824",
    },
    oklchNote: "Calibrated obsidian oklch(15% 0.015 260); ice cyan #38BDF8",
    fonts: { display: "Plus Jakarta Sans", accent: "Space Grotesk", body: "Plus Jakarta Sans", mono: "JetBrains Mono" },
    materialRegister: "Rim-Lit Hardware & Telemetry Rail",
    motionPhysics: "Quart-out 140-220ms",
    compatibleSurfaces: ["operate", "persuade", "experience"],
  },
];

const MACROSTRUCTURES = {
  web: [
    { slug: "interactive-oscilloscope", label: "Interactive Instrument / Oscilloscope", blueprint: "Full-bleed assertion hero -> live interactive proof stage (slider/probe/toggle) -> tabular spec matrix -> grounded CTA" },
    { slug: "diegetic-artifact-frame", label: "Diegetic Artifact Frame", blueprint: "Physical subject frame (film leader / caliper / blueprint) -> annotated callout inspection -> real data report table" },
    { slug: "editorial-broadsheet", label: "Editorial Broadsheet", blueprint: "Masthead dateline -> asymmetric 7/5 plate hero -> multi-column typographic proof -> inline interactive ledger" },
    { slug: "split-monograph", label: "Split Monograph", blueprint: "Sticky left thesis & proof control -> scrolling right specimen plates & falsifiable benchmarks" },
    { slug: "technical-spec-sheet", label: "Technical Spec Sheet", blueprint: "Dense 1px hairline tolerance header -> interactive unit/mode selector -> benchmark comparison matrix -> download spec" },
    { slug: "manifesto-ledger", label: "Manifesto Ledger", blueprint: "Scale-contrast claim statement -> live counter-example toggle -> numbered evidence ledger -> clean action bar" },
    { slug: "product-workbench", label: "Product Workbench", blueprint: "Live working canvas at top -> parameter rail -> real-time output metrics & copyable export" },
  ],
  animation: [
    { slug: "trigger-anchored-popover", label: "Trigger-Anchored Popover & Menu", blueprint: "Trigger button -> origin-locked scale(0.95->1) + opacity (<220ms) -> 25% faster exit" },
    { slug: "auto-play-once-demo", label: "Auto-Play-Once Load Demonstration", blueprint: "1.4s deterministic initial demonstration -> pointer/key interrupt -> manual scrubber handoff" },
    { slug: "spring-scrubber-stage", label: "Interruptible Spring Scrubber", blueprint: "Zero-dep damped spring state -> draggable target -> zero mid-flight snap back" },
    { slug: "view-transition-morph", label: "Document View Transition Morph", blueprint: "Shared view-transition-name geometry -> 220ms cross-fade/morph -> reduced-motion instant cut" },
    { slug: "scroll-choreography-deck", label: "Progressive Scroll-Timeline Reveal", blueprint: "@supports (animation-timeline: view()) progressive layer -> never leaves opacity:0 fallback" },
  ],
  motion: [
    { slug: "3-beat-launch-spot", label: "3-Beat Launch Film Spot", blueprint: "Beat 1 Hook (0-1.2s) -> Beat 2 Mechanism Proof (1.2-3.4s) -> Beat 3 Lockup Hold (3.4-5.0s, >=20% clean hold)" },
    { slug: "25d-camera-dolly", label: "2.5D Multi-Plane Camera Dolly", blueprint: "Perspective 1200px rig -> Z-dolly push across BG/Subject/FG planes -> matched-velocity whip cut" },
    { slug: "procedural-waveform-reel", label: "Seeded Procedural Data Reel", blueprint: "mulberry32(seed) deterministic waveform -> kinetic word-level caption locks -> window.__d27Seek(t) scrubber" },
    { slug: "kinetic-type-manifesto", label: "Kinetic Type Manifesto", blueprint: "Masked word-by-word reveal -> optical reading hold >= 0.9s -> crisp hard-cut climax lockup" },
    { slug: "product-ui-deconstruct", label: "Product UI Deconstruct", blueprint: "Live macro zoom 250% on proof widget -> callout vector trace -> clean end-card hold" },
  ],
  book: [
    { slug: "tufte-sidenote-monograph", label: "Tufte Sidenote Web-Book", blueprint: "65ch primary prose column + right-rail <aside class='sidenote'> + sticky chapter TOC + @media print spread" },
    { slug: "typst-tschichold-spread", label: "Typst Tschichold Print Spread", blueprint: "2:3:4:6 page margins + vertical chapter sinkage + single-signal paragraphs + widows/orphans: 3" },
    { slug: "practitioner-field-manual", label: "Practitioner Field Manual", blueprint: "Concrete failure scene opener -> conventional wisdom rebuttal -> diagram/code mechanism -> sharp implication" },
    { slug: "investigative-chapter-arc", label: "Investigative Narrative Arc", blueprint: "Dated primary artifact -> chronological mechanism trace -> primary-source table -> unvarnished takeaway" },
    { slug: "annotated-systems-treatise", label: "Annotated Systems Treatise", blueprint: "Book Charter header -> numbered theorem/invariant blocks -> worked failure postmortem -> margin cross-refs" },
  ],
  mascot: [
    { slug: "two-noun-anatomy-sheet", label: "2-Noun Domain Anatomy Sheet", blueprint: "Named <g id='...'> anatomy chips -> hover group isolation (dims peers to 14%) -> --m-cut negative-space silhouette ladder" },
    { slug: "cutout-silhouette-ladder", label: "Negative-Space Cutout Ladder", blueprint: "400px master SVG -> 64px / 32px / 16px light & dark cutout parity via --m-fill / --m-cut CSS tokens" },
    { slug: "terminal-glyph-companion", label: "Interactive Glyph Companion", blueprint: "Domain-fused silhouette + interactive pose/state switcher (idle / active / alert) + subtle reduced-motion safe micro-idle" },
    { slug: "pose-state-rig", label: "Multi-State Pose Rig", blueprint: "Modular SVG <g id> rig -> state pill controls -> clean 16px favicon cutout proof" },
  ],
  thumbnail: [
    { slug: "curiosity-gap-duality", label: "Title + Thumbnail Curiosity-Gap Pair", blueprint: "Paired non-overlapping Title + 0-4 word 1280x720 plate + live 160x90 feed preview with 14:28 dead-zone pill" },
    { slug: "macro-metric-zoom", label: "250-400% Macro Metric Zoom", blueprint: "Massive single focal metric/artifact + rim-light contrast >= 7:1 + bottom-right dead zone completely clear" },
    { slug: "before-after-anomaly", label: "Split Anomaly Comparison", blueprint: "Two-state visual contrast + 1-3 word tension hook + gaze arrow away from bottom-right timestamp" },
    { slug: "subject-rimlight-plate", label: "Rim-Lit Subject Plate", blueprint: "Separated foreground silhouette + extreme focal crop + live dark/light feed squint check" },
  ],
};

const REQUIRED_REFS_BY_MEDIUM = {
  web: [
    "references/direction-matrix.md",
    "references/websites.md",
    "references/animations.md",
    "references/qa-and-critique.md",
  ],
  animation: [
    "references/direction-matrix.md",
    "references/animations.md",
    "references/websites.md",
    "references/qa-and-critique.md",
  ],
  motion: [
    "references/direction-matrix.md",
    "references/motion-design.md",
    "references/qa-and-critique.md",
  ],
  book: [
    "references/direction-matrix.md",
    "references/book-writing.md",
    "references/qa-and-critique.md",
  ],
  mascot: [
    "references/direction-matrix.md",
    "references/mascot-creation.md",
    "references/animations.md",
    "references/qa-and-critique.md",
  ],
  thumbnail: [
    "references/direction-matrix.md",
    "references/thumbnails.md",
    "references/qa-and-critique.md",
  ],
};

const BANNED_CLICHES = [
  { id: "no-bento-soup", label: "No 3-column icon-in-a-box SaaS feature cards" },
  { id: "no-beige-cosplay", label: "No warm-beige + vermilion Monocle cosplay" },
  { id: "no-purple-glow", label: "No dark-slate purple-to-pink hero glow" },
  { id: "no-devtools-teal", label: "No obsidian + mint-teal DevTools cliché" },
  { id: "no-fake-macos", label: "No fake macOS window chrome around non-terminal content" },
  { id: "no-badge-stack", label: "No sparkle or badge pills stacked above section headings" },
];

const SURFACE_FLOORS = {
  persuade: { minBodyPx: 16, minContrastNormal: 4.5, minContrastLarge: 3.0, viewports: ["390x844", "1440x900"] },
  operate: { minBodyPx: 16, minContrastNormal: 4.5, minContrastLarge: 3.0, viewports: ["390x844", "1440x900"] },
  read: { minBodyPx: 16, minContrastNormal: 7.0, minContrastLarge: 4.5, viewports: ["390x844", "1440x900"] },
  experience: { minBodyPx: 16, minContrastNormal: 4.5, minContrastLarge: 3.0, viewports: ["390x844", "1440x900"], titleSafeMarginPct: 10 },
};

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(
    `Design 27 v${VERSION} — Deterministic Brief Dealer\n` +
    `Usage: node scripts/d27-deal.mjs --prompt "<brief>" [--medium web|animation|motion|book|mascot|thumbnail] [--surface persuade|operate|read|experience] [--out brief.json] [--history <file>] [--no-save]`
  );
  process.exit(0);
}

const getFlag = (flag) => {
  const eq = args.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("-") ? args[i + 1] : null;
};

const flagValIndices = new Set();
["--prompt", "--medium", "--surface", "--out", "--history"].forEach((f) => {
  const i = args.indexOf(f);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith("-")) flagValIndices.add(i + 1);
});

const prompt = getFlag("--prompt") || args.find((a, idx) => !a.startsWith("-") && !flagValIndices.has(idx)) || "default-brief";
const medium = (getFlag("--medium") || "web").toLowerCase();
const surfaceMode = (getFlag("--surface") || (medium === "book" ? "read" : "persuade")).toLowerCase();
const outFile = getFlag("--out");
const noSave = args.includes("--no-save");

if (!VALID_MEDIUMS.has(medium)) {
  console.error(`Unknown --medium "${medium}". Valid mediums: ${[...VALID_MEDIUMS].join(", ")}`);
  process.exit(3);
}
if (!VALID_SURFACES.has(surfaceMode)) {
  console.error(`Unknown --surface "${surfaceMode}". Valid surfaces: ${[...VALID_SURFACES].join(", ")}`);
  process.exit(3);
}

const defaultCacheDir = path.join(os.tmpdir(), "design-27");
const historyFile = path.resolve(getFlag("--history") || path.join(defaultCacheDir, "history.json"));

let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
  } catch {
    history = [];
  }
}

const recentSlugs = new Set(history.slice(-3).map((h) => h.primary));
const compatible = DIRECTIONS.filter((d) => d.compatibleSurfaces.includes(surfaceMode));
const fresh = compatible.filter((d) => !recentSlugs.has(d.slug));
const candidates = fresh.length >= 2 ? fresh : compatible.length >= 2 ? compatible : DIRECTIONS;

const hash = crypto.createHash("sha256").update(`${prompt}:${medium}:${surfaceMode}:${history.length}`).digest();
const idxA = hash[0] % candidates.length;
const idxB = (idxA + 1 + (hash[1] % (candidates.length - 1))) % candidates.length;
const primary = candidates[idxA];
const alternate = candidates[idxB];
const macroPool = MACROSTRUCTURES[medium] || MACROSTRUCTURES.web;
const macrostructure = macroPool[hash[2] % macroPool.length];
const bannedCliche = BANNED_CLICHES[hash[3] % BANNED_CLICHES.length];

const chosenFonts = new Set(Object.values(primary.fonts).map((f) => f.toLowerCase()));
const defaultBannedFonts = ["Inter", "Roboto", "Poppins", "Montserrat", "Arial"].filter(
  (f) => !chosenFonts.has(f.toLowerCase())
);

const preEmitLock = "/* D27-Lock: Mode | World | Macrostructure | Metaphor | Proof | M4+ I4+ H4+ C5 R4+ */";
const signatureContract = {
  requireDiegeticMetaphor: true,
  requireInteractiveProof: ["web", "animation", "motion", "mascot"].includes(medium),
  preEmitLock,
  preEmitLockComment: preEmitLock,
};

const assertionsByMedium = {
  web: [
    { kind: "aboveTheFold", selector: "h1" },
    { kind: "before", a: "h1", b: "main a, main button, .hero a, .hero button" },
    { kind: "staysInFrame", selector: "img, svg, canvas" },
  ],
  animation: [
    { kind: "aboveTheFold", selector: "h1, svg, canvas" },
    { kind: "staysInFrame", selector: "img, svg, canvas" },
  ],
  motion: [
    { kind: "aboveTheFold", selector: "h1, svg, canvas" },
    { kind: "staysInFrame", selector: "img, svg, canvas" },
  ],
  mascot: [
    { kind: "aboveTheFold", selector: "h1, svg, canvas" },
    { kind: "staysInFrame", selector: "img, svg, canvas" },
  ],
  thumbnail: [
    { kind: "aboveTheFold", selector: "#thumbnail-canvas, [data-thumbnail], .yt-thumb, h1" },
    { kind: "staysInFrame", selector: "#thumbnail-canvas, [data-thumbnail], .yt-thumb, img, svg" },
  ],
  book: [
    { kind: "aboveTheFold", selector: "h1" },
    { kind: "staysInFrame", selector: "img, svg, table, pre" },
  ],
};

const contract = {
  tool: "d27-deal",
  schemaVersion: 4,
  version: VERSION,
  generatedAt: new Date().toISOString(),
  medium,
  surfaceMode,
  primary,
  alternate,
  macrostructure,
  signatureContract,
  bannedCliche,
  bannedDefaults: {
    fonts: defaultBannedFonts,
    colors: ["#6366f1", "#a855f7", "#ec4899"],
    patterns: ["generic-purple-gradient", "3-column-icon-cards", "floating-blob-hero"],
  },
  floors: SURFACE_FLOORS[surfaceMode] || SURFACE_FLOORS.persuade,
  assertions: assertionsByMedium[medium] || assertionsByMedium.web,
  requiredRefs: REQUIRED_REFS_BY_MEDIUM[medium] || REQUIRED_REFS_BY_MEDIUM.web,
  clearedRecent: [...recentSlugs],
};

if (!noSave) {
  try {
    fs.mkdirSync(path.dirname(historyFile), { recursive: true });
    history.push({
      timestamp: contract.generatedAt,
      prompt: prompt.slice(0, 120),
      medium,
      surfaceMode,
      primary: primary.slug,
      alternate: alternate.slug,
      macrostructure: macrostructure.slug,
    });
    fs.writeFileSync(historyFile, JSON.stringify(history.slice(-20), null, 2));
  } catch {
    // Non-fatal in read-only sandboxes
  }
}

if (outFile) {
  const resolvedOut = path.resolve(outFile);
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  fs.writeFileSync(resolvedOut, JSON.stringify(contract, null, 2));
}

console.log(JSON.stringify(contract, null, 2));
