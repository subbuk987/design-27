#!/usr/bin/env node
/**
 * Design 27 — Deterministic Anti-Convergence Direction Dealer
 * Usage: node scripts/d27-deal.mjs --prompt "<brief>" [--history .design27/history.json] [--no-save]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DIRECTIONS = [
  { slug: "swiss-editorial", label: "Swiss Editorial", palette: "Archival White #FFFFFF + Ink #111214 + Cobalt #1746D1", fonts: "Inter Tight + Newsreader + IBM Plex Mono" },
  { slug: "brutalist-poster", label: "Brutalist / Poster", palette: "Jet #0A0A0A + Bone #F4F2EA + Acid Chartreuse #D8F238", fonts: "Anton / Syne + Space Mono" },
  { slug: "tactile-playful", label: "Tactile Playful", palette: "Warm Oat #FAF5EC + Plum Ink #1E1726 + Coral #E85D3F", fonts: "Bricolage Grotesque + Plus Jakarta Sans" },
  { slug: "atmospheric-dark", label: "Atmospheric Dark", palette: "Obsidian #090B10 + Slate #131722 + Ice Cyan #38BDF8", fonts: "Geist / Space Grotesk + JetBrains Mono" },
  { slug: "utilitarian-technical", label: "Utilitarian Technical", palette: "Alabaster #F8F9FA + Carbon #101214 + Emerald #0F766E", fonts: "IBM Plex Sans + IBM Plex Mono" },
  { slug: "retro-zine", label: "Retro / Zine", palette: "Newsprint #F1EAD8 + Soy Ink #1E1B18 + Riso Teal #0D7A72", fonts: "Instrument Serif + IBM Plex Mono + DM Sans" },
  { slug: "luxury-minimal", label: "Luxury Minimal", palette: "Limestone #F4F1EA + Espresso #141210 + Sand #9C8362", fonts: "Cormorant Garamond + Plus Jakarta Sans" },
];

const BANNED_CLICHES = [
  "No 3-column icon-in-a-box SaaS feature cards",
  "No warm-beige + vermilion Monocle cosplay",
  "No dark-slate purple-to-pink hero glow",
  "No centered-stack headline + 4 KPI tiles hero",
  "No fake macOS window chrome around non-terminal content",
  "No badge pills stacked above section headings",
];

const args = process.argv.slice(2);
const promptIdx = args.indexOf("--prompt");
const prompt = promptIdx !== -1 ? args[promptIdx + 1] : args.find((a) => !a.startsWith("-")) || "default-brief";
const histIdx = args.indexOf("--history");
const historyFile = path.resolve(histIdx !== -1 ? args[histIdx + 1] : ".design27/history.json");
const noSave = args.includes("--no-save");

let history = [];
if (fs.existsSync(historyFile)) {
  try {
    history = JSON.parse(fs.readFileSync(historyFile, "utf8"));
  } catch {
    history = [];
  }
}

const recentSlugs = new Set(history.slice(-3).map((h) => h.primary));
const pool = DIRECTIONS.filter((d) => !recentSlugs.has(d.slug));
const candidates = pool.length >= 2 ? pool : DIRECTIONS;

const hash = crypto.createHash("sha256").update(`${prompt}:${history.length}`).digest();
const idxA = hash[0] % candidates.length;
const idxB = (idxA + 1 + (hash[1] % (candidates.length - 1))) % candidates.length;
const cliché = BANNED_CLICHES[hash[2] % BANNED_CLICHES.length];

const pickA = candidates[idxA];
const pickB = candidates[idxB];

if (!noSave) {
  fs.mkdirSync(path.dirname(historyFile), { recursive: true });
  history.push({ timestamp: new Date().toISOString(), prompt: prompt.slice(0, 120), primary: pickA.slug, alternate: pickB.slug });
  fs.writeFileSync(historyFile, JSON.stringify(history.slice(-20), null, 2));
}

console.log(
  JSON.stringify(
    {
      tool: "d27-deal",
      primary: pickA,
      alternate: pickB,
      bannedCliche: cliché,
      clearedRecent: [...recentSlugs],
    },
    null,
    2
  )
);
