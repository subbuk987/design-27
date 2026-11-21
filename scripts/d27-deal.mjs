#!/usr/bin/env node
/**
 * Design 27 — Deterministic Anti-Convergence & World-Sync Direction Dealer
 * Usage: node scripts/d27-deal.mjs --prompt "<brief>" [--surface persuade|operate|read|experience] [--out brief.json] [--no-save]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const DIRECTIONS = [
  {
    slug: "swiss-editorial",
    label: "Swiss Editorial",
    surfaceWorld: "Archival paper or chalk ground + crisp 1px ink rules",
    fonts: "Inter Tight + Newsreader italic + IBM Plex Mono",
    materialRegister: "Crisp Geometric Vector",
    motionPhysics: "Expo out (0.16, 1, 0.3, 1); zero bounce",
    compatibleSurfaces: ["persuade", "read", "operate"],
  },
  {
    slug: "brutalist-poster",
    label: "Brutalist / Poster",
    surfaceWorld: "Raw bone or jet ground + 2-4px solid ink blocks + 1 electric spot",
    fonts: "Anton / Syne + Space Mono",
    materialRegister: "Risograph / Halftone Print",
    motionPhysics: "Hard cuts & snappy 150-240ms snaps",
    compatibleSurfaces: ["persuade", "experience"],
  },
  {
    slug: "tactile-playful",
    label: "Tactile Playful",
    surfaceWorld: "Warm oat or clay-tinted ground + soft tactile depth",
    fonts: "Bricolage Grotesque + Plus Jakarta Sans",
    materialRegister: "Tactile 3D Clay / Vinyl",
    motionPhysics: "Playful spring (stiffness 320, damping 18, mass 0.9)",
    compatibleSurfaces: ["persuade", "experience"],
  },
  {
    slug: "atmospheric-dark",
    label: "Atmospheric Dark",
    surfaceWorld: "Deep calibrated obsidian ground + rim-lit studio stages",
    fonts: "Geist / Space Grotesk + JetBrains Mono",
    materialRegister: "Technical Axonometric",
    motionPhysics: "Expo out (0.16, 1, 0.3, 1); cinematic 550-750ms hero",
    compatibleSurfaces: ["persuade", "experience", "operate"],
  },
  {
    slug: "utilitarian-technical",
    label: "Utilitarian Technical",
    surfaceWorld: "Neutral alabaster or carbon slate + precision tabular hairlines",
    fonts: "IBM Plex Sans + IBM Plex Mono",
    materialRegister: "Technical Axonometric",
    motionPhysics: "Fast quart out (0.25, 1, 0.5, 1); 120-200ms UI",
    compatibleSurfaces: ["operate", "read"],
  },
  {
    slug: "retro-zine",
    label: "Retro / Zine",
    surfaceWorld: "Uncoated newsprint + 2-color riso multiply overprint",
    fonts: "Instrument Serif + IBM Plex Mono + DM Sans",
    materialRegister: "Risograph / Halftone Print",
    motionPhysics: "Stepped 12-15fps tactile stutter or brisk 220ms cuts",
    compatibleSurfaces: ["persuade", "experience", "read"],
  },
  {
    slug: "luxury-minimal",
    label: "Luxury Minimal",
    surfaceWorld: "Limestone or deep espresso + 0px corners + 0.5px hairlines",
    fonts: "Cormorant Garamond + wide-tracked Plus Jakarta Sans",
    materialRegister: "Editorial Ink / Woodcut",
    motionPhysics: "Poised quintic in-out (0.65, 0, 0.35, 1)",
    compatibleSurfaces: ["persuade", "experience", "read"],
  },
];

const BANNED_CLICHES = [
  { id: "no-bento-soup", label: "No 3-column icon-in-a-box SaaS feature cards" },
  { id: "no-beige-cosplay", label: "No warm-beige + vermilion Monocle cosplay" },
  { id: "no-purple-glow", label: "No dark-slate purple-to-pink hero glow" },
  { id: "no-devtools-teal", label: "No obsidian + mint-teal DevTools cliché" },
  { id: "no-fake-macos", label: "No fake macOS window chrome around non-terminal content" },
  { id: "no-badge-stack", label: "No sparkle or badge pills stacked above section headings" },
];

const args = process.argv.slice(2);
const getFlag = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const prompt = getFlag("--prompt") || args.find((a) => !a.startsWith("-")) || "default-brief";
const surfaceMode = (getFlag("--surface") || "persuade").toLowerCase();
const outFile = getFlag("--out");
const noSave = args.includes("--no-save");

// Store history in OS cache dir by default so working repos never get dirty git status
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

const hash = crypto.createHash("sha256").update(`${prompt}:${surfaceMode}:${history.length}`).digest();
const idxA = hash[0] % candidates.length;
const idxB = (idxA + 1 + (hash[1] % (candidates.length - 1))) % candidates.length;
const bannedCliche = BANNED_CLICHES[hash[2] % BANNED_CLICHES.length];

const contract = {
  tool: "d27-deal",
  version: "2.1.0",
  surfaceMode,
  primary: candidates[idxA],
  alternate: candidates[idxB],
  bannedCliche,
  requiredRefs: [
    "references/direction-matrix.md",
    surfaceMode === "operate" ? "references/websites.md" : "references/websites.md",
    "references/qa-and-critique.md",
  ],
  clearedRecent: [...recentSlugs],
};

if (!noSave) {
  try {
    fs.mkdirSync(path.dirname(historyFile), { recursive: true });
    history.push({
      timestamp: new Date().toISOString(),
      prompt: prompt.slice(0, 120),
      surfaceMode,
      primary: contract.primary.slug,
      alternate: contract.alternate.slug,
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
