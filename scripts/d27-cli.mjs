#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Unified Zero-Dependency CLI Dispatcher (In-Process ESM Dispatch)
 * Usage: node scripts/d27-cli.mjs <check|deal|captions|frames|hook|doctor|eval> [args...]
 */
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const VERSION = "4.0.0";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const [cmd, ...rest] = process.argv.slice(2);

const SPAWN_ROUTES = Object.freeze({
  deal: path.join(__dirname, "d27-deal.mjs"),
  captions: path.join(__dirname, "d27-captions.mjs"),
  eval: path.join(root, "evals", "run-eval.mjs"),
});

if (!cmd || cmd === "--help" || cmd === "-h") {
  console.log(`Design 27 CLI v${VERSION} (Zero Dependencies)\n`);
  console.log("Commands:");
  console.log("  check <path> [flags]           Run static/SARIF/GitHub/ffprobe/Chrome-CDP/Playwright checks");
  console.log("  doctor                         Verify Node, ffprobe, ffmpeg, Playwright & Chrome CDP capabilities");
  console.log("  deal --prompt \"...\"            Deal Material World, Macrostructure & Signature Contract brief");
  console.log("  captions <words.json>          Chunk timestamps to JSON, SRT, or styled ASS burn-in");
  console.log("  frames <sheet|verify|audit>    Extract frames, verify reverse-seek determinism, or audit video");
  console.log("  hook --event=post-edit         Run zero-network two-tier edit-time agent hook (in-process)");
  console.log("  eval                           Run reproducible Security, 6-Pillar & SARIF contract test suite");
  process.exit(0);
}

// Fast in-process ESM dispatch (0ms V8 fork overhead)
if (cmd === "check") {
  const { runCheck } = await import("./d27-check.mjs");
  process.exitCode = await runCheck(rest);
} else if (cmd === "doctor") {
  const { runCheck } = await import("./d27-check.mjs");
  process.exitCode = await runCheck(["--doctor", ...rest]);
} else if (cmd === "hook") {
  const { runHook } = await import("./d27-hook.mjs");
  process.exitCode = await runHook(rest);
} else if (cmd === "frames") {
  const { runFrames } = await import("./d27-frames.mjs");
  process.exitCode = await runFrames(rest);
} else if (Object.hasOwn(SPAWN_ROUTES, cmd)) {
  const res = spawnSync(process.execPath, [SPAWN_ROUTES[cmd], ...rest], { stdio: "inherit" });
  process.exitCode = res.status ?? 0;
} else {
  console.error(`Unknown Design 27 command: ${cmd}. Run with --help for available commands.`);
  process.exitCode = 3;
}
