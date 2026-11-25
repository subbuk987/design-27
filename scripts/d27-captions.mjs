#!/usr/bin/env node
/**
 * Design 27 v4.0.0 — Zero-Dependency Word-Timestamp Caption Chunker, ASS Burn-In & Reading-Hold Validator
 * Usage: node scripts/d27-captions.mjs <words.json> [--fps 30] [--aspect 9:16|16:9] [--format json|srt|ass] [--out file] [--validate]
 */
import fs from "node:fs";
import path from "node:path";

const VERSION = "4.0.0";
const args = process.argv.slice(2);
const VALUE_FLAGS = new Set(["--fps", "--aspect", "--format", "--out"]);
const skipIndices = new Set();
const flagValues = new Map();
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith("-")) continue;
  const eqIdx = a.indexOf("=");
  if (eqIdx !== -1) {
    const base = a.slice(0, eqIdx);
    if (VALUE_FLAGS.has(base)) flagValues.set(base, a.slice(eqIdx + 1));
  } else if (VALUE_FLAGS.has(a) && i + 1 < args.length && !args[i + 1].startsWith("-")) {
    flagValues.set(a, args[i + 1]);
    skipIndices.add(i + 1);
    i++;
  }
}
const getFlag = (f, fallback) => (flagValues.has(f) ? flagValues.get(f) : fallback);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Design 27 Captions v${VERSION}\nUsage: node scripts/d27-captions.mjs <words.json> [--fps 30] [--aspect 9:16|16:9] [--format json|srt|ass] [--out file] [--validate]`);
  process.exit(0);
}

const inputArg = args.find((a, i) => !a.startsWith("-") && !skipIndices.has(i));
const fps = Number(getFlag("--fps", "30"));
const aspect = getFlag("--aspect", "9:16");
const format = args.includes("--srt") ? "srt" : getFlag("--format", "json").toLowerCase();
const outArg = getFlag("--out", null);
const validate = args.includes("--validate");

if (!Number.isFinite(fps) || fps <= 0) {
  console.error(`Invalid --fps value: ${getFlag("--fps", "30")} (must be a positive number).`);
  process.exit(3);
}

if (!inputArg || !fs.existsSync(path.resolve(inputArg))) {
  console.error("Usage: node scripts/d27-captions.mjs <words.json> [--fps 30] [--aspect 9:16|16:9] [--format json|srt|ass] [--out file] [--validate]");
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(fs.readFileSync(path.resolve(inputArg), "utf8"));
} catch (err) {
  console.error(`Invalid JSON in ${inputArg}: ${err.message}`);
  process.exit(1);
}

const rawWords = Array.isArray(raw) ? raw : raw.words || [];
const words = [];
for (let i = 0; i < rawWords.length; i++) {
  const w = rawWords[i];
  if (!w || typeof w.word !== "string" || !Number.isFinite(Number(w.start)) || !Number.isFinite(Number(w.end))) {
    console.error(`Invalid word entry at index ${i}: expected { word: string, start: number, end: number }.`);
    process.exit(1);
  }
  const start = Math.max(0, Number(w.start));
  const end = Math.max(start + 0.01, Number(w.end));
  words.push({ word: w.word.trim(), start, end });
}
words.sort((a, b) => a.start - b.start);

const maxWords = aspect === "9:16" ? 3 : 8;
const maxChars = aspect === "9:16" ? 22 : 42;

const cues = [];
let bucket = [];

const flush = () => {
  if (!bucket.length) return;
  const startSec = bucket[0].start;
  const endSec = bucket[bucket.length - 1].end;
  const text = bucket.map((w) => w.word).join(" ");
  const duration = Math.max(0.01, endSec - startSec);
  cues.push({
    index: cues.length + 1,
    text,
    startSec,
    endSec,
    durationSec: Number(duration.toFixed(3)),
    cps: Number((text.length / duration).toFixed(1)),
    startFrame: Math.round(startSec * fps),
    endFrame: Math.round(endSec * fps),
    words: bucket,
  });
  bucket = [];
};

for (const w of words) {
  const candidate = [...bucket, w].map((x) => x.word).join(" ");
  if (bucket.length >= maxWords || (bucket.length > 0 && candidate.length > maxChars)) {
    flush();
  }
  bucket.push(w);
}
flush();

const warnings = [];
if (validate) {
  const minGapSec = 2 / fps;
  const eps = 0.001;
  cues.forEach((c, idx) => {
    const minHold = 0.5 + 0.3 * c.words.length;
    const minDur = aspect === "9:16" ? (c.words.length <= 3 ? 0.35 : 0.6) : 0.833;
    if (c.cps > 17) warnings.push(`Cue #${c.index} ("${c.text}") exceeds 17 CPS (${c.cps} CPS).`);
    if (c.text.length > maxChars) warnings.push(`Cue #${c.index} exceeds ${maxChars} chars for ${aspect}.`);
    if (c.durationSec < minDur) warnings.push(`Cue #${c.index} duration ${c.durationSec}s is below ${Math.round(minDur * 1000)}ms minimum for ${aspect}.`);
    if (c.durationSec > 7.0) warnings.push(`Cue #${c.index} duration ${c.durationSec}s exceeds Netflix 7.0s maximum.`);
    if (c.durationSec < minHold * 0.7) warnings.push(`Cue #${c.index} duration ${c.durationSec}s is below comfortable reading hold (${minHold.toFixed(2)}s).`);
    if (idx > 0) {
      const gapSec = Number((c.startSec - cues[idx - 1].endSec).toFixed(4));
      if (gapSec < -eps) {
        warnings.push(`Cue #${c.index} overlaps previous cue by ${Math.round(Math.abs(gapSec) * 1000)}ms.`);
      } else if (gapSec > eps && gapSec < minGapSec - eps) {
        warnings.push(`Cue #${c.index} has a ${Math.round(gapSec * 1000)}ms gap (< 2 frames at ${fps}fps; causes 1-frame flash).`);
      }
    }
    if (idx === cues.length - 1 && c.durationSec < 2.0) warnings.push(`Final cue #${c.index} holds ${c.durationSec}s (< 2.0s closing floor).`);
  });
}

const fmtSrt = (sec) => {
  const ms = Math.round(sec * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const r = String(ms % 1000).padStart(3, "0");
  return `${h}:${m}:${s},${r}`;
};

const fmtAss = (sec) => {
  const cs = Math.round(sec * 100);
  const h = Math.floor(cs / 360000);
  const m = String(Math.floor((cs % 360000) / 6000)).padStart(2, "0");
  const s = String(Math.floor((cs % 6000) / 100)).padStart(2, "0");
  const r = String(cs % 100).padStart(2, "0");
  return `${h}:${m}:${s}.${r}`;
};

const escapeAss = (str) =>
  str.replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}");

let output = "";
if (format === "srt") {
  output = cues.map((c) => `${c.index}\n${fmtSrt(c.startSec)} --> ${fmtSrt(c.endSec)}\n${c.text}\n`).join("\n");
} else if (format === "ass") {
  const isVert = aspect === "9:16";
  const resX = isVert ? 1080 : 1920;
  const resY = isVert ? 1920 : 1080;
  const fontSize = isVert ? 76 : 64;
  const marginL = isVert ? 80 : 160;
  const marginR = isVert ? 160 : 160;
  const marginV = isVert ? 420 : 90;

  const header = [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${resX}`,
    `PlayResY: ${resY}`,
    "WrapStyle: 2",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: Default,IBM Plex Sans,${fontSize},&H00F7F7F5,&H0000D4FF,&H00101214,&H80000000,1,0,0,0,100,100,0,0,1,4,0,2,${marginL},${marginR},${marginV},1`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];

  const events = [];
  for (const c of cues) {
    for (let wi = 0; wi < c.words.length; wi++) {
      const w = c.words[wi];
      const nextWord = c.words[wi + 1];
      // Bridge intra-cue gaps up to 0.5s so the caption never flickers off between words
      const bridgedEnd = nextWord ? Math.max(w.end, Math.min(nextWord.start, w.end + 0.5)) : w.end;
      const styled = c.words
        .map((x, idx) => (idx === wi ? `{\\c&H0045B8FF&}${escapeAss(x.word)}{\\c&H00F7F7F5&}` : escapeAss(x.word)))
        .join(" ");
      events.push(`Dialogue: 0,${fmtAss(w.start)},${fmtAss(bridgedEnd)},Default,,0,0,0,,${styled}`);
    }
  }
  output = [...header, ...events].join("\n");
} else {
  output = JSON.stringify({ tool: "d27-captions", version: VERSION, fps, aspect, cueCount: cues.length, warnings, cues }, null, 2);
}

if (outArg) {
  const resolvedOut = path.resolve(outArg);
  fs.mkdirSync(path.dirname(resolvedOut), { recursive: true });
  fs.writeFileSync(resolvedOut, `${output}\n`, "utf8");
} else {
  console.log(output);
}

if (validate && warnings.length > 0) process.exit(2);
