#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — 26-Assertion Research-Backed Security, 10x-Leap, 6-Pillar & Scope-Hygiene Eval Suite
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCheck } from "../scripts/d27-check.mjs";
import { evaluateDeterminismHashes } from "../scripts/lib/chrome-cdp.mjs";
import { parseVerifyArgs } from "../scripts/d27-frames.mjs";
import { analyzeCutoutBitmap } from "../scripts/lib/pixel-audit.mjs";
import { computeApcaLc } from "../scripts/lib/color-math.mjs";
import { computeBurstiness } from "../scripts/lib/prose-audit.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cli = path.join(root, "scripts", "d27-cli.mjs");
const checker = path.join(root, "scripts", "d27-check.mjs");
const dealer = path.join(root, "scripts", "d27-deal.mjs");
const hook = path.join(root, "scripts", "d27-hook.mjs");
const captions = path.join(root, "scripts", "d27-captions.mjs");

const fixtures = {
  slopSaas: path.join(__dirname, "fixtures", "slop-saas.html"),
  cleanSaas: path.join(__dirname, "fixtures", "design27-saas.html"),
  slopBook: path.join(__dirname, "fixtures", "slop-book.md"),
  cleanBook: path.join(__dirname, "fixtures", "clean-book.md"),
  slopMascot: path.join(__dirname, "fixtures", "slop-mascot.html"),
  cleanMascot: path.join(__dirname, "fixtures", "clean-mascot.html"),
  slopThumb: path.join(__dirname, "fixtures", "slop-thumb.html"),
  cleanThumb: path.join(__dirname, "fixtures", "clean-thumb.html"),
  slopAnim: path.join(__dirname, "fixtures", "slop-anim.html"),
  cleanAnim: path.join(__dirname, "fixtures", "clean-anim.html"),
  slopMotion: path.join(__dirname, "fixtures", "slop-motion.html"),
  cleanMotion: path.join(__dirname, "fixtures", "clean-motion.html"),
};

console.log("Design 27 v4.0.0 — Reproducible 26-Assertion Research-Backed Security, 10x-Leap & 6-Pillar Eval Suite\n");
let failed = 0;

function assert(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"} | ${name}`);
  if (detail) console.log(`     ${detail}`);
  if (!ok) failed += 1;
}

function safeJson(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return null;
  }
}

function parseHex(hex) {
  if (typeof hex !== "string") return null;
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

function contrastRatio(hex1, hex2) {
  const c1 = parseHex(hex1);
  const c2 = parseHex(hex2);
  if (!c1 || !c2) return 0;
  const l1 = relLuminance(c1);
  const l2 = relLuminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// 1. Web slop fails exit 2
const r1 = spawnSync(process.execPath, [checker, fixtures.slopSaas, "--json"], { encoding: "utf8" });
const d1 = safeJson(r1.stdout);
assert(
  "1. Web Slop Baseline (slop-saas.html)",
  r1.status === 2 && d1 && !d1.passed && d1.floorFails >= 5,
  `Exit: ${r1.status} | FLOOR: ${d1?.floorFails} | REFLEX: ${d1?.reflexWarns}`
);

// 2. Web Design 27 v4.0 reference passes exit 0 with 0 warnings
const r2 = spawnSync(process.execPath, [checker, fixtures.cleanSaas, "--strict", "--json"], { encoding: "utf8" });
const d2 = safeJson(r2.stdout);
assert(
  "2. Web Design 27 v4.0 Reference (design27-saas.html)",
  r2.status === 0 && d2 && d2.passed && d2.floorFails === 0 && d2.reflexWarns === 0,
  `Exit: ${r2.status} | FLOOR: ${d2?.floorFails} | REFLEX: ${d2?.reflexWarns}`
);

// 3. Book prose slop fails vs clean cold-open prose passes
const r3Fail = spawnSync(process.execPath, [checker, fixtures.slopBook, "--medium=book", "--json"], { encoding: "utf8" });
const d3Fail = safeJson(r3Fail.stdout);
const r3Pass = spawnSync(process.execPath, [checker, fixtures.cleanBook, "--medium=book", "--strict", "--json"], { encoding: "utf8" });
const d3Pass = safeJson(r3Pass.stdout);
const slopBookRules = new Set((d3Fail?.findings || []).map((f) => f.rule));
assert(
  "3. Book Prose Slop vs Clean (slop-book.md / clean-book.md)",
  r3Fail.status === 2 &&
    d3Fail?.floorFails >= 1 &&
    slopBookRules.has("no-ai-slop-vocabulary") &&
    slopBookRules.has("no-negative-parallelism-tic") &&
    slopBookRules.has("no-throat-clearing-opener") &&
    r3Pass.status === 0 &&
    d3Pass?.passed &&
    d3Pass?.floorFails === 0,
  `Slop Exit: ${r3Fail.status} (rules: ${[...slopBookRules].join(", ")}) | Clean Exit: ${r3Pass.status}`
);

// 4. Mascot blind-silhouette / missing-groups fail vs cutout-rigged pass
const r4Fail = spawnSync(process.execPath, [checker, fixtures.slopMascot, "--medium=mascot", "--json"], { encoding: "utf8" });
const d4Fail = safeJson(r4Fail.stdout);
const r4Pass = spawnSync(process.execPath, [checker, fixtures.cleanMascot, "--medium=mascot", "--strict", "--json"], { encoding: "utf8" });
const d4Pass = safeJson(r4Pass.stdout);
const slopMascotRules = new Set((d4Fail?.findings || []).map((f) => f.rule));
assert(
  "4. Mascot Blind-Silhouette vs Cutout-Rigged (slop-mascot.html / clean-mascot.html)",
  r4Fail.status === 2 &&
    d4Fail?.floorFails >= 2 &&
    slopMascotRules.has("no-blind-silhouette-filter") &&
    slopMascotRules.has("require-svg-named-groups") &&
    r4Pass.status === 0 &&
    d4Pass?.passed &&
    d4Pass?.floorFails === 0,
  `Slop Exit: ${r4Fail.status} (rules: ${[...slopMascotRules].join(", ")}) | Clean Exit: ${r4Pass.status}`
);

// 5. Thumbnail word-ceiling fail vs safe-zone pass
const r5Fail = spawnSync(process.execPath, [checker, fixtures.slopThumb, "--medium=thumbnail", "--json"], { encoding: "utf8" });
const d5Fail = safeJson(r5Fail.stdout);
const r5Pass = spawnSync(process.execPath, [checker, fixtures.cleanThumb, "--medium=thumbnail", "--strict", "--json"], { encoding: "utf8" });
const d5Pass = safeJson(r5Pass.stdout);
const slopThumbRules = new Set((d5Fail?.findings || []).map((f) => f.rule));
assert(
  "5. Thumbnail Word-Ceiling vs Safe-Zone Pass (slop-thumb.html / clean-thumb.html)",
  r5Fail.status === 2 &&
    d5Fail?.floorFails >= 1 &&
    slopThumbRules.has("thumbnail-word-ceiling") &&
    r5Pass.status === 0 &&
    d5Pass?.passed &&
    d5Pass?.floorFails === 0,
  `Slop Exit: ${r5Fail.status} (rules: ${[...slopThumbRules].join(", ")}) | Clean Exit: ${r5Pass.status}`
);

// 6. d27-deal v4 contract: schemaVersion === 4, macrostructure, contrast-safe tokens
const r6 = spawnSync(process.execPath, [dealer, "--prompt", "Audio field recorder", "--medium", "web", "--no-save"], { encoding: "utf8" });
const d6 = safeJson(r6.stdout);
const t6 = d6?.primary?.tokens;
const cPrimary = t6 ? contrastRatio(t6.inkPrimary, t6.surfaceCanvas) : 0;
const cSecondary = t6 ? contrastRatio(t6.inkSecondary, t6.surfaceCanvas) : 0;
assert(
  "6. d27-deal v4 Schema, Macrostructure & Contrast-Safe Tokens",
  r6.status === 0 &&
    d6?.schemaVersion === 4 &&
    d6?.version === "4.0.0" &&
    Boolean(d6?.macrostructure?.slug && d6?.macrostructure?.blueprint) &&
    Boolean(d6?.signatureContract?.requireDiegeticMetaphor) &&
    cPrimary >= 4.5 &&
    cSecondary >= 4.5,
  `schema=${d6?.schemaVersion} | world=${d6?.primary?.slug} | macro=${d6?.macrostructure?.slug} | contrast=${cPrimary.toFixed(2)}:1 / ${cSecondary.toFixed(2)}:1`
);

// 7. SARIF 2.1.0 schema contract + fatal executionSuccessful: false
const r7 = spawnSync(process.execPath, [checker, fixtures.slopSaas, "--sarif"], { encoding: "utf8" });
const s7 = safeJson(r7.stdout);
const r7Bad = spawnSync(process.execPath, [checker, "/nonexistent-d27-path", "--sarif"], { encoding: "utf8" });
const s7Bad = safeJson(r7Bad.stdout);
assert(
  "7. SARIF 2.1.0 Schema & Fatal Contract",
  s7?.version === "2.1.0" &&
    (s7?.runs?.[0]?.results?.length || 0) > 0 &&
    r7Bad.status === 1 &&
    s7Bad?.runs?.[0]?.invocations?.[0]?.executionSuccessful === false,
  `SARIF v${s7?.version} | results: ${s7?.runs?.[0]?.results?.length} | missing-target executionSuccessful: ${s7Bad?.runs?.[0]?.invocations?.[0]?.executionSuccessful}`
);

// 8. --doctor preflight exits 0 with v4 capabilities & chromeCdp telemetry
const r8 = spawnSync(process.execPath, [checker, "--doctor"], { encoding: "utf8" });
const d8 = safeJson(r8.stdout);
assert(
  "8. --doctor Preflight & Chrome CDP Contract",
  r8.status === 0 &&
    d8?.ok === true &&
    d8?.version === "4.0.0" &&
    Array.isArray(d8?.capabilities) &&
    typeof d8?.chromeCdp?.available === "boolean",
  `version=${d8?.version} | chromeCdp=${d8?.chromeCdp?.available} | capabilities=${(d8?.capabilities || []).join(", ")}`
);

// 9. Zero-network edit-time hook emits PostToolUse feedback on slop file
const r9 = spawnSync(process.execPath, [hook, "--event=post-edit"], {
  input: JSON.stringify({ tool_input: { file_path: fixtures.slopSaas } }),
  encoding: "utf8",
});
const d9 = safeJson(r9.stdout);
assert(
  "9. Zero-Network Edit-Time Hook (PostToolUse)",
  r9.status === 0 && Boolean(d9?.hookSpecificOutput?.additionalContext),
  `Event: ${d9?.hookSpecificOutput?.hookEventName || "none"}`
);

// 10. Scope-hygiene check verifying removed out-of-scope files do not exist
const removedArtifacts = [
  "references/posters.md",
  "references/presentations.md",
  "references/cheatsheets.md",
  "references/books-and-editorial.md",
  "references/mascot-and-illustration.md",
  "assets/before-after-deck.svg",
];
const leftovers = removedArtifacts.filter((rel) => fs.existsSync(path.join(root, rel)));
assert(
  "10. Scope-Hygiene Contract (No Posters / Presentations / Legacy Assets)",
  leftovers.length === 0,
  leftovers.length === 0 ? "0 removed poster/presentation/legacy artifacts present" : `Found leftovers: ${leftovers.join(", ")}`
);

// 11. Inline waiver hyphenated rule contract
const tmpWaiverFile = path.join(os.tmpdir(), `d27-eval-waiver-${process.pid}-${Date.now()}.html`);
let r11;
let d11 = null;
try {
  fs.writeFileSync(
    tmpWaiverFile,
    "/* d27-disable-next-line: no-transition-all — deliberate test */\n.box { transition: all 200ms ease; }\n",
    "utf8"
  );
  r11 = spawnSync(process.execPath, [checker, tmpWaiverFile, "--report-unused-ignores", "--json"], { encoding: "utf8" });
  d11 = safeJson(r11.stdout);
} finally {
  fs.rmSync(tmpWaiverFile, { force: true });
}
assert(
  "11. Inline Waiver Hyphenated Rule Contract",
  r11?.status === 0 && d11?.suppressed?.length === 1 && d11?.findings?.length === 0,
  `Exit: ${r11?.status} | suppressed: ${d11?.suppressed?.length} | findings: ${d11?.findings?.length}`
);

// 12. End-to-end brief + CDP render contract
const tmpBriefFile = path.join(os.tmpdir(), `d27-eval-brief-${process.pid}-${Date.now()}.json`);
const canRender = Boolean(d8?.chromeCdp?.available || d8?.playwright?.available);
let r12Deal;
let r12Check;
let d12 = null;
try {
  r12Deal = spawnSync(
    process.execPath,
    [dealer, "--prompt", "Latency telemetry", "--medium", "web", "--out", tmpBriefFile, "--no-save"],
    { encoding: "utf8" }
  );
  const checkArgs12 = [checker, fixtures.cleanSaas, "--brief", tmpBriefFile];
  if (canRender) checkArgs12.push("--render");
  checkArgs12.push("--json");
  r12Check = spawnSync(process.execPath, checkArgs12, { encoding: "utf8" });
  d12 = safeJson(r12Check.stdout);
} finally {
  fs.rmSync(tmpBriefFile, { force: true });
}
assert(
  "12. End-to-End Brief + CDP Render Contract",
  r12Deal?.status === 0 && r12Check?.status === 0 && d12?.floorFails === 0,
  `Deal Exit: ${r12Deal?.status} | Check Exit: ${r12Check?.status} | render=${canRender} (${d12?.renderAudit?.engine || "static"}) | FLOOR: ${d12?.floorFails}`
);

// 13. CLI negative flag & medium path isolation
const tmpMotionDir = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-isolation-"));
let r13;
let d13 = null;
try {
  const nestedDir = path.join(tmpMotionDir, "motion-dashboard");
  fs.mkdirSync(nestedDir, { recursive: true });
  const nestedHtml = path.join(nestedDir, "index.html");
  fs.copyFileSync(fixtures.cleanSaas, nestedHtml);
  r13 = spawnSync(
    process.execPath,
    [checker, nestedHtml, "--medium=web", "--target-lufs", "-16", "--json"],
    { encoding: "utf8" }
  );
  d13 = safeJson(r13.stdout);
} finally {
  fs.rmSync(tmpMotionDir, { recursive: true, force: true });
}
assert(
  "13. CLI Negative Flag & Medium Path Isolation",
  r13?.status === 0 && d13?.floorFails === 0,
  `Exit: ${r13?.status} | medium=${d13?.medium} | FLOOR: ${d13?.floorFails}`
);

// 14. SVG proof plates well-formedness & strict check
const assetsDir = path.join(root, "assets");
const svgFiles = fs.existsSync(assetsDir)
  ? fs.readdirSync(assetsDir).filter((f) => f.endsWith(".svg")).sort()
  : [];
const badSvgComments = [];
for (const svgFile of svgFiles) {
  const rawSvg = fs.readFileSync(path.join(assetsDir, svgFile), "utf8");
  const comments = rawSvg.match(/<!--((?!-->)[\s\S])*-->/g) || [];
  if (comments.some((c) => c.slice(4, -3).includes("--"))) {
    badSvgComments.push(svgFile);
  }
}
const r14 = spawnSync(process.execPath, [checker, assetsDir, "--strict", "--json"], { encoding: "utf8" });
const d14 = safeJson(r14.stdout);
assert(
  "14. SVG Proof Plates Well-Formedness",
  svgFiles.length >= 3 && badSvgComments.length === 0 && r14.status === 0 && d14?.passed === true,
  `SVGs: ${svgFiles.length} | badComments: ${badSvgComments.length ? badSvgComments.join(", ") : "none"} | Check Exit: ${r14.status} | FLOOR: ${d14?.floorFails} | REFLEX: ${d14?.reflexWarns}`
);

// 15. UI Animation slop fails (scale(0), ease-in, transition: all, missing reduced-motion) vs clean passes
const r15Fail = spawnSync(process.execPath, [checker, fixtures.slopAnim, "--medium=animation", "--json"], { encoding: "utf8" });
const d15Fail = safeJson(r15Fail.stdout);
const r15Pass = spawnSync(process.execPath, [checker, fixtures.cleanAnim, "--medium=animation", "--strict", "--json"], { encoding: "utf8" });
const d15Pass = safeJson(r15Pass.stdout);
const slopAnimRules = new Set((d15Fail?.findings || []).map((f) => f.rule));
assert(
  "15. UI Animation Slop vs Clean (slop-anim.html / clean-anim.html)",
  r15Fail.status === 2 &&
    slopAnimRules.has("no-scale-zero-entrance") &&
    slopAnimRules.has("no-ease-in-ui-entrance") &&
    slopAnimRules.has("no-transition-all") &&
    slopAnimRules.has("require-reduced-motion") &&
    r15Pass.status === 0 &&
    d15Pass?.passed &&
    d15Pass?.floorFails === 0 &&
    d15Pass?.reflexWarns === 0,
  `Slop Exit: ${r15Fail.status} (rules: ${[...slopAnimRules].join(", ")}) | Clean Exit: ${r15Pass.status}`
);

// 16. Launch Motion non-deterministic slop fails vs seekable clean passes
const r16Fail = spawnSync(process.execPath, [checker, fixtures.slopMotion, "--medium=motion", "--json"], { encoding: "utf8" });
const d16Fail = safeJson(r16Fail.stdout);
const r16Pass = spawnSync(process.execPath, [checker, fixtures.cleanMotion, "--medium=motion", "--strict", "--json"], { encoding: "utf8" });
const d16Pass = safeJson(r16Pass.stdout);
const slopMotionRules = new Set((d16Fail?.findings || []).map((f) => f.rule));
assert(
  "16. Launch Motion Non-Deterministic vs Seekable Clean (slop-motion.html / clean-motion.html)",
  r16Fail.status === 2 &&
    slopMotionRules.has("no-nondeterministic-video") &&
    slopMotionRules.has("no-wallclock-css-in-video") &&
    slopMotionRules.has("no-imperative-media-clock") &&
    r16Pass.status === 0 &&
    d16Pass?.passed &&
    d16Pass?.floorFails === 0 &&
    d16Pass?.reflexWarns === 0,
  `Slop Exit: ${r16Fail.status} (rules: ${[...slopMotionRules].join(", ")}) | Clean Exit: ${r16Pass.status}`
);

// 17. Security: blanket `d27-disable: all` cannot waive Tier 1 FLOOR rules & CLI blocks prototype route hits
const tmpSecDir = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-sec-"));
let r17Check, d17, r17Cli;
try {
  const secFile = path.join(tmpSecDir, "waiver-bypass.html");
  fs.writeFileSync(secFile, "/* d27-disable: all */\n<style>.btn { transition: all 200ms ease; }</style>", "utf8");
  r17Check = spawnSync(process.execPath, [checker, secFile, "--json"], { encoding: "utf8" });
  d17 = safeJson(r17Check.stdout);
  r17Cli = spawnSync(process.execPath, [cli, "constructor"], { encoding: "utf8" });
} finally {
  fs.rmSync(tmpSecDir, { recursive: true, force: true });
}
assert(
  "17. Security: Blanket `all` Waiver Blocked on FLOOR & CLI Prototype Guard",
  r17Check?.status === 2 && d17?.floorFails >= 1 && r17Cli?.status === 3,
  `FLOOR bypass exit: ${r17Check?.status} (FLOOR: ${d17?.floorFails}) | CLI constructor exit: ${r17Cli?.status}`
);

// 18. Multi-line `no-tiny-body-font` detection & comment-disarmed mascot cutout guard
const tmpCssDir = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-css-"));
let r18Body, d18Body, r18Mascot, d18Mascot;
try {
  const bodyFile = path.join(tmpCssDir, "multiline-body.css");
  fs.writeFileSync(bodyFile, "body {\n  color: #111;\n  font-size: 12px;\n}\n", "utf8");
  r18Body = spawnSync(process.execPath, [checker, bodyFile, "--json"], { encoding: "utf8" });
  d18Body = safeJson(r18Body.stdout);

  const mascotFile = path.join(tmpCssDir, "comment-cutout.html");
  fs.writeFileSync(mascotFile, "<style>/* TODO: use --m-cut */ .sil { filter: brightness(0); }</style><svg data-mascot viewBox='0 0 400 400'><g id='a'></g><g id='b'></g><g id='c'></g><g id='d'></g></svg>", "utf8");
  r18Mascot = spawnSync(process.execPath, [checker, mascotFile, "--medium=mascot", "--json"], { encoding: "utf8" });
  d18Mascot = safeJson(r18Mascot.stdout);
} finally {
  fs.rmSync(tmpCssDir, { recursive: true, force: true });
}
const rules18Body = new Set((d18Body?.findings || []).map((f) => f.rule));
const rules18Mascot = new Set((d18Mascot?.findings || []).map((f) => f.rule));
assert(
  "18. Multi-Line Body Font Floor & Comment-Immune Mascot Cutout/Group Gate",
  r18Body?.status === 2 &&
    rules18Body.has("no-tiny-body-font") &&
    r18Mascot?.status === 2 &&
    rules18Mascot.has("no-blind-silhouette-filter") &&
    rules18Mascot.has("require-svg-named-groups"),
  `Body rules: ${[...rules18Body].join(", ")} | Mascot rules: ${[...rules18Mascot].join(", ")}`
);

// 19. Balanced-paren Typst 0.13 `#set par(...)` & Markdown non-prose masking
const tmpBookDir = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-book-"));
let r19Typ, d19Typ, r19Md, d19Md;
try {
  const typFile = path.join(tmpBookDir, "double-sig.typ");
  fs.writeFileSync(typFile, "#set par(leading: 0.65em, spacing: 1.5em, first-line-indent: (amount: 1.4em, all: false))\n\nHello world.\n", "utf8");
  r19Typ = spawnSync(process.execPath, [checker, typFile, "--medium=book", "--json"], { encoding: "utf8" });
  d19Typ = safeJson(r19Typ.stdout);

  const mdFile = path.join(tmpBookDir, "masked-prose.md");
  fs.writeFileSync(mdFile, "---\ntitle: Tapestry\n---\n\nUse `delve` and `underscore` in code.\n\n> Direct historical quote mentioning tapestry and pivotal realm.\n", "utf8");
  r19Md = spawnSync(process.execPath, [checker, mdFile, "--medium=book", "--strict", "--json"], { encoding: "utf8" });
  d19Md = safeJson(r19Md.stdout);
} finally {
  fs.rmSync(tmpBookDir, { recursive: true, force: true });
}
const rules19Typ = new Set((d19Typ?.findings || []).map((f) => f.rule));
assert(
  "19. Balanced-Paren Typst 0.13 Check & Book Non-Prose Masking",
  r19Typ?.status === 2 && rules19Typ.has("no-double-signaled-paragraphs") && r19Md?.status === 0 && d19Md?.findings?.length === 0,
  `Typst exit: ${r19Typ?.status} (${[...rules19Typ].join(", ")}) | Masked MD exit: ${r19Md?.status} (findings: ${d19Md?.findings?.length})`
);

// 20. Captions `--out` + ASS escaping + gap bridging & Thumbnail title-overlap gate
const tmpCapDir = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-cap-"));
let r20Cap, assText = "", r20Thumb, d20Thumb;
try {
  const wordsFile = path.join(tmpCapDir, "words.json");
  const assFile = path.join(tmpCapDir, "out.ass");
  fs.writeFileSync(wordsFile, JSON.stringify([
    { word: "{Zero}", start: 0.0, end: 0.3 },
    { word: "Bloat", start: 0.5, end: 1.0 },
  ]), "utf8");
  r20Cap = spawnSync(process.execPath, [captions, wordsFile, "--format", "ass", "--out", assFile], { encoding: "utf8" });
  if (fs.existsSync(assFile)) assText = fs.readFileSync(assFile, "utf8");

  const overlapThumb = path.join(tmpCapDir, "overlap-thumb.html");
  fs.writeFileSync(overlapThumb, "<div id='thumbnail-canvas' data-thumbnail data-title='Node Pipeline Benchmark'><h1>Node Pipeline</h1></div>", "utf8");
  r20Thumb = spawnSync(process.execPath, [checker, overlapThumb, "--medium=thumbnail", "--strict", "--json"], { encoding: "utf8" });
  d20Thumb = safeJson(r20Thumb.stdout);
} finally {
  fs.rmSync(tmpCapDir, { recursive: true, force: true });
}
const rules20Thumb = new Set((d20Thumb?.findings || []).map((f) => f.rule));
assert(
  "20. Captions --out/ASS Escape/Gap-Bridge & Thumbnail Title-Overlap Gate",
  r20Cap?.status === 0 &&
    assText.includes("\\{Zero\\}") &&
    assText.includes("0:00:00.50") &&
    r20Thumb?.status === 2 &&
    rules20Thumb.has("thumbnail-title-overlap"),
  `Captions exit: ${r20Cap?.status} (escaped=${assText.includes("\\{Zero\\}")}) | Thumb overlap rules: ${[...rules20Thumb].join(", ")}`
);

// 21. Leap #1: In-process runCheck + incremental cache hit & edit invalidation
const tmpCacheWork = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-cache-work-"));
const tmpXdg = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-xdg-"));
const prevXdg = process.env.XDG_CACHE_HOME;
process.env.XDG_CACHE_HOME = tmpXdg;
let c1 = null, c2 = null, c3 = null;
try {
  const sample = path.join(tmpCacheWork, "sample.html");
  fs.copyFileSync(fixtures.cleanSaas, sample);
  const runInProc = async () => {
    let out = "";
    const code = await runCheck([sample, "--json"], { stdout: { write: (s) => { out += s; } }, stderr: { write: () => {} } });
    return { code, report: safeJson(out) };
  };
  c1 = await runInProc();
  c2 = await runInProc();
  fs.appendFileSync(sample, "\n<style>.bad { transition: all 200ms ease; }</style>\n", "utf8");
  c3 = await runInProc();
} finally {
  if (prevXdg === undefined) delete process.env.XDG_CACHE_HOME;
  else process.env.XDG_CACHE_HOME = prevXdg;
  fs.rmSync(tmpCacheWork, { recursive: true, force: true });
  fs.rmSync(tmpXdg, { recursive: true, force: true });
}
assert(
  "21. In-Process runCheck & Incremental Cache Hit/Invalidation",
  c1?.code === 0 && c1?.report?.meta?.cacheHits === 0 &&
    c2?.code === 0 && c2?.report?.meta?.cacheHits === 1 &&
    c3?.code === 2 && c3?.report?.meta?.cacheHits === 0 && (c3?.report?.floorFails || 0) >= 1,
  `Cold hits=${c1?.report?.meta?.cacheHits} | Warm hits=${c2?.report?.meta?.cacheHits} | Edited hits=${c3?.report?.meta?.cacheHits} (FLOOR=${c3?.report?.floorFails})`
);

// 22. Leap #2: Reverse-seek motion determinism pure-Node contract
const parsedVerify = parseVerifyArgs(["verify", "hero.html", "--beats", "0,0.6,1.2,2.4", "--width", "1920", "--height", "1080"]);
let badBeatsThrew = false;
try { parseVerifyArgs(["verify", "hero.html", "--beats", "0,NaN"]); } catch { badBeatsThrew = true; }
const detPass = evaluateDeterminismHashes({ beats: [0, 0.6, 1.2], forwardHashes: ["h0", "h1", "h2"], reverseHashes: ["h0", "h1", "h2"] });
const detDrift = evaluateDeterminismHashes({ beats: [0, 0.6, 1.2], forwardHashes: ["h0", "h1", "h2"], reverseHashes: ["h0", "DRIFT", "h2"] });
const detStatic = evaluateDeterminismHashes({ beats: [0, 0.6], forwardHashes: ["same", "same"], reverseHashes: ["same", "same"] });
assert(
  "22. Reverse-Seek Motion Determinism Harness Contract",
  parsedVerify.timestamps.length === 4 && parsedVerify.width === 1920 && badBeatsThrew &&
    detPass.pass === true && detPass.mismatches.length === 0 &&
    detDrift.pass === false && detDrift.failures.includes("motion-nondeterministic-seek") &&
    detStatic.pass === false && detStatic.allIdentical === true && detStatic.failures.includes("motion-static-seek"),
  `Pass=${detPass.pass} | Drift=${detDrift.failures.join(",")} | Static=${detStatic.failures.join(",")}`
);

// 23. Leap #3: 16x16 BFS negative-space pixel cutout verification
function makeBitmap(rects) {
  const buf = new Uint8ClampedArray(16 * 16 * 4);
  for (let i = 0; i < 256; i++) { buf[i * 4] = 255; buf[i * 4 + 1] = 255; buf[i * 4 + 2] = 255; buf[i * 4 + 3] = 255; }
  for (const { x, y, w, h, val } of rects) {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        const p = (yy * 16 + xx) * 4;
        buf[p] = val; buf[p + 1] = val; buf[p + 2] = val; buf[p + 3] = 255;
      }
    }
  }
  return buf;
}
const bmCutoutPass = analyzeCutoutBitmap(makeBitmap([{ x: 3, y: 3, w: 10, h: 10, val: 0 }, { x: 5, y: 6, w: 2, h: 1, val: 255 }, { x: 9, y: 6, w: 2, h: 1, val: 255 }]), 16, 16);
const bmSolidBlob = analyzeCutoutBitmap(makeBitmap([{ x: 3, y: 3, w: 10, h: 10, val: 0 }]), 16, 16);
const bmOpenNotch = analyzeCutoutBitmap(makeBitmap([{ x: 3, y: 0, w: 10, h: 10, val: 0 }, { x: 6, y: 0, w: 4, h: 5, val: 255 }]), 16, 16);
const bmTooTiny = analyzeCutoutBitmap(makeBitmap([{ x: 7, y: 7, w: 2, h: 2, val: 0 }]), 16, 16);
assert(
  "23. 16x16 BFS Pixel Cutout & Ink-Coverage Verification",
  bmCutoutPass.collapsed === false && bmCutoutPass.interiorCutoutPixels === 4 &&
    bmSolidBlob.collapsed === true && bmSolidBlob.interiorCutoutPixels === 0 &&
    bmOpenNotch.collapsed === true && bmOpenNotch.interiorCutoutPixels === 0 &&
    bmTooTiny.collapsed === true && bmTooTiny.inkCoverage < 0.2,
  `Pass(cutout=${bmCutoutPass.interiorCutoutPixels},cov=${bmCutoutPass.inkCoverage}) | Blob(collapsed=${bmSolidBlob.collapsed}) | Notch(cutout=${bmOpenNotch.interiorCutoutPixels}) | Tiny(cov=${bmTooTiny.inkCoverage})`
);

// 24. Research Gate: APCA 0.98G-4g-W3 polarity-aware contrast & layout-thrash transition guard
const lcDarkOnLight = computeApcaLc([17, 18, 20], [250, 248, 243]);
const lcLightOnDark = computeApcaLc([240, 242, 246], [11, 14, 20]);
const tmpThrashDir = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-thrash-"));
let r24Thrash, d24Thrash;
try {
  const thrashFile = path.join(tmpThrashDir, "thrash.css");
  fs.writeFileSync(thrashFile, ".drawer { transition: width 240ms ease-out; }\n", "utf8");
  r24Thrash = spawnSync(process.execPath, [checker, thrashFile, "--medium=animation", "--strict", "--json"], { encoding: "utf8" });
  d24Thrash = safeJson(r24Thrash.stdout);
} finally {
  fs.rmSync(tmpThrashDir, { recursive: true, force: true });
}
const rules24 = new Set((d24Thrash?.findings || []).map((f) => f.rule));
assert(
  "24. APCA 0.98G-4g-W3 Polarity Contrast & Layout-Thrash Transition Guard",
  lcDarkOnLight > 95 && lcLightOnDark < -95 && r24Thrash?.status === 2 && rules24.has("no-layout-thrash-transition"),
  `APCA(+)=${lcDarkOnLight} | APCA(-)=${lcLightOnDark} | Thrash rules: ${[...rules24].join(", ")}`
);

// 25. Research Gate: Desaire/Kobak quantitative sentence-length burstiness (CV)
const flatAiParas = [{
  startLine: 1,
  text: Array.from({ length: 12 }, () => "Modern distributed systems require careful architectural planning to handle unexpected network partitions gracefully under heavy production load.").join(" ")
}];
const humanParas = [{
  startLine: 1,
  text: "The cache held. Its clock drifted by four seconds. When three payment workers retried simultaneously behind one unindexed connection pool, checkout p99 latency climbed from 42ms to 4.8s across eighteen thousand live requests. Nothing crashed. Requests simply queued. Engineers inspected disk throughput, garbage collection pauses, and kernel socket buffers before noticing one waiting migration parked behind a seven-minute reporting query. Fix the timeout. Short lock ceilings save production traffic only when the runner backs off cleanly instead of hammering the primary node. Drop retries. Measure queues."
}];
const bFlat = computeBurstiness(flatAiParas);
const bHuman = computeBurstiness(humanParas);
assert(
  "25. Desaire/Kobak Quantitative Sentence Burstiness (CV)",
  bFlat.metronomic === true && bFlat.cv < 0.35 && bHuman.metronomic === false && bHuman.cv >= 0.45,
  `Flat AI(CV=${bFlat.cv},metronomic=${bFlat.metronomic}) | Human(CV=${bHuman.cv},metronomic=${bHuman.metronomic})`
);

// 26. Research Gate: Netflix caption timing (<833ms / 1-frame gap) & 16px partial-alpha/island collapse
const tmpNetDir = fs.mkdtempSync(path.join(os.tmpdir(), "d27-eval-net-"));
let r26Cap, d26Cap;
try {
  const wFile = path.join(tmpNetDir, "short.json");
  fs.writeFileSync(wFile, JSON.stringify([
    { word: "One", start: 0.0, end: 0.06 },
    { word: "two", start: 0.06, end: 0.12 },
    { word: "three", start: 0.12, end: 0.18 },
    { word: "four", start: 0.18, end: 0.24 },
    { word: "five", start: 0.24, end: 0.30 },
    { word: "six", start: 0.30, end: 0.36 },
    { word: "seven", start: 0.36, end: 0.42 },
    { word: "eight", start: 0.42, end: 0.50 },
    { word: "Flash", start: 0.52, end: 1.50 },
  ]), "utf8");
  r26Cap = spawnSync(process.execPath, [captions, wFile, "--fps", "30", "--aspect", "16:9", "--validate"], { encoding: "utf8" });
  d26Cap = safeJson(r26Cap.stdout);
} finally {
  fs.rmSync(tmpNetDir, { recursive: true, force: true });
}
// Construct 16x16 blurry partial-alpha bitmap (alpha=128 everywhere on ink)
const blurryBuf = new Uint8ClampedArray(16 * 16 * 4);
for (let i = 0; i < 256; i++) { blurryBuf[i * 4] = 0; blurryBuf[i * 4 + 1] = 0; blurryBuf[i * 4 + 2] = 0; blurryBuf[i * 4 + 3] = 128; }
const bmBlurry = analyzeCutoutBitmap(blurryBuf, 16, 16);
const hasMinDurWarn = (d26Cap?.warnings || []).some((w) => w.includes("833ms"));
const hasGapWarn = (d26Cap?.warnings || []).some((w) => w.includes("< 2 frames"));
assert(
  "26. Netflix Caption Timing (833ms/2-Frame Gap) & 16px Partial-Alpha Blur Gate",
  r26Cap?.status === 2 && hasMinDurWarn && hasGapWarn && bmBlurry.collapsed === true && bmBlurry.partialAlphaRatio > 0.8,
  `Netflix warns=${d26Cap?.warnings?.length} (833ms=${hasMinDurWarn},2fGap=${hasGapWarn}) | Blurry(partialAlpha=${bmBlurry.partialAlphaRatio},collapsed=${bmBlurry.collapsed})`
);

console.log(`\nSummary: ${26 - failed}/26 passed`);
process.exit(failed === 0 ? 0 : 1);
