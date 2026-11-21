#!/usr/bin/env node
/**
 * Design 27 — Reproducible Eval Runner
 * Executes scripts/d27-check.mjs against baseline slop vs. Design 27 fixtures.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const checker = path.join(root, "scripts", "d27-check.mjs");

const cases = [
  { name: "Stock AI Baseline (slop-saas.html)", file: path.join(__dirname, "fixtures", "slop-saas.html"), expectPass: false },
  { name: "Design 27 Output (design27-saas.html)", file: path.join(__dirname, "fixtures", "design27-saas.html"), expectPass: true },
];

console.log("Design 27 — Reproducible Floor Eval Benchmark\n");
let allMatched = true;

for (const c of cases) {
  const res = spawnSync(process.execPath, [checker, c.file, "--json"], { encoding: "utf8" });
  const data = JSON.parse(res.stdout);
  const ok = data.passed === c.expectPass;
  if (!ok) allMatched = false;
  console.log(`${ok ? "PASS" : "FAIL"} | ${c.name}`);
  console.log(`     Exit: ${res.status} | FLOOR fails: ${data.floorFails} | REFLEX warns: ${data.reflexWarns}`);
}

process.exit(allMatched ? 0 : 1);
