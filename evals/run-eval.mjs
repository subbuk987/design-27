#!/usr/bin/env node
/**
 * Design 27 v3.0.0 — Reproducible Floor, SARIF 2.1.0, Doctor & Hook Contract Eval Suite
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const checker = path.join(root, "scripts", "d27-check.mjs");
const hook = path.join(root, "scripts", "d27-hook.mjs");
const slopFile = path.join(__dirname, "fixtures", "slop-saas.html");
const cleanFile = path.join(__dirname, "fixtures", "design27-saas.html");

console.log("Design 27 v3.0.0 — Reproducible Contract & Eval Suite\n");
let failed = 0;

function assert(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"} | ${name}`);
  if (detail) console.log(`     ${detail}`);
  if (!ok) failed += 1;
}

// 1. Stock AI baseline fails with exit 2
const r1 = spawnSync(process.execPath, [checker, slopFile, "--json"], { encoding: "utf8" });
const d1 = JSON.parse(r1.stdout);
assert("1. Stock AI Baseline (slop-saas.html)", r1.status === 2 && !d1.passed && d1.floorFails >= 5, `Exit: ${r1.status} | FLOOR: ${d1.floorFails} | REFLEX: ${d1.reflexWarns}`);

// 2. Design 27 fixture passes with exit 0
const r2 = spawnSync(process.execPath, [checker, cleanFile, "--json"], { encoding: "utf8" });
const d2 = JSON.parse(r2.stdout);
assert("2. Design 27 Reference (design27-saas.html)", r2.status === 0 && d2.passed && d2.floorFails === 0, `Exit: ${r2.status} | FLOOR: ${d2.floorFails} | REFLEX: ${d2.reflexWarns}`);

// 3. SARIF 2.1.0 schema contract + fatal executionSuccessful: false
const r3 = spawnSync(process.execPath, [checker, slopFile, "--sarif"], { encoding: "utf8" });
const s3 = JSON.parse(r3.stdout);
const r3Bad = spawnSync(process.execPath, [checker, "/nonexistent-d27-path", "--sarif"], { encoding: "utf8" });
const s3Bad = JSON.parse(r3Bad.stdout);
assert(
  "3. SARIF 2.1.0 Schema & Fatal Contract",
  s3.version === "2.1.0" && s3.runs[0].results.length > 0 && r3Bad.status === 1 && s3Bad.runs[0].invocations[0].executionSuccessful === false,
  `SARIF v${s3.version} | results: ${s3.runs[0].results.length} | missing-target executionSuccessful: ${s3Bad.runs[0].invocations[0].executionSuccessful}`
);

// 4. --doctor preflight always exits 0 with capabilities
const r4 = spawnSync(process.execPath, [checker, "--doctor"], { encoding: "utf8" });
const d4 = JSON.parse(r4.stdout);
assert("4. --doctor Preflight Contract", r4.status === 0 && d4.ok === true && Array.isArray(d4.capabilities), `Capabilities: ${d4.capabilities.join(", ")}`);

// 5. Two-tier edit-time hook emits PostToolUse feedback on slop file
const r5 = spawnSync(process.execPath, [hook, "--event=post-edit"], {
  input: JSON.stringify({ tool_input: { file_path: slopFile } }),
  encoding: "utf8",
});
const d5 = r5.stdout ? JSON.parse(r5.stdout) : {};
assert(
  "5. Zero-Network Edit-Time Hook (PostToolUse)",
  r5.status === 0 && Boolean(d5?.hookSpecificOutput?.additionalContext),
  `Event: ${d5?.hookSpecificOutput?.hookEventName || "none"}`
);

process.exit(failed === 0 ? 0 : 1);
