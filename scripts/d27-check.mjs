#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Zero-Dependency Quality, SARIF 2.1.0, Contrast, Media, Prose, Incremental Cache & Chrome-CDP DOM Checker
 * Usage: node scripts/d27-check.mjs <file-or-dir> [flags]
 * Flags: --brief <file> --medium=<web|animation|motion|book|mascot|thumbnail> --render --snapshots <dir>
 *        --json --sarif --github --strict --tier=fast|deep --report-unused-ignores --list-rules --doctor
 *        --no-inline-ignores --no-cache --target-lufs <num> --unsafe-no-sandbox
 * Exit codes: 0 = pass, 1 = fatal/IO error, 2 = compliance gate failed, 3 = CLI usage error
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { buildSarif, escapeGhData, escapeGhProp } from "./lib/reporters.mjs";
import { parseIgnores, matchIgnore, getUnusedIgnores } from "./lib/ignores.mjs";
import { LINE_RULES, ALL_RULES } from "./lib/rules-catalog.mjs";
import { contrastRatio, computeApcaLc, suggestContrastingHex, parseCssColor, relativeChroma, rgbToOklch } from "./lib/color-math.mjs";
import { auditTypstParagraphs, auditBookProse } from "./lib/prose-audit.mjs";
import {
  resolveRepoCacheDir,
  computeRulesetHash,
  computeFileHash,
  shouldBypassCache,
  buildCacheKey,
  readCacheEntry,
  writeCacheEntry,
  VIDEO_EXTS,
} from "./lib/cache.mjs";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { VERSION } from "./lib/version.mjs";
const MAX_FILE_BYTES = 512 * 1024;
const MAX_DIR_DEPTH = 16;
const EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".svg", ".js", ".ts"]);
const BOOK_EXTENSIONS = new Set([...EXTENSIONS, ".md", ".typ"]);
const CODE_EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".js", ".ts"]);
const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".design27"]);
const KNOWN_MEDIUMS = new Set(["web", "animation", "motion", "book", "mascot", "thumbnail"]);
const KNOWN_FLAGS = [
  "--brief", "--medium", "--render", "--snapshots", "--json", "--sarif", "--github", "--strict",
  "--tier", "--report-unused-ignores", "--list-rules", "--doctor", "--no-inline-ignores",
  "--no-cache", "--target-lufs", "--unsafe-no-sandbox", "--help", "-h",
];

const STOPWORDS = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is", "are", "was", "were", "by", "at", "from", "this", "that", "how", "why", "i", "we", "you", "your", "our", "my"]);
const STRIP_D27_COMMENT_RE = /\/\*[^*]*(?:\*(?!\/)[^*]*)*\bd27-(?:disable|allow|ignore)(?:-(?:next-line|line))?\b[\s\S]*?\*\/|<!--[\s\S]*?\bd27-(?:disable|allow|ignore)(?:-(?:next-line|line))?\b[\s\S]*?-->|\/\/[^\r\n]*\bd27-(?:disable|allow|ignore)(?:-(?:next-line|line))?\b[^\r\n]*/gi;

let cachedRulesetHash = null;
function getRulesetHash() {
  if (!cachedRulesetHash) {
    cachedRulesetHash = computeRulesetHash([
      __filename,
      path.join(__dirname, "lib", "rules-catalog.mjs"),
      path.join(__dirname, "lib", "ignores.mjs"),
      path.join(__dirname, "lib", "prose-audit.mjs"),
      path.join(__dirname, "lib", "color-math.mjs"),
    ]);
  }
  return cachedRulesetHash;
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

async function probeBinaryAsync(cmd, args = ["-version"]) {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, { encoding: "utf8", timeout: 4000 });
    const firstLine = (stdout || stderr || "").split(/\r?\n/)[0]?.trim() || "ok";
    return { available: true, version: firstLine.slice(0, 80) };
  } catch {
    return { available: false, version: null };
  }
}

let lineStartsFor = null;
let lineStarts = [];
function lineNumberAt(content, index) {
  if (index <= 0) return 1;
  if (content !== lineStartsFor) {
    lineStartsFor = content;
    lineStarts = [];
    for (let i = content.indexOf("\n"); i !== -1; i = content.indexOf("\n", i + 1)) lineStarts.push(i);
  }
  let lo = 0, hi = lineStarts.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (lineStarts[mid] < index) lo = mid + 1; else hi = mid; }
  return lo + 1;
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

// Linear <svg>...</svg> scan; a lazy [\s\S]*? regex is quadratic on a hostile page of unclosed "<svg " tags.
function findSvgBlocks(content) {
  const out = [];
  const lower = content.toLowerCase();
  let from = 0;
  while (out.length < 256) {
    const start = lower.indexOf("<svg", from);
    if (start === -1) break;
    const end = lower.indexOf("</svg>", start);
    if (end === -1) break;
    const block = [content.slice(start, end + 6)];
    block.index = start;
    out.push(block);
    from = end + 6;
  }
  return out;
}

function extractTagBlock(html, startIdx) {
  const openRe = /<([a-zA-Z0-9-]+)\b[^<>]*>/y;
  openRe.lastIndex = startIdx;
  const openMatch = openRe.exec(html);
  if (!openMatch) return "";
  const tag = openMatch[1].toLowerCase();
  const voidTags = new Set(["img", "br", "hr", "input", "meta", "link"]);
  if (voidTags.has(tag)) return openMatch[0];
  let depth = 0;
  const tagRe = new RegExp(`<(\\/?)${tag}\\b[^<>]*>`, "gi");
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

const EXIT_STATE_RE = /\b(?:exit\w*|leav\w*|out|clos\w*|dismiss\w*|hid\w*)\b/i;

// Blank text nodes outside <style>/<script>, keeping tags, attributes and line breaks (linear indexOf scan).
function maskHtmlText(html) {
  const lower = html.toLowerCase();
  const blank = (s) => s.replace(/>([^<]+)</g, (m, t) => ">" + t.replace(/[^\r\n]/g, " ") + "<");
  let out = "";
  let pos = 0;
  while (pos < html.length) {
    const s1 = lower.indexOf("<style", pos);
    const s2 = lower.indexOf("<script", pos);
    const start = s1 === -1 ? s2 : s2 === -1 ? s1 : Math.min(s1, s2);
    if (start === -1) { out += blank(html.slice(pos)); break; }
    const close = lower.indexOf(start === s1 ? "</style>" : "</script>", start);
    const end = close === -1 ? html.length : close + (start === s1 ? 8 : 9);
    out += blank(html.slice(pos, start)) + html.slice(start, end);
    pos = end;
  }
  return out;
}

// [start, end] offsets of every `@media print { ... }` block (brace-depth scan).
function mediaPrintRanges(css) {
  const ranges = [];
  const re = /@media\s+print\b[^{]{0,200}\{/gi;
  let m;
  while ((m = re.exec(css)) !== null && ranges.length < 64) {
    let depth = 1, i = m.index + m[0].length;
    while (i < css.length && depth > 0) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") depth -= 1;
      i += 1;
    }
    ranges.push([m.index, i]);
    re.lastIndex = i;
  }
  return ranges;
}

function stripCommentsForAnalysis(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

function hasActiveCutoutArchitecture(content) {
  const clean = stripCommentsForAnalysis(content);
  const maskIds = [...clean.matchAll(/<mask\b[^<>]*\bid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  const hasUsedMask = maskIds.some((id) => new RegExp(`mask\\s*=\\s*["']url\\(#${escapeRegExp(id)}\\)["']`, "i").test(clean));
  const hasActiveCutVar =
    /--(?:m-cut|sil-bg)\s*:/i.test(clean) &&
    /var\(\s*--(?:m-cut|sil-bg)\b/i.test(clean);
  return hasUsedMask || hasActiveCutVar;
}

export async function runCheck(rawArgs = [], io = { stdout: process.stdout, stderr: process.stderr }) {
  const writeOut = (text) => {
    const out = text.endsWith("\n") ? text : `${text}\n`;
    io.stdout.write(out);
  };
  const writeErr = (text) => {
    const out = text.endsWith("\n") ? text : `${text}\n`;
    io.stderr.write(out);
  };

  const ddIdx = rawArgs.indexOf("--");
  const flagArgs = ddIdx === -1 ? rawArgs : rawArgs.slice(0, ddIdx);
  const positionalAfterDd = ddIdx === -1 ? [] : rawArgs.slice(ddIdx + 1);

  const VALUE_FLAGS = new Set(["--brief", "--snapshots", "--medium", "--target-lufs", "--tier"]);
  const consumedValueIndices = new Set();
  const flagValues = new Map();
  for (let i = 0; i < flagArgs.length; i++) {
    const a = flagArgs[i];
    if (!a.startsWith("-")) continue;
    const eqIdx = a.indexOf("=");
    if (eqIdx !== -1) {
      const base = a.slice(0, eqIdx);
      if (VALUE_FLAGS.has(base)) flagValues.set(base, a.slice(eqIdx + 1));
    } else if (VALUE_FLAGS.has(a) && i + 1 < flagArgs.length) {
      const next = flagArgs[i + 1];
      if (!next.startsWith("-") || /^-\d+(?:\.\d+)?$/.test(next)) {
        flagValues.set(a, next);
        consumedValueIndices.add(i + 1);
        i++;
      }
    }
  }
  const getFlagValue = (flag) => (flagValues.has(flag) ? flagValues.get(flag) : null);

  const jsonMode = flagArgs.includes("--json");
  const sarifMode = flagArgs.includes("--sarif");
  const githubMode = flagArgs.includes("--github");
  const strictMode = flagArgs.includes("--strict");
  const renderMode = flagArgs.includes("--render");
  const doctorMode = flagArgs.includes("--doctor");
  const listRulesMode = flagArgs.includes("--list-rules");
  const reportUnused = flagArgs.includes("--report-unused-ignores");
  const noInlineIgnores = flagArgs.includes("--no-inline-ignores");
  const noCache = flagArgs.includes("--no-cache");
  const unsafeNoSandbox = flagArgs.includes("--unsafe-no-sandbox");

  const tierArg = getFlagValue("--tier") || "deep";
  const briefPath = getFlagValue("--brief");
  const explicitMedium = getFlagValue("--medium")?.toLowerCase() || null;
  const snapshotsDir = getFlagValue("--snapshots");
  const targetLufs = Number(getFlagValue("--target-lufs") ?? "-14");

  for (let i = 0; i < flagArgs.length; i++) {
    if (consumedValueIndices.has(i)) continue;
    const a = flagArgs[i];
    if (a.startsWith("-")) {
      const base = a.split("=")[0];
      if (!KNOWN_FLAGS.includes(base)) {
        const err = { ok: false, error: { code: "unknown_flag", message: `Unknown flag: ${base}`, hint: suggestFlag(base) } };
        writeErr(jsonMode ? JSON.stringify(err, null, 2) : `${err.error.message}. ${err.error.hint}`);
        return 3;
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
    writeErr(jsonMode ? JSON.stringify(err, null, 2) : `${err.error.message}. ${err.error.hint}`);
    return 3;
  }

  if (flagArgs.includes("--help") || flagArgs.includes("-h")) {
    writeOut(
      `Design 27 Check v${VERSION}\n` +
      `Usage: node scripts/d27-check.mjs <file-or-dir> [--brief brief.json] [--medium web|animation|motion|book|mascot|thumbnail]\n` +
      `       [--render] [--snapshots dir] [--json|--sarif|--github] [--strict] [--tier=fast|deep]\n` +
      `       [--report-unused-ignores] [--list-rules] [--doctor] [--no-inline-ignores] [--no-cache] [--target-lufs -14] [--unsafe-no-sandbox]`
    );
    return 0;
  }

  if (listRulesMode) {
    if (jsonMode) {
      writeOut(JSON.stringify(ALL_RULES.map(({ id, tier, speed, medium, message }) => ({ id, tier, speed, medium, message })), null, 2));
    } else {
      writeOut(ALL_RULES.map((r) => `${r.id.padEnd(30)} [${r.tier.padEnd(6)}] (${r.speed}/${r.medium}) ${r.message}`).join("\n"));
    }
    return 0;
  }

  if (doctorMode) {
    const [ffprobe, ffmpeg, pwRes] = await Promise.all([
      probeBinaryAsync("ffprobe"),
      probeBinaryAsync("ffmpeg"),
      import("playwright").then(() => true).catch(() => false),
    ]);
    const { findChromeBinary } = await import("./lib/chrome-cdp.mjs");
    const chromeBinary = findChromeBinary();
    const capabilities = ["static", "brief", "sarif", "github-annotations"];
    if (ffprobe.available) capabilities.push("video-probe");
    if (ffmpeg.available) capabilities.push("video-craft", "ebur128");
    if (pwRes || chromeBinary) capabilities.push("render-dom", "snapshots");
    writeOut(JSON.stringify({
      ok: true,
      version: VERSION,
      node: { version: process.version, ok: true },
      ffprobe,
      ffmpeg,
      playwright: { available: pwRes },
      chromeCdp: { available: Boolean(chromeBinary), binary: chromeBinary },
      capabilities,
    }, null, 2));
    return 0;
  }

  const targetArg =
    positionalAfterDd[0] ||
    flagArgs.find((a, i) => !a.startsWith("-") && !consumedValueIndices.has(i));

  if (!targetArg) {
    const err = { ok: false, error: { code: "missing_target", message: "No target file or directory provided.", hint: "Pass a file or directory path, or use --doctor / --list-rules." } };
    if (sarifMode) writeOut(JSON.stringify(buildSarif({ version: VERSION, rules: ALL_RULES, findings: [], executionSuccessful: false }), null, 2));
    else writeErr(jsonMode ? JSON.stringify(err, null, 2) : `${err.error.message} ${err.error.hint}`);
    return 1;
  }

  const targetPath = path.resolve(targetArg);
  if (!fs.existsSync(targetPath)) {
    if (sarifMode) writeOut(JSON.stringify(buildSarif({ version: VERSION, rules: ALL_RULES, findings: [], executionSuccessful: false }), null, 2));
    else writeErr(`Target not found: ${targetPath}`);
    return 1;
  }

  let activeBrief = null;
  let briefHash = "";
  if (briefPath) {
    const resolvedBrief = path.resolve(briefPath);
    if (!fs.existsSync(resolvedBrief)) {
      writeErr(`Brief file not found: ${resolvedBrief}`);
      return 1;
    }
    try {
      activeBrief = JSON.parse(fs.readFileSync(resolvedBrief, "utf8"));
      briefHash = computeFileHash(resolvedBrief);
      if (!activeBrief || typeof activeBrief !== "object" || Array.isArray(activeBrief)) throw new Error("brief must be a JSON object");
      // brief.json may be attacker-controlled: coerce every field the checker reads to the expected shape.
      if (typeof activeBrief.medium !== "string") delete activeBrief.medium;
      if (!Array.isArray(activeBrief.assertions)) activeBrief.assertions = [];
      if (activeBrief.bannedDefaults && !Array.isArray(activeBrief.bannedDefaults.fonts)) activeBrief.bannedDefaults.fonts = [];
      if (activeBrief.emotion && !(Array.isArray(activeBrief.emotion.accentChroma) && activeBrief.emotion.accentChroma.every(Number.isFinite))) delete activeBrief.emotion;
    } catch (err) {
      writeErr(`Invalid JSON in brief ${resolvedBrief}: ${err.message}`);
      return 1;
    }
  }

  const targetStat = fs.statSync(targetPath);
  const targetExt = targetStat.isFile() ? path.extname(targetPath).toLowerCase() : "";
  const effectiveMedium =
    explicitMedium ||
    activeBrief?.medium?.toLowerCase() ||
    ((targetExt === ".typ" || targetExt === ".md") ? "book" : "web");

  function collectFiles(entry, depth = 0) {
    if (depth > MAX_DIR_DEPTH) return [];
    const lstat = fs.lstatSync(entry);
    if (lstat.isSymbolicLink() && depth > 0) return [];
    if (lstat.isFile()) return lstat.size > MAX_FILE_BYTES ? [] : [entry];
    if (!lstat.isDirectory()) return [];
    const allowedExts = effectiveMedium === "book" ? BOOK_EXTENSIONS : EXTENSIONS;
    const out = [];
    for (const dirent of fs.readdirSync(entry, { withFileTypes: true })) {
      if (dirent.isSymbolicLink() || IGNORE_DIRS.has(dirent.name)) continue;
      const full = path.join(entry, dirent.name);
      if (dirent.isDirectory()) {
        out.push(...collectFiles(full, depth + 1));
      } else if (dirent.isFile()) {
        const ext = path.extname(dirent.name).toLowerCase();
        if (allowedExts.has(ext) || VIDEO_EXTS.has(ext)) {
          if (!VIDEO_EXTS.has(ext)) {
            const st = fs.statSync(full);
            if (st.size > MAX_FILE_BYTES) continue;
          }
          out.push(full);
        }
      }
    }
    return out;
  }

  const findings = [];
  const suppressed = [];
  const files = collectFiles(targetPath);
  const mediaAudit = { ran: false, ffmpegCraftRan: false };
  const cacheDir = noCache ? null : resolveRepoCacheDir(process.cwd());
  const rulesetHash = cacheDir ? getRulesetHash() : "";
  let cacheHits = 0;
  let cacheMisses = 0;

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const ext = path.extname(file).toLowerCase();

    if (VIDEO_EXTS.has(ext)) {
      const { auditVideoFile } = await import("./lib/media-audit.mjs");
      auditVideoFile({ file, rel, ext, targetLufs, findings, mediaAudit });
      continue;
    }

    const bypass = !cacheDir || shouldBypassCache({ render: renderMode, noCache, relPath: rel });
    let cacheKey = null;
    if (!bypass) {
      const st = fs.statSync(file);
      cacheKey = buildCacheKey({
        relPath: rel,
        size: st.size,
        mtimeMs: st.mtimeMs,
        rulesetHash,
        effectiveMedium,
        tierArg,
        noInlineIgnores,
        reportUnused,
        briefHash,
      });
      const cached = readCacheEntry(cacheDir, cacheKey);
      if (cached && Array.isArray(cached.findings) && Array.isArray(cached.suppressed)) {
        findings.push(...cached.findings);
        suppressed.push(...cached.suppressed);
        cacheHits += 1;
        continue;
      }
      cacheMisses += 1;
    }

    const fileFindings = [];
    const fileSuppressed = [];
    const recordFinding = (finding, directives) => {
      if (!noInlineIgnores && directives) {
        const matched = matchIgnore(directives, finding.rule, finding.line, finding.tier);
        if (matched) {
          fileSuppressed.push({ file: finding.file, line: finding.line, rule: finding.rule, reason: matched.reason || "inline-ignore" });
          return;
        }
      }
      fileFindings.push(finding);
    };

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
    const hasCutoutArch = hasActiveCutoutArchitecture(content);
    // Mascot floors apply to any page that declares a mascot, not only runs passed --medium=mascot.
    const isMascotPage = effectiveMedium === "mascot" || /\bdata-mascot\b|<svg\b[^<>]{0,300}\b(?:id|class)\s*=\s*["'][^"']{0,80}\bmascot\b/i.test(content);
    // CSS/JS rules must not fire on prose that merely mentions `transition: all`: blank HTML text nodes for them.
    const codeLines = [".html", ".htm"].includes(ext) ? maskHtmlText(content).split(/\r?\n/) : lines;

    if (isCodeFile) {
      lines.forEach((line, idx) => {
        if (line.length > 4000) return;
        const lineNum = idx + 1;
        const lineForRules = (codeLines[idx] ?? line).replace(STRIP_D27_COMMENT_RE, "");
        const markupLine = line.replace(STRIP_D27_COMMENT_RE, "");
        for (const rule of LINE_RULES) {
          if (tierArg === "fast" && rule.speed !== "fast") continue;
          if (rule.videoOnly && !isVideoFile) continue;
          if (rule.regex.test(rule.markup ? markupLine : lineForRules)) {
            recordFinding({ file: rel, line: lineNum, tier: rule.tier, rule: rule.id, message: rule.message, fix: rule.fix }, directives);
          }
        }

        if (!isVideoFile && !/^\s*(?:\/\/|\/\*|\*|<!--)/.test(lineForRules)) {
          if (/\bscale(?:3d|X|Y)?\s*\(\s*0(?:\s*,\s*0(?:\s*,\s*0)?)?\s*\)/i.test(lineForRules) && !EXIT_STATE_RE.test(lineForRules)) {
            recordFinding({
              file: rel, line: lineNum, tier: "REFLEX", rule: "no-scale-zero-entrance",
              message: "UI animation uses `scale(0)` which looks artificial and disconnected from trigger geometry.",
              fix: "Animate from `scale(0.95)` to `scale(1)` anchored to the trigger `transform-origin`.",
            }, directives);
          }

          if (/\bease-in(?!-out)\b/i.test(lineForRules) && !EXIT_STATE_RE.test(lineForRules)) {
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

        if (/\bfilter\s*:[^;\n]*\bbrightness\(\s*0(?:\.0+)?\s*\)/i.test(lineForRules) && !hasCutoutArch) {
          recordFinding({
            file: rel, line: lineNum,
            tier: isMascotPage ? "FLOOR" : "REFLEX",
            rule: "no-blind-silhouette-filter",
            message: "`filter: brightness(0)` silhouettes flatten interior features into a solid blob without an active `<mask>` or `var(--m-cut)`/`var(--sil-bg)`.",
            fix: "Invert interior features with `--m-fill` / `--m-cut` CSS custom properties or an active `<mask>` cutout.",
          }, directives);
        }
      });

      const ruleBlockRe = /(?<=^|[{}])([^{}]+)\{([^{}]+)\}/g;
      const printRanges = mediaPrintRanges(content);
      let m;
      while ((m = ruleBlockRe.exec(content)) !== null) {
        const selector = m[1];
        const body = m[2];
        const lineNum = lineNumberAt(content, m.index);
        const inPrint = printRanges.some(([a, b]) => m.index > a && m.index < b);

        if (!inPrint && /(?:^|[\s,])body(?:\s|$|,)/i.test(selector) && /\bfont-size\s*:\s*(?:[0-9]|1[0-5])(?:\.\d+)?px\b/i.test(body)) {
          recordFinding({
            file: rel, line: lineNum, tier: "FLOOR", rule: "no-tiny-body-font",
            message: "Web body copy drops below the 16px legibility floor.",
            fix: "Set `body { font-size: clamp(1rem, 0.25vw + 0.95rem, 1.125rem); }` (`>= 16px`).",
          }, directives);
        }

        if (!isVideoFile && tierArg !== "fast") {
          if (!EXIT_STATE_RE.test(selector) &&
              /\b(?:transition|animation)-timing-function\s*:\s*ease-in(?!-out)\b/i.test(body)) {
            const durMs = parseDurationMs(body);
            if (durMs !== null && durMs > 220) {
              const alreadyFlagged = fileFindings.some((f) => f.file === rel && f.line === lineNum && f.rule === "no-ease-in-ui-entrance");
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

    if ([".html", ".htm", ".css", ".scss", ".svg"].includes(ext)) {
      if ([".html", ".htm", ".css", ".scss"].includes(ext)) {
        if (tierArg !== "fast") {
          // Comments stripped first: `/* TODO: prefers-reduced-motion */` is not a fallback.
          const codeOnly = stripCommentsForAnalysis(content);
          const hasAnimation = /@keyframes\b|\banimation\s*:/.test(codeOnly);
          const hasReducedMotion = /prefers-reduced-motion/.test(codeOnly);
          if (hasAnimation && !hasReducedMotion && !isVideoFile) {
            recordFinding({
              file: rel, line: 1, tier: "FLOOR", rule: "require-reduced-motion",
              message: "CSS animation/keyframes declared without a `prefers-reduced-motion: reduce` fallback.",
              fix: "Add `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`.",
            }, directives);
          }

          const hasInteractive = /<(?:button|a|input|select)\b/i.test(content);
          const hasFocusVisible = /:focus-visible[^{]{0,200}\{[^}]{0,400}(?:outline(?:-color|-style|-width)?\s*:(?!\s*(?:none|0)\b)|box-shadow\s*:(?!\s*none\b))/i.test(codeOnly);
          const removesFocus = /:focus(?!-within)[^{]{0,200}\{[^}]{0,400}outline(?:-style|-width)?\s*:\s*(?:none|0)\b/i.test(codeOnly);
          if (hasInteractive && removesFocus && !hasFocusVisible) {
            recordFinding({
              file: rel, line: 1, tier: "FLOOR", rule: "require-focus-visible",
              message: "Focus outline removed (`:focus { outline: none }`) with no visible `:focus-visible` replacement.",
              fix: "Keep `:focus-visible { outline: 2px solid var(--accent-focal, currentColor); outline-offset: 2px; }`.",
            }, directives);
          } else if (hasInteractive && /<style\b/i.test(content) && !hasFocusVisible) {
            recordFinding({
              file: rel, line: 1, tier: "FLOOR", rule: "require-focus-visible",
              message: "Interactive elements styled without an explicit `:focus-visible` indicator.",
              fix: "Add `:focus-visible { outline: 2px solid var(--accent-focal, currentColor); outline-offset: 2px; }`.",
            }, directives);
          }
        }

        // Tokens may be hex, oklch() or rgb(): the skill tells authors to write OKLCH, so the gate must read it.
        const tokenValue = (name) => content.match(new RegExp(`--${name}\\s*:\\s*(#[0-9a-f]{3,6}\\b|oklch\\([^)]{1,80}\\)|rgba?\\([^)]{1,80}\\))`, "i"))?.[1];
        const canvasHex = tokenValue("surface-canvas");
        const inkPrimaryHex = tokenValue("ink-primary");
        const inkSecondaryHex = tokenValue("ink-secondary");
        const unsolvable = "no ink lightness passes on this canvas: change --surface-canvas";
        const primaryMinRatio = (effectiveMedium === "book" || activeBrief?.surfaceMode === "read") ? 7.0 : 4.5;
        if (canvasHex && inkPrimaryHex) {
          const bg = parseCssColor(canvasHex), fg = parseCssColor(inkPrimaryHex);
          if (bg && fg) {
            const ratio = contrastRatio(fg, bg);
            const apcaLc = computeApcaLc(fg, bg);
            if (ratio < primaryMinRatio) {
              const suggested = suggestContrastingHex(fg, bg, primaryMinRatio, 75);
              recordFinding({
                file: rel, line: 1, tier: "FLOOR", rule: "wcag-contrast-fail",
                message: `--ink-primary (${inkPrimaryHex}) on --surface-canvas (${canvasHex}) has ratio ${ratio.toFixed(2)}:1 (< ${primaryMinRatio.toFixed(1)}:1 floor, APCA Lc=${apcaLc}).`,
                suggestedColor: suggested,
                fix: suggested ? `Change --ink-primary from ${inkPrimaryHex} to ${suggested}.` : unsolvable,
              }, directives);
            } else if (Math.abs(apcaLc) < 75) {
              const suggested = suggestContrastingHex(fg, bg, primaryMinRatio, 75);
              recordFinding({
                file: rel, line: 1, tier: "REFLEX", rule: "apca-contrast-fail",
                message: `--ink-primary (${inkPrimaryHex}) on --surface-canvas (${canvasHex}) fails APCA body floor (Lc=${apcaLc}, |Lc| < 75).`,
                suggestedColor: suggested,
                fix: suggested ? `Increase perceptual contrast by updating --ink-primary toward ${suggested}.` : unsolvable,
              }, directives);
            }
          }
        }
        if (canvasHex && inkSecondaryHex) {
          const bg = parseCssColor(canvasHex), fg = parseCssColor(inkSecondaryHex);
          if (bg && fg) {
            const ratio = contrastRatio(fg, bg);
            const apcaLc = computeApcaLc(fg, bg);
            if (ratio < 4.5) {
              const suggested = suggestContrastingHex(fg, bg, 4.5, 75);
              recordFinding({
                file: rel, line: 1, tier: "FLOOR", rule: "wcag-contrast-fail",
                message: `--ink-secondary (${inkSecondaryHex}) on --surface-canvas (${canvasHex}) has ratio ${ratio.toFixed(2)}:1 (< 4.5:1 floor, APCA Lc=${apcaLc}).`,
                suggestedColor: suggested,
                fix: suggested ? `Change --ink-secondary from ${inkSecondaryHex} to ${suggested}.` : unsolvable,
              }, directives);
            } else if (Math.abs(apcaLc) < 75) {
              // APCA: Lc 75 is the minimum for body-size text; secondary ink carries 14-16px meta and captions.
              const suggested = suggestContrastingHex(fg, bg, 4.5, 75);
              recordFinding({
                file: rel, line: 1, tier: "REFLEX", rule: "apca-contrast-fail",
                message: `--ink-secondary (${inkSecondaryHex}) on --surface-canvas (${canvasHex}) fails APCA body-text floor (Lc=${apcaLc}, |Lc| < 75).`,
                suggestedColor: suggested,
                fix: suggested ? `Increase perceptual contrast by updating --ink-secondary toward ${suggested}.` : unsolvable,
              }, directives);
            }
          }
        }

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

      if ([".html", ".htm"].includes(ext)) {
        const eyebrowRe = /<(span|div|p|small|strong|em)\b([^<>]{0,512})>([^<]{1,140})<\/\1>\s*<h[1-6]\b/gi;
        const eyebrowMatches = [];
        const codeOnlyHtml = stripCommentsForAnalysis(content);
        const imgNoAlt = codeOnlyHtml.match(/<img\b(?![^<>]*\balt\s*=)[^<>]*>/i);
        if (imgNoAlt) {
          recordFinding({
            file: rel, line: lineNumberAt(content, content.indexOf(imgNoAlt[0])), tier: "FLOOR", rule: "require-img-alt",
            message: "`<img>` without an `alt` attribute (WCAG 1.1.1).",
            fix: "Add descriptive `alt`, or `alt=\"\"` for decorative images.",
          }, directives);
        }
        if (/<html\b(?![^<>]*\blang\s*=)[^<>]*>/i.test(codeOnlyHtml)) {
          recordFinding({
            file: rel, line: 1, tier: "FLOOR", rule: "require-html-lang",
            message: "`<html>` without a `lang` attribute (WCAG 3.1.1).",
            fix: "Add `<html lang=\"en\">` (or the page language).",
          }, directives);
        }
        if (tierArg !== "fast") {
          const rootTok = (name) => parseCssColor(content.match(new RegExp(`--${name}\\s*:\\s*(#[0-9a-f]{3,6}\\b|oklch\\([^)]{1,80}\\)|rgba?\\([^)]{1,80}\\))`, "i"))?.[1]);
          const canvasRgb = rootTok("surface-canvas") || rootTok("bg") || rootTok("background");
          const accentRgb = rootTok("accent-focal") || rootTok("accent");
          const darkOrange = canvasRgb && accentRgb && rgbToOklch(canvasRgb).L < 0.2 &&
            (() => { const a = rgbToOklch(accentRgb); return a.C > 0.15 && a.H >= 25 && a.H <= 60; })();
          const defaultDisplay = codeOnlyHtml.match(/font-family\s*:\s*["']?(Geist|Inter(?: Tight)?)\b/i)?.[1];
          const dealt = [activeBrief?.primary, activeBrief?.alternate].some((w) => w?.fonts?.display && defaultDisplay && w.fonts.display.toLowerCase() === defaultDisplay.toLowerCase());
          if ((darkOrange || defaultDisplay) && !dealt) {
            recordFinding({
              file: rel, line: 1, tier: "REFLEX", rule: "convergence-signature",
              message: `AI-default convergence signature: ${[darkOrange && "near-black canvas + orange accent", defaultDisplay && `\`${defaultDisplay}\` type`].filter(Boolean).join(" and ")}.`,
              fix: "Re-deal a Material World (`d27-deal --prompt ...`) or justify the choice on record.",
            }, directives);
          }
        }
        let em;
        while ((em = eyebrowRe.exec(content)) !== null) {
          const attrs = em[2];
          const innerText = em[3].replace(/<[^<>]+>/g, "").trim();
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

        const hasThumbMarker = /\b(?:id\s*=\s*["']thumbnail-canvas["']|data-thumbnail\b|class\s*=\s*["'][^"']*\byt-thumb\b)/i.test(content);
        if (effectiveMedium === "thumbnail" || hasThumbMarker) {
          const stageMatch = content.match(/<(?:div|section|main|figure)\b[^<>]*(?:id\s*=\s*["']thumbnail-canvas["']|data-thumbnail\b|class\s*=\s*["'][^"']*\byt-thumb\b)[^<>]*>/i);
          let stageHtml = "";
          let stageLine = 1;
          let stageOpenTag = "";
          if (stageMatch) {
            stageOpenTag = stageMatch[0];
            stageHtml = extractTagBlock(content, stageMatch.index);
            stageLine = lineNumberAt(content, stageMatch.index);
          } else {
            const bodyMatch = content.match(/<body\b[^<>]*>[\s\S]*?<\/body>/i);
            stageHtml = bodyMatch ? bodyMatch[0] : content;
          }
          const cleanedStage = stageHtml
            .replace(/<(?:style|script|title|desc|defs)\b[\s\S]*?<\/\s*(?:style|script|title|desc|defs)>/gi, " ")
            .replace(/<!--[\s\S]*?-->/g, " ")
            .replace(/<(?:span|div|time)\b[^<>]*(?:class\s*=\s*["'][^"']*(?:yt-duration|timestamp|deadzone-box)[^"']*["']|data-timestamp)[^<>]*>[\s\S]*?<\/\s*(?:span|div|time)>/gi, " ")
            .replace(/<[^<>]+>/g, " ")
            .replace(/&[a-z0-9#]+;/gi, " ")
            .trim();
          const words = cleanedStage ? cleanedStage.split(/\s+/).filter(Boolean) : [];
          if (words.length > 4) {
            recordFinding({
              file: rel, line: stageLine, tier: "FLOOR", rule: "thumbnail-word-ceiling",
              message: `Primary thumbnail stage has ${words.length} words ("${words.slice(0, 6).join(" ")}..."), exceeding the 4-word ceiling.`,
              fix: "Cut thumbnail stage copy to 0-4 words and move explanatory context into the paired video/article Title.",
            }, directives);
          }

          const pairedTitle = stageOpenTag.match(/\bdata-title\s*=\s*["']([^"']+)["']/i)?.[1];
          if (pairedTitle && words.length > 0) {
            const stem = (w) => (w.length >= 5 ? w.replace(/(?:ing|ed|es|s)$/, "") : w);
            const normSet = (arr) => new Set(arr.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 1 && !STOPWORDS.has(w)).map(stem));
            const thumbSet = normSet(words);
            const titleSet = normSet(pairedTitle.split(/\s+/));
            if (thumbSet.size > 0 && titleSet.size > 0) {
              const shared = [...thumbSet].filter((t) => titleSet.has(t));
              const overlap = shared.length / Math.min(thumbSet.size, titleSet.size);
              if (overlap >= 0.5 && (shared.length >= 2 || thumbSet.size === 1)) {
                recordFinding({
                  file: rel, line: stageLine, tier: "REFLEX", rule: "thumbnail-title-overlap",
                  message: `Thumbnail hook overlaps ${Math.round(overlap * 100)}% of paired title tokens (${shared.join(", ")}), collapsing the Loewenstein information gap.`,
                  fix: "Rewrite the thumbnail hook to add visual/verbal tension instead of repeating title words.",
                }, directives);
              }
            }
          }
        }
      }

      if (tierArg !== "fast") {
        const svgMatches = findSvgBlocks(content);
        for (const sm of svgMatches) {
          const svg = sm[0];
          const svgLine = lineNumberAt(content, sm.index);
          const namedGroups = (svg.match(/<g\b[^<>]*\bid\s*=\s*["'][^"']+["']/gi) || []).length;
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
          const primaryLine = lineNumberAt(content, primarySvgMatch.index);

          if (!/\bviewBox\s*=\s*["'][^"']+["']/i.test(primarySvg)) {
            recordFinding({
              file: rel, line: primaryLine,
              tier: isMascotPage ? "FLOOR" : "REFLEX",
              rule: "require-svg-named-groups",
              message: "Primary mascot <svg> is missing a `viewBox` attribute (breaks responsive & 16px silhouette scaling).",
              fix: 'Add `viewBox="0 0 400 400"` to the primary mascot `<svg>`.',
            }, directives);
          }

          const groupOpenRe = /<g\b[^<>]*\bid\s*=\s*["']([^"']+)["'][^<>]*>/gi;
          const semanticGroups = new Set();
          let gm;
          let groupsSeen = 0;
          while ((gm = groupOpenRe.exec(primarySvg)) !== null && groupsSeen++ < 64) {
            const gid = gm[1].trim();
            if (/^(?:g|group|layer|untitled)\d*$/i.test(gid)) continue;
            const block = extractTagBlock(primarySvg, gm.index);
            if (/<(?:path|circle|ellipse|polygon|polyline|rect|line|text|use)\b/i.test(block)) {
              semanticGroups.add(gid.toLowerCase());
            }
          }
          const stockParts = [...semanticGroups].filter((g) => /^(?:ears?|cheeks?|blush)$/.test(g));
          if (stockParts.length) {
            recordFinding({
              file: rel, line: primaryLine, tier: "REFLEX", rule: "no-generic-mascot-features",
              message: `Mascot uses stock cute-animal parts (${stockParts.map((g) => "#" + g).join(", ")}).`,
              fix: "Derive anatomy from the 2-noun domain metaphor (mascot-creation.md §1) unless the brief names an animal.",
            }, directives);
          }
          if (semanticGroups.size < 4) {
            recordFinding({
              file: rel,
              line: primaryLine,
              tier: isMascotPage ? "FLOOR" : "REFLEX",
              rule: "require-svg-named-groups",
              message: `Primary mascot <svg> has ${semanticGroups.size} non-empty semantic <g id="..."> group(s) (minimum 4 required).`,
              fix: "Split mascot anatomy into >= 4 non-empty semantic `<g id=\"...\">` groups (e.g. `#chassis`, `#eyes`, `#mouth`, `#badge`).",
            }, directives);
          }
        }
      }

      if (tierArg !== "fast" && activeBrief && [".html", ".htm", ".css", ".scss"].includes(ext)) {
        const worlds = [activeBrief.primary, activeBrief.alternate].filter((w) => w && typeof w === "object" && w.tokens);
        const rootBody = content.match(/:root\s*\{([^}]*)\}/)?.[1];
        if (worlds.length && rootBody) {
          const tok = (name) => parseCssColor(rootBody.match(new RegExp(`--${name}\\s*:\\s*(#[0-9a-f]{3,6}\\b|oklch\\([^)]{1,80}\\)|rgba?\\([^)]{1,80}\\))`, "i"))?.[1]);
          const lab = (rgb) => { const o = rgbToOklch(rgb); const h = (o.H * Math.PI) / 180; return [o.L, o.C * Math.cos(h), o.C * Math.sin(h)]; };
          // OKLab distance 0.04 ~ a clearly visible step: tolerates emotion tuning and rounding, not a new palette.
          const near = (a, hex) => { const b = parseCssColor(hex); if (!a || !b) return false; const [x, y] = [lab(a), lab(b)]; return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 0.04; };
          const canvas = tok("surface-canvas"), accent = tok("accent-focal");
          const usesWorld = worlds.some((w) => near(canvas, w.tokens.surfaceCanvas) && near(accent, w.tokens.accentFocal));
          const display = worlds.map((w) => w.fonts?.display).filter((f) => typeof f === "string" && f.length < 64);
          const usesFont = display.some((f) => new RegExp(`font-family\\s*:[^;]{0,200}${escapeRegExp(f)}`, "i").test(content));
          if ((canvas || accent) && (!usesWorld || (display.length && !usesFont))) {
            recordFinding({
              file: rel, line: lineNumberAt(content, content.indexOf(":root")), tier: "REFLEX", rule: "brief-world-drift",
              message: `Output drifted from the dealt world (${worlds.map((w) => w.slug).join(" / ")}): ${[!usesWorld && "canvas/accent tokens differ", display.length && !usesFont && `display face is not ${display.join(" or ")}`].filter(Boolean).join("; ")}.`,
              fix: "Use the dealt world's `surfaceCanvas`, `accentFocal` and display face, or log the override: `/* d27-allow: brief-world-drift — reason */`.",
            }, directives);
          }
        }
        if (/<style\b/i.test(content) && !/:root\s*\{/.test(content)) {
          recordFinding({
            file: rel, line: 1, tier: "FLOOR", rule: "brief-require-tokens",
            message: `Active brief (${activeBrief.primary?.slug}) requires semantic \`:root\` tokens.`,
            fix: "Declare `--surface-canvas`, `--ink-primary`, and `--accent-focal` inside `:root { ... }`.",
          }, directives);
        }
        for (const bannedFont of activeBrief.bannedDefaults?.fonts || []) {
          if (typeof bannedFont !== "string" || bannedFont.length === 0 || bannedFont.length > 128) continue;
          const fontRe = new RegExp(`(?:font-family|font)\\s*:[^;]{0,512}\\b${escapeRegExp(bannedFont)}\\b`, "i");
          if (fontRe.test(content)) {
            recordFinding({
              file: rel, line: 1, tier: "FLOOR", rule: "brief-banned-default-used",
              message: `Built CSS uses banned default font \`${bannedFont}\` from active brief.`,
              fix: `Swap \`${bannedFont}\` for dealt brief typography (${activeBrief.primary?.fonts?.body || "stage 3 token"}).`,
            }, directives);
          }
        }
        const band = activeBrief.emotion?.accentChroma;
        const rootBlock = Array.isArray(band) ? content.match(/:root\s*\{([^}]*)\}/)?.[1] : null;
        if (rootBlock) {
          // Accent tokens only: ink, surface and state colours (error red, success green) are not the arousal dose.
          const accents = [...rootBlock.matchAll(/--accent[\w-]*\s*:\s*(#[0-9a-f]{3,6}\b|oklch\([^)]{1,80}\)|rgba?\([^)]{1,80}\))/gi)]
            .filter((m) => !/--accent-ink\b/i.test(m[0]))
            .map((m) => parseCssColor(m[1]))
            .filter(Boolean)
            .map((rgb) => relativeChroma(rgb));
          const peak = accents.length ? Math.max(...accents) : null;
          // 0.05 slack, same as d27-deal's tuning: avoids flagging dealt worlds at the band edge.
          const [minC, maxC] = band;
          if (peak !== null && (peak > maxC + 0.05 || peak < minC - 0.05)) {
            const tooLoud = peak > maxC;
            recordFinding({
              file: rel, line: lineNumberAt(content, content.indexOf(":root")), tier: "REFLEX", rule: "brief-emotion-chroma-mismatch",
              message: `Peak accent relative chroma ${peak.toFixed(2)} is ${tooLoud ? "above" : "below"} the \`${activeBrief.emotion.target}\` arousal band ${minC}-${maxC} (share of max sRGB chroma at that L and H).`,
              fix: tooLoud
                ? `Lower accent chroma (keep L and H) to <= ${maxC} of its gamut maximum, or re-deal with a higher-arousal --emotion (references/emotion-science.md §0).`
                : `Raise one focal accent to >= ${minC} of its gamut maximum, or re-deal with a lower-arousal --emotion (references/emotion-science.md §0).`,
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

    if (tierArg !== "fast" && ext === ".typ") {
      auditTypstParagraphs({ content, rel, directives, recordFinding, lineNumberAt });
    }

    const isHtmlExt = [".html", ".htm"].includes(ext);
    const isBookProseTarget = [".md", ".typ"].includes(ext) || (effectiveMedium === "book" && isHtmlExt);
    if (isBookProseTarget) {
      auditBookProse({ content, ext, rel, effectiveMedium, directives, recordFinding });
    } else if (isHtmlExt && tierArg !== "fast") {
      auditBookProse({ content, ext, rel, effectiveMedium, directives, recordFinding, lite: true });
    }

    if (reportUnused && !noInlineIgnores) {
      fileFindings.push(...getUnusedIgnores(directives, rel));
    }

    findings.push(...fileFindings);
    suppressed.push(...fileSuppressed);
    if (!bypass && cacheKey) {
      writeCacheEntry(cacheDir, cacheKey, { findings: fileFindings, suppressed: fileSuppressed });
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
        message: `Thumbnail element <${col.tag}> ("${col.text}") collides with platform dead zone at ${vpLabel}.`,
        fix: "Reposition thumbnail copy, logos, and focal subjects clear of platform overlay dead zones.",
      });
    }
    if (audit.thumbnailHookScale && audit.thumbnailHookScale.ratio < audit.thumbnailHookScale.minRatio) {
      findings.push({
        file: rel, line: 1, tier: "REFLEX", rule: "thumbnail-hook-too-small",
        message: `Thumbnail hook font-size is ${Math.round(audit.thumbnailHookScale.ratio * 100)}% of stage height (< 14% squint floor) at ${vpLabel}.`,
        fix: "Scale primary thumbnail hook text to >= 16–24% of canvas height.",
      });
    }
    if (audit.mascotCutout && audit.mascotCutout.collapsed) {
      const c = audit.mascotCutout;
      findings.push({
        file: rel, line: 1, tier: "FLOOR", rule: "mascot-16px-cutout-collapse",
        message: `Mascot 16x16 cutout collapsed (interiorCutoutPixels=${c.interiorCutoutPixels}, inkCoverage=${Math.round(c.inkCoverage * 100)}%) at ${vpLabel}.`,
        fix: "Enlarge --m-cut interior eyes (>= 36u) and cutout strokes/gaps (>= 25u) in viewBox 0 0 400 400.",
      });
    }
    if (audit.unnamedControls?.length) {
      findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "render-unnamed-control", message: `Controls without an accessible name at ${vpLabel}: ${audit.unnamedControls.join(", ")}.`, fix: "Add visible text, `aria-label`, or an associated `<label>`." });
    }
    if (audit.targetTooSmall?.length) {
      findings.push({ file: rel, line: 1, tier: "REFLEX", rule: "render-target-size", message: `Pointer targets < 24x24px at ${vpLabel}: ${audit.targetTooSmall.join(", ")}.`, fix: "Raise hit areas to >= 24x24px (44x44 for primary touch targets)." });
    }
    for (const re of runtimeErrors || []) {
      // Page-controlled text: clip it before it reaches reports, CI annotations and the agent's context.
      findings.push({ file: rel, line: 1, tier: "FLOOR", rule: "runtime-error", message: String(re).slice(0, 300), fix: "Fix broken script or missing asset request." });
    }
  }

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
      const { auditHtmlWithCdp, buildDomAuditFnSource } = await import("./lib/chrome-cdp.mjs");
      let pw = null;
      try { pw = await import("playwright"); } catch { pw = null; }

      if (pw) {
        try {
          const browser = await pw.chromium.launch();
          if (snapshotsDir) fs.mkdirSync(path.resolve(snapshotsDir), { recursive: true });
          const auditFnSrc = buildDomAuditFnSource();
          const { serveDirectory, commonDir } = await import("./lib/safe-io.mjs");
          const server = await serveDirectory(commonDir(htmlFiles));
          try {

          for (const htmlFile of htmlFiles) {
            for (const vp of viewports) {
              const page = await browser.newPage({ viewport: vp });
              await page.route("**/*", (route) => {
                const u = route.request().url();
                if (u.startsWith("data:") || u.startsWith(`${server.origin}/`)) {
                  return route.continue();
                }
                return route.abort("blockedbyclient");
              });
              const runtimeErrors = [];
              page.on("pageerror", (e) => runtimeErrors.push(e.message));
              await page.goto(server.urlFor(htmlFile), { waitUntil: "domcontentloaded" });
              await page.evaluate(async () => {
                if (document.fonts && document.fonts.ready) await document.fonts.ready;
                await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
              });

              if (snapshotsDir) {
                const snapName = `${path.basename(htmlFile, path.extname(htmlFile))}-${vp.width}x${vp.height}.png`;
                const { writeFileSafe } = await import("./lib/safe-io.mjs");
                writeFileSafe(path.join(path.resolve(snapshotsDir), snapName), await page.screenshot());
              }

              const audit = await page.evaluate(
                async ({ fnStr, assertionsArg, mediumArg }) => {
                  const fn = eval(`(${fnStr})`);
                  return await fn(assertionsArg, mediumArg);
                },
                { fnStr: auditFnSrc, assertionsArg: assertions, mediumArg: effectiveMedium }
              );

              recordDomAuditResult({ file: htmlFile, viewport: vp, runtimeErrors, audit });
              renderAudit.viewportsChecked.push(`${vp.width}x${vp.height}`);
              renderAudit.samplesChecked += 1;
              await page.close();
            }
          }
          } finally {
            await browser.close();
            await server.close();
          }
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
            unsafeNoSandbox,
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
    writeOut(JSON.stringify(buildSarif({ version: VERSION, rules: ALL_RULES, findings, executionSuccessful: true }), null, 2));
  } else if (githubMode) {
    for (const f of findings) {
      const level = f.tier === "FLOOR" ? "error" : "warning";
      writeOut(`::${level} file=${escapeGhProp(f.file)},line=${Number(f.line) || 1},title=${escapeGhProp(f.rule)}::${escapeGhData(`${f.message} Fix: ${f.fix}`)}`);
    }
  } else if (jsonMode) {
    writeOut(
      JSON.stringify(
        {
          tool: "d27-check",
          version: VERSION,
          medium: effectiveMedium,
          ok: !failed,
          strict: strictMode,
          filesScanned: files.length,
          briefVerified: activeBrief ? activeBrief.primary?.slug : null,
          meta: { cacheHits, cacheMisses },
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
    const linesOut = [
      `Design 27 Check v${VERSION} (${effectiveMedium}) — Scanned ${files.length} file(s): ${floorFails.length} FLOOR fail(s), ${reflexWarns.length} REFLEX warning(s), ${suppressed.length} suppressed`,
    ];
    for (const f of findings) {
      linesOut.push(`  [${f.tier}] ${f.file}:${f.line} (${f.rule}) — ${f.message}`);
      linesOut.push(`    Fix: ${f.fix}`);
    }
    writeOut(linesOut.join("\n"));
  }

  return failed ? 2 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await runCheck(process.argv.slice(2));
}
