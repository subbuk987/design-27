#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Zero-Dependency Beat-Boundary Contact-Sheet Extractor & sweep_static Auditor
 * Supports both video (.mp4/.mov/.webm via ffmpeg) and seekable HTML motion (.html/.htm via Chrome CDP).
 * Usage:
 *   node scripts/d27-frames.mjs sheet <video.mp4|motion.html> --beats 0,1.2,2.5,4.2 [--out sheet.png|frames-dir] [--width 1280] [--height 720]
 *   node scripts/d27-frames.mjs audit <video.mp4> [--max-static 3.0] [--allow-black]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { captureHtmlFramesWithCdp } from "./lib/chrome-cdp.mjs";

const VERSION = "4.0.0";
const [subcmd, inputArg, ...rest] = process.argv.slice(2);
const getFlag = (flag, fallback) => {
  const eq = rest.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const i = rest.indexOf(flag);
  return i !== -1 && rest[i + 1] ? rest[i + 1] : fallback;
};

if (!subcmd || subcmd === "--help" || subcmd === "-h" || !inputArg || !["sheet", "audit"].includes(subcmd)) {
  console.error(
    `Design 27 Frames v${VERSION}\nUsage:\n` +
    `  node scripts/d27-frames.mjs sheet <video.mp4|motion.html> --beats 0,1.2,2.5,4.2 --out sheet.png|frames-dir\n` +
    `  node scripts/d27-frames.mjs audit <video.mp4> [--max-static 3.0] [--allow-black]`
  );
  process.exit(subcmd === "--help" || subcmd === "-h" ? 0 : 1);
}

const inputPath = path.resolve(inputArg);
if (!fs.existsSync(inputPath)) {
  console.error(`Input not found: ${inputPath}`);
  process.exit(1);
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
          console.log(
            JSON.stringify(
              {
                tool: "d27-frames",
                version: VERSION,
                mode: "sheet",
                engine: "chrome-cdp+ffmpeg",
                timestamps: beats,
                out: outPath,
                ok: true,
              },
              null,
              2
            )
          );
          process.exit(0);
        }
      }

      if (wantsPngSheet && !ffmpegAvailable) {
        // Keep extracted frames inside a sibling directory next to requested --out when ffmpeg is absent
        const fallbackDir = outPath.replace(/\.png$/i, "-frames");
        fs.mkdirSync(fallbackDir, { recursive: true });
        const finalFrames = frames.map((f) => {
          const dest = path.join(fallbackDir, path.basename(f.path));
          fs.copyFileSync(f.path, dest);
          return { ...f, path: dest };
        });
        fs.rmSync(framesDir, { recursive: true, force: true });
        console.log(
          JSON.stringify(
            {
              tool: "d27-frames",
              version: VERSION,
              mode: "sheet",
              engine: "chrome-cdp",
              note: "ffmpeg not installed; wrote individual beat PNG frames.",
              timestamps: beats,
              outDir: fallbackDir,
              frames: finalFrames,
              ok: true,
            },
            null,
            2
          )
        );
        process.exit(0);
      }

      console.log(
        JSON.stringify(
          {
            tool: "d27-frames",
            version: VERSION,
            mode: "sheet",
            engine: "chrome-cdp",
            timestamps: beats,
            outDir: framesDir,
            frames,
            ok: true,
          },
          null,
          2
        )
      );
      process.exit(0);
    } catch (err) {
      if (wantsPngSheet && fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
      }
      console.error("Chrome CDP sheet extraction failed:", err.message);
      process.exit(1);
    }
  }

  // Video sheet mode via ffmpeg
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
  const selectExpr = sorted.map((t) => `lt(abs(t-${t}),0.04)`).join("+");

  const vf = `select='${selectExpr}',setpts=N/FRAME_RATE/TB,scale=640:-1,tile=${cols}x${rows}`;
  const res = spawnSync("ffmpeg", ["-y", "-i", inputPath, "-vf", vf, "-frames:v", "1", outPath], { encoding: "utf8" });
  if (res.error || res.status !== 0) {
    console.error("ffmpeg sheet extraction failed:", res.stderr || res.error?.message);
    process.exit(1);
  }
  console.log(JSON.stringify({ tool: "d27-frames", version: VERSION, mode: "sheet", engine: "ffmpeg", timestamps: sorted, out: outPath, ok: true }, null, 2));
  process.exit(0);
}

if (subcmd === "audit") {
  if (isHtml) {
    console.error("`audit` mode requires a rendered video file (.mp4/.mov/.webm). Use `sheet` to scrub HTML motion timelines.");
    process.exit(1);
  }
  const maxStatic = Number(getFlag("--max-static", "3.0"));
  const allowBlack = rest.includes("--allow-black");
  const res = spawnSync("ffmpeg", ["-i", inputPath, "-vf", "fps=4,signalstats,metadata=print:file=-", "-f", "null", "-"], { encoding: "utf8" });
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
  console.log(JSON.stringify({ tool: "d27-frames", version: VERSION, mode: "audit", samples: samples.length, maxStaticSec, maxBlackSec, pass }, null, 2));
  process.exit(pass ? 0 : 2);
}
