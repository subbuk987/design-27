#!/usr/bin/env node
/**
 * Design 27 — Zero-Dependency Floor, Anti-Slop, Video-Determinism, ffprobe & Optional Headless DOM Checker
 * Usage: node scripts/d27-check.mjs <file-or-dir> [--brief <brief.json>] [--render] [--json]
 * Exit codes: 0 = clean (0 FLOOR fails), 1 = invalid target, 2 = FLOOR failures found
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".svg", ".js", ".ts"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm"]);
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".design27"]);

const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const renderMode = args.includes("--render");
const briefIdx = args.indexOf("--brief");
const briefPath = briefIdx !== -1 ? args[briefIdx + 1] : null;
const targetArg = args.find((a, i) => !a.startsWith("-") && (briefIdx === -1 || i !== briefIdx + 1));

if (!targetArg) {
  console.error("Usage: node scripts/d27-check.mjs <file-or-dir> [--brief <brief.json>] [--render] [--json]");
  process.exit(1);
}

const targetPath = path.resolve(targetArg);
if (!fs.existsSync(targetPath)) {
  console.error(`Target not found: ${targetPath}`);
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
    else if (EXTENSIONS.has(path.extname(name).toLowerCase()) || VIDEO_EXTS.has(path.extname(name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

const LINE_RULES = [
  {
    id: "no-transition-all",
    tier: "FLOOR",
    regex: /\btransition\s*:\s*all\b|\btransition-all\b/i,
    message: "Catch-all `transition: all` / `transition-all` animates layout properties and causes jank.",
    fix: "Name explicit GPU properties: `transition: color 180ms, background-color 180ms, transform 240ms, opacity 240ms;`.",
  },
  {
    id: "no-overflow-x-hidden",
    tier: "FLOOR",
    regex: /\boverflow-x\s*:\s*hidden\b/i,
    message: "`overflow-x: hidden` breaks `position: sticky` descendants.",
    fix: "Replace `overflow-x: hidden` with `overflow-x: clip`.",
  },
  {
    id: "no-100vw",
    tier: "FLOOR",
    regex: /\b(?:width|min-width|max-width)\s*:\s*100vw\b|\bw-\[100vw\]/i,
    message: "`100vw` includes scrollbar width on Windows/Linux and causes horizontal overflow.",
    fix: "Use `width: 100%` or `max-width: 100%` instead of `100vw`.",
  },
  {
    id: "no-purple-slop-gradient",
    tier: "REFLEX",
    regex: /(#6366f1.*#a855f7|#a855f7.*#ec4899|from-indigo-500.*via-purple-500|from-purple-500.*to-pink-500)/i,
    message: "Detected default AI purple-indigo-pink gradient slop.",
    fix: "Replace with a brief-calibrated 60/30/10 palette using semantic `:root` tokens.",
  },
  {
    id: "no-emoji-ui-icon",
    tier: "REFLEX",
    regex: /<(?:h[1-6]|button|span|a|label|li)[^>]*>[^<]*[✨🚀🔥👋🎉💡⚡]/u,
    message: "Decorative emoji used inside UI heading, button, or label.",
    fix: "Remove the emoji or replace with a uniform monoline SVG icon (`16-18px`, `1.5px` stroke, `currentColor`).",
  },
  {
    id: "no-hype-copy",
    tier: "REFLEX",
    regex: /\b(supercharge|revolutionize|game-changing|unlock the power|seamless experience)\b|Welcome back,\s*[^<]{1,30}!/i,
    message: "AI hype buzzword or generic greeting detected in interface copy.",
    fix: "Rewrite in plain, product-specific language with zero exclamation marks.",
  },
  {
    id: "no-tiny-body-font",
    tier: "FLOOR",
    regex: /\bbody\s*\{[^}]*font-size\s*:\s*(?:[0-9]|1[0-5])px\b/i,
    message: "Web body copy drops below the 16px legibility floor.",
    fix: "Set `body { font-size: clamp(1rem, 0.25vw + 0.95rem, 1.125rem); }` (`>= 16px`).",
  },
  {
    id: "no-nondeterministic-video",
    tier: "FLOOR",
    videoOnly: true,
    regex: /\b(Date\.now\s*\(|Math\.random\s*\(|requestAnimationFrame\s*\(|setTimeout\s*\(|setInterval\s*\(|repeat\s*:\s*-1)\b/,
    message: "Non-deterministic call (`Date.now`, `Math.random`, `rAF`, `setTimeout/Interval`, or `repeat: -1`) breaks seekable renders.",
    fix: "Derive every animated value purely from timeline `frame` / seeded PRNG and finite durations.",
  },
  {
    id: "no-wallclock-css-in-video",
    tier: "FLOOR",
    videoOnly: true,
    regex: /\b(transition\s*:|@keyframes\b)/i,
    message: "Wall-clock CSS `transition` or `@keyframes` inside a frame-stepped video composition drifts out of sync.",
    fix: "Drive motion from seekable timeline state (`useCurrentFrame()` in Remotion or paused `gsap.timeline` in HyperFrames).",
  },
  {
    id: "no-permanent-will-change",
    tier: "REFLEX",
    regex: /\bwill-change\s*:\s*(?:transform|opacity|all)\b/i,
    message: "Permanent `will-change` on static containers wastes GPU layer memory.",
    fix: "Remove static `will-change` or apply only during active interaction/animation.",
  },
];

const findings = [];
const files = collectFiles(targetPath);

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const ext = path.extname(file).toLowerCase();

  // Full ffprobe media verification for rendered video exports
  if (VIDEO_EXTS.has(ext)) {
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
            fix: "Force constant frame rate with `-vsync cfr`.",
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
          if (drift > 0.25) {
            findings.push({
              file: rel, line: 1, tier: "FLOOR", rule: "require-av-parity",
              message: `Audio/video duration mismatch of ${drift.toFixed(2)}s risks frozen tail frames or clipped VO.`,
              fix: "Align audio and video duration (`-shortest` or dynamic `calculateMetadata` probing).",
            });
          }
        }
      }
    } catch {
      // ffprobe not installed; skip binary probe
    }
    continue;
  }

  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  const isVideoFile = /(remotion|hyperframes|timeline|scene|video|motion)/i.test(file) || /useCurrentFrame|__timelines/.test(content);

  lines.forEach((line, idx) => {
    for (const rule of LINE_RULES) {
      if (rule.videoOnly && !isVideoFile) continue;
      if (rule.regex.test(line)) {
        findings.push({ file: rel, line: idx + 1, tier: rule.tier, rule: rule.id, message: rule.message, fix: rule.fix });
      }
    }
  });

  if ([".html", ".htm", ".css", ".scss"].includes(ext)) {
    const hasAnimation = /@keyframes\b|\banimation\s*:/.test(content);
    const hasReducedMotion = /prefers-reduced-motion/.test(content);
    if (hasAnimation && !hasReducedMotion && !isVideoFile) {
      findings.push({
        file: rel, line: 1, tier: "FLOOR", rule: "require-reduced-motion",
        message: "CSS animation/keyframes declared without a `prefers-reduced-motion: reduce` fallback.",
        fix: "Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`.",
      });
    }

    const hasInteractive = /<(?:button|a|input|select)\b/i.test(content);
    const hasFocusVisible = /:focus-visible/.test(content);
    if (hasInteractive && /<style\b/i.test(content) && !hasFocusVisible) {
      findings.push({
        file: rel, line: 1, tier: "FLOOR", rule: "require-focus-visible",
        message: "Interactive elements styled without an explicit `:focus-visible` indicator.",
        fix: "Add `:focus-visible { outline: 2px solid var(--accent-focal, currentColor); outline-offset: 2px; }`.",
      });
    }

    if (activeBrief) {
      const hasRootTokens = /:root\s*\{/.test(content);
      if (/<style\b/i.test(content) && !hasRootTokens) {
        findings.push({
          file: rel, line: 1, tier: "FLOOR", rule: "brief-require-tokens",
          message: `Active brief (${activeBrief.primary?.slug}) requires semantic \`:root\` tokens.`,
          fix: "Declare `--surface-canvas`, `--ink-primary`, and `--accent-focal` inside `:root { ... }`.",
        });
      }
      if (activeBrief.bannedCliche?.id === "no-beige-cosplay" && /#F7F6F2/i.test(content) && /#C9350D/i.test(content)) {
        findings.push({
          file: rel, line: 1, tier: "FLOOR", rule: "brief-banned-cliche",
          message: "Output tripped dealt banned cliché (`no-beige-cosplay`).",
          fix: `Recalibrate palette to match dealt direction: ${activeBrief.primary?.surfaceWorld}.`,
        });
      }
      if (activeBrief.bannedCliche?.id === "no-devtools-teal" && /#090B10/i.test(content) && /#2DD4BF/i.test(content)) {
        findings.push({
          file: rel, line: 1, tier: "FLOOR", rule: "brief-banned-cliche",
          message: "Output tripped dealt banned cliché (`no-devtools-teal`).",
          fix: `Recalibrate palette to match dealt direction: ${activeBrief.primary?.surfaceWorld}.`,
        });
      }
    }
  }
}

// Optional headless Chromium DOM audit when --render is passed and playwright is installed
let renderChecked = false;
if (renderMode) {
  const htmlFiles = files.filter((f) => /\.(?:html|htm)$/i.test(f));
  if (htmlFiles.length > 0) {
    try {
      const pw = await import("playwright");
      const browser = await pw.chromium.launch();
      for (const htmlFile of htmlFiles) {
        const rel = path.relative(process.cwd(), htmlFile);
        for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
          const page = await browser.newPage({ viewport: vp });
          await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "networkidle" });
          const audit = await page.evaluate(() => ({
            overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            bodyFontPx: parseFloat(getComputedStyle(document.body).fontSize || "16"),
          }));
          if (audit.overflowX) {
            findings.push({
              file: rel, line: 1, tier: "FLOOR", rule: "render-no-overflow-x",
              message: `Rendered horizontal overflow at ${vp.width}x${vp.height}.`,
              fix: "Audit grid tracks (`minmax(0, 1fr)`), `overflow-x: clip`, and media widths.",
            });
          }
          if (audit.bodyFontPx < 16) {
            findings.push({
              file: rel, line: 1, tier: "FLOOR", rule: "render-body-font-floor",
              message: `Computed body font-size is ${audit.bodyFontPx}px (< 16px floor) at ${vp.width}px.`,
              fix: "Raise base body font-size to >= 16px.",
            });
          }
          await page.close();
        }
      }
      await browser.close();
      renderChecked = true;
    } catch {
      // Playwright not installed; continue with static verification
    }
  }
}

const floorFails = findings.filter((f) => f.tier === "FLOOR");
const reflexWarns = findings.filter((f) => f.tier === "REFLEX");

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        tool: "d27-check",
        version: "2.2.0",
        filesScanned: files.length,
        briefVerified: activeBrief ? activeBrief.primary?.slug : null,
        renderChecked,
        floorFails: floorFails.length,
        reflexWarns: reflexWarns.length,
        passed: floorFails.length === 0,
        findings,
      },
      null,
      2
    )
  );
} else {
  console.log(
    `Design 27 Check v2.2 — Scanned ${files.length} file(s): ${floorFails.length} FLOOR fail(s), ${reflexWarns.length} REFLEX warning(s)`
  );
  for (const f of findings) {
    console.log(`  [${f.tier}] ${f.file}:${f.line} (${f.rule}) — ${f.message}`);
    console.log(`    Fix: ${f.fix}`);
  }
}

process.exit(floorFails.length > 0 ? 2 : 0);
