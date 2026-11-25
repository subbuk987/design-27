/**
 * Design 27 v4.0.0 — Video & Audio Export Audit (ISO BMFF faststart, ffprobe, ebur128)
 */
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";

function parseFpsRatio(str) {
  if (!str || typeof str !== "string") return null;
  const parts = str.split("/");
  if (parts.length === 2) {
    const num = Number(parts[0]);
    const den = Number(parts[1]);
    return den > 0 && Number.isFinite(num / den) ? num / den : null;
  }
  const v = Number(str);
  return Number.isFinite(v) && v > 0 ? v : null;
}

/**
 * Walk ISO BMFF top-level box headers to accurately determine whether `moov` precedes `mdat`.
 * Avoids 64KB buffer truncation and false hits inside metadata strings.
 */
function checkMp4Faststart(file) {
  const fd = fs.openSync(file, "r");
  try {
    const stat = fs.fstatSync(fd);
    const fileSize = stat.size;
    const hdr = Buffer.alloc(16);
    let offset = 0;
    let moovOffset = -1;
    let mdatOffset = -1;
    let boxesScanned = 0;

    while (offset + 8 <= fileSize && boxesScanned < 256) {
      const read = fs.readSync(fd, hdr, 0, Math.min(16, fileSize - offset), offset);
      if (read < 8) break;
      let size = hdr.readUInt32BE(0);
      const type = hdr.toString("ascii", 4, 8);
      if (size === 1 && read >= 16) {
        size = Number(hdr.readBigUInt64BE(8));
      } else if (size === 0) {
        size = fileSize - offset;
      }
      if (type === "moov" && moovOffset === -1) moovOffset = offset;
      if (type === "mdat" && mdatOffset === -1) mdatOffset = offset;
      if (moovOffset !== -1 && mdatOffset !== -1) break;
      if (!Number.isFinite(size) || size < 8) break;
      offset += size;
      boxesScanned += 1;
    }
    return moovOffset !== -1 && (mdatOffset === -1 || moovOffset < mdatOffset);
  } finally {
    fs.closeSync(fd);
  }
}

export function auditVideoFile({ file, rel, ext, targetLufs, findings, mediaAudit }) {
  mediaAudit.ran = true;
  if (ext === ".mp4") {
    try {
      if (!checkMp4Faststart(file)) {
        findings.push({
          file: rel, line: 1, tier: "REFLEX", rule: "require-mp4-faststart",
          message: "MP4 `moov` atom is not before `mdat` (delays web/social playback start).",
          fix: "Re-mux with `-movflags +faststart`.",
        });
      }
    } catch { /* ignore */ }
  }

  try {
    // file-only protocols + timeout: a hostile .mp4 that is really an HLS playlist must not fetch or hang.
    const out = execFileSync("ffprobe", ["-v", "error", "-protocol_whitelist", "file", "-show_streams", "-of", "json", file], { encoding: "utf8", timeout: 30000 });
    const info = JSON.parse(out);
    const streams = info.streams || [];
    const vStream = streams.find((s) => s.codec_type === "video");
    const aStream = streams.find((s) => s.codec_type === "audio");

    if (vStream) {
      if (vStream.pix_fmt && vStream.pix_fmt !== "yuv420p") {
        findings.push({
          file: rel, line: 1, tier: "FLOOR", rule: "require-yuv420p",
          message: `Video pixel format is \`${vStream.pix_fmt}\` (breaks Safari/iOS/social playback).`,
          fix: "Encode with `-c:v libx264 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart`.",
        });
      }
      const rFps = parseFpsRatio(vStream.r_frame_rate);
      const avgFps = parseFpsRatio(vStream.avg_frame_rate);
      if (rFps !== null && avgFps !== null && Math.abs(rFps - avgFps) > 0.05) {
        findings.push({
          file: rel, line: 1, tier: "FLOOR", rule: "require-cfr",
          message: `Variable frame rate detected (r_frame_rate=${rFps.toFixed(3)}, avg=${avgFps.toFixed(3)}).`,
          fix: "Force constant frame rate with `-fps_mode cfr`.",
        });
      }
      // Strict allowlist: untagged or partial Rec.709 color metadata causes Safari/QuickTime gamma shifts
      const hasFullBt709 =
        vStream.color_space === "bt709" &&
        vStream.color_primaries === "bt709" &&
        vStream.color_transfer === "bt709";
      if (!hasFullBt709) {
        findings.push({
          file: rel, line: 1, tier: "REFLEX", rule: "require-full-bt709",
          message: `Missing or incomplete Rec.709 color tags (space=${vStream.color_space || "unset"}, primaries=${vStream.color_primaries || "unset"}, trc=${vStream.color_transfer || "unset"}).`,
          fix: "Pass all four flags: `-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv`.",
        });
      }
      if (aStream && vStream.duration && aStream.duration) {
        const drift = Math.abs(parseFloat(vStream.duration) - parseFloat(aStream.duration));
        if (drift > 0.05) {
          findings.push({
            file: rel, line: 1, tier: "FLOOR", rule: "require-av-parity",
            message: `Audio/video duration mismatch of ${drift.toFixed(3)}s exceeds 0.05s lip-sync ceiling.`,
            fix: "Align audio and video duration (`-shortest` or dynamic `calculateMetadata` probing).",
          });
        }
      }
      if (aStream) {
        const eb = spawnSync("ffmpeg", ["-nostats", "-protocol_whitelist", "file", "-i", file, "-filter_complex", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8", timeout: 120000 });
        if (!eb.error && eb.stderr) {
          mediaAudit.ffmpegCraftRan = true;
          const iMatch = eb.stderr.match(/Integrated loudness:[\s\S]*?I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/);
          const pMatch = eb.stderr.match(/True peak:[\s\S]*?Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS/);
          if (iMatch) {
            const lufs = parseFloat(iMatch[1]);
            if (Math.abs(lufs - targetLufs) > 2.0) {
              findings.push({
                file: rel, line: 1, tier: "FLOOR", rule: "video-loudness-floor",
                message: `Integrated loudness ${lufs} LUFS is outside target ${targetLufs} ±2.0 LUFS.`,
                fix: `Apply two-pass linear loudnorm targeting I=${targetLufs}:TP=-1.0.`,
              });
            }
          }
          if (pMatch && parseFloat(pMatch[1]) > -1.0) {
            findings.push({
              file: rel, line: 1, tier: "FLOOR", rule: "video-true-peak",
              message: `Audio true peak ${pMatch[1]} dBFS exceeds -1.0 dBFS ceiling.`,
              fix: "Set `TP=-1.0` in two-pass linear `loudnorm`.",
            });
          }
        }
      }
    }
  } catch { /* ffprobe unavailable */ }
}
