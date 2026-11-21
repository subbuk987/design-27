#!/usr/bin/env node
/**
 * Design 27 — Zero-Dependency Static Floor & Anti-Slop Checker
 * Usage: node scripts/d27-check.mjs <file-or-dir> [--json]
 * Exit codes: 0 = clean (0 FLOOR fails), 1 = invalid target, 2 = FLOOR failures found
 */
import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".svg", ".js", ".ts"]);
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".design27"]);

const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const targetArg = args.find((a) => !a.startsWith("-"));

if (!targetArg) {
  console.error("Usage: node scripts/d27-check.mjs <file-or-dir> [--json]");
  process.exit(1);
}

const targetPath = path.resolve(targetArg);
if (!fs.existsSync(targetPath)) {
  console.error(`Target not found: ${targetPath}`);
  process.exit(1);
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
    else if (EXTENSIONS.has(path.extname(name).toLowerCase())) out.push(full);
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
    fix: "Remove the emoji or replace with a uniform monoline SVG icon (`16–18px`, `1.5px` stroke, `currentColor`).",
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
    regex: /\b(Date\.now\s*\(|Math\.random\s*\(|repeat\s*:\s*-1)\b/,
    message: "Non-deterministic call (`Date.now()`, unseeded `Math.random()`, or `repeat: -1`) breaks seekable frame-by-frame renders.",
    fix: "Derive values purely from timeline `frame` / seeded PRNG and finite durations.",
  },
];

const findings = [];
const files = collectFiles(targetPath);

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  const ext = path.extname(file).toLowerCase();
  const isVideoFile = /(remotion|hyperframes|timeline|scene|video|motion)/i.test(file) || /useCurrentFrame|__timelines/.test(content);

  lines.forEach((line, idx) => {
    for (const rule of LINE_RULES) {
      if (rule.id === "no-nondeterministic-video" && !isVideoFile) continue;
      if (rule.regex.test(line)) {
        findings.push({
          file: rel,
          line: idx + 1,
          tier: rule.tier,
          rule: rule.id,
          message: rule.message,
          fix: rule.fix,
        });
      }
    }
  });

  // File-level checks for HTML/CSS
  if ([".html", ".htm", ".css", ".scss"].includes(ext)) {
    const hasAnimation = /@keyframes\b|\banimation\s*:/.test(content);
    const hasReducedMotion = /prefers-reduced-motion/.test(content);
    if (hasAnimation && !hasReducedMotion) {
      findings.push({
        file: rel,
        line: 1,
        tier: "FLOOR",
        rule: "require-reduced-motion",
        message: "CSS animation/keyframes declared without a `prefers-reduced-motion: reduce` fallback.",
        fix: "Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`.",
      });
    }

    const hasInteractive = /<(?:button|a|input|select)\b/i.test(content);
    const hasFocusVisible = /:focus-visible/.test(content);
    if (hasInteractive && /<style\b/i.test(content) && !hasFocusVisible) {
      findings.push({
        file: rel,
        line: 1,
        tier: "FLOOR",
        rule: "require-focus-visible",
        message: "Interactive elements styled without an explicit `:focus-visible` indicator.",
        fix: "Add `:focus-visible { outline: 2px solid var(--accent-focal, currentColor); outline-offset: 2px; }`.",
      });
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
        filesScanned: files.length,
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
  console.log(`Design 27 Check — Scanned ${files.length} file(s): ${floorFails.length} FLOOR fail(s), ${reflexWarns.length} REFLEX warning(s)`);
  for (const f of findings) {
    console.log(`  [${f.tier}] ${f.file}:${f.line} (${f.rule}) — ${f.message}`);
    console.log(`    Fix: ${f.fix}`);
  }
}

process.exit(floorFails.length > 0 ? 2 : 0);
