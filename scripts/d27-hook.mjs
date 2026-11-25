#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Zero-Dependency Two-Tier Edit-Time Agent Hook (Zero Network Calls, In-Process Check)
 * Usage:
 *   echo '{"tool_input":{"file_path":"index.html"}}' | node scripts/d27-hook.mjs --event=post-edit
 *   echo '{}' | node scripts/d27-hook.mjs --event=stop
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

import { VERSION } from "./lib/version.mjs";
// Findings quote page text (selectors, error messages) into the agent's context: one line each, clipped.
const clip = (v, n) => String(v ?? "").replace(/[\r\n\u2028\u2029]+/g, " ").slice(0, n);
const formatFinding = (f) => `[${clip(f.tier, 8)}] ${clip(f.file, 160)}:${Number(f.line) || 1} (${clip(f.rule, 48)}): ${clip(f.message, 240)} Fix: ${clip(f.fix, 240)}`;
const WATCH_EXTS = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".svg", ".js", ".ts", ".typ", ".md"]);

function resolvePrivateLedgerPath() {
  const repoHash = crypto.createHash("sha256").update(process.cwd()).digest("hex").slice(0, 12);
  const baseDir =
    process.env.XDG_RUNTIME_DIR ||
    process.env.XDG_CACHE_HOME ||
    path.join(os.homedir(), ".cache");
  const candidates = [
    path.join(baseDir, "design-27"),
    path.join(os.tmpdir(), `design-27-${typeof process.getuid === "function" ? process.getuid() : "user"}`),
  ];
  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) {
        const st = fs.lstatSync(dir);
        if (st.isSymbolicLink() || !st.isDirectory()) continue;
        if (typeof process.getuid === "function" && st.uid !== process.getuid()) continue;
      } else {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      }
      return path.join(dir, `session-ledger-${repoHash}.json`);
    } catch {
      continue;
    }
  }
  return null;
}

async function runCheckInProcess(args) {
  let stdout = "";
  const io = {
    stdout: { write: (s) => { stdout += String(s); } },
    stderr: { write: () => {} },
  };
  const { runCheck } = await import("./d27-check.mjs");
  await runCheck(args, io);
  try {
    return stdout ? JSON.parse(stdout) : { findings: [] };
  } catch {
    return { findings: [] };
  }
}

export async function runHook(argv = []) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(`Design 27 Hook v${VERSION}\nUsage: node scripts/d27-hook.mjs --event=<post-edit|stop>`);
    return 0;
  }

  const ledgerPath = resolvePrivateLedgerPath();
  const eventArg = argv.find((a) => a.startsWith("--event="))?.split("=")[1] || "post-edit";

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

  const loadLedger = () => {
    if (!ledgerPath || !fs.existsSync(ledgerPath)) return { files: [], seen: [] };
    try {
      const st = fs.lstatSync(ledgerPath);
      if (st.isSymbolicLink() || !st.isFile()) return { files: [], seen: [] };
      return JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
    } catch {
      return { files: [], seen: [] };
    }
  };

  const saveLedger = (data) => {
    if (!ledgerPath) return;
    try {
      const tmpFile = `${ledgerPath}.${process.pid}.${Date.now()}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), { mode: 0o600, flag: "wx" });
      fs.renameSync(tmpFile, ledgerPath);
    } catch { /* non-fatal */ }
  };

  if (eventArg === "post-edit") {
    const filePath = payload?.tool_input?.file_path || payload?.file_path || payload?.path;
    if (typeof filePath !== "string" || !filePath || !WATCH_EXTS.has(path.extname(filePath).toLowerCase()) || !fs.existsSync(filePath)) {
      return 0;
    }
    let abs;
    try {
      abs = fs.realpathSync(filePath);
    } catch {
      return 0;
    }
    if (!WATCH_EXTS.has(path.extname(abs).toLowerCase())) return 0;

    const parsed = await runCheckInProcess(["--tier=fast", "--json", "--no-cache", "--", abs]);
    const ledger = loadLedger();
    if (!ledger.files.includes(abs)) ledger.files.push(abs);
    for (const f of parsed.findings || []) {
      const fp = `${f.file}:${f.line}:${f.rule}`;
      if (!ledger.seen.includes(fp)) ledger.seen.push(fp);
    }
    saveLedger(ledger);

    if ((parsed.findings || []).length > 0) {
      const lines = parsed.findings.slice(0, 40).map(formatFinding);
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: `Design 27 v${VERSION} fast check found ${parsed.findings.length} issue(s):\n${lines.join("\n")}`,
        },
      }));
    }
    return 0;
  }

  if (eventArg === "stop") {
    const ledger = loadLedger();
    const seenSet = new Set(ledger.seen || []);
    const freshFindings = [];
    for (const abs of ledger.files || []) {
      if (typeof abs !== "string" || !WATCH_EXTS.has(path.extname(abs).toLowerCase()) || !fs.existsSync(abs)) continue;
      const parsed = await runCheckInProcess(["--tier=deep", "--json", "--", abs]);
      for (const f of parsed.findings || []) {
        const fp = `${f.file}:${f.line}:${f.rule}`;
        if (!seenSet.has(fp)) freshFindings.push(f);
      }
    }
    saveLedger({ files: [], seen: [] });

    if (freshFindings.length > 0) {
      const lines = freshFindings.slice(0, 40).map(formatFinding);
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "Stop",
          additionalContext: `Design 27 v${VERSION} deep session audit found ${freshFindings.length} remaining issue(s):\n${lines.join("\n")}`,
        },
      }));
    }
    return 0;
  }

  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await runHook(process.argv.slice(2));
}
