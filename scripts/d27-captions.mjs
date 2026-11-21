#!/usr/bin/env node
/**
 * Design 27 v3.0.0 — Zero-Dependency Word-Timestamp Caption Chunker, ASS Burn-In & Reading-Hold Validator
 * Usage: node scripts/d27-captions.mjs <words.json> [--fps 30] [--aspect 9:16|16:9] [--format json|srt|ass] [--validate]
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
const format = args.includes("--srt") ? "srt" : getFlag("--format", "json").toLowerCase();
const validate = args.includes("--validate");

if (!inputArg || !fs.existsSync(path.resolve(inputArg))) {
  console.error("Usage: node scripts/d27-captions.mjs <words.json> [--fps 30] [--aspect 9:16|16:9] [--format json|srt|ass] [--validate]");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(path.resolve(inputArg), "utf8"));
const words = Array.isArray(raw) ? raw : raw.words || [];
const maxWords = aspect === "9:16" ? 3 : 8;
const maxChars = aspect === "9:16" ? 22 : 42;

const cues = [];
let bucket = [];

const flush = () => {
  if (!bucket.length) return;
  const startSec = bucket[0].start;
  const endSec = bucket[bucket.length - 1].end;
  const text = bucket.map((w) => w.word.trim()).join(" ");
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
  const candidate = [...bucket, w].map((x) => x.word.trim()).join(" ");
  if (bucket.length >= maxWords || (bucket.length > 0 && candidate.length > maxChars)) {
    flush();
  }
  bucket.push(w);
}
flush();

const warnings = [];
if (validate) {
  cues.forEach((c, idx) => {
    const minHold = 0.5 + 0.3 * c.words.length;
    if (c.cps > 17) warnings.push(`Cue #${c.index} ("${c.text}") exceeds 17 CPS (${c.cps} CPS).`);
    if (c.text.length > maxChars) warnings.push(`Cue #${c.index} exceeds ${maxChars} chars for ${aspect}.`);
    if (c.durationSec < minHold * 0.7) warnings.push(`Cue #${c.index} duration ${c.durationSec}s is below comfortable reading hold (${minHold.toFixed(2)}s).`);
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

if (format === "srt") {
  console.log(cues.map((c) => `${c.index}\n${fmtSrt(c.startSec)} --> ${fmtSrt(c.endSec)}\n${c.text}\n`).join("\n"));
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
      const styled = c.words
        .map((x, idx) => (idx === wi ? `{\\c&H0045B8FF&}${x.word.trim()}{\\c&H00F7F7F5&}` : x.word.trim()))
        .join(" ");
      events.push(`Dialogue: 0,${fmtAss(w.start)},${fmtAss(w.end)},Default,,0,0,0,,${styled}`);
    }
  }
  console.log([...header, ...events].join("\n"));
} else {
  console.log(JSON.stringify({ tool: "d27-captions", version: "3.0.0", fps, aspect, cueCount: cues.length, warnings, cues }, null, 2));
}

if (validate && warnings.length > 0) process.exit(2);
