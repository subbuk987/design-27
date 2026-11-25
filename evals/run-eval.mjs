#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — 14-Assertion Deterministic Contract, Pillar & Scope-Hygiene Eval Suite
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const checker = path.join(root, "scripts", "d27-check.mjs");
const dealer = path.join(root, "scripts", "d27-deal.mjs");
const hook = path.join(root, "scripts", "d27-hook.mjs");

const fixtures = {
  slopSaas: path.join(__dirname, "fixtures", "slop-saas.html"),
  cleanSaas: path.join(__dirname, "fixtures", "design27-saas.html"),
  slopBook: path.join(__dirname, "fixtures", "slop-book.md"),
  cleanBook: path.join(__dirname, "fixtures", "clean-book.md"),
  slopMascot: path.join(__dirname, "fixtures", "slop-mascot.html"),
  cleanMascot: path.join(__dirname, "fixtures", "clean-mascot.html"),
  slopThumb: path.join(__dirname, "fixtures", "slop-thumb.html"),
  cleanThumb: path.join(__dirname, "fixtures", "clean-thumb.html"),
};

console.log("Design 27 v4.0.0 — Reproducible 14-Assertion Contract & Eval Suite\n");
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

console.log(`\nSummary: ${14 - failed}/14 passed`);
process.exit(failed === 0 ? 0 : 1);
