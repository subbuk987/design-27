#!/usr/bin/env node
/**
 * Design 27 v3.0.0 — Zero-Dependency Beat-Boundary Contact-Sheet Extractor & sweep_static Auditor
 * Usage:
 *   node scripts/d27-frames.mjs sheet <video.mp4> --beats 0,1.2,2.5,4.0 --out contact-sheet.png
 *   node scripts/d27-frames.mjs audit <video.mp4> [--max-static 3.0] [--allow-black]
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [subcmd, videoArg, ...rest] = process.argv.slice(2);
const getFlag = (flag, fallback) => {
  const i = rest.indexOf(flag);
  return i !== -1 && rest[i + 1] ? rest[i + 1] : fallback;
};

if (!subcmd || !videoArg || !["sheet", "audit"].includes(subcmd)) {
  console.error("Usage:\n  node scripts/d27-frames.mjs sheet <video.mp4> --beats 0,1.2,2.5 --out sheet.png\n  node scripts/d27-frames.mjs audit <video.mp4> [--max-static 3.0]");
  process.exit(1);
}

const videoPath = path.resolve(videoArg);
if (!fs.existsSync(videoPath)) {
  console.error(`Video not found: ${videoPath}`);
  process.exit(1);
}

if (subcmd === "sheet") {
  const beatsRaw = getFlag("--beats", "0,1.5,3.0");
  const outPath = path.resolve(getFlag("--out", "contact-sheet.png"));
  const beats = beatsRaw.split(",").map(Number).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);

  // Sample frame 0 + each beat boundary (+0.05s) + scene midpoint
  const timestamps = new Set([0]);
  for (let i = 0; i < beats.length; i++) {
    timestamps.add(Number((beats[i] + 0.05).toFixed(2)));
    if (i + 1 < beats.length) {
      timestamps.add(Number(((beats[i] + beats[i + 1]) / 2).toFixed(2)));
    }
  }
  const sorted = [...timestamps].sort((a, b) => a - b);
  const cols = Math.min(4, sorted.length);
  const rows = Math.ceil(sorted.length / cols);
  const selectExpr = sorted.map((t) => `lt(abs(t-${t}),0.04)`).join("+");

  const vf = `select='${selectExpr}',setpts=N/FRAME_RATE/TB,scale=640:-1,tile=${cols}x${rows}`;
  const res = spawnSync("ffmpeg", ["-y", "-i", videoPath, "-vf", vf, "-frames:v", "1", outPath], { encoding: "utf8" });
  if (res.error || res.status !== 0) {
    console.error("ffmpeg sheet extraction failed:", res.stderr || res.error?.message);
    process.exit(1);
  }
  console.log(JSON.stringify({ tool: "d27-frames", mode: "sheet", timestamps: sorted, out: outPath, ok: true }, null, 2));
  process.exit(0);
}

if (subcmd === "audit") {
  const maxStatic = Number(getFlag("--max-static", "3.0"));
  const allowBlack = rest.includes("--allow-black");
  const res = spawnSync("ffmpeg", ["-i", videoPath, "-vf", "fps=4,signalstats,metadata=print:file=-", "-f", "null", "-"], { encoding: "utf8" });
  if (res.error) {
    console.error("ffmpeg unavailable for audit:", res.error.message);
    process.exit(1);
  }

  const lines = (res.stdout + "\n" + res.stderr).split(/\r?\n/);
  const samples = [];
  let cur = {};
  for (const line of lines) {
    const ydif = line.match(/lavfi\.signalstats\.YDIF=([0-9.]+)/);
    const yavg = line.match(/lavfi\.signalstats\.YAVG=([0-9.]+)/);
    if (ydif) cur.ydif = parseFloat(ydif[1]);
    if (yavg) cur.yavg = parseFloat(yavg[1]);
    if (cur.ydif !== undefined && cur.yavg !== undefined) {
      samples.push(cur);
      cur = {};
    }
  }

  let staticRun = 0, maxStaticSec = 0, blackRun = 0, maxBlackSec = 0;
  for (const s of samples) {
    if (s.ydif < 0.15) { staticRun += 0.25; maxStaticSec = Math.max(maxStaticSec, staticRun); } else staticRun = 0;
    if (s.yavg < 16.5 || s.yavg > 238) { blackRun += 0.25; maxBlackSec = Math.max(maxBlackSec, blackRun); } else blackRun = 0;
  }

  const staticFail = maxStaticSec >= maxStatic;
  const blankFail = !allowBlack && maxBlackSec > 0.5;
  const pass = !staticFail && !blankFail;
  console.log(JSON.stringify({ tool: "d27-frames", mode: "audit", samples: samples.length, maxStaticSec, maxBlackSec, pass }, null, 2));
  process.exit(pass ? 0 : 2);
}
