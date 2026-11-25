#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Deterministic Anti-Convergence, World-Sync & Assertion Brief Dealer
 * Usage:
 *   node scripts/d27-deal.mjs --prompt "<brief>" [--medium web|animation|motion|book|mascot|thumbnail]
 *     [--surface persuade|operate|read|experience] [--emotion calm|focused|trust|inviting|playful|awe|energetic|urgent]
 *     [--campaign <brief.json>] [--out brief.json] [--history <file>] [--no-save]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { writeFileSafe } from "./lib/safe-io.mjs";
import { parseHex, contrastRatio, computeApcaLc, rgbToOklch, oklchToRgb, maxChroma, relativeChroma, rgbToHex } from "./lib/color-math.mjs";

import { VERSION } from "./lib/version.mjs";
const VALID_MEDIUMS = new Set(["web", "animation", "motion", "book", "mascot", "thumbnail"]);
const VALID_SURFACES = new Set(["persuade", "operate", "read", "experience"]);

const DIRECTIONS = [
  {
    slug: "academy-film-leader",
    label: "35mm Film Leader",
    surfaceWorld: "Mid-olive grey perforated sprocket frame + 0px corners + 1.5px emulsion rules",
    tokens: {
      surfaceCanvas: "#D8DACF",
      surfaceElevated: "#E4E6DC",
      inkPrimary: "#161714",
      inkSecondary: "#363731",
      accentFocal: "#B82818",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Mid-olive grey oklch(88% 0.015 115); cue vermilion #B82818",
    fonts: { display: "Big Shoulders Display", body: "Archivo", mono: "Space Mono" },
    materialRegister: "35mm Film Leader / Sprocket Stock",
    motionPhysics: "Crisp 180ms gate snaps & countdown targets",
    compatibleSurfaces: ["persuade", "experience", "operate"],
    domains: ["film", "cinema", "video", "movie", "studio", "festival", "camera", "editing", "documentary", "production", "trailer"],
  },
  {
    slug: "anodized-instrument",
    label: "Anodized Instrument",
    surfaceWorld: "Milled aluminum chassis + 2-4px chamfered radii + brushed hairlines",
    tokens: {
      surfaceCanvas: "#CFD4D9",
      surfaceElevated: "#E2E6EA",
      inkPrimary: "#11161D",
      inkSecondary: "#252D3B",
      accentFocal: "#0B56B8",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Milled aluminum oklch(87% 0.009 248); calibrated cobalt #0B56B8",
    fonts: { display: "Chivo", body: "Public Sans", mono: "JetBrains Mono" },
    materialRegister: "Milled Aluminum & Precision Dial Matrix",
    motionPhysics: "Quart-out 140-220ms detents",
    compatibleSurfaces: ["persuade", "operate", "experience"],
    domains: ["hardware", "audio", "instrument", "sensor", "device", "precision", "measurement", "drone", "synth", "recorder", "microphone"],
  },
  {
    slug: "cast-formwork",
    label: "Cast Formwork",
    surfaceWorld: "Raw concrete brutalist structural bands + 0px corners + 2-3px tie-rod rules",
    tokens: {
      surfaceCanvas: "#DAD9D3",
      surfaceElevated: "#E5E4DE",
      inkPrimary: "#141412",
      inkSecondary: "#353530",
      accentFocal: "#0E3FD1",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Raw concrete oklch(88% 0.008 99); signal blue #0E3FD1",
    fonts: { display: "Archivo Black", body: "Work Sans", mono: "Space Mono" },
    materialRegister: "Raw Concrete & Tie-Rod Ink",
    motionPhysics: "Snappy 160-240ms architectural cuts",
    compatibleSurfaces: ["persuade", "experience"],
    domains: ["architecture", "construction", "infrastructure", "concrete", "civic", "urban", "building", "city", "planning"],
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
    oklchNote: "Archival vellum oklch(96% 0.014 89); oxblood rubric #8C241E",
    fonts: { display: "Newsreader", body: "Literata", mono: "IBM Plex Mono" },
    materialRegister: "Archival Vellum & Rag Monograph",
    motionPhysics: "Poised 320-480ms quintic settle",
    compatibleSurfaces: ["read", "persuade"],
    domains: ["book", "publishing", "history", "archive", "library", "academic", "research", "essay", "law", "scholarship"],
  },
  {
    slug: "phosphor-oscilloscope",
    label: "Phosphor Oscilloscope",
    surfaceWorld: "Deep CRT glass + 6% graticule reticle + 4px bezel radii + recessed trace frames",
    tokens: {
      surfaceCanvas: "#0B110E",
      surfaceElevated: "#121C17",
      inkPrimary: "#DCEEE4",
      inkSecondary: "#B2D4C1",
      accentFocal: "#38E57A",
      accentInk: "#071A0E",
    },
    oklchNote: "Deep CRT glass oklch(17% 0.011 163); phosphor green #38E57A",
    fonts: { display: "Space Grotesk", body: "IBM Plex Sans", mono: "JetBrains Mono" },
    materialRegister: "CRT Graticule & Vector Trace",
    motionPhysics: "Instant 100-180ms beam sweeps",
    compatibleSurfaces: ["operate", "experience", "persuade"],
    domains: ["devtools", "terminal", "cli", "monitoring", "signal", "electronics", "observability", "security", "debugger", "logs"],
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
    oklchNote: "Chalk oklch(100% 0.000 0); international cobalt #1746D1",
    fonts: { display: "Schibsted Grotesk", body: "Hanken Grotesk", mono: "IBM Plex Mono" },
    materialRegister: "Modular Grid & Architectural Plates",
    motionPhysics: "Expo-out 220-320ms; zero bounce",
    compatibleSurfaces: ["persuade", "read", "operate"],
    domains: ["design", "system", "agency", "typography", "museum", "consulting", "report", "documentation", "grid", "exhibition"],
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
    oklchNote: "Stark bone oklch(96% 0.011 95); vermilion signal #C83214",
    fonts: { display: "Anton", body: "Libre Franklin", mono: "Space Mono" },
    materialRegister: "Stark Bone & Halftone Razor Ink",
    motionPhysics: "Hard 150-220ms mechanical snaps",
    compatibleSurfaces: ["persuade", "experience", "operate"],
    domains: ["manifesto", "streetwear", "sport", "athletic", "campaign", "protest", "launch", "bold", "brand"],
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
    oklchNote: "Warm oat oklch(97% 0.013 82); kiln terracotta #B83B0A",
    fonts: { display: "Bricolage Grotesque", body: "Figtree", mono: "Spline Sans Mono" },
    materialRegister: "Tactile Cutouts & Kiln Clay",
    motionPhysics: "Damped spring 240-340ms",
    compatibleSurfaces: ["persuade", "experience", "operate"],
    domains: ["craft", "maker", "furniture", "woodworking", "tools", "bakery", "coffee", "food", "restaurant", "hospitality"],
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
    oklchNote: "Uncoated newsprint oklch(94% 0.025 89); riso teal #0F6B73",
    fonts: { display: "Fraunces", body: "DM Sans", mono: "DM Mono" },
    materialRegister: "Risograph Woodcut & Soy Overprint",
    motionPhysics: "Stepped 12-15fps or 200ms print cuts",
    compatibleSurfaces: ["persuade", "experience", "read"],
    domains: ["zine", "indie", "music", "community", "education", "nonprofit", "comics", "newsletter", "school"],
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
    oklchNote: "Enamel ivory oklch(92% 0.017 92); racing green #14532D",
    fonts: { display: "Overpass", body: "Public Sans", mono: "Overpass Mono" },
    materialRegister: "Vitreous Enamel Wayfinding Plaque",
    motionPhysics: "Clean mechanical 160-240ms",
    compatibleSurfaces: ["persuade", "operate", "read"],
    domains: ["transit", "travel", "logistics", "timetable", "rail", "train", "heritage", "hotel", "ferry", "outdoor"],
  },
  {
    slug: "darkroom-silver",
    label: "Darkroom Silver",
    surfaceWorld: "Bath slate contact-sheet plates + wide margins + 0-2px film rebates",
    tokens: {
      surfaceCanvas: "#0E0F11",
      surfaceElevated: "#17191D",
      inkPrimary: "#ECEEF0",
      inkSecondary: "#C5CDD5",
      accentFocal: "#F99B3C",
      accentInk: "#120B02",
    },
    oklchNote: "Bath slate oklch(17% 0.004 264); safelight amber #E88B28",
    fonts: { display: "Instrument Serif", body: "Atkinson Hyperlegible", mono: "JetBrains Mono" },
    materialRegister: "Silver-Gelatin Monochrome Plates",
    motionPhysics: "Expo-out 280-420ms",
    compatibleSurfaces: ["persuade", "experience", "operate"],
    domains: ["photography", "film", "lab", "portfolio", "night", "wine", "whisky", "luxury", "jewellery"],
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
    oklchNote: "Sage rag oklch(94% 0.012 133); ochre ink #8F510D",
    fonts: { display: "Lora", body: "Libre Franklin", mono: "Courier Prime" },
    materialRegister: "Herbarium Specimen Folio",
    motionPhysics: "Organic 260-380ms settle",
    compatibleSurfaces: ["persuade", "read", "experience"],
    domains: ["garden", "plant", "wellness", "health", "nature", "agriculture", "seed", "tea", "skincare", "climate", "farm"],
  },
  {
    slug: "blueprint-cyanotype",
    label: "Blueprint Cyanotype",
    surfaceWorld: "Prussian cyan orthographic CAD grid (5% white rules) + 0-2px corners + title block",
    tokens: {
      surfaceCanvas: "#102A43",
      surfaceElevated: "#163859",
      inkPrimary: "#F0F6FC",
      inkSecondary: "#BDD4E9",
      accentFocal: "#F4C430",
      accentInk: "#102030",
    },
    oklchNote: "Prussian cyan oklch(28% 0.056 250); drafting gold #F4C430",
    fonts: { display: "IBM Plex Sans Condensed", body: "IBM Plex Sans", mono: "IBM Plex Mono" },
    materialRegister: "Cyanotype Orthographic CAD Plate",
    motionPhysics: "Crisp 1.5px stroke reveals 160-220ms",
    compatibleSurfaces: ["persuade", "operate", "experience"],
    domains: ["engineering", "robotics", "aerospace", "cad", "manufacturing", "patent", "science", "lab", "physics"],
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
    oklchNote: "Cool newsprint oklch(94% 0.005 118); press burgundy #7F1D1D",
    fonts: { display: "Libre Caslon Display", body: "Libre Franklin", mono: "IBM Plex Mono" },
    materialRegister: "Multi-Column Broadsheet & Documentary Plates",
    motionPhysics: "Brisk 200-280ms",
    compatibleSurfaces: ["persuade", "read", "operate"],
    domains: ["news", "journalism", "magazine", "politics", "finance", "opinion", "media", "newspaper"],
  },
  {
    slug: "ceramic-studio",
    label: "Ceramic Studio",
    surfaceWorld: "Stoneware clay asymmetric gallery plates (45-60% air) + 0-4px soft corners",
    tokens: {
      surfaceCanvas: "#E8DFD1",
      surfaceElevated: "#DDD2C1",
      inkPrimary: "#1C1917",
      inkSecondary: "#47413D",
      accentFocal: "#1D4ED8",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Stoneware clay oklch(91% 0.021 79); cobalt glaze #1D4ED8",
    fonts: { display: "Cormorant Garamond", body: "Work Sans", mono: "DM Mono" },
    materialRegister: "Matte Stoneware & Cobalt Glaze",
    motionPhysics: "Unhurried 300-450ms settle",
    compatibleSurfaces: ["persuade", "read", "experience"],
    domains: ["ceramics", "pottery", "interior", "home", "homeware", "beauty", "boutique", "spa", "candle"],
  },
  {
    slug: "midnight-telemetry",
    label: "Midnight Telemetry",
    surfaceWorld: "Calibrated obsidian hairline shell rail + open KPI strip + 4-8px crisp radii + 1px rules",
    tokens: {
      surfaceCanvas: "#0B0E14",
      surfaceElevated: "#141A24",
      inkPrimary: "#ECEEF2",
      inkSecondary: "#C2CCE0",
      accentFocal: "#38BDF8",
      accentInk: "#071824",
    },
    oklchNote: "Calibrated obsidian oklch(16% 0.014 264); ice cyan #38BDF8",
    fonts: { display: "Sora", body: "Plus Jakarta Sans", mono: "JetBrains Mono" },
    materialRegister: "Rim-Lit Hardware & Telemetry Rail",
    motionPhysics: "Quart-out 140-220ms",
    compatibleSurfaces: ["operate", "persuade", "experience"],
    domains: ["fintech", "analytics", "dashboard", "saas", "ai", "cloud", "crypto", "trading", "metrics", "api"],
  },
  {
    slug: "riso-flamingo",
    label: "Riso Flamingo Two-Spot",
    surfaceWorld: "Fluorescent-pink stock printed in one riso blue + 8-14px soft radii + visible misregistration offsets",
    tokens: {
      surfaceCanvas: "#FAD0DC",
      surfaceElevated: "#FCE0E8",
      inkPrimary: "#14123F",
      inkSecondary: "#2E2A66",
      accentFocal: "#1F3BC2",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Flamingo stock oklch(90% 0.050 359); riso blue #1F3BC2",
    fonts: { display: "Rubik Mono One", body: "Figtree", mono: "Martian Mono" },
    materialRegister: "Two-Spot Riso Print & Misregistered Ink",
    motionPhysics: "Springy 220-340ms with 3-6% overshoot",
    compatibleSurfaces: ["persuade", "experience"],
    domains: ["kids", "children", "education", "music", "event", "festival", "playful", "candy", "game", "games", "toy", "pop"],
  },
  {
    slug: "transit-signal-yellow",
    label: "Transit Signal Yellow",
    surfaceWorld: "Full signal-yellow wayfinding panel + 2-4px rounded corners + heavy pictogram strokes",
    tokens: {
      surfaceCanvas: "#F7CB2A",
      surfaceElevated: "#F9D85C",
      inkPrimary: "#111111",
      inkSecondary: "#29240F",
      accentFocal: "#0A3A8C",
      accentInk: "#FFFFFF",
    },
    oklchNote: "Signal yellow oklch(86% 0.166 92); transit navy #0A3A8C",
    fonts: { display: "Barlow Condensed", body: "Barlow", mono: "Red Hat Mono" },
    materialRegister: "Wayfinding Enamel Panel & Pictogram Strokes",
    motionPhysics: "Decisive 140-220ms slides along one axis",
    compatibleSurfaces: ["persuade", "operate", "experience"],
    domains: ["transport", "delivery", "safety", "wayfinding", "parking", "taxi", "airport", "sports", "alert", "logistics"],
  },
  {
    slug: "gallery-wall",
    label: "Photo-Led Gallery Wall",
    surfaceWorld: "Neutral gallery wall where full-bleed photography carries all colour + 0-4px corners + generous margins",
    tokens: {
      surfaceCanvas: "#EEECE7",
      surfaceElevated: "#F7F6F2",
      inkPrimary: "#121212",
      inkSecondary: "#3D3C3A",
      accentFocal: "#1C1C1C",
      accentInk: "#F7F6F2",
    },
    oklchNote: "Gallery wall oklch(94% 0.007 89); image-led achromatic UI #1C1C1C",
    fonts: { display: "Gloock", body: "Instrument Sans", mono: "Commit Mono" },
    materialRegister: "Archival Print, Wall Label & Picture Light",
    motionPhysics: "Slow 400-700ms cross-dissolves; zero bounce",
    compatibleSurfaces: ["persuade", "experience", "read"],
    domains: ["photography", "photo", "art", "gallery", "estate", "travel", "fashion", "hotel", "restaurant", "portfolio", "wedding"],
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
    "references/emotion-science.md",
    "references/websites.md",
    "references/animations.md",
    "references/qa-and-critique.md",
  ],
  animation: [
    "references/direction-matrix.md",
    "references/emotion-science.md",
    "references/animations.md",
    "references/qa-and-critique.md",
  ],
  motion: [
    "references/direction-matrix.md",
    "references/emotion-science.md",
    "references/motion-design.md",
    "references/qa-and-critique.md",
  ],
  book: [
    "references/direction-matrix.md",
    "references/emotion-science.md",
    "references/book-writing.md",
    "references/qa-and-critique.md",
  ],
  mascot: [
    "references/direction-matrix.md",
    "references/emotion-science.md",
    "references/mascot-creation.md",
    "references/animations.md",
    "references/qa-and-critique.md",
  ],
  thumbnail: [
    "references/direction-matrix.md",
    "references/emotion-science.md",
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

// Heuristic bands (references/emotion-science.md §0), calibrated, not measured. accentChroma is RELATIVE chroma:
// C / max sRGB C at that L and H, so a vivid cyan and a vivid blue score alike (raw OKLCH C would not).
const EMOTION_TARGETS = {
  calm: { valence: "positive", arousal: "low", accentChroma: [0, 0.55], motionMs: [300, 600], shape: "curved", complexity: "low" },
  focused: { valence: "neutral", arousal: "low-mid", accentChroma: [0, 0.8], motionMs: [120, 240], shape: "neutral", complexity: "low" },
  trust: { valence: "positive", arousal: "low-mid", accentChroma: [0.3, 0.75], motionMs: [200, 320], shape: "neutral", complexity: "low" },
  inviting: { valence: "positive", arousal: "mid", accentChroma: [0.45, 0.9], motionMs: [200, 400], shape: "curved", complexity: "mid" },
  playful: { valence: "positive", arousal: "high", accentChroma: [0.75, 1], motionMs: [180, 340], shape: "curved", complexity: "mid-high" },
  awe: { valence: "positive", arousal: "mid-high", accentChroma: [0.5, 1], motionMs: [500, 1200], shape: "mixed", complexity: "mid" },
  energetic: { valence: "positive", arousal: "high", accentChroma: [0.8, 1], motionMs: [150, 300], shape: "mixed", complexity: "mid-high" },
  urgent: { valence: "negative", arousal: "high", accentChroma: [0.85, 1], motionMs: [100, 200], shape: "angular", complexity: "low" },
};
const DEFAULT_EMOTION_BY_SURFACE = { read: "calm", operate: "focused", persuade: "inviting", experience: "energetic" };

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
    `Usage: node scripts/d27-deal.mjs --prompt "<brief>" [--medium web|animation|motion|book|mascot|thumbnail] [--surface persuade|operate|read|experience] [--emotion calm|focused|trust|inviting|playful|awe|energetic|urgent] [--campaign <brief.json>] [--out brief.json] [--history <file>] [--no-save]`
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
["--prompt", "--medium", "--surface", "--emotion", "--campaign", "--out", "--history"].forEach((f) => {
  const i = args.indexOf(f);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith("-")) flagValIndices.add(i + 1);
});

const prompt = getFlag("--prompt") || args.find((a, idx) => !a.startsWith("-") && !flagValIndices.has(idx)) || "default-brief";
const medium = (getFlag("--medium") || "web").toLowerCase();
const surfaceMode = (getFlag("--surface") || (medium === "book" ? "read" : "persuade")).toLowerCase();
// One campaign = one world: later mediums reuse the first brief's world instead of re-dealing.
const campaignPath = getFlag("--campaign");
let campaign = null;
if (campaignPath) {
  try {
    campaign = JSON.parse(fs.readFileSync(path.resolve(campaignPath), "utf8"));
  } catch (err) {
    console.error(`Cannot read --campaign brief ${campaignPath}: ${err.message}`);
    process.exit(3);
  }
  const known = (w) => w && typeof w.slug === "string" && DIRECTIONS.some((d) => d.slug === w.slug);
  if (!known(campaign.primary)) {
    console.error(`--campaign brief ${campaignPath} has no known primary world.`);
    process.exit(3);
  }
}

const emotionKey = (getFlag("--emotion") || (typeof campaign?.emotion?.target === "string" ? campaign.emotion.target : null) || DEFAULT_EMOTION_BY_SURFACE[surfaceMode] || "inviting").toLowerCase();
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
if (!Object.hasOwn(EMOTION_TARGETS, emotionKey)) {
  console.error(`Unknown --emotion "${emotionKey}". Valid emotions: ${Object.keys(EMOTION_TARGETS).join(", ")}`);
  process.exit(3);
}
const emotion = { target: emotionKey, ...EMOTION_TARGETS[emotionKey] };

const repoHash = crypto.createHash("sha256").update(process.cwd()).digest("hex").slice(0, 12);
const xdgBase = process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");
const defaultCacheDir = path.join(xdgBase, "design-27");
const historyFile = path.resolve(getFlag("--history") || path.join(defaultCacheDir, `history-${repoHash}.json`));

let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
  } catch {
    history = [];
  }
  if (!Array.isArray(history)) history = [];
  history = history.filter((h) => h && typeof h.primary === "string");
}

const recentSlugs = new Set(history.slice(-3).map((h) => h.primary));
const hash = crypto.createHash("sha256").update(`${prompt}:${medium}:${surfaceMode}:${history.length}`).digest();
const macroPool = MACROSTRUCTURES[medium] || MACROSTRUCTURES.web;
const macrostructure = macroPool[hash[2] % macroPool.length];

// Subject before chance: score worlds by the brief's domain words, then hash only among the best matches.
const promptLc = ` ${prompt.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
const domainScore = (d) => (d.domains || []).filter((w) => promptLc.includes(` ${w} `) || promptLc.includes(` ${w}s `)).length;
const compatible = DIRECTIONS.filter((d) => d.compatibleSurfaces.includes(surfaceMode));
const scored = compatible.map((d) => ({ d, score: domainScore(d) })).sort((a, b) => b.score - a.score);
const topScore = scored[0]?.score || 0;
const matched = topScore > 0 ? scored.filter((x) => x.score > 0).slice(0, 3).map((x) => x.d) : [];
const pool = matched.length >= 2 ? matched : matched.length === 1 ? [matched[0], ...compatible.filter((d) => d !== matched[0])] : compatible;
const fresh = pool.filter((d) => !recentSlugs.has(d.slug));
const candidates = fresh.length >= 2 ? fresh : pool.length >= 2 ? pool : DIRECTIONS;

const idxA = matched.length === 1 ? 0 : hash[0] % candidates.length;
const idxB = (idxA + 1 + (hash[1] % (candidates.length - 1))) % candidates.length;
const pick = (w) => structuredClone(DIRECTIONS.find((d) => d.slug === w.slug));
let primary = campaign ? pick(campaign.primary) : structuredClone(candidates[idxA]);
const alternate = campaign && campaign.alternate?.slug && DIRECTIONS.some((d) => d.slug === campaign.alternate.slug)
  ? pick(campaign.alternate)
  : structuredClone(candidates[idxB === idxA ? (idxA + 1) % candidates.length : idxB]);
const bannedCliche = campaign?.bannedCliche?.id
  ? BANNED_CLICHES.find((b) => b.id === campaign.bannedCliche.id) || BANNED_CLICHES[hash[3] % BANNED_CLICHES.length]
  : BANNED_CLICHES[hash[3] % BANNED_CLICHES.length];

// Tune the accent's relative chroma into the emotion band (hue + lightness kept), only if accent text stays legible.
function tuneAccent(world) {
  const acc = parseHex(world.tokens.accentFocal);
  const ink = parseHex(world.tokens.accentInk);
  const [lo, hi] = emotion.accentChroma;
  const rel = relativeChroma(acc);
  // Same 0.05 slack as the checker's brief-emotion-chroma-mismatch: no imperceptible micro-tunes.
  if (rel >= lo - 0.05 && rel <= hi + 0.05) return null;
  const { L, H } = rgbToOklch(acc);
  const targetC = Math.min(hi, Math.max(lo, rel)) * maxChroma(L, H);
  const tuned = oklchToRgb({ L, C: targetC, H }).map((v) => Math.max(0, Math.min(255, Math.round(v))));
  if (contrastRatio(ink, tuned) < 4.5 || Math.abs(computeApcaLc(ink, tuned)) < 60) return null;
  const hex = rgbToHex(tuned).toUpperCase();
  const from = world.tokens.accentFocal;
  world.tokens.accentFocal = hex;
  return { from, to: hex, relativeChroma: Number(relativeChroma(tuned).toFixed(2)) };
}
const accentTuning = tuneAccent(primary);
tuneAccent(alternate);

const chosenFonts = new Set(Object.values(primary.fonts).map((f) => f.toLowerCase()));
const defaultBannedFonts = ["Inter", "Roboto", "Poppins", "Montserrat", "Arial"].filter(
  (f) => !chosenFonts.has(f.toLowerCase())
);

const preEmitLock = "/* D27-Lock: Idea (SMP) | Mode | World | Macrostructure | Metaphor | Proof | Emotion (target, peak, end) | M4+ I4+ H4+ C5 R4+ */";
const signatureContract = {
  requireDiegeticMetaphor: true,
  // Default, waivable on record (Tier 2): only interactive media on Persuade/Experience surfaces.
  requireInteractiveProof: ["web", "animation", "mascot"].includes(medium) && ["persuade", "experience"].includes(surfaceMode),
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

const primaryBg = parseHex(primary.tokens.surfaceCanvas);
const primaryInk = parseHex(primary.tokens.inkPrimary);
const secondaryInk = parseHex(primary.tokens.inkSecondary);
const verifiedContrast = {
  primaryRatio: primaryBg && primaryInk ? Number(contrastRatio(primaryInk, primaryBg).toFixed(2)) : 0,
  secondaryRatio: primaryBg && secondaryInk ? Number(contrastRatio(secondaryInk, primaryBg).toFixed(2)) : 0,
  primaryApcaLc: primaryBg && primaryInk ? computeApcaLc(primaryInk, primaryBg) : 0,
  secondaryApcaLc: primaryBg && secondaryInk ? computeApcaLc(secondaryInk, primaryBg) : 0,
  floorMet: Boolean(
    primaryBg && primaryInk && secondaryInk &&
    contrastRatio(primaryInk, primaryBg) >= (surfaceMode === "read" ? 7.0 : 4.5) &&
    contrastRatio(secondaryInk, primaryBg) >= 4.5 &&
    Math.abs(computeApcaLc(primaryInk, primaryBg)) >= 75 &&
    Math.abs(computeApcaLc(secondaryInk, primaryBg)) >= 75
  ),
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
  emotion: { ...emotion, accentTuning },
  domainMatch: !campaign && matched.length ? matched.map((d) => d.slug) : null,
  campaign: campaign ? { source: path.basename(campaignPath), world: primary.slug } : null,
  verifiedContrast,
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
    // History holds prompt text: keep it private to the user (0700 dir, 0600 file).
    fs.mkdirSync(path.dirname(historyFile), { recursive: true, mode: 0o700 });
    history.push({
      timestamp: contract.generatedAt,
      prompt: prompt.slice(0, 120),
      medium,
      surfaceMode,
      primary: primary.slug,
      alternate: alternate.slug,
      macrostructure: macrostructure.slug,
    });
    writeFileSafe(historyFile, JSON.stringify(history.slice(-20), null, 2), 0o600);
  } catch {
    // Non-fatal in read-only sandboxes
  }
}

if (outFile) {
  const resolvedOut = path.resolve(outFile);
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  writeFileSafe(resolvedOut, JSON.stringify(contract, null, 2));
}

console.log(JSON.stringify(contract, null, 2));
