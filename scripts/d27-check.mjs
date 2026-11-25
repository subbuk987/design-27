#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Zero-Dependency Quality, SARIF 2.1.0, Contrast, Media, Prose & Chrome-CDP DOM Checker
 * Usage: node scripts/d27-check.mjs <file-or-dir> [flags]
 * Flags: --brief <file> --medium=<web|animation|motion|book|mascot|thumbnail> --render --snapshots <dir>
 *        --json --sarif --github --strict --tier=fast|deep --report-unused-ignores --list-rules --doctor
 *        --no-inline-ignores --target-lufs <num>
 * Exit codes: 0 = pass, 1 = fatal/IO error, 2 = compliance gate failed, 3 = CLI usage error
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { buildSarif } from "./lib/reporters.mjs";
import { parseIgnores, matchIgnore, getUnusedIgnores } from "./lib/ignores.mjs";
import { findChromeBinary, auditHtmlWithCdp, buildDomAuditFnSource } from "./lib/chrome-cdp.mjs";

const VERSION = "4.0.0";
const EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".svg", ".js", ".ts"]);
const BOOK_EXTENSIONS = new Set([...EXTENSIONS, ".md", ".typ"]);
const CODE_EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".js", ".ts"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm"]);
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".design27"]);
const KNOWN_MEDIUMS = new Set(["web", "animation", "motion", "book", "mascot", "thumbnail"]);
const KNOWN_FLAGS = [
  "--brief", "--medium", "--render", "--snapshots", "--json", "--sarif", "--github", "--strict",
  "--tier", "--report-unused-ignores", "--list-rules", "--doctor", "--no-inline-ignores",
  "--target-lufs", "--help", "-h",
];

function levenshtein(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return m[a.length][b.length];
}

function suggestFlag(bad) {
  let best = null;
  let dist = 99;
  for (const f of KNOWN_FLAGS) {
    const d = levenshtein(bad, f);
    if (d < dist) { dist = d; best = f; }
  }
  return dist <= 3 ? `Did you mean ${best}?` : "Run with --help to see valid flags.";
}

// Pure-JS WCAG 2.1 contrast & suggestedColor helper
function parseHex(hex) {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}
function relLuminance([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrastRatio(c1, c2) {
  const l1 = relLuminance(c1);
  const l2 = relLuminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
function suggestContrastingHex(fg, bg, minRatio = 4.5) {
  const bgLum = relLuminance(bg);
  const darken = bgLum > 0.4;
  for (let step = 1; step <= 20; step++) {
    const factor = step / 20;
    const cand = fg.map((v) => (darken ? v * (1 - factor) : v + (255 - v) * factor));
    if (contrastRatio(cand, bg) >= minRatio) return rgbToHex(cand);
  }
  return darken ? "#111214" : "#F7F7F5";
}

function probeBinary(cmd, args = ["-version"]) {
  const res = spawnSync(cmd, args, { encoding: "utf8" });
  if (res.error || res.status !== 0) return { available: false, version: null };
  const firstLine = (res.stdout || res.stderr || "").split(/\r?\n/)[0]?.trim() || "ok";
  return { available: true, version: firstLine.slice(0, 80) };
}

function lineNumberAt(content, index) {
  if (index <= 0) return 1;
  return content.slice(0, index).split(/\r?\n/).length;
}

function parseDurationMs(str) {
  const matches = [...str.matchAll(/(\d+(?:\.\d+)?)\s*(ms|s)\b/gi)];
  if (matches.length === 0) return null;
  let maxMs = 0;
  for (const m of matches) {
    const val = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    const ms = unit === "s" ? val * 1000 : val;
    if (ms > maxMs) maxMs = ms;
  }
  return maxMs;
}

function extractTagBlock(html, startIdx) {
  const openMatch = html.slice(startIdx).match(/^<([a-zA-Z0-9-]+)\b[^>]*>/);
  if (!openMatch) return "";
  const tag = openMatch[1].toLowerCase();
  const voidTags = new Set(["img", "br", "hr", "input", "meta", "link"]);
  if (voidTags.has(tag)) return openMatch[0];
  let depth = 0;
  const tagRe = new RegExp(`<(\\/?)${tag}\\b[^>]*>`, "gi");
  tagRe.lastIndex = startIdx;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[1] === "/") {
      depth -= 1;
      if (depth <= 0) return html.slice(startIdx, m.index + m[0].length);
    } else if (!m[0].endsWith("/>")) {
      depth += 1;
    }
  }
  return html.slice(startIdx);
}

function blankNonProseBlocks(html) {
  return html.replace(/<(head|style|script)\b[\s\S]*?<\/\1>/gi, (block) =>
    block.replace(/[^\r\n]/g, " ")
  );
}

function blankMarkdownCodeFences(md) {
  return md.replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\r\n]/g, ""));
}

const STRIP_D27_COMMENT_RE = /\/\*[^*]*(?:\*(?!\/)[^*]*)*\bd27-(?:disable|allow|ignore)(?:-(?:next-line|line))?\b[\s\S]*?\*\/|<!--[\s\S]*?\bd27-(?:disable|allow|ignore)(?:-(?:next-line|line))?\b[\s\S]*?-->|\/\/[^\r\n]*\bd27-(?:disable|allow|ignore)(?:-(?:next-line|line))?\b[^\r\n]*/gi;

const LINE_RULES = [
  {
    id: "no-transition-all", tier: "FLOOR", speed: "fast", medium: "web",
    regex: /\btransition\s*:\s*all\b|\btransition-all\b/i,
    message: "Catch-all `transition: all` / `transition-all` animates layout properties and causes jank.",
    fix: "Name explicit GPU properties: `transition: color 180ms, background-color 180ms, transform 240ms, opacity 240ms;`.",
  },
  {
    id: "no-overflow-x-hidden", tier: "FLOOR", speed: "fast", medium: "web",
    regex: /\boverflow-x\s*:\s*hidden\b/i,
    message: "`overflow-x: hidden` breaks `position: sticky` descendants.",
    fix: "Replace `overflow-x: hidden` with `overflow-x: clip`.",
  },
  {
    id: "no-100vw", tier: "FLOOR", speed: "fast", medium: "web",
    regex: /\b(?:width|min-width|max-width)\s*:\s*100vw\b|\bw-\[100vw\]/i,
    message: "`100vw` includes scrollbar width on Windows/Linux and causes horizontal overflow.",
    fix: "Use `width: 100%` or `max-width: 100%` instead of `100vw`.",
  },
  {
    id: "no-purple-slop-gradient", tier: "REFLEX", speed: "fast", medium: "web",
    regex: /(#6366f1.*#a855f7|#a855f7.*#ec4899|from-indigo-500.*via-purple-500|from-purple-500.*to-pink-500)/i,
    message: "Detected default AI purple-indigo-pink gradient slop.",
    fix: "Replace with a brief-calibrated 60/30/10 palette using semantic `:root` tokens.",
  },
  {
    id: "no-emoji-ui-icon", tier: "REFLEX", speed: "fast", medium: "web",
    regex: /<(?:h[1-6]|button|span|a|label|li)[^>]*>[^<]*[✨🚀🔥👋🎉💡⚡]/u,
    message: "Decorative emoji used inside UI heading, button, or label.",
    fix: "Remove the emoji or replace with a uniform monoline SVG icon (`16-18px`, `1.5px` stroke, `currentColor`).",
  },
  {
    id: "no-hype-copy", tier: "REFLEX", speed: "fast", medium: "all",
    regex: /\b(supercharge|revolutionize|game-changing|unlock the power|seamless experience)\b|Welcome back,\s*[^<]{1,30}!/i,
    message: "AI hype buzzword or generic greeting detected in interface copy.",
    fix: "Rewrite in plain, product-specific language with zero exclamation marks.",
  },
  {
    id: "no-fake-italic-heading", tier: "REFLEX", speed: "fast", medium: "web",
    regex: /<h[12][^>]*>[^<]*<(?:em|i)\b[^>]*>[^<\s]+<\/(?:em|i)>[^<]*<\/h[12]>/i,
    message: "Single italic word inside a roman display heading is a known AI fake-editorial cliché.",
    fix: "Keep display headings cohesive or use one of the 4 legal Tension Archetypes in `references/direction-matrix.md`.",
  },
  {
    id: "no-tiny-body-font", tier: "FLOOR", speed: "fast", medium: "web",
    regex: /\bbody\s*\{[^}]*font-size\s*:\s*(?:[0-9]|1[0-5])px\b/i,
    message: "Web body copy drops below the 16px legibility floor.",
    fix: "Set `body { font-size: clamp(1rem, 0.25vw + 0.95rem, 1.125rem); }` (`>= 16px`).",
  },
  {
    id: "no-nondeterministic-video", tier: "FLOOR", speed: "fast", medium: "motion", videoOnly: true,
    regex: /\b(Date\.now\s*\(|Math\.random\s*\(|requestAnimationFrame\s*\(|setTimeout\s*\(|setInterval\s*\(|repeat\s*:\s*-1)\b/,
    message: "Non-deterministic call (`Date.now`, `Math.random`, `rAF`, `setTimeout/Interval`, or `repeat: -1`) breaks seekable renders.",
    fix: "Derive every animated value purely from timeline `frame` / seeded PRNG and finite durations.",
  },
  {
    id: "no-wallclock-css-in-video", tier: "FLOOR", speed: "fast", medium: "motion", videoOnly: true,
    regex: /\b(transition\s*:|@keyframes\b)/i,
    message: "Wall-clock CSS `transition` or `@keyframes` inside a frame-stepped video composition drifts out of sync.",
    fix: "Drive motion from seekable timeline state (`useCurrentFrame()` in Remotion or paused `gsap.timeline` in HyperFrames).",
  },
  {
    id: "no-gsap-from-seek-drift", tier: "REFLEX", speed: "deep", medium: "motion", videoOnly: true,
    regex: /\bgsap\.from\s*\(/,
    message: "`gsap.from()` inside seekable scenes can drift when scrubbing backward.",
    fix: "Use explicit `gsap.fromTo(target, { ...from }, { ...to })` for deterministic backward/forward seeks.",
  },
  {
    id: "no-imperative-media-clock", tier: "FLOOR", speed: "deep", medium: "motion", videoOnly: true,
    regex: /\.\s*(?:play|pause)\s*\(\s*\)|\.currentTime\s*=/,
    message: "Imperative `.play()` / `.pause()` / `.currentTime =` breaks deterministic video frame-stepping.",
    fix: "Bind media timing declaratively to the composition timeline (`<OffthreadVideo>` or `<video data-start=...>`).",
  },
  {
    id: "no-layout-read-in-tick", tier: "FLOOR", speed: "deep", medium: "motion", videoOnly: true,
    regex: /onUpdate\s*:\s*.*(?:getBoundingClientRect|offsetWidth|offsetHeight|clientWidth|clientHeight)/,
    message: "DOM layout measurement inside `onUpdate` causes per-frame layout thrashing.",
    fix: "Pre-measure dimensions once before the timeline starts and animate GPU transforms only.",
  },
  {
    id: "no-permanent-will-change", tier: "REFLEX", speed: "deep", medium: "web",
    regex: /\bwill-change\s*:\s*(?:transform|opacity|all)\b/i,
    message: "Permanent `will-change` on static containers wastes GPU layer memory.",
    fix: "Remove static `will-change` or apply only during active interaction/animation.",
  },
];

const EXTRA_RULES = [
  { id: "no-eyebrow-spam", tier: "REFLEX", speed: "fast", medium: "web", message: ">= 4 tracked-uppercase eyebrow/meta tags immediately preceding headings in one HTML file.", fix: "Cap section eyebrows to 1-2 structural landmarks; vary section openings with direct headings, numbers, or artifacts." },
  { id: "no-scale-zero-entrance", tier: "REFLEX", speed: "fast", medium: "animation", message: "UI entrance/transition uses `scale(0)` instead of `scale(0.95 -> 1)`.", fix: "Animate UI surfaces from `scale(0.95)` to `scale(1)` anchored to the trigger `transform-origin`." },
  { id: "no-ease-in-ui-entrance", tier: "REFLEX", speed: "fast", medium: "animation", message: "UI entrance/transition > 220ms uses `ease-in` (feels sluggish on arrival).", fix: "Use `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out` for UI entrances under 300ms; reserve `ease-in` for exits." },
  { id: "no-freehand-svg-clipart", tier: "REFLEX", speed: "deep", medium: "web", message: "Inline <svg> has > 12 primitives without >= 3 named <g id> groups, `data-mascot`, or `data-asset=\"verified\"`.", fix: "Group mascot parts into named `<g id=\"...\">` layers, simplify diagram geometry, or mark verified assets `data-asset=\"verified\"`." },
  { id: "no-blind-silhouette-filter", tier: "FLOOR", speed: "fast", medium: "mascot", message: "`filter: brightness(0)` crushes mascot interior features into a featureless blob without `<mask>` or `--m-cut`/`--sil-bg` cutouts.", fix: "Use `--m-fill` / `--m-cut` CSS custom properties or `<mask>` Boolean cutouts so eyes and signature marks invert cleanly." },
  { id: "require-svg-named-groups", tier: "FLOOR", speed: "deep", medium: "mascot", message: "Primary mascot <svg> must contain >= 4 named `<g id=\"...\">` anatomy groups.", fix: "Structure the primary SVG into >= 4 semantic `<g id=\"...\">` groups (e.g. body, eyes, mouth, accent)." },
  { id: "thumbnail-word-ceiling", tier: "FLOOR", speed: "fast", medium: "thumbnail", message: "Primary thumbnail stage visible text exceeds the 5-word ceiling (0-4 words recommended).", fix: "Trim thumbnail overlay copy to 0-4 punchy tension words and put specific context in the paired Title." },
  { id: "thumbnail-deadzone-collision", tier: "FLOOR", speed: "deep", medium: "thumbnail", message: "Thumbnail text/heading overlaps the bottom-right timestamp dead zone (x >= 78%, y >= 82%).", fix: "Relocate headline/metric copy away from the bottom-right timestamp badge area." },
  { id: "no-ai-slop-vocabulary", tier: "FLOOR", speed: "fast", medium: "book", message: "AI prose cliché vocabulary detected (`delve`, `tapestry`, `testament`, `pivotal`, `underscore`, `realm`, `vibrant`, `multifaceted`, `overarching`).", fix: "Replace abstract AI filler words with concrete verbs, measurements, or domain nouns." },
  { id: "no-negative-parallelism-tic", tier: "REFLEX", speed: "fast", medium: "book", message: "Negative parallelism prose tic (`It's not just X — it's Y` / `not merely X, but Y`) detected.", fix: "State the actual claim directly without the formulaic negation contrast." },
  { id: "no-throat-clearing-opener", tier: "REFLEX", speed: "fast", medium: "book", message: "Paragraph opens with throat-clearing filler (`Moreover,`, `Furthermore,`, `Additionally,`, `In conclusion,`, `It is worth noting`).", fix: "Cut the transition crutch and lead directly with the noun, verb, or evidence." },
  { id: "no-double-signaled-paragraphs", tier: "FLOOR", speed: "deep", medium: "book", message: "Book stylesheet combines positive `text-indent` (`first-line-indent`) with positive paragraph `margin-bottom`/`spacing`.", fix: "Pick one paragraph separator: either `text-indent` with `margin-bottom: 0`, OR vertical spacing with `text-indent: 0`." },
  { id: "require-reduced-motion", tier: "FLOOR", speed: "deep", medium: "web", message: "CSS animation/keyframes declared without a `prefers-reduced-motion: reduce` fallback.", fix: "Add `@media (prefers-reduced-motion: reduce)` neutralizing animations/transitions." },
  { id: "require-focus-visible", tier: "FLOOR", speed: "deep", medium: "web", message: "Interactive elements styled without an explicit `:focus-visible` indicator.", fix: "Add `:focus-visible { outline: 2px solid var(--accent-focal, currentColor); outline-offset: 2px; }`." },
  { id: "wcag-contrast-fail", tier: "FLOOR", speed: "fast", medium: "web", message: "Declared semantic ink token fails WCAG 2.1 4.5:1 contrast floor against `--surface-canvas`.", fix: "Adjust `--ink-primary` / `--ink-secondary` to meet >= 4.5:1 (>= 7:1 recommended for primary ink)." },
  { id: "brief-require-tokens", tier: "FLOOR", speed: "deep", medium: "web", message: "Active brief requires semantic `:root` design tokens.", fix: "Declare `--surface-canvas`, `--ink-primary`, and `--accent-focal` inside `:root`." },
  { id: "brief-banned-default-used", tier: "FLOOR", speed: "deep", medium: "web", message: "Built CSS uses a banned default font from the active brief.", fix: "Replace the banned default font with the brief's dealt typography." },
  { id: "brief-banned-cliche", tier: "FLOOR", speed: "deep", medium: "web", message: "Output tripped the dealt banned cliché signature.", fix: "Recalibrate palette and layout to match the dealt Material World." },
  { id: "require-mp4-faststart", tier: "REFLEX", speed: "fast", medium: "motion", message: "MP4 `moov` atom is not before `mdat`.", fix: "Re-mux with `-movflags +faststart`." },
  { id: "require-yuv420p", tier: "FLOOR", speed: "fast", medium: "motion", message: "Video pixel format is not `yuv420p`.", fix: "Encode with `-pix_fmt yuv420p`." },
  { id: "require-cfr", tier: "FLOOR", speed: "fast", medium: "motion", message: "Variable frame rate detected in video stream.", fix: "Force constant frame rate with `-fps_mode cfr`." },
  { id: "require-full-bt709", tier: "REFLEX", speed: "fast", medium: "motion", message: "Incomplete Rec.709 color tags in video stream.", fix: "Pass `-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv`." },
  { id: "require-av-parity", tier: "FLOOR", speed: "fast", medium: "motion", message: "Audio/video duration mismatch exceeds 0.05s ceiling.", fix: "Align audio and video stream durations." },
  { id: "video-loudness-floor", tier: "FLOOR", speed: "fast", medium: "motion", message: "Integrated loudness is outside target LUFS ±2.0.", fix: "Apply two-pass linear `loudnorm`." },
  { id: "video-true-peak", tier: "FLOOR", speed: "fast", medium: "motion", message: "Audio true peak exceeds -1.0 dBFS ceiling.", fix: "Set `TP=-1.0` in two-pass linear `loudnorm`." },
  { id: "first-frame-empty", tier: "FLOOR", speed: "deep", medium: "all", message: "Rendered viewport has no visible text on initial paint.", fix: "Ensure visible content renders on initial paint." },
  { id: "render-no-overflow-x", tier: "FLOOR", speed: "deep", medium: "web", message: "Rendered horizontal overflow detected.", fix: "Audit grid tracks (`minmax(0, 1fr)`), `overflow-x: clip`, and media widths." },
  { id: "render-body-font-floor", tier: "FLOOR", speed: "deep", medium: "web", message: "Computed body font-size is below 16px floor.", fix: "Raise base body font-size to >= 16px." },
  { id: "assert-selector-missing", tier: "FLOOR", speed: "deep", medium: "all", message: "Brief assertion selector matched 0 elements.", fix: "Ensure the required DOM element is rendered." },
  { id: "assert-above-the-fold", tier: "FLOOR", speed: "deep", medium: "all", message: "Brief assertion element falls below the initial viewport fold.", fix: "Keep hero headline/stage above the fold." },
  { id: "assert-before", tier: "FLOOR", speed: "deep", medium: "all", message: "Brief assertion visual ordering check failed.", fix: "Ensure primary element appears vertically before secondary element." },
  { id: "assert-stays-in-frame", tier: "FLOOR", speed: "deep", medium: "all", message: "Brief assertion element overflows viewport horizontal frame.", fix: "Constrain element within viewport width (`max-width: 100%`)." },
  { id: "runtime-error", tier: "FLOOR", speed: "deep", medium: "all", message: "Uncaught page runtime or asset request error during render audit.", fix: "Fix broken script or missing asset request." },
  { id: "render-unavailable", tier: "FLOOR", speed: "deep", medium: "all", message: "Requested --render audit could not run (neither Playwright nor headless Chrome CDP available).", fix: "Install Google Chrome/Chromium or Playwright, or run without --render." },
];

const ALL_RULES = [...LINE_RULES, ...EXTRA_RULES];

// CLI parsing
const args = process.argv.slice(2);
const VALUE_FLAGS = new Set(["--brief", "--snapshots", "--medium", "--target-lufs", "--tier"]);
const consumedValueIndices = new Set();
const flagValues = new Map();
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith("-")) continue;
  const eqIdx = a.indexOf("=");
  if (eqIdx !== -1) {
    const base = a.slice(0, eqIdx);
    if (VALUE_FLAGS.has(base)) flagValues.set(base, a.slice(eqIdx + 1));
  } else if (VALUE_FLAGS.has(a) && i + 1 < args.length) {
    const next = args[i + 1];
    if (!next.startsWith("-") || /^-\d+(?:\.\d+)?$/.test(next)) {
      flagValues.set(a, next);
      consumedValueIndices.add(i + 1);
      i++;
    }
  }
}
const getFlagValue = (flag) => (flagValues.has(flag) ? flagValues.get(flag) : null);

const jsonMode = args.includes("--json");
const sarifMode = args.includes("--sarif");
const githubMode = args.includes("--github");
const strictMode = args.includes("--strict");
const renderMode = args.includes("--render");
const doctorMode = args.includes("--doctor");
const listRulesMode = args.includes("--list-rules");
const reportUnused = args.includes("--report-unused-ignores");
const noInlineIgnores = args.includes("--no-inline-ignores");

const tierArg = getFlagValue("--tier") || "deep";
const briefPath = getFlagValue("--brief");
const explicitMedium = getFlagValue("--medium")?.toLowerCase() || null;
const snapshotsDir = getFlagValue("--snapshots");
const targetLufs = Number(getFlagValue("--target-lufs") ?? "-14");

// Validate unknown flags with Levenshtein hints (skipping consumed flag value indices)
for (let i = 0; i < args.length; i++) {
  if (consumedValueIndices.has(i)) continue;
  const a = args[i];
  if (a.startsWith("-")) {
    const base = a.split("=")[0];
    if (!KNOWN_FLAGS.includes(base)) {
      const err = { ok: false, error: { code: "unknown_flag", message: `Unknown flag: ${base}`, hint: suggestFlag(base) } };
      console.error(jsonMode ? JSON.stringify(err, null, 2) : `${err.error.message}. ${err.error.hint}`);
      process.exit(3);
    }
  }
}

if (explicitMedium && !KNOWN_MEDIUMS.has(explicitMedium)) {
  const err = {
    ok: false,
    error: {
      code: "unknown_medium",
      message: `Unknown --medium value: ${explicitMedium}`,
      hint: `Valid mediums: ${[...KNOWN_MEDIUMS].join(", ")}`,
    },
  };
  console.error(jsonMode ? JSON.stringify(err, null, 2) : `${err.error.message}. ${err.error.hint}`);
  process.exit(3);
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(
    `Design 27 Check v${VERSION}\n` +
    `Usage: node scripts/d27-check.mjs <file-or-dir> [--brief brief.json] [--medium web|animation|motion|book|mascot|thumbnail]\n` +
    `       [--render] [--snapshots dir] [--json|--sarif|--github] [--strict] [--tier=fast|deep]\n` +
    `       [--report-unused-ignores] [--list-rules] [--doctor] [--no-inline-ignores] [--target-lufs -14]`
  );
  process.exit(0);
}

if (listRulesMode) {
  if (jsonMode) {
    console.log(JSON.stringify(ALL_RULES.map(({ id, tier, speed, medium, message }) => ({ id, tier, speed, medium, message })), null, 2));
  } else {
    for (const r of ALL_RULES) console.log(`${r.id.padEnd(30)} [${r.tier.padEnd(6)}] (${r.speed}/${r.medium}) ${r.message}`);
  }
  process.exit(0);
}

if (doctorMode) {
  const ffprobe = probeBinary("ffprobe");
  const ffmpeg = probeBinary("ffmpeg");
  let pwAvailable = false;
  try { await import("playwright"); pwAvailable = true; } catch { pwAvailable = false; }
  const chromeBinary = findChromeBinary();
  const capabilities = ["static", "brief", "sarif", "github-annotations"];
  if (ffprobe.available) capabilities.push("video-probe");
  if (ffmpeg.available) capabilities.push("video-craft", "ebur128");
  if (pwAvailable || chromeBinary) capabilities.push("render-dom", "snapshots");
  const report = {
    ok: true,
    version: VERSION,
    node: { version: process.version, ok: true },
    ffprobe,
    ffmpeg,
    playwright: { available: pwAvailable },
    chromeCdp: { available: Boolean(chromeBinary), binary: chromeBinary },
    capabilities,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const targetArg = args.find((a, i) => !a.startsWith("-") && !consumedValueIndices.has(i));

if (!targetArg) {
  const err = { ok: false, error: { code: "missing_target", message: "No target file or directory provided.", hint: "Pass a file or directory path, or use --doctor / --list-rules." } };
  if (sarifMode) console.log(JSON.stringify(buildSarif({ version: VERSION, rules: ALL_RULES, findings: [], executionSuccessful: false }), null, 2));
  else console.error(jsonMode ? JSON.stringify(err, null, 2) : `${err.error.message} ${err.error.hint}`);
  process.exit(1);
}

const targetPath = path.resolve(targetArg);
if (!fs.existsSync(targetPath)) {
  if (sarifMode) console.log(JSON.stringify(buildSarif({ version: VERSION, rules: ALL_RULES, findings: [], executionSuccessful: false }), null, 2));
  else console.error(`Target not found: ${targetPath}`);
  process.exit(1);
}

let activeBrief = null;
if (briefPath && fs.existsSync(path.resolve(briefPath))) {
  activeBrief = JSON.parse(fs.readFileSync(path.resolve(briefPath), "utf8"));
}

const targetStat = fs.statSync(targetPath);
const targetExt = targetStat.isFile() ? path.extname(targetPath).toLowerCase() : "";
const effectiveMedium =
  explicitMedium ||
  activeBrief?.medium?.toLowerCase() ||
  ((targetExt === ".typ" || targetExt === ".md") ? "book" : "web");

function collectFiles(entry) {
  const stat = fs.statSync(entry);
  if (stat.isFile()) return [entry];
  const allowedExts = effectiveMedium === "book" ? BOOK_EXTENSIONS : EXTENSIONS;
  const out = [];
  for (const name of fs.readdirSync(entry)) {
    if (IGNORE_DIRS.has(name)) continue;
    const full = path.join(entry, name);
    const s = fs.statSync(full);
    if (s.isDirectory()) out.push(...collectFiles(full));
    else {
      const ext = path.extname(name).toLowerCase();
      if (allowedExts.has(ext) || VIDEO_EXTS.has(ext)) out.push(full);
    }
  }
  return out;
}

const findings = [];
const suppressed = [];
const files = collectFiles(targetPath);
const mediaAudit = { ran: false, ffmpegCraftRan: false };

function recordFinding(finding, directives) {
  if (!noInlineIgnores && directives) {
    const matched = matchIgnore(directives, finding.rule, finding.line);
    if (matched) {
      suppressed.push({ file: finding.file, line: finding.line, rule: finding.rule, reason: matched.reason || "inline-ignore" });
      return;
    }
  }
  findings.push(finding);
}

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const ext = path.extname(file).toLowerCase();

  // Video export inspection (ffprobe + faststart + ebur128)
  if (VIDEO_EXTS.has(ext)) {
    mediaAudit.ran = true;
    if (ext === ".mp4") {
      try {
        const fd = fs.openSync(file, "r");
        const buf = Buffer.alloc(65536);
        const bytes = fs.readSync(fd, buf, 0, buf.length, 0);
        fs.closeSync(fd);
        const head = buf.subarray(0, bytes);
        const moovIdx = head.indexOf("moov");
        const mdatIdx = head.indexOf("mdat");
        if (moovIdx === -1 || (mdatIdx !== -1 && moovIdx > mdatIdx)) {
          findings.push({
            file: rel, line: 1, tier: "REFLEX", rule: "require-mp4-faststart",
            message: "MP4 `moov` atom is not before `mdat` (delays web/social playback start).",
            fix: "Re-mux with `-movflags +faststart`.",
          });
        }
      } catch { /* ignore */ }
    }

    try {
      const out = execFileSync("ffprobe", ["-v", "error", "-show_streams", "-of", "json", file], { encoding: "utf8" });
      const info = JSON.parse(out);
      const streams = info.streams || [];
      const vStream = streams.find((s) => s.codec_type === "video");
      const aStream = streams.find((s) => s.codec_type === "audio");

      if (vStream) {
        if (vStream.pix_fmt && vStream.pix_fmt !== "yuv420p") {
          findings.push({
            file: rel, line: 1, tier: "FLOOR", rule: "require-yuv420p",
            message: `Video pixel format is \`${vStream.pix_fmt}\` (breaks Safari/iOS/social playback).`,
            fix: "Encode with `-c:v libx264 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart`.",
          });
        }
        if (vStream.r_frame_rate && vStream.avg_frame_rate && vStream.r_frame_rate !== vStream.avg_frame_rate) {
          findings.push({
            file: rel, line: 1, tier: "FLOOR", rule: "require-cfr",
            message: `Variable frame rate detected (r_frame_rate=${vStream.r_frame_rate}, avg=${vStream.avg_frame_rate}).`,
            fix: "Force constant frame rate with `-fps_mode cfr`.",
          });
        }
        if (vStream.color_space === "bt709" && (vStream.color_primaries !== "bt709" || vStream.color_transfer !== "bt709")) {
          findings.push({
            file: rel, line: 1, tier: "REFLEX", rule: "require-full-bt709",
            message: "Incomplete Rec.709 color tags can cause Safari/QuickTime gamma shifts.",
            fix: "Pass all four flags: `-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv`.",
          });
        }
        if (aStream && vStream.duration && aStream.duration) {
          const drift = Math.abs(parseFloat(vStream.duration) - parseFloat(aStream.duration));
          if (drift > 0.05) {
            findings.push({
              file: rel, line: 1, tier: "FLOOR", rule: "require-av-parity",
              message: `Audio/video duration mismatch of ${drift.toFixed(3)}s exceeds 0.05s lip-sync ceiling.`,
              fix: "Align audio and video duration (`-shortest` or dynamic `calculateMetadata` probing).",
            });
          }
        }
        if (aStream) {
          const eb = spawnSync("ffmpeg", ["-nostats", "-i", file, "-filter_complex", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" });
          if (!eb.error && eb.stderr) {
            mediaAudit.ffmpegCraftRan = true;
            const iMatch = eb.stderr.match(/Integrated loudness:[\s\S]*?I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/);
            const pMatch = eb.stderr.match(/True peak:[\s\S]*?Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS/);
            if (iMatch) {
              const lufs = parseFloat(iMatch[1]);
              if (Math.abs(lufs - targetLufs) > 2.0) {
                findings.push({
                  file: rel, line: 1, tier: "FLOOR", rule: "video-loudness-floor",
                  message: `Integrated loudness ${lufs} LUFS is outside target ${targetLufs} ±2.0 LUFS.`,
                  fix: `Apply two-pass linear loudnorm targeting I=${targetLufs}:TP=-1.0.`,
                });
              }
            }
            if (pMatch && parseFloat(pMatch[1]) > -1.0) {
              findings.push({
                file: rel, line: 1, tier: "FLOOR", rule: "video-true-peak",
                message: `Audio true peak ${pMatch[1]} dBFS exceeds -1.0 dBFS ceiling.`,
                fix: "Set `TP=-1.0` in two-pass linear `loudnorm`.",
              });
            }
          }
        }
      }
    } catch { /* ffprobe unavailable */ }
    continue;
  }

  const content = fs.readFileSync(file, "utf8");
  const directives = noInlineIgnores ? [] : parseIgnores(content);
  const lines = content.split(/\r?\n/);
  const isVideoFile =
    explicitMedium && explicitMedium !== "motion"
      ? false
      : effectiveMedium === "motion" ||
        /(remotion|hyperframes)/i.test(path.basename(file)) ||
        /\buseCurrentFrame\b|window\.__timelines\b|window\.__d27Seek\b/.test(content);
  const isCodeFile = CODE_EXTENSIONS.has(ext) || ext === ".svg";
  const hasCutoutArch = /<mask\b|--m-cut\b|--sil-bg\b/i.test(content);

  // Line rules for code & SVG files
  if (isCodeFile) {
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const lineForRules = line.replace(STRIP_D27_COMMENT_RE, "");
      for (const rule of LINE_RULES) {
        if (tierArg === "fast" && rule.speed !== "fast") continue;
        if (rule.videoOnly && !isVideoFile) continue;
        if (rule.regex.test(lineForRules)) {
          recordFinding({ file: rel, line: lineNum, tier: rule.tier, rule: rule.id, message: rule.message, fix: rule.fix }, directives);
        }
      }

      // Rule 2: no-scale-zero-entrance
      if (!isVideoFile && !/^\s*(?:\/\/|\/\*|\*|<!--)/.test(lineForRules)) {
        if (/\bscale(?:3d|X|Y)?\s*\(\s*0(?:\s*,\s*0(?:\s*,\s*0)?)?\s*\)/i.test(lineForRules)) {
          recordFinding({
            file: rel, line: lineNum, tier: "REFLEX", rule: "no-scale-zero-entrance",
            message: "UI animation uses `scale(0)` which looks artificial and disconnected from trigger geometry.",
            fix: "Animate from `scale(0.95)` to `scale(1)` anchored to the trigger `transform-origin`.",
          }, directives);
        }
      }

      // Rule 3: no-ease-in-ui-entrance (single-line declaration check)
      if (!isVideoFile && !/^\s*(?:\/\/|\/\*|\*|<!--)/.test(lineForRules)) {
        if (/\bease-in(?!-out)\b/i.test(lineForRules) && !/\b(exit|leave|out|close|dismiss|hide)\b/i.test(lineForRules)) {
          const durMs = parseDurationMs(lineForRules);
          if (durMs !== null && durMs > 220) {
            recordFinding({
              file: rel, line: lineNum, tier: "REFLEX", rule: "no-ease-in-ui-entrance",
              message: `UI transition/animation (${durMs}ms) uses \`ease-in\` on entrance (> 220ms feels sluggish).`,
              fix: "Use `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out` under 300ms; reserve `ease-in` for exits.",
            }, directives);
          }
        }
      }

      // Rule 5: no-blind-silhouette-filter
      if (/\bfilter\s*:[^;\n]*\bbrightness\(\s*0(?:\.0+)?\s*\)/i.test(lineForRules) && !hasCutoutArch) {
        recordFinding({
          file: rel, line: lineNum,
          tier: effectiveMedium === "mascot" ? "FLOOR" : "REFLEX",
          rule: "no-blind-silhouette-filter",
          message: "`filter: brightness(0)` silhouettes flatten interior features into a solid blob without `<mask>` or `--m-cut`/`--sil-bg`.",
          fix: "Invert interior features with `--m-fill` / `--m-cut` CSS custom properties or a `<mask>` cutout.",
        }, directives);
      }
    });

    // Rule 3 multi-line CSS block check for `ease-in` + duration > 220ms
    if (!isVideoFile && tierArg !== "fast") {
      const ruleBlockRe = /([^{}]+)\{([^{}]+)\}/g;
      let m;
      while ((m = ruleBlockRe.exec(content)) !== null) {
        const selector = m[1];
        const body = m[2];
        if (/\b(exit|leave|out|close|dismiss|hide)\b/i.test(selector)) continue;
        if (/\b(?:transition|animation)-timing-function\s*:\s*ease-in(?!-out)\b/i.test(body)) {
          const durMs = parseDurationMs(body);
          if (durMs !== null && durMs > 220) {
            const lineNum = lineNumberAt(content, m.index);
            const alreadyFlagged = findings.some((f) => f.file === rel && f.line === lineNum && f.rule === "no-ease-in-ui-entrance");
            if (!alreadyFlagged) {
              recordFinding({
                file: rel, line: lineNum, tier: "REFLEX", rule: "no-ease-in-ui-entrance",
                message: `CSS block \`${selector.trim().slice(0, 40)}\` uses \`ease-in\` with ${durMs}ms duration (> 220ms).`,
                fix: "Switch entrance timing to `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out`.",
              }, directives);
            }
          }
        }
      }
    }
  }

  // HTML / CSS / SVG structural checks
  if ([".html", ".htm", ".css", ".scss", ".svg"].includes(ext)) {
    if ([".html", ".htm", ".css", ".scss"].includes(ext)) {
      if (tierArg !== "fast") {
        const hasAnimation = /@keyframes\b|\banimation\s*:/.test(content);
        const hasReducedMotion = /prefers-reduced-motion/.test(content);
        if (hasAnimation && !hasReducedMotion && !isVideoFile) {
          recordFinding({
            file: rel, line: 1, tier: "FLOOR", rule: "require-reduced-motion",
            message: "CSS animation/keyframes declared without a `prefers-reduced-motion: reduce` fallback.",
            fix: "Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`.",
          }, directives);
        }

        const hasInteractive = /<(?:button|a|input|select)\b/i.test(content);
        const hasFocusVisible = /:focus-visible/.test(content);
        if (hasInteractive && /<style\b/i.test(content) && !hasFocusVisible) {
          recordFinding({
            file: rel, line: 1, tier: "FLOOR", rule: "require-focus-visible",
            message: "Interactive elements styled without an explicit `:focus-visible` indicator.",
            fix: "Add `:focus-visible { outline: 2px solid var(--accent-focal, currentColor); outline-offset: 2px; }`.",
          }, directives);
        }
      }

      // Pure-JS WCAG 2.1 contrast check on declared :root --surface-canvas vs --ink-primary / --ink-secondary
      const canvasHex = content.match(/--surface-canvas\s*:\s*(#[0-9a-f]{3,6})\b/i)?.[1];
      const inkPrimaryHex = content.match(/--ink-primary\s*:\s*(#[0-9a-f]{3,6})\b/i)?.[1];
      const inkSecondaryHex = content.match(/--ink-secondary\s*:\s*(#[0-9a-f]{3,6})\b/i)?.[1];
      const primaryMinRatio = (effectiveMedium === "book" || activeBrief?.surfaceMode === "read") ? 7.0 : 4.5;
      if (canvasHex && inkPrimaryHex) {
        const bg = parseHex(canvasHex), fg = parseHex(inkPrimaryHex);
        if (bg && fg) {
          const ratio = contrastRatio(fg, bg);
          if (ratio < primaryMinRatio) {
            const suggested = suggestContrastingHex(fg, bg, 7.0);
            recordFinding({
              file: rel, line: 1, tier: "FLOOR", rule: "wcag-contrast-fail",
              message: `--ink-primary (${inkPrimaryHex}) on --surface-canvas (${canvasHex}) has ratio ${ratio.toFixed(2)}:1 (< ${primaryMinRatio.toFixed(1)}:1 floor).`,
              suggestedColor: suggested,
              fix: `Change --ink-primary from ${inkPrimaryHex} to ${suggested}.`,
            }, directives);
          }
        }
      }
      if (canvasHex && inkSecondaryHex) {
        const bg = parseHex(canvasHex), fg = parseHex(inkSecondaryHex);
        if (bg && fg) {
          const ratio = contrastRatio(fg, bg);
          if (ratio < 4.5) {
            const suggested = suggestContrastingHex(fg, bg, 4.6);
            recordFinding({
              file: rel, line: 1, tier: "FLOOR", rule: "wcag-contrast-fail",
              message: `--ink-secondary (${inkSecondaryHex}) on --surface-canvas (${canvasHex}) has ratio ${ratio.toFixed(2)}:1 (< 4.5:1 floor).`,
              suggestedColor: suggested,
              fix: `Change --ink-secondary from ${inkSecondaryHex} to ${suggested}.`,
            }, directives);
          }
        }
      }

      // Rule 12 (CSS): no-double-signaled-paragraphs
      if (tierArg !== "fast") {
        const pBlocks = [...content.matchAll(/(?:^|[\s,}])p\s*\{([^}]*)\}/gi)];
        if (pBlocks.length > 0) {
          let hasPosIndent = false;
          let hasPosBottomMargin = false;
          let firstLine = 1;
          for (const pb of pBlocks) {
            const body = pb[1];
            const ti = body.match(/\btext-indent\s*:\s*([0-9.]+)(?:px|em|rem|ch|pt|%)?/i);
            const mb = body.match(/\bmargin(?:-bottom|-block-end)\s*:\s*([0-9.]+)(?:px|em|rem|ch|pt|%)?/i);
            if (ti && parseFloat(ti[1]) > 0) { hasPosIndent = true; firstLine = lineNumberAt(content, pb.index); }
            if (mb && parseFloat(mb[1]) > 0) { hasPosBottomMargin = true; firstLine = lineNumberAt(content, pb.index); }
          }
          if (hasPosIndent && hasPosBottomMargin) {
            recordFinding({
              file: rel, line: firstLine,
              tier: effectiveMedium === "book" ? "FLOOR" : "REFLEX",
              rule: "no-double-signaled-paragraphs",
              message: "Paragraph style combines positive `text-indent` with positive bottom margin (double-signaled paragraphs).",
              fix: "Use `text-indent` with `margin-bottom: 0`, OR paragraph spacing with `text-indent: 0`.",
            }, directives);
          }
        }
      }
    }

    // Rule 1: no-eyebrow-spam (>= 4 tracked-uppercase eyebrow/meta tags immediately before headings)
    if ([".html", ".htm"].includes(ext)) {
      const eyebrowRe = /<(span|div|p|small|strong|em)\b([^>]*)>([\s\S]{1,140}?)<\/\1>\s*<h[1-6]\b/gi;
      const eyebrowMatches = [];
      let em;
      while ((em = eyebrowRe.exec(content)) !== null) {
        const attrs = em[2];
        const innerText = em[3].replace(/<[^>]+>/g, "").trim();
        const hasEyebrowClass = /\bclass\s*=\s*["'][^"']*(?:eyebrow|kicker|overline|meta|section-tag|badge|tag|cap|label)[^"']*["']/i.test(attrs);
        const hasUppercaseStyle = /text-transform\s*:\s*uppercase|\buppercase\b/i.test(attrs);
        const isAllCapsShort = /^[A-Z0-9\s/·•\-—:]{2,45}$/.test(innerText) && /[A-Z]{2,}/.test(innerText);
        if (hasEyebrowClass || hasUppercaseStyle || isAllCapsShort) {
          eyebrowMatches.push(lineNumberAt(content, em.index));
        }
      }
      if (eyebrowMatches.length >= 4) {
        recordFinding({
          file: rel, line: eyebrowMatches[3], tier: "REFLEX", rule: "no-eyebrow-spam",
          message: `Found ${eyebrowMatches.length} tracked-uppercase eyebrow/meta tags stamped before headings.`,
          fix: "Limit section eyebrows to 1-2 structural landmarks; vary section openings without mechanical kickers.",
        }, directives);
      }

      // Rule 7: thumbnail-word-ceiling
      const hasThumbMarker = /\b(?:id\s*=\s*["']thumbnail-canvas["']|data-thumbnail\b|class\s*=\s*["'][^"']*\byt-thumb\b)/i.test(content);
      if (effectiveMedium === "thumbnail" || hasThumbMarker) {
        const stageMatch = content.match(/<(?:div|section|main|figure)\b[^>]*(?:id\s*=\s*["']thumbnail-canvas["']|data-thumbnail\b|class\s*=\s*["'][^"']*\byt-thumb\b)[^>]*>/i);
        let stageHtml = "";
        let stageLine = 1;
        if (stageMatch) {
          stageHtml = extractTagBlock(content, stageMatch.index);
          stageLine = lineNumberAt(content, stageMatch.index);
        } else {
          const bodyMatch = content.match(/<body\b[^>]*>[\s\S]*?<\/body>/i);
          stageHtml = bodyMatch ? bodyMatch[0] : content;
        }
        const cleanedStage = stageHtml
          .replace(/<(?:style|script)\b[\s\S]*?<\/\s*(?:style|script)>/gi, " ")
          .replace(/<!--[\s\S]*?-->/g, " ")
          .replace(/<(?:span|div|time)\b[^>]*(?:class\s*=\s*["'][^"']*(?:yt-duration|timestamp)[^"']*["']|data-timestamp)[^>]*>[\s\S]*?<\/\s*(?:span|div|time)>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&[a-z0-9#]+;/gi, " ")
          .trim();
        const words = cleanedStage ? cleanedStage.split(/\s+/).filter(Boolean) : [];
        if (words.length > 5) {
          recordFinding({
            file: rel, line: stageLine, tier: "FLOOR", rule: "thumbnail-word-ceiling",
            message: `Primary thumbnail stage has ${words.length} words ("${words.slice(0, 6).join(" ")}..."), exceeding the 5-word ceiling.`,
            fix: "Cut thumbnail stage copy to 0-4 words and move explanatory context into the paired video/article Title.",
          }, directives);
        }
      }
    }

    // Rule 4 & 6: SVG checks (no-freehand-svg-clipart + require-svg-named-groups)
    if (tierArg !== "fast") {
      const svgRe = /<svg\b[\s\S]*?<\/svg>/gi;
      const svgMatches = [...content.matchAll(svgRe)];
      for (const sm of svgMatches) {
        const svg = sm[0];
        const svgLine = lineNumberAt(content, sm.index);
        const namedGroups = (svg.match(/<g\b[^>]*\bid\s*=\s*["'][^"']+["']/gi) || []).length;
        if (
          !/data-asset\s*=\s*["']verified["']/i.test(svg) &&
          !/data-d27-allow/i.test(svg) &&
          !/\bdata-mascot\b/i.test(svg) &&
          namedGroups < 3
        ) {
          const primitives = (svg.match(/<(?:path|circle|ellipse|polygon|polyline|rect)\b/gi) || []).length;
          if (primitives > 12) {
            recordFinding({
              file: rel, line: svgLine, tier: "REFLEX", rule: "no-freehand-svg-clipart",
              message: `Inline <svg> has ${primitives} primitives without >= 3 named <g id> groups or \`data-asset="verified"\`.`,
              fix: "Organize mascot anatomy into named `<g id=\"...\">` groups, simplify diagram primitives, or mark `data-asset=\"verified\"`.",
            }, directives);
          }
        }
      }

      if ((effectiveMedium === "mascot" || /\bdata-mascot\b/i.test(content)) && svgMatches.length > 0) {
        const primarySvgMatch =
          svgMatches.find((m) => /\bdata-mascot\b/i.test(m[0])) ||
          svgMatches.reduce((best, cur) => (cur[0].length > best[0].length ? cur : best), svgMatches[0]);
        const primarySvg = primarySvgMatch[0];
        const namedGroups = (primarySvg.match(/<g\b[^>]*\bid\s*=\s*["'][^"']+["']/gi) || []).length;
        if (namedGroups < 4) {
          recordFinding({
            file: rel,
            line: lineNumberAt(content, primarySvgMatch.index),
            tier: effectiveMedium === "mascot" ? "FLOOR" : "REFLEX",
            rule: "require-svg-named-groups",
            message: `Primary mascot <svg> has ${namedGroups} named <g id="..."> group(s) (minimum 4 required).`,
            fix: "Split mascot anatomy into >= 4 named `<g id=\"...\">` groups (e.g. `#chassis`, `#eyes`, `#mouth`, `#badge`).",
          }, directives);
        }
      }
    }

    // Active brief contract verification
    if (tierArg !== "fast" && activeBrief && [".html", ".htm", ".css", ".scss"].includes(ext)) {
      if (/<style\b/i.test(content) && !/:root\s*\{/.test(content)) {
        recordFinding({
          file: rel, line: 1, tier: "FLOOR", rule: "brief-require-tokens",
          message: `Active brief (${activeBrief.primary?.slug}) requires semantic \`:root\` tokens.`,
          fix: "Declare `--surface-canvas`, `--ink-primary`, and `--accent-focal` inside `:root { ... }`.",
        }, directives);
      }
      for (const bannedFont of activeBrief.bannedDefaults?.fonts || []) {
        const fontRe = new RegExp(`(?:font-family|font)\\s*:[^;]*\\b${bannedFont}\\b`, "i");
        if (fontRe.test(content)) {
          recordFinding({
            file: rel, line: 1, tier: "FLOOR", rule: "brief-banned-default-used",
            message: `Built CSS uses banned default font \`${bannedFont}\` from active brief.`,
            fix: `Swap \`${bannedFont}\` for dealt brief typography (${activeBrief.primary?.fonts?.body || "stage 3 token"}).`,
          }, directives);
        }
      }
      if (activeBrief.bannedCliche?.id === "no-beige-cosplay" && /#F7F6F2/i.test(content) && /#C9350D/i.test(content)) {
        recordFinding({
          file: rel, line: 1, tier: "FLOOR", rule: "brief-banned-cliche",
          message: "Output tripped dealt banned cliché (`no-beige-cosplay`).",
          fix: `Recalibrate palette to match dealt direction: ${activeBrief.primary?.surfaceWorld}.`,
        }, directives);
      }
      if (activeBrief.bannedCliche?.id === "no-devtools-teal" && /#090B10/i.test(content) && /#2DD4BF/i.test(content)) {
        recordFinding({
          file: rel, line: 1, tier: "FLOOR", rule: "brief-banned-cliche",
          message: "Output tripped dealt banned cliché (`no-devtools-teal`).",
          fix: `Recalibrate palette to match dealt direction: ${activeBrief.primary?.surfaceWorld}.`,
        }, directives);
      }
    }
  }

  // Typst double-signaled paragraph check (Rule 12)
  if (tierArg !== "fast" && ext === ".typ") {
    const parRe = /#set\s+par\s*\(([^)]*)\)/gi;
    let pm;
    while ((pm = parRe.exec(content)) !== null) {
      const argsStr = pm[1];
      const indentMatch = argsStr.match(/first-line-indent\s*:\s*([0-9.]+)\s*(pt|em|mm|cm|in|%)?/i);
      const spacingMatch = argsStr.match(/spacing\s*:\s*([0-9.]+)\s*(pt|em|mm|cm|in|%)?/i);
      const leadingMatch = argsStr.match(/leading\s*:\s*([0-9.]+)\s*(pt|em|mm|cm|in|%)?/i);
      if (indentMatch && parseFloat(indentMatch[1]) > 0 && spacingMatch && parseFloat(spacingMatch[1]) > 0) {
        const sp = parseFloat(spacingMatch[1]);
        const ld = leadingMatch ? parseFloat(leadingMatch[1]) : 0;
        if (!leadingMatch || sp > ld * 1.25) {
          recordFinding({
            file: rel, line: lineNumberAt(content, pm.index), tier: "FLOOR", rule: "no-double-signaled-paragraphs",
            message: "Typst `#set par(...)` combines positive `first-line-indent` with positive paragraph `spacing`.",
            fix: "Either set `first-line-indent: 0pt` when using vertical `spacing`, or match `spacing` to `leading`.",
          }, directives);
        }
      }
    }
  }

  // Rules 9, 10, 11: Book prose rules (.md, .typ, or book-medium .html)
  const isBookProseTarget = [".md", ".typ"].includes(ext) || (effectiveMedium === "book" && [".html", ".htm"].includes(ext));
  if (isBookProseTarget) {
    const proseSource = [".html", ".htm"].includes(ext)
      ? blankNonProseBlocks(content)
      : blankMarkdownCodeFences(content);
    const proseLines = proseSource.split(/\r?\n/);
    const aiSlopRe = /\b(delve|delves|delving|tapestry|testament|pivotal|underscore|underscores|underscoring|landscape|beacon|intricate|foster|garner|realm|vibrant|multifaceted|overarching)\b/gi;

    let slopHits = 0;
    const slopMatches = [];
    proseLines.forEach((rawLine, idx) => {
      const textLine = [".html", ".htm"].includes(ext) ? rawLine.replace(/<[^>]+>/g, " ").trim() : rawLine.trim();
      if (!textLine) return;
      const lineNum = idx + 1;

      const hits = textLine.match(aiSlopRe);
      if (hits) {
        slopHits += hits.length;
        slopMatches.push({ lineNum, words: [...new Set(hits.map((w) => w.toLowerCase()))] });
      }

      if (/\b(?:it(?:'s| is)\s+not\s+just\b[^.!?\n]{1,100}[—–-]+\s*it(?:'s| is)\b|\bnot\s+(?:just|merely|simply|only)\b[^.!?\n]{1,100},\s*but(?:\s+also)?\b)/i.test(textLine)) {
        recordFinding({
          file: rel, line: lineNum, tier: "REFLEX", rule: "no-negative-parallelism-tic",
          message: "Detected AI negative parallelism prose tic (`not just X — it's Y` / `not merely X, but Y`).",
          fix: "Rewrite as a direct affirmative statement.",
        }, directives);
      }

      const isHtmlParaStart = [".html", ".htm"].includes(ext) && /<p\b/i.test(rawLine);
      const prevBlankOrHeading = idx === 0 || proseLines[idx - 1].trim() === "" || /^#+\s/.test(proseLines[idx - 1].trim());
      if (isHtmlParaStart || (![".html", ".htm"].includes(ext) && prevBlankOrHeading)) {
        const cleanOpener = rawLine.replace(/^\s*(?:<p\b[^>]*>\s*)?/, "");
        if (/^(?:Moreover,|Furthermore,|Additionally,|Crucially,|Interestingly,|In conclusion,|It is worth noting\b)/i.test(cleanOpener)) {
          recordFinding({
            file: rel, line: lineNum, tier: "REFLEX", rule: "no-throat-clearing-opener",
            message: "Paragraph opens with AI throat-clearing filler (`Moreover,`, `Furthermore,`, `Additionally,`, `Crucially,`, `Interestingly,`, `In conclusion,`, `It is worth noting`).",
            fix: "Delete the transition opener and start directly with the subject.",
          }, directives);
        }
      }
    });

    if (slopHits > 0) {
      const slopTier = effectiveMedium === "book" && slopHits >= 2 ? "FLOOR" : "REFLEX";
      for (const sm of slopMatches) {
        recordFinding({
          file: rel, line: sm.lineNum, tier: slopTier, rule: "no-ai-slop-vocabulary",
          message: `Detected AI cliché vocabulary (${sm.words.join(", ")}) [${slopHits} hit(s) in file].`,
          fix: "Replace generic AI vocabulary with concrete domain verbs and specific nouns.",
        }, directives);
      }
    }
  }

  if (reportUnused && !noInlineIgnores) {
    findings.push(...getUnusedIgnores(directives, rel));
  }
}

function recordDomAuditResult({ file, viewport, runtimeErrors, audit }) {
  const rel = path.relative(process.cwd(), file);
  const vpLabel = `${viewport.width}x${viewport.height}`;
  if (!audit.visibleText) {
    findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "first-frame-empty", message: `Empty viewport at ${vpLabel}.`, fix: "Ensure visible hero content renders on initial paint." });
  }
  if (audit.overflowX) {
    findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "render-no-overflow-x", message: `Rendered horizontal overflow at ${vpLabel}.`, fix: "Audit grid tracks (`minmax(0, 1fr)`), `overflow-x: clip`, and media widths." });
  }
  if (audit.bodyFontPx < 16) {
    findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "render-body-font-floor", message: `Computed body font-size is ${audit.bodyFontPx}px (< 16px floor) at ${viewport.width}px.`, fix: "Raise base body font-size to >= 16px." });
  }
  for (const af of audit.assertionFails || []) {
    findings.push({ file: rel, line: 1, tier: "FLOOR", rule: af.rule, message: `${af.msg} (${vpLabel})`, fix: "Satisfy declared brief assertion." });
  }
  for (const col of audit.thumbnailDeadzoneCollisions || []) {
    findings.push({
      file: rel, line: 1, tier: "FLOOR", rule: "thumbnail-deadzone-collision",
      message: `Thumbnail element <${col.tag}> ("${col.text}") collides with bottom-right timestamp dead zone (x >= 78%, y >= 82%) at ${vpLabel}.`,
      fix: "Reposition thumbnail copy away from the bottom-right timestamp overlay zone.",
    });
  }
  for (const re of runtimeErrors || []) {
    findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "runtime-error", message: re, fix: "Fix broken script or missing asset request." });
  }
}

// Anti-false-pass render telemetry + Playwright or zero-dependency Chrome CDP fallback
const renderAudit = {
  requested: renderMode,
  ran: false,
  engine: null,
  reason: renderMode ? null : "not_requested",
  viewportsChecked: [],
  samplesChecked: 0,
  snapshotsDir: snapshotsDir || null,
};

if (renderMode) {
  const htmlFiles = files.filter((f) => /\.(?:html|htm)$/i.test(f));
  if (htmlFiles.length === 0) {
    renderAudit.reason = "no_html_files";
  } else {
    const viewports = effectiveMedium === "thumbnail"
      ? [{ width: 1280, height: 720 }]
      : [{ width: 390, height: 844 }, { width: 1440, height: 900 }];
    const assertions = activeBrief?.assertions || [];
    let pw = null;
    try { pw = await import("playwright"); } catch { pw = null; }

    if (pw) {
      try {
        const browser = await pw.chromium.launch();
        if (snapshotsDir) fs.mkdirSync(path.resolve(snapshotsDir), { recursive: true });
        const auditFn = buildDomAuditFnSource();

        for (const htmlFile of htmlFiles) {
          for (const vp of viewports) {
            const page = await browser.newPage({ viewport: vp });
            const runtimeErrors = [];
            page.on("pageerror", (e) => runtimeErrors.push(e.message));
            page.on("requestfailed", (req) => runtimeErrors.push(`Failed request: ${req.url()}`));
            await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "networkidle" });

            if (snapshotsDir) {
              const snapName = `${path.basename(htmlFile, path.extname(htmlFile))}-${vp.width}x${vp.height}.png`;
              await page.screenshot({ path: path.join(path.resolve(snapshotsDir), snapName) });
            }

            const audit = await page.evaluate(
              ({ fnStr, assertionsArg, mediumArg }) => {
                const fn = eval(`(${fnStr})`);
                return fn(assertionsArg, mediumArg);
              },
              { fnStr: auditFn.toString(), assertionsArg: assertions, mediumArg: effectiveMedium }
            );

            recordDomAuditResult({ file: htmlFile, viewport: vp, runtimeErrors, audit });
            renderAudit.viewportsChecked.push(`${vp.width}x${vp.height}`);
            renderAudit.samplesChecked += 1;
            await page.close();
          }
        }
        await browser.close();
        renderAudit.ran = true;
        renderAudit.engine = "playwright";
      } catch (err) {
        renderAudit.ran = false;
        renderAudit.reason = err?.message || "playwright_failed";
      }
    }

    if (!renderAudit.ran) {
      try {
        const cdpResults = await auditHtmlWithCdp({
          htmlFiles,
          viewports,
          assertions,
          medium: effectiveMedium,
          snapshotsDir,
        });
        for (const res of cdpResults) {
          recordDomAuditResult(res);
          renderAudit.viewportsChecked.push(`${res.viewport.width}x${res.viewport.height}`);
          renderAudit.samplesChecked += 1;
        }
        renderAudit.ran = true;
        renderAudit.engine = "chrome-cdp";
        renderAudit.reason = null;
      } catch (err) {
        renderAudit.ran = false;
        renderAudit.engine = null;
        renderAudit.reason = err?.message || "render_unavailable";
        findings.push({
          file: targetArg, line: 1, tier: "FLOOR", rule: "render-unavailable",
          message: `Requested --render audit did not run (${renderAudit.reason}).`,
          fix: "Install Google Chrome/Chromium or Playwright, or run without --render for static verification (never treat skipped render as clean).",
        });
      }
    }
  }
}

const floorFails = findings.filter((f) => f.tier === "FLOOR");
const reflexWarns = findings.filter((f) => f.tier === "REFLEX");
const failed = strictMode ? findings.length > 0 : floorFails.length > 0;

if (sarifMode) {
  console.log(JSON.stringify(buildSarif({ version: VERSION, rules: ALL_RULES, findings, executionSuccessful: true }), null, 2));
} else if (githubMode) {
  for (const f of findings) {
    const level = f.tier === "FLOOR" ? "error" : "warning";
    console.log(`::${level} file=${f.file},line=${f.line || 1},title=${f.rule}::${f.message} Fix: ${f.fix}`);
  }
} else if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        tool: "d27-check",
        version: VERSION,
        medium: effectiveMedium,
        ok: !failed,
        strict: strictMode,
        filesScanned: files.length,
        briefVerified: activeBrief ? activeBrief.primary?.slug : null,
        renderAudit,
        mediaAudit,
        counts: { error: floorFails.length, warning: reflexWarns.length, suppressed: suppressed.length },
        floorFails: floorFails.length,
        reflexWarns: reflexWarns.length,
        passed: !failed,
        findings,
        suppressed,
      },
      null,
      2
    )
  );
} else {
  console.log(
    `Design 27 Check v${VERSION} (${effectiveMedium}) — Scanned ${files.length} file(s): ${floorFails.length} FLOOR fail(s), ${reflexWarns.length} REFLEX warning(s), ${suppressed.length} suppressed`
  );
  for (const f of findings) {
    console.log(`  [${f.tier}] ${f.file}:${f.line} (${f.rule}) — ${f.message}`);
    console.log(`    Fix: ${f.fix}`);
  }
}

process.exitCode = failed ? 2 : 0;
