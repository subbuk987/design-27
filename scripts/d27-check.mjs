#!/usr/bin/env node
/**
 * Design 27 v3.0.0 — Zero-Dependency Quality, SARIF 2.1.0, Contrast, Media & DOM Checker
 * Usage: node scripts/d27-check.mjs <file-or-dir> [flags]
 * Flags: --brief <file> --render --snapshots <dir> --json --sarif --github --strict --tier=fast|deep
 *        --report-unused-ignores --list-rules --doctor --no-inline-ignores
 * Exit codes: 0 = pass, 1 = fatal/IO error, 2 = compliance gate failed, 3 = CLI usage error
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import { buildSarif } from "./lib/reporters.mjs";
import { parseIgnores, matchIgnore, getUnusedIgnores } from "./lib/ignores.mjs";

const VERSION = "3.0.0";
const EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".svg", ".js", ".ts"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm"]);
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".design27"]);
const KNOWN_FLAGS = [
  "--brief", "--render", "--snapshots", "--json", "--sarif", "--github", "--strict",
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

// CLI parsing
const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const sarifMode = args.includes("--sarif");
const githubMode = args.includes("--github");
const strictMode = args.includes("--strict");
const renderMode = args.includes("--render");
const doctorMode = args.includes("--doctor");
const listRulesMode = args.includes("--list-rules");
const reportUnused = args.includes("--report-unused-ignores");
const noInlineIgnores = args.includes("--no-inline-ignores");

const tierArg = args.find((a) => a.startsWith("--tier="))?.split("=")[1] || "deep";
const briefIdx = args.indexOf("--brief");
const briefPath = briefIdx !== -1 ? args[briefIdx + 1] : null;
const snapIdx = args.indexOf("--snapshots");
const snapshotsDir = snapIdx !== -1 ? args[snapIdx + 1] : null;
const lufsIdx = args.indexOf("--target-lufs");
const targetLufs = lufsIdx !== -1 ? Number(args[lufsIdx + 1]) : -14;

// Validate unknown flags with Levenshtein hints
for (const a of args) {
  if (a.startsWith("-")) {
    const base = a.split("=")[0];
    if (!KNOWN_FLAGS.includes(base)) {
      const err = { ok: false, error: { code: "unknown_flag", message: `Unknown flag: ${base}`, hint: suggestFlag(base) } };
      console.error(jsonMode ? JSON.stringify(err, null, 2) : `${err.error.message}. ${err.error.hint}`);
      process.exit(3);
    }
  }
}

if (args.includes("--help") || args.includes("-h")) {
  console.log("Usage: node scripts/d27-check.mjs <file-or-dir> [--brief brief.json] [--render] [--snapshots dir] [--json|--sarif|--github] [--strict] [--tier=fast|deep] [--report-unused-ignores] [--list-rules] [--doctor]");
  process.exit(0);
}

if (listRulesMode) {
  if (jsonMode) {
    console.log(JSON.stringify(LINE_RULES.map(({ id, tier, speed, medium, message }) => ({ id, tier, speed, medium, message })), null, 2));
  } else {
    for (const r of LINE_RULES) console.log(`${r.id.padEnd(28)} [${r.tier.padEnd(6)}] (${r.speed}/${r.medium}) ${r.message}`);
  }
  process.exit(0);
}

if (doctorMode) {
  const ffprobe = probeBinary("ffprobe");
  const ffmpeg = probeBinary("ffmpeg");
  let pwAvailable = false;
  try { await import("playwright"); pwAvailable = true; } catch { pwAvailable = false; }
  const capabilities = ["static", "brief", "sarif", "github-annotations"];
  if (ffprobe.available) capabilities.push("video-probe");
  if (ffmpeg.available) capabilities.push("video-craft", "ebur128");
  if (pwAvailable) capabilities.push("render-dom", "snapshots");
  const report = {
    ok: true,
    version: VERSION,
    node: { version: process.version, ok: true },
    ffprobe,
    ffmpeg,
    playwright: { available: pwAvailable },
    capabilities,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const skipIndices = new Set();
[briefIdx, snapIdx, lufsIdx].forEach((i) => { if (i !== -1) skipIndices.add(i + 1); });
const targetArg = args.find((a, i) => !a.startsWith("-") && !skipIndices.has(i));

if (!targetArg) {
  const err = { ok: false, error: { code: "missing_target", message: "No target file or directory provided.", hint: "Pass a file or directory path, or use --doctor / --list-rules." } };
  if (sarifMode) console.log(JSON.stringify(buildSarif({ version: VERSION, rules: LINE_RULES, findings: [], executionSuccessful: false }), null, 2));
  else console.error(jsonMode ? JSON.stringify(err, null, 2) : `${err.error.message} ${err.error.hint}`);
  process.exit(1);
}

const targetPath = path.resolve(targetArg);
if (!fs.existsSync(targetPath)) {
  if (sarifMode) console.log(JSON.stringify(buildSarif({ version: VERSION, rules: LINE_RULES, findings: [], executionSuccessful: false }), null, 2));
  else console.error(`Target not found: ${targetPath}`);
  process.exit(1);
}

let activeBrief = null;
if (briefPath && fs.existsSync(path.resolve(briefPath))) {
  activeBrief = JSON.parse(fs.readFileSync(path.resolve(briefPath), "utf8"));
}

function collectFiles(entry) {
  const stat = fs.statSync(entry);
  if (stat.isFile()) return [entry];
  const out = [];
  for (const name of fs.readdirSync(entry)) {
    if (IGNORE_DIRS.has(name)) continue;
    const full = path.join(entry, name);
    const s = fs.statSync(full);
    if (s.isDirectory()) out.push(...collectFiles(full));
    else if (EXTENSIONS.has(path.extname(name).toLowerCase()) || VIDEO_EXTS.has(path.extname(name).toLowerCase())) out.push(full);
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
    // Pure-Node MP4 +faststart check (moov before mdat)
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
        // FFmpeg ebur128 integrated loudness & true-peak verification when audio exists
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
  const isVideoFile = /(remotion|hyperframes|timeline|scene|video|motion)/i.test(file) || /useCurrentFrame|__timelines/.test(content);

  lines.forEach((line, idx) => {
    for (const rule of LINE_RULES) {
      if (tierArg === "fast" && rule.speed !== "fast") continue;
      if (rule.videoOnly && !isVideoFile) continue;
      if (rule.regex.test(line)) {
        recordFinding({ file: rel, line: idx + 1, tier: rule.tier, rule: rule.id, message: rule.message, fix: rule.fix }, directives);
      }
    }
  });

  if ([".html", ".htm", ".css", ".scss"].includes(ext)) {
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

    // Pure-JS WCAG 2.1 contrast check on declared :root --surface-canvas vs --ink-primary / --ink-secondary
    const canvasHex = content.match(/--surface-canvas\s*:\s*(#[0-9a-f]{3,6})\b/i)?.[1];
    const inkPrimaryHex = content.match(/--ink-primary\s*:\s*(#[0-9a-f]{3,6})\b/i)?.[1];
    const inkSecondaryHex = content.match(/--ink-secondary\s*:\s*(#[0-9a-f]{3,6})\b/i)?.[1];
    if (canvasHex && inkPrimaryHex) {
      const bg = parseHex(canvasHex), fg = parseHex(inkPrimaryHex);
      if (bg && fg) {
        const ratio = contrastRatio(fg, bg);
        if (ratio < 4.5) {
          const suggested = suggestContrastingHex(fg, bg, 7.0);
          recordFinding({
            file: rel, line: 1, tier: "FLOOR", rule: "wcag-contrast-fail",
            message: `--ink-primary (${inkPrimaryHex}) on --surface-canvas (${canvasHex}) has ratio ${ratio.toFixed(2)}:1 (< 4.5:1 floor).`,
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

    // Freehand LLM SVG clip-art detector (> 12 primitives without data-asset="verified")
    const svgBlocks = content.match(/<svg\b[\s\S]*?<\/svg>/gi) || [];
    for (const svg of svgBlocks) {
      if (/data-asset\s*=\s*["']verified["']/i.test(svg) || /data-d27-allow/i.test(svg)) continue;
      const primitives = (svg.match(/<(?:path|circle|ellipse|polygon|polyline|rect)\b/gi) || []).length;
      if (primitives > 12) {
        recordFinding({
          file: rel, line: 1, tier: "REFLEX", rule: "no-freehand-svg-clipart",
          message: `Inline <svg> has ${primitives} primitives without \`data-asset="verified"\` (potential LLM freehand clip-art).`,
          fix: `Simplify to strict geometric/diagram primitives, replace with a real asset slot, or mark verified assets \`data-asset="verified"\`.`,
        }, directives);
      }
    }

    // Active brief contract verification
    if (activeBrief) {
      if (/<style\b/i.test(content) && !/:root\s*\{/.test(content)) {
        recordFinding({
          file: rel, line: 1, tier: "FLOOR", rule: "brief-require-tokens",
          message: `Active brief (${activeBrief.primary?.slug}) requires semantic \`:root\` tokens.`,
          fix: "Declare `--surface-canvas`, `--ink-primary`, and `--accent-focal` inside `:root { ... }`.",
        }, directives);
      }
      for (const bannedFont of activeBrief.bannedDefaults?.fonts || []) {
        const fontRe = new RegExp(`font-family\\s*:[^;]*\\b${bannedFont}\\b`, "i");
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

  if (reportUnused && !noInlineIgnores) {
    findings.push(...getUnusedIgnores(directives, rel));
  }
}

// Anti-false-pass render telemetry + optional Playwright multi-viewport DOM & assertions audit
const renderAudit = {
  requested: renderMode,
  ran: false,
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
    try {
      const pw = await import("playwright");
      const browser = await pw.chromium.launch();
      const viewports = [{ width: 390, height: 844 }, { width: 1440, height: 900 }];
      if (snapshotsDir) fs.mkdirSync(path.resolve(snapshotsDir), { recursive: true });

      for (const htmlFile of htmlFiles) {
        const rel = path.relative(process.cwd(), htmlFile);
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

          const audit = await page.evaluate((assertions) => {
            const overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth;
            const bodyFontPx = parseFloat(getComputedStyle(document.body).fontSize || "16");
            const visibleText = (document.body.innerText || "").trim().length > 0;
            const assertionFails = [];
            for (const a of assertions || []) {
              if (a.kind === "aboveTheFold") {
                const el = document.querySelector(a.selector);
                if (!el) assertionFails.push({ rule: "assert-selector-missing", msg: `Selector \`${a.selector}\` matched 0 elements.` });
                else if (el.getBoundingClientRect().bottom > window.innerHeight) {
                  assertionFails.push({ rule: "assert-above-the-fold", msg: `\`${a.selector}\` falls below viewport fold.` });
                }
              }
            }
            return { overflowX, bodyFontPx, visibleText, assertionFails };
          }, activeBrief?.assertions || []);

          if (!audit.visibleText) {
            findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "first-frame-empty", message: `Empty viewport at ${vp.width}x${vp.height}.`, fix: "Ensure visible hero content renders on initial paint." });
          }
          if (audit.overflowX) {
            findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "render-no-overflow-x", message: `Rendered horizontal overflow at ${vp.width}x${vp.height}.`, fix: "Audit grid tracks (`minmax(0, 1fr)`), `overflow-x: clip`, and media widths." });
          }
          if (audit.bodyFontPx < 16) {
            findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "render-body-font-floor", message: `Computed body font-size is ${audit.bodyFontPx}px (< 16px floor) at ${vp.width}px.`, fix: "Raise base body font-size to >= 16px." });
          }
          for (const af of audit.assertionFails) {
            findings.push({ file: rel, line: 1, tier: "FLOOR", rule: af.rule, message: `${af.msg} (${vp.width}x${vp.height})`, fix: "Satisfy declared brief assertion." });
          }
          for (const re of runtimeErrors) {
            findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "runtime-error", message: re, fix: "Fix broken script or missing asset request." });
          }

          renderAudit.viewportsChecked.push(`${vp.width}x${vp.height}`);
          renderAudit.samplesChecked += 1;
          await page.close();
        }
      }
      await browser.close();
      renderAudit.ran = true;
    } catch (err) {
      renderAudit.ran = false;
      renderAudit.reason = err?.message || "playwright_unavailable";
      findings.push({
        file: targetArg, line: 1, tier: "FLOOR", rule: "render-unavailable",
        message: `Requested --render audit did not run (${renderAudit.reason}).`,
        fix: "Install playwright or run without --render for static verification (never treat skipped render as clean).",
      });
    }
  }
}

const floorFails = findings.filter((f) => f.tier === "FLOOR");
const reflexWarns = findings.filter((f) => f.tier === "REFLEX");
const failed = strictMode ? findings.length > 0 : floorFails.length > 0;

if (sarifMode) {
  console.log(JSON.stringify(buildSarif({ version: VERSION, rules: LINE_RULES, findings, executionSuccessful: true }), null, 2));
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
    `Design 27 Check v${VERSION} — Scanned ${files.length} file(s): ${floorFails.length} FLOOR fail(s), ${reflexWarns.length} REFLEX warning(s), ${suppressed.length} suppressed`
  );
  for (const f of findings) {
    console.log(`  [${f.tier}] ${f.file}:${f.line} (${f.rule}) — ${f.message}`);
    console.log(`    Fix: ${f.fix}`);
  }
}

process.exitCode = failed ? 2 : 0;
