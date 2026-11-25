#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Zero-Dependency Beat-Boundary Contact-Sheet, Reverse-Seek Determinism & sweep_static Auditor
 * Supports both video (.mp4/.mov/.webm via ffmpeg) and seekable HTML motion (.html/.htm via Chrome CDP).
 * Usage:
 *   node scripts/d27-frames.mjs sheet <video.mp4|motion.html> --beats 0,1.2,2.5,4.2 [--out sheet.png|frames-dir] [--width 1280] [--height 720]
 *   node scripts/d27-frames.mjs verify <motion.html> --beats 0,0.6,1.2,2.4 [--width 1280] [--height 720] [--unsafe-no-sandbox]
 *   node scripts/d27-frames.mjs audit <video.mp4> [--max-static 3.0] [--allow-black]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { captureHtmlFramesWithCdp, verifyHtmlDeterminismWithCdp } from "./lib/chrome-cdp.mjs";

import { VERSION } from "./lib/version.mjs";

export function parseVerifyArgs(argv) {
  const args = argv[0] === "verify" ? argv.slice(1) : argv;
  let htmlFile = null;
  let beatsRaw = "0,1.2,2.4";
  let width = 1280;
  let height = 720;
  let timeoutMs = 15000;
  let unsafeNoSandbox = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--beats=")) beatsRaw = a.slice(8);
    else if (a === "--beats") beatsRaw = args[++i];
    else if (a.startsWith("--width=")) width = Number(a.slice(8));
    else if (a === "--width") width = Number(args[++i]);
    else if (a.startsWith("--height=")) height = Number(a.slice(9));
    else if (a === "--height") height = Number(args[++i]);
    else if (a.startsWith("--timeout=")) timeoutMs = Number(a.slice(10));
    else if (a === "--timeout") timeoutMs = Number(args[++i]);
    else if (a === "--unsafe-no-sandbox") unsafeNoSandbox = true;
    else if (!a.startsWith("-") && !htmlFile) htmlFile = a;
  }

  if (!htmlFile) throw new Error("Usage: d27-frames.mjs verify <motion.html> --beats 0,0.6,1.2,2.4");
  const timestamps = String(beatsRaw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  if (timestamps.length === 0 || timestamps.some((n) => !Number.isFinite(n) || n < 0)) {
    throw new Error("--beats must be comma-separated non-negative numbers.");
  }
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new Error("--width and --height must be positive integers.");
  }
  return { htmlFile, timestamps, width, height, timeoutMs, unsafeNoSandbox };
}

export async function runFrames(argv) {
  const [subcmd, inputArg, ...rest] = argv;
  const getFlag = (flag, fallback) => {
    const eq = rest.find((a) => a.startsWith(`${flag}=`));
    if (eq) return eq.slice(flag.length + 1);
    const i = rest.indexOf(flag);
    return i !== -1 && rest[i + 1] ? rest[i + 1] : fallback;
  };

  if (!subcmd || subcmd === "--help" || subcmd === "-h" || !inputArg || !["sheet", "verify", "audit"].includes(subcmd)) {
    console.error(
      `Design 27 Frames v${VERSION}\nUsage:\n` +
      `  node scripts/d27-frames.mjs sheet <video.mp4|motion.html> --beats 0,1.2,2.5,4.2 --out sheet.png|frames-dir\n` +
      `  node scripts/d27-frames.mjs verify <motion.html> --beats 0,0.6,1.2,2.4 [--width 1280] [--height 720]\n` +
      `  node scripts/d27-frames.mjs audit <video.mp4> [--max-static 3.0] [--allow-black]`
    );
    return subcmd === "--help" || subcmd === "-h" ? 0 : 1;
  }

  if (subcmd === "verify") {
    try {
      const opts = parseVerifyArgs(argv);
      const resolved = path.resolve(opts.htmlFile);
      if (!fs.existsSync(resolved)) {
        console.error(`Input not found: ${resolved}`);
        return 1;
      }
      const res = await verifyHtmlDeterminismWithCdp({ ...opts, htmlFile: resolved });
      console.log(JSON.stringify({ tool: "d27-frames", version: VERSION, mode: "verify", ...res }, null, 2));
      return res.pass ? 0 : 2;
    } catch (err) {
      console.error("Reverse-seek determinism verify failed:", err.message);
      return 1;
    }
  }

  const inputPath = path.resolve(inputArg);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`);
    return 1;
  }

  const ext = path.extname(inputPath).toLowerCase();
  const isHtml = ext === ".html" || ext === ".htm";

  if (subcmd === "sheet") {
    const beatsRaw = getFlag("--beats", "0,1.5,3.0");
    const beats = [...new Set(beatsRaw.split(",").map(Number).filter((n) => !Number.isNaN(n)))].sort((a, b) => a - b);
    if (beats.length === 0) beats.push(0);

    if (isHtml) {
      const outArg = getFlag("--out", path.join(os.tmpdir(), `d27-frames-${Date.now()}`));
      const outPath = path.resolve(outArg);
      const wantsPngSheet = outPath.toLowerCase().endsWith(".png");
      const width = Number(getFlag("--width", "1280"));
      const height = Number(getFlag("--height", "720"));
      const ffmpegAvailable = !spawnSync("ffmpeg", ["-version"], { encoding: "utf8" }).error;
      const framesDir = wantsPngSheet
        ? fs.mkdtempSync(path.join(os.tmpdir(), "d27-html-frames-"))
        : outPath;

      try {
        const { frames } = await captureHtmlFramesWithCdp({
          htmlFile: inputPath,
          timestamps: beats,
          width,
          height,
          outDir: framesDir,
        });

        if (wantsPngSheet && ffmpegAvailable) {
          const cols = Math.min(4, frames.length);
          const rows = Math.ceil(frames.length / cols);
          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          const ffRes = spawnSync(
            "ffmpeg",
            [
              "-y",
              "-framerate", "1",
              "-i", path.join(framesDir, "frame-%03d.png"),
              "-vf", `scale=640:-1,tile=${cols}x${rows}`,
              "-frames:v", "1",
              outPath,
            ],
            { encoding: "utf8" }
          );
          if (!ffRes.error && ffRes.status === 0) {
            fs.rmSync(framesDir, { recursive: true, force: true });
            console.log(JSON.stringify({ tool: "d27-frames", version: VERSION, mode: "sheet", engine: "chrome-cdp+ffmpeg", timestamps: beats, out: outPath, ok: true }, null, 2));
            return 0;
          }
        }

        if (wantsPngSheet && !ffmpegAvailable) {
          const fallbackDir = outPath.replace(/\.png$/i, "-frames");
          fs.mkdirSync(fallbackDir, { recursive: true });
          const finalFrames = frames.map((f) => {
            const dest = path.join(fallbackDir, path.basename(f.path));
            fs.copyFileSync(f.path, dest);
            return { ...f, path: dest };
          });
          fs.rmSync(framesDir, { recursive: true, force: true });
          console.log(JSON.stringify({ tool: "d27-frames", version: VERSION, mode: "sheet", engine: "chrome-cdp", note: "ffmpeg not installed; wrote individual beat PNG frames.", timestamps: beats, outDir: fallbackDir, frames: finalFrames, ok: true }, null, 2));
          return 0;
        }

        console.log(JSON.stringify({ tool: "d27-frames", version: VERSION, mode: "sheet", engine: "chrome-cdp", timestamps: beats, outDir: framesDir, frames, ok: true }, null, 2));
        return 0;
      } catch (err) {
        if (wantsPngSheet && fs.existsSync(framesDir)) {
          fs.rmSync(framesDir, { recursive: true, force: true });
        }
        console.error("Chrome CDP sheet extraction failed:", err.message);
        return 1;
      }
    }

    const outPath = path.resolve(getFlag("--out", "contact-sheet.png"));
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
    let fps = 30;
    const fpRes = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "default=nw=1:nk=1", inputPath], { encoding: "utf8" });
    if (!fpRes.error && fpRes.status === 0 && fpRes.stdout) {
      const [num, den] = fpRes.stdout.trim().split("/").map(Number);
      if (num > 0 && den > 0) fps = num / den;
    }
    const frameIndices = [...new Set(sorted.map((t) => Math.max(0, Math.round(t * fps))))].sort((a, b) => a - b);
    const selectExpr = frameIndices.map((n) => `eq(n,${n})`).join("+");

    const vf = `select='${selectExpr}',setpts=N/FRAME_RATE/TB,scale=640:-1,tile=${cols}x${rows}`;
    const res = spawnSync("ffmpeg", ["-y", "-i", inputPath, "-vf", vf, "-frames:v", "1", outPath], { encoding: "utf8" });
    if (res.error || res.status !== 0) {
      console.error("ffmpeg sheet extraction failed:", res.stderr || res.error?.message);
      return 1;
    }
    console.log(JSON.stringify({ tool: "d27-frames", version: VERSION, mode: "sheet", engine: "ffmpeg", timestamps: sorted, out: outPath, ok: true }, null, 2));
    return 0;
  }

  if (subcmd === "audit") {
    if (isHtml) {
      console.error("`audit` mode requires a rendered video file (.mp4/.mov/.webm). Use `sheet` or `verify` on HTML motion timelines.");
      return 1;
    }
    const maxStatic = Number(getFlag("--max-static", "3.0"));
    const allowBlack = rest.includes("--allow-black");
    const res = spawnSync("ffmpeg", ["-i", inputPath, "-vf", "fps=4,signalstats,metadata=print:file=-", "-f", "null", "-"], { encoding: "utf8" });
    if (res.error) {
      console.error("ffmpeg unavailable for audit:", res.error.message);
      return 1;
    }

    const lines = (res.stdout + "\n" + res.stderr).split(/\r?\n/);
    const samples = [];
    let cur = {};
    for (const line of lines) {
      const ydif = line.match(/lavfi\.signalstats\.YDIF=([0-9.]+)/);
      const ylow = line.match(/lavfi\.signalstats\.YLOW=([0-9.]+)/);
      const yhigh = line.match(/lavfi\.signalstats\.YHIGH=([0-9.]+)/);
      if (ydif) cur.ydif = parseFloat(ydif[1]);
      if (ylow) cur.ylow = parseFloat(ylow[1]);
      if (yhigh) cur.yhigh = parseFloat(yhigh[1]);
      if (cur.ydif !== undefined && cur.ylow !== undefined && cur.yhigh !== undefined) {
        samples.push(cur);
        cur = {};
      }
    }

    const lockupCutoff = Math.floor(samples.length * 0.75);
    let staticRun = 0, maxStaticSec = 0, blankRun = 0, maxBlankSec = 0;
    samples.forEach((s, idx) => {
      if (idx < lockupCutoff) {
        if (s.ydif < 0.15) { staticRun += 0.25; maxStaticSec = Math.max(maxStaticSec, staticRun); } else staticRun = 0;
      }
      if (s.yhigh - s.ylow < 8) { blankRun += 0.25; maxBlankSec = Math.max(maxBlankSec, blankRun); } else blankRun = 0;
    });

    const staticFail = maxStaticSec >= maxStatic;
    const blankFail = !allowBlack && maxBlankSec > 0.5;
    const pass = !staticFail && !blankFail;
    console.log(JSON.stringify({ tool: "d27-frames", version: VERSION, mode: "audit", samples: samples.length, maxStaticSec, maxBlankSec, pass }, null, 2));
    return pass ? 0 : 2;
  }
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = await runFrames(process.argv.slice(2));
}
