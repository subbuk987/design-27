#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Zero-Dependency Two-Tier Edit-Time Agent Hook (Zero Network Calls)
 * Usage:
 *   echo '{"tool_input":{"file_path":"index.html"}}' | node scripts/d27-hook.mjs --event=post-edit
 *   echo '{}' | node scripts/d27-hook.mjs --event=stop
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const VERSION = "4.0.0";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const checker = path.join(__dirname, "d27-check.mjs");
const ledgerPath = path.join(os.tmpdir(), "design-27", "session-ledger.json");
const WATCH_EXTS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".svg", ".js", ".ts", ".typ"]);

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`Design 27 Hook v${VERSION}\nUsage: node scripts/d27-hook.mjs --event=<post-edit|stop>`);
  process.exit(0);
}

const eventArg = process.argv.slice(2).find((a) => a.startsWith("--event="))?.split("=")[1] || "post-edit";

let stdinData = "";
try {
  stdinData = fs.readFileSync(0, "utf8").trim();
} catch {
  stdinData = "";
}

let payload = {};
if (stdinData) {
  try { payload = JSON.parse(stdinData); } catch { payload = {}; }
}

function loadLedger() {
  if (!fs.existsSync(ledgerPath)) return { files: [], seen: [] };
  try { return JSON.parse(fs.readFileSync(ledgerPath, "utf8")); } catch { return { files: [], seen: [] }; }
}
function saveLedger(data) {
  try {
    fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
    fs.writeFileSync(ledgerPath, JSON.stringify(data, null, 2));
  } catch { /* non-fatal */ }
}

if (eventArg === "post-edit") {
  const filePath = payload?.tool_input?.file_path || payload?.file_path || payload?.path;
  if (!filePath || !WATCH_EXTS.has(path.extname(filePath).toLowerCase()) || !fs.existsSync(filePath)) {
    process.exit(0);
  }
  const abs = path.resolve(filePath);
  const res = spawnSync(process.execPath, [checker, abs, "--tier=fast", "--json"], { encoding: "utf8" });
  let parsed = { findings: [] };
  try { parsed = res.stdout ? JSON.parse(res.stdout) : { findings: [] }; } catch { parsed = { findings: [] }; }
  const ledger = loadLedger();
  if (!ledger.files.includes(abs)) ledger.files.push(abs);
  for (const f of parsed.findings || []) {
    const fp = `${f.file}:${f.line}:${f.rule}`;
    if (!ledger.seen.includes(fp)) ledger.seen.push(fp);
  }
  saveLedger(ledger);

  if ((parsed.findings || []).length > 0) {
    const lines = parsed.findings.map((f) => `[${f.tier}] ${f.file}:${f.line} (${f.rule}): ${f.message} Fix: ${f.fix}`);
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `Design 27 v${VERSION} fast check found ${parsed.findings.length} issue(s):\n${lines.join("\n")}`,
      },
    }));
  }
  process.exit(0);
}

if (eventArg === "stop") {
  const ledger = loadLedger();
  const seenSet = new Set(ledger.seen || []);
  const freshFindings = [];
  for (const abs of ledger.files || []) {
    if (!fs.existsSync(abs)) continue;
    const res = spawnSync(process.execPath, [checker, abs, "--tier=deep", "--json"], { encoding: "utf8" });
    if (!res.stdout) continue;
    let parsed;
    try { parsed = JSON.parse(res.stdout); } catch { continue; }
    for (const f of parsed.findings || []) {
      const fp = `${f.file}:${f.line}:${f.rule}`;
      if (!seenSet.has(fp)) freshFindings.push(f);
    }
  }
  saveLedger({ files: [], seen: [] });

  if (freshFindings.length > 0) {
    const lines = freshFindings.map((f) => `[${f.tier}] ${f.file}:${f.line} (${f.rule}): ${f.message} Fix: ${f.fix}`);
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "Stop",
        additionalContext: `Design 27 v${VERSION} deep session audit found ${freshFindings.length} remaining issue(s):\n${lines.join("\n")}`,
      },
    }));
  }
  process.exit(0);
}
