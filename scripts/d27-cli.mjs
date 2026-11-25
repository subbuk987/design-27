#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Unified Zero-Dependency CLI Dispatcher
 * Usage: node scripts/d27-cli.mjs <check|deal|captions|frames|hook|doctor|eval> [args...]
 */
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const VERSION = "4.0.0";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const [cmd, ...rest] = process.argv.slice(2);

const ROUTES = {
  check: path.join(__dirname, "d27-check.mjs"),
  deal: path.join(__dirname, "d27-deal.mjs"),
  captions: path.join(__dirname, "d27-captions.mjs"),
  frames: path.join(__dirname, "d27-frames.mjs"),
  hook: path.join(__dirname, "d27-hook.mjs"),
  eval: path.join(root, "evals", "run-eval.mjs"),
};

if (!cmd || cmd === "--help" || cmd === "-h") {
  console.log(`Design 27 CLI v${VERSION} (Zero Dependencies)\n`);
  console.log("Commands:");
  console.log("  check <path> [flags]      Run static/SARIF/GitHub/ffprobe/Chrome-CDP/Playwright checks");
  console.log("  doctor                    Verify Node, ffprobe, ffmpeg, Playwright & Chrome CDP capabilities");
  console.log("  deal --prompt \"...\"       Deal Material World, Macrostructure & Signature Contract brief");
  console.log("  captions <words.json>     Chunk timestamps to JSON, SRT, or styled ASS burn-in");
  console.log("  frames <sheet|audit>      Extract video or HTML timeline beat-boundary frames & sweep_static audit");
  console.log("  hook --event=post-edit    Run zero-network two-tier edit-time agent hook");
  console.log("  eval                      Run reproducible Floor & SARIF contract test suite");
  process.exit(0);
}

if (cmd === "doctor") {
  const res = spawnSync(process.execPath, [ROUTES.check, "--doctor", ...rest], { stdio: "inherit" });
  process.exit(res.status ?? 0);
}

const targetScript = ROUTES[cmd];
if (!targetScript) {
  console.error(`Unknown Design 27 command: ${cmd}. Run with --help for available commands.`);
  process.exit(3);
}

const res = spawnSync(process.execPath, [targetScript, ...rest], { stdio: "inherit" });
process.exit(res.status ?? 0);
