#!/usr/bin/env node
/**
 * Design 27 — Zero-Dependency Word-Timestamp to Frame-Accurate Caption Chunker
 * Converts Whisper/ElevenLabs word-level JSON [{ word, start, end }] into 9:16 or 16:9 cues + SRT.
 * Usage: node scripts/d27-captions.mjs <words.json> [--fps 30] [--aspect 9:16|16:9] [--srt]
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const getFlag = (f, fallback) => {
  const i = args.indexOf(f);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const inputArg = args.find((a, i) => !a.startsWith("-") && (i === 0 || !args[i - 1].startsWith("--")));
const fps = Number(getFlag("--fps", "30"));
const aspect = getFlag("--aspect", "9:16");
const asSrt = args.includes("--srt");

if (!inputArg || !fs.existsSync(path.resolve(inputArg))) {
  console.error("Usage: node scripts/d27-captions.mjs <words.json> [--fps 30] [--aspect 9:16|16:9] [--srt]");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(path.resolve(inputArg), "utf8"));
const words = Array.isArray(raw) ? raw : raw.words || [];
const maxWords = aspect === "9:16" ? 3 : 8;
const maxChars = aspect === "9:16" ? 20 : 42;

const cues = [];
let bucket = [];

const flush = () => {
  if (!bucket.length) return;
  const startSec = bucket[0].start;
  const endSec = bucket[bucket.length - 1].end;
  cues.push({
    index: cues.length + 1,
    text: bucket.map((w) => w.word.trim()).join(" "),
    startSec,
    endSec,
    startFrame: Math.round(startSec * fps),
    endFrame: Math.round(endSec * fps),
    words: bucket,
  });
  bucket = [];
};

for (const w of words) {
  const candidate = [...bucket, w].map((x) => x.word.trim()).join(" ");
  if (bucket.length >= maxWords || (bucket.length > 0 && candidate.length > maxChars)) {
    flush();
  }
  bucket.push(w);
}
flush();

const fmtSrt = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const r = String(ms % 1000).padStart(3, "0");
  return `${h}:${m}:${s},${r}`;
};

if (asSrt) {
  console.log(cues.map((c) => `${c.index}\n${fmtSrt(c.startSec)} --> ${fmtSrt(c.endSec)}\n${c.text}\n`).join("\n"));
} else {
  console.log(JSON.stringify({ tool: "d27-captions", fps, aspect, cueCount: cues.length, cues }, null, 2));
}
