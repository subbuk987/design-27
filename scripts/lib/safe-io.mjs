/**
 * Design 27 — hostile-input I/O helpers: symlink-safe writes and a jailed loopback file server for --render.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Write via temp file + rename. rename() replaces a symlink entry itself instead of writing through it,
 * so a planted `brief.json -> ~/.bashrc` link cannot redirect the write.
 */
export function writeFileSafe(file, data, mode = 0o644) {
  const target = path.resolve(file);
  const tmp = `${target}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, data, { flag: "wx", mode });
  try {
    fs.renameSync(tmp, target);
  } catch (err) {
    fs.rmSync(tmp, { force: true });
    throw err;
  }
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".ttf": "font/ttf", ".otf": "font/otf", ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg", ".wav": "audio/wav",
};

/** Deepest directory containing every file. */
export function commonDir(files) {
  const dirs = files.map((f) => path.dirname(path.resolve(f)).split(path.sep));
  const out = [];
  for (let i = 0; i < dirs[0].length; i++) {
    if (dirs.every((d) => d[i] === dirs[0][i])) out.push(dirs[0][i]); else break;
  }
  return out.join(path.sep) || path.sep;
}

/**
 * Serve `rootDir` on 127.0.0.1:<random port>. Pages loaded over http cannot frame file:// URLs, and every
 * request is realpath-checked to stay inside rootDir; dotfiles (.env, .ssh, .git) are never served.
 */
export async function serveDirectory(rootDir) {
  const realRoot = fs.realpathSync(rootDir);
  const server = http.createServer((req, res) => {
    const deny = (code) => { res.writeHead(code); res.end(); };
    if (req.method !== "GET" && req.method !== "HEAD") return deny(405);
    let rel;
    try {
      rel = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
    } catch {
      return deny(400);
    }
    if (rel.split("/").some((seg) => seg.startsWith("."))) return deny(403);
    let real;
    try {
      real = fs.realpathSync(path.join(realRoot, rel));
    } catch {
      return deny(404);
    }
    if (real !== realRoot && !real.startsWith(realRoot + path.sep)) return deny(403);
    let stat;
    try { stat = fs.statSync(real); } catch { return deny(404); }
    if (!stat.isFile()) return deny(404);
    res.writeHead(200, { "content-type": MIME[path.extname(real).toLowerCase()] || "application/octet-stream", "content-length": stat.size });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(real).pipe(res);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin,
    urlFor: (file) => origin + "/" + path.relative(realRoot, fs.realpathSync(file)).split(path.sep).map(encodeURIComponent).join("/"),
    close: () => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); }),
  };
}
