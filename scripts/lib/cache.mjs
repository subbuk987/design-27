/**
 * Design 27 v4.0.0 — Zero-Dependency, Symlink-Safe Content-Addressed Incremental Cache
 * Stored inside a private 0o700 per-repo XDG cache directory (never world-writable /tmp).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CACHE_SCHEMA_VERSION = 1;
export const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".mkv", ".m4v", ".avi"]);

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function verifyPrivateDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
    }
    const st = fs.lstatSync(dirPath);
    if (st.isSymbolicLink() || !st.isDirectory()) return false;
    if (typeof process.getuid === "function" && st.uid !== process.getuid()) return false;
    if ((st.mode & 0o777) !== 0o700) {
      try { fs.chmodSync(dirPath, 0o700); } catch { /* ignore on non-POSIX */ }
    }
    return true;
  } catch {
    return false;
  }
}

export function resolveRepoCacheDir(repoRoot = process.cwd()) {
  const base =
    process.env.XDG_CACHE_HOME ||
    (os.homedir() ? path.join(os.homedir(), ".cache") : null);
  if (!base) return null;

  let canonicalRoot;
  try {
    canonicalRoot = fs.realpathSync(repoRoot);
  } catch {
    canonicalRoot = path.resolve(repoRoot);
  }

  const rootDir = path.join(base, "design-27");
  if (!verifyPrivateDir(rootDir)) return null;

  const repoDir = path.join(rootDir, `cache-${sha256(canonicalRoot).slice(0, 16)}`);
  if (!verifyPrivateDir(repoDir)) return null;

  return repoDir;
}

export function computeRulesetHash(modulePaths) {
  const hash = crypto.createHash("sha256");
  hash.update(String(CACHE_SCHEMA_VERSION));
  for (const p of modulePaths) {
    try {
      hash.update(path.basename(p));
      hash.update(fs.readFileSync(p));
    } catch {
      hash.update(String(p));
    }
  }
  return hash.digest("hex");
}

export function computeFileHash(absPath) {
  if (!absPath) return "";
  try {
    return crypto.createHash("sha256").update(fs.readFileSync(absPath)).digest("hex");
  } catch {
    return "";
  }
}

export function shouldBypassCache({ render, noCache, relPath }) {
  return Boolean(render || noCache || VIDEO_EXTS.has(path.extname(relPath || "").toLowerCase()));
}

export function buildCacheKey({
  relPath,
  size,
  mtimeMs,
  rulesetHash,
  effectiveMedium,
  tierArg,
  noInlineIgnores,
  reportUnused,
  briefHash,
}) {
  return sha256(
    JSON.stringify([
      CACHE_SCHEMA_VERSION,
      relPath,
      size,
      Math.trunc(mtimeMs),
      rulesetHash,
      effectiveMedium || "",
      tierArg || "",
      Boolean(noInlineIgnores),
      Boolean(reportUnused),
      briefHash || "",
    ])
  );
}

export function readCacheEntry(cacheDir, key) {
  if (!cacheDir || !key) return null;
  const finalPath = path.join(cacheDir, `${key}.json`);
  try {
    if (!fs.existsSync(finalPath)) return null;
    const st = fs.lstatSync(finalPath);
    if (st.isSymbolicLink() || !st.isFile()) return null;
    const parsed = JSON.parse(fs.readFileSync(finalPath, "utf8"));
    if (!parsed || parsed.v !== CACHE_SCHEMA_VERSION || parsed.key !== key) return null;
    return parsed.data || null;
  } catch {
    return null;
  }
}

// Entries were never deleted; drop ones untouched for 30 days (at most once per process).
let pruned = false;
function pruneOldEntries(cacheDir) {
  if (pruned) return;
  pruned = true;
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  try {
    for (const name of fs.readdirSync(cacheDir)) {
      if (!name.endsWith(".json")) continue;
      const p = path.join(cacheDir, name);
      const st = fs.lstatSync(p);
      if (st.isFile() && st.mtimeMs < cutoff) fs.unlinkSync(p);
    }
  } catch { /* best effort */ }
}

export function writeCacheEntry(cacheDir, key, payload) {
  if (!cacheDir || !key) return false;
  const finalPath = path.join(cacheDir, `${key}.json`);
  const tmpPath = path.join(
    cacheDir,
    `.${key}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`
  );
  try {
    fs.writeFileSync(
      tmpPath,
      JSON.stringify({ v: CACHE_SCHEMA_VERSION, key, data: payload }),
      { flag: "wx", mode: 0o600 }
    );
    fs.renameSync(tmpPath, finalPath);
    pruneOldEntries(cacheDir);
    return true;
  } catch {
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
    return false;
  }
}
