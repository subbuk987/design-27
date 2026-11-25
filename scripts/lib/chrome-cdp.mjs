/**
 * Design 27 v4.0.0 — Zero-NPM-Dependency, Zero-Socket Headless Chrome CDP Client
 * Uses Chrome's native `--remote-debugging-pipe` (stdio fd 3/4) with strict zero-network
 * enforcement (`--host-resolver-rules` + CDP `Fetch.enable`), no `--allow-file-access-from-files`,
 * fail-closed sandboxing, reverse-seek motion determinism verification, and 16x16 pixel cutout audits.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { analyzeCutoutBitmap } from "./pixel-audit.mjs";

const DEFAULT_TIMEOUT_MS = 15000;
const ALLOWED_EXTRA_FLAG_RE = /^--(?:no-sandbox|window-size=\d+,\d+)$/;

export function findChromeBinary() {
  const candidates = [];
  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);
  candidates.push(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  );
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  for (const bin of ["google-chrome", "chromium", "chromium-browser", "msedge"]) {
    const res = spawnSync("which", [bin], { encoding: "utf8" });
    if (!res.error && res.status === 0) {
      const found = (res.stdout || "").trim().split(/\r?\n/)[0];
      if (found && fs.existsSync(found)) return found;
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function terminateChrome(proc, tmpUserDataDir) {
  if (proc && proc.exitCode === null && proc.signalCode === null) {
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 1000);
      proc.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
      try {
        proc.kill("SIGKILL");
      } catch {
        clearTimeout(timer);
        resolve();
      }
    });
  }
  await sleep(60);
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      fs.rmSync(tmpUserDataDir, { recursive: true, force: true });
      break;
    } catch {
      await sleep(100);
    }
  }
}

async function spawnPipeSessionOnce(binaryPath, extraFlags, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const safeExtraFlags = (extraFlags || []).filter((f) => typeof f === "string" && ALLOWED_EXTRA_FLAG_RE.test(f));
  const tmpUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "d27-chrome-"));
  const chromeArgs = [
    "--headless=new",
    ...safeExtraFlags,
    "--remote-debugging-pipe",
    `--user-data-dir=${tmpUserDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1",
    "about:blank",
  ];

  const proc = spawn(binaryPath, chromeArgs, {
    env: { ...process.env, HOME: tmpUserDataDir },
    stdio: ["ignore", "pipe", "pipe", "pipe", "pipe"],
  });

  const pipeWrite = proc.stdio[3];
  const pipeRead = proc.stdio[4];
  let stderrBuf = "";
  proc.stderr.setEncoding("utf8");
  proc.stderr.on("data", (c) => {
    if (stderrBuf.length < 2000) stderrBuf += c;
  });

  let nextId = 1;
  let rxBuffer = "";
  let closed = false;
  const pending = new Map();
  const listeners = new Map();

  const rejectAllPending = (reason) => {
    closed = true;
    for (const [id, entry] of pending.entries()) {
      clearTimeout(entry.timer);
      entry.reject(new Error(reason));
      pending.delete(id);
    }
  };

  proc.once("error", (err) => rejectAllPending(`Chrome process error: ${err.message}`));
  proc.once("exit", (code, sig) => rejectAllPending(`Chrome exited (code=${code}, signal=${sig}): ${stderrBuf.slice(0, 240)}`));
  pipeWrite.on("error", () => { /* handled on exit */ });
  pipeRead.on("error", () => { /* handled on exit */ });

  pipeRead.setEncoding("utf8");
  pipeRead.on("data", (chunk) => {
    rxBuffer += chunk;
    let nulIdx;
    while ((nulIdx = rxBuffer.indexOf("\0")) !== -1) {
      const raw = rxBuffer.slice(0, nulIdx);
      rxBuffer = rxBuffer.slice(nulIdx + 1);
      if (!raw) continue;
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        continue;
      }
      if (msg.id !== undefined) {
        const entry = pending.get(msg.id);
        if (!entry) continue;
        pending.delete(msg.id);
        clearTimeout(entry.timer);
        if (msg.error) {
          entry.reject(new Error(`CDP ${entry.method} error: ${msg.error.message || JSON.stringify(msg.error)}`));
        } else {
          entry.resolve(msg.result || {});
        }
        continue;
      }
      if (msg.method) {
        const set = listeners.get(msg.method);
        if (set) {
          for (const fn of [...set]) {
            try { fn(msg.params || {}, msg.sessionId || null); } catch { /* ignore */ }
          }
        }
      }
    }
  });

  function sendRaw(method, params = {}, sessionId = null, opTimeoutMs = timeoutMs) {
    return new Promise((resolve, reject) => {
      if (closed || !pipeWrite.writable) {
        reject(new Error(`CDP pipe closed before ${method}: ${stderrBuf.slice(0, 200)}`));
        return;
      }
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP ${method} timed out after ${opTimeoutMs}ms`));
      }, opTimeoutMs);
      pending.set(id, { method, resolve, reject, timer });
      const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
      pipeWrite.write(JSON.stringify(payload) + "\0");
    });
  }

  try {
    const created = await sendRaw("Target.createTarget", { url: "about:blank" }, null, timeoutMs);
    const attached = await sendRaw(
      "Target.attachToTarget",
      { targetId: created.targetId, flatten: true },
      null,
      timeoutMs,
    );
    const sessionId = attached.sessionId;

    const send = (method, params = {}, opTimeoutMs = timeoutMs) =>
      sendRaw(method, params, sessionId, opTimeoutMs);

    const on = (method, fn) => {
      if (!listeners.has(method)) listeners.set(method, new Set());
      const wrapped = (params, msgSessionId) => {
        if (!msgSessionId || msgSessionId === sessionId) fn(params);
      };
      listeners.get(method).add(wrapped);
      return () => listeners.get(method)?.delete(wrapped);
    };

    const onceEvent = (method, opTimeoutMs = timeoutMs) =>
      new Promise((resolve, reject) => {
        let off = () => {};
        const timer = setTimeout(() => {
          off();
          reject(new Error(`Timed out waiting for CDP event ${method} (${opTimeoutMs}ms)`));
        }, opTimeoutMs);
        off = on(method, (params) => {
          clearTimeout(timer);
          off();
          resolve(params);
        });
      });

    await send("Page.enable", {}, timeoutMs);
    await send("Runtime.enable", {}, timeoutMs);

    try {
      await send("Fetch.enable", { patterns: [{ urlPattern: "http://*" }, { urlPattern: "https://*" }] }, timeoutMs);
      on("Fetch.requestPaused", (params) => {
        const url = params?.request?.url || "";
        const isLoopback = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//i.test(url);
        if (isLoopback) {
          send("Fetch.continueRequest", { requestId: params.requestId }, 2000).catch(() => {});
        } else {
          send("Fetch.failRequest", { requestId: params.requestId, errorReason: "BlockedByClient" }, 2000).catch(() => {});
        }
      });
    } catch { /* Fetch domain unavailable on older builds; --host-resolver-rules still blocks DNS */ }

    return { proc, tmpUserDataDir, send, on, onceEvent };
  } catch (err) {
    await terminateChrome(proc, tmpUserDataDir);
    throw err;
  }
}

async function withCdpSession(fn, timeoutMs = DEFAULT_TIMEOUT_MS, { unsafeNoSandbox = false } = {}) {
  const binary = findChromeBinary();
  if (!binary) {
    throw new Error("Chrome/Chromium binary not found on PATH or standard macOS/Linux paths.");
  }
  const extraFlags = unsafeNoSandbox || process.env.D27_UNSAFE_NO_SANDBOX === "1" ? ["--no-sandbox"] : [];
  const session = await spawnPipeSessionOnce(binary, extraFlags, timeoutMs);

  try {
    return await fn(session);
  } finally {
    await terminateChrome(session.proc, session.tmpUserDataDir);
  }
}

/**
 * Pure hash evaluator for reverse-seek motion determinism (unit-testable in pure Node).
 */
export function evaluateDeterminismHashes({ beats, forwardHashes, reverseHashes }) {
  if (beats.length !== forwardHashes.length || beats.length !== reverseHashes.length) {
    throw new Error("beats, forwardHashes, and reverseHashes length mismatch");
  }
  const mismatches = [];
  for (let i = 0; i < beats.length; i++) {
    if (forwardHashes[i] !== reverseHashes[i]) {
      mismatches.push({
        beat: beats[i],
        index: i,
        forward: forwardHashes[i],
        reverse: reverseHashes[i],
      });
    }
  }
  const allIdentical = beats.length >= 2 && new Set(forwardHashes).size === 1;
  const failures = [];
  if (mismatches.length > 0) failures.push("motion-nondeterministic-seek");
  if (allIdentical) failures.push("motion-static-seek");
  return {
    beats,
    forwardHashes,
    reverseHashes,
    mismatches,
    allIdentical,
    failures,
    pass: failures.length === 0,
  };
}

export function buildDomAuditFnSource() {
  const cutoutHelperSrc = analyzeCutoutBitmap.toString();
  return `async function runDesign27DomAudit(assertions, medium) {
    ${cutoutHelperSrc}
    const overflowAllowedOnRoot = Boolean(
      document.documentElement?.matches?.('[data-d27-allow*="overflow"]') ||
      document.body?.matches?.('[data-d27-allow*="overflow"]'),
    );
    const overflowX = overflowAllowedOnRoot
      ? false
      : document.documentElement.scrollWidth > document.documentElement.clientWidth;
    const bodyFontPx = parseFloat(getComputedStyle(document.body).fontSize || "16");
    const visibleText = (document.body.innerText || "").trim().length > 0;
    const assertionFails = [];

    for (const a of assertions || []) {
      if (a.kind === "aboveTheFold") {
        const el = document.querySelector(a.selector);
        if (!el) {
          assertionFails.push({ rule: "assert-selector-missing", msg: "Selector \`" + a.selector + "\` matched 0 elements." });
        } else if (el.getBoundingClientRect().bottom > window.innerHeight) {
          assertionFails.push({ rule: "assert-above-the-fold", msg: "\`" + a.selector + "\` falls below viewport fold." });
        }
      } else if (a.kind === "before") {
        const elA = document.querySelector(a.a);
        const bCandidates = [...document.querySelectorAll(a.b)];
        const elB = bCandidates.find((el) => !el.closest("header nav, body > header, body > nav")) || bCandidates[0] || null;
        if (!elA || !elB) {
          assertionFails.push({
            rule: "assert-selector-missing",
            msg: "Selector \`" + (!elA ? a.a : a.b) + "\` matched 0 elements.",
          });
        } else if (elA.getBoundingClientRect().top > elB.getBoundingClientRect().top) {
          assertionFails.push({
            rule: "assert-before",
            msg: "\`" + a.a + "\` should appear vertically before \`" + a.b + "\`.",
          });
        }
      } else if (a.kind === "staysInFrame") {
        const els = [...document.querySelectorAll(a.selector)];
        for (const el of els) {
          if (el.closest('[data-d27-allow*="overflow"], [data-d27-allow*="overlap"]')) continue;
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && (r.left < -1 || r.right > window.innerWidth + 1)) {
            assertionFails.push({
              rule: "assert-stays-in-frame",
              msg: "Element \`" + a.selector + "\` extends outside viewport horizontal bounds (" + Math.round(r.left) + ".." + Math.round(r.right) + " vs " + window.innerWidth + "px).",
            });
            break;
          }
        }
      }
    }

    const thumbnailDeadzoneCollisions = [];
    let thumbnailHookScale = null;
    const stage =
      document.querySelector("#thumbnail-canvas, [data-thumbnail], .yt-thumb") ||
      (medium === "thumbnail" ? document.body : null);
    if (stage) {
      const sr = stage.getBoundingClientRect();
      if (sr.width > 0 && sr.height > 0) {
        const fmt = (stage.getAttribute("data-format") || "").toLowerCase() ||
          (sr.height > sr.width * 1.3 ? "shorts" : Math.abs(sr.width - sr.height) < sr.width * 0.1 ? "podcast" : "youtube");
        const deadZones = fmt === "shorts"
          ? [
              { left: sr.left + sr.width * 0.82, top: sr.top + sr.height * 0.45, right: sr.right, bottom: sr.bottom },
              { left: sr.left, top: sr.top + sr.height * 0.80, right: sr.right, bottom: sr.bottom },
            ]
          : fmt === "podcast" || fmt === "og"
            ? []
            : [{ left: sr.left + sr.width * 0.78, top: sr.top + sr.height * 0.82, right: sr.right, bottom: sr.bottom }];

        const candidates = stage.querySelectorAll("*");
        for (const el of candidates) {
          if (el.closest(".yt-duration, .timestamp, [data-timestamp], .yt-feed-preview, .feed-preview, [data-feed-preview], .deadzone-box")) {
            continue;
          }
          if (el.closest('[data-d27-allow*="safe-zone"], [data-d27-allow*="overlap"]')) {
            continue;
          }
          const st = getComputedStyle(el);
          if (st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity) === 0) continue;

          const tag = el.tagName.toLowerCase();
          const hasDirectText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
          const isVisualFocal = ["img", "svg", "canvas"].includes(tag) || el.hasAttribute("data-focal");
          const beforeContent = getComputedStyle(el, "::before").content;
          const afterContent = getComputedStyle(el, "::after").content;
          const hasPseudoText =
            (beforeContent && beforeContent !== "none" && beforeContent !== '""') ||
            (afterContent && afterContent !== "none" && afterContent !== '""');

          if (!hasDirectText && !isVisualFocal && !hasPseudoText) continue;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          for (const dz of deadZones) {
            if (r.right > dz.left && r.left < dz.right && r.bottom > dz.top && r.top < dz.bottom) {
              thumbnailDeadzoneCollisions.push({
                tag,
                text: (el.textContent || el.getAttribute("alt") || el.getAttribute("aria-label") || tag).trim().slice(0, 40),
              });
              break;
            }
          }
        }

        if (medium === "thumbnail") {
          const hooks = [...stage.querySelectorAll("h1, .thumb-hook, [data-hook]")]
            .filter((el) => el.textContent.trim() && getComputedStyle(el).display !== "none");
          if (hooks.length > 0) {
            const maxPx = hooks.reduce((m, el) => Math.max(m, parseFloat(getComputedStyle(el).fontSize) || 0), 0);
            const ratio = Number((maxPx / sr.height).toFixed(4));
            thumbnailHookScale = { fontSize: maxPx, stageHeight: sr.height, ratio, minRatio: 0.14 };
          }
        }
      }
    }

    let mascotCutout = null;
    if (medium === "mascot") {
      const svg = document.querySelector("svg[data-mascot], [data-mascot] svg");
      if (svg) {
        try {
          const clone = svg.cloneNode(true);
          clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          if (!clone.getAttribute("viewBox")) {
            const r = svg.getBoundingClientRect();
            clone.setAttribute("viewBox", "0 0 " + (r.width || 400) + " " + (r.height || 400));
          }
          clone.setAttribute("width", "16");
          clone.setAttribute("height", "16");
          const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
          styleEl.textContent = ":root,svg,*{--m-fill:#000!important;--m-shade:#000!important;--m-screen:#000!important;--m-cut:#fff!important;--m-hi:transparent!important;--m-glint:transparent!important;--m-shadow:transparent!important;}";
          clone.prepend(styleEl);

          const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
          const img = await new Promise((res, rej) => {
            const timer = setTimeout(() => rej(new Error("svg-decode-timeout")), 1500);
            const im = new Image();
            im.onload = () => { clearTimeout(timer); res(im); };
            im.onerror = (e) => { clearTimeout(timer); rej(e); };
            im.src = src;
          });

          const canvas = document.createElement("canvas");
          canvas.width = 16;
          canvas.height = 16;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.clearRect(0, 0, 16, 16);
          ctx.drawImage(img, 0, 0, 16, 16);
          mascotCutout = analyzeCutoutBitmap(ctx.getImageData(0, 0, 16, 16).data, 16, 16);
        } catch {
          mascotCutout = null;
        }
      }
    }

    return { overflowX, bodyFontPx, visibleText, assertionFails, thumbnailDeadzoneCollisions, thumbnailHookScale, mascotCutout };
  }`;
}

export async function auditHtmlWithCdp({
  htmlFiles,
  viewports = [{ width: 390, height: 844 }, { width: 1440, height: 900 }],
  assertions = [],
  medium = "web",
  snapshotsDir = null,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  unsafeNoSandbox = false,
}) {
  if (snapshotsDir) fs.mkdirSync(path.resolve(snapshotsDir), { recursive: true });
  const evalFnSrc = buildDomAuditFnSource();

  return withCdpSession(async ({ send, on, onceEvent }) => {
    const results = [];
    for (const htmlFile of htmlFiles) {
      const fileUrl = pathToFileURL(htmlFile).href;
      for (const vp of viewports) {
        const runtimeErrors = [];
        const offEx = on("Runtime.exceptionThrown", (params) => {
          const desc = params?.exceptionDetails?.exception?.description || params?.exceptionDetails?.text || "Runtime exception";
          runtimeErrors.push(desc);
        });

        try {
          await send("Emulation.setDeviceMetricsOverride", {
            width: vp.width,
            height: vp.height,
            deviceScaleFactor: 1,
            mobile: vp.width < 600,
          }, timeoutMs);

          const loadPromise = onceEvent("Page.loadEventFired", timeoutMs);
          loadPromise.catch(() => {});
          const navRes = await send("Page.navigate", { url: fileUrl }, timeoutMs);
          if (navRes?.errorText) {
            throw new Error(`Navigation failed for ${fileUrl}: ${navRes.errorText}`);
          }
          await loadPromise;
          await send("Runtime.evaluate", {
            expression: "(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return true; })()",
            returnByValue: true,
            awaitPromise: true,
          }, timeoutMs);

          let snapshotPath = null;
          if (snapshotsDir) {
            const shot = await send("Page.captureScreenshot", { format: "png" }, timeoutMs);
            const snapName = `${path.basename(htmlFile, path.extname(htmlFile))}-${vp.width}x${vp.height}.png`;
            snapshotPath = path.join(path.resolve(snapshotsDir), snapName);
            fs.writeFileSync(snapshotPath, Buffer.from(shot.data, "base64"));
          }

          const expression = `(${evalFnSrc})(${JSON.stringify(assertions || [])}, ${JSON.stringify(medium)})`;
          const evalRes = await send("Runtime.evaluate", {
            expression,
            returnByValue: true,
            awaitPromise: true,
          }, timeoutMs);

          if (evalRes.exceptionDetails) {
            throw new Error(evalRes.exceptionDetails.text || "Runtime.evaluate exception");
          }

          results.push({
            file: htmlFile,
            viewport: vp,
            runtimeErrors,
            audit: evalRes.result?.value || {
              overflowX: false,
              bodyFontPx: 16,
              visibleText: false,
              assertionFails: [],
              thumbnailDeadzoneCollisions: [],
              thumbnailHookScale: null,
              mascotCutout: null,
            },
            snapshotPath,
          });
        } finally {
          offEx();
        }
      }
    }
    return results;
  }, timeoutMs, { unsafeNoSandbox });
}

export async function captureHtmlFramesWithCdp({
  htmlFile,
  timestamps = [0],
  width = 1280,
  height = 720,
  outDir,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  unsafeNoSandbox = false,
}) {
  const resolvedOut = path.resolve(outDir);
  fs.mkdirSync(resolvedOut, { recursive: true });
  const fileUrl = pathToFileURL(path.resolve(htmlFile)).href;

  return withCdpSession(async ({ send, onceEvent }) => {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    }, timeoutMs);

    const loadPromise = onceEvent("Page.loadEventFired", timeoutMs);
    loadPromise.catch(() => {});
    const navRes = await send("Page.navigate", { url: fileUrl }, timeoutMs);
    if (navRes?.errorText) {
      throw new Error(`Navigation failed for ${fileUrl}: ${navRes.errorText}`);
    }
    await loadPromise;

    const hookCheck = await send("Runtime.evaluate", {
      expression: "(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; return typeof window.__d27Seek === 'function' || Boolean(window.__timelines); })()",
      returnByValue: true,
      awaitPromise: true,
    }, timeoutMs);
    if (!hookCheck?.result?.value) {
      throw new Error("HTML motion file does not expose window.__d27Seek(sec) or window.__timelines.");
    }

    const frames = [];
    for (let i = 0; i < timestamps.length; i++) {
      const t = Number(timestamps[i]);
      if (!Number.isFinite(t) || t < 0) {
        throw new Error(`Invalid beat timestamp: ${timestamps[i]}`);
      }
      const seekExpr = `(async () => {
        const t = ${JSON.stringify(t)};
        if (typeof window.__d27Seek === 'function') {
          await window.__d27Seek(t);
        } else if (window.__timelines) {
          Object.values(window.__timelines).forEach(tl => tl && tl.seek && tl.seek(t));
        }
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        return true;
      })()`;

      await send("Runtime.evaluate", {
        expression: seekExpr,
        returnByValue: true,
        awaitPromise: true,
      }, timeoutMs);

      const shot = await send("Page.captureScreenshot", { format: "png" }, timeoutMs);
      const fileName = `frame-${String(i).padStart(3, "0")}.png`;
      const outFile = path.join(resolvedOut, fileName);
      fs.writeFileSync(outFile, Buffer.from(shot.data, "base64"));
      frames.push({ index: i, timestamp: t, path: outFile });
    }

    return { outDir: resolvedOut, frames };
  }, timeoutMs, { unsafeNoSandbox });
}

export async function verifyHtmlDeterminismWithCdp({
  htmlFile,
  timestamps = [0, 1.2],
  width = 1280,
  height = 720,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  unsafeNoSandbox = false,
}) {
  const beats = [...timestamps].map(Number).sort((a, b) => a - b);
  if (beats.length === 0 || beats.some((n) => !Number.isFinite(n) || n < 0)) {
    throw new Error("timestamps must be non-negative finite numbers.");
  }
  const fileUrl = pathToFileURL(path.resolve(htmlFile)).href;

  return withCdpSession(async ({ send, onceEvent }) => {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    }, timeoutMs);

    const loadPromise = onceEvent("Page.loadEventFired", timeoutMs);
    loadPromise.catch(() => {});
    const navRes = await send("Page.navigate", { url: fileUrl }, timeoutMs);
    if (navRes?.errorText) {
      throw new Error(`Navigation failed for ${fileUrl}: ${navRes.errorText}`);
    }
    await loadPromise;

    const hookCheck = await send("Runtime.evaluate", {
      expression: "(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; return typeof window.__d27Seek === 'function' || Boolean(window.__timelines); })()",
      returnByValue: true,
      awaitPromise: true,
    }, timeoutMs);
    if (!hookCheck?.result?.value) {
      throw new Error("HTML motion file does not expose window.__d27Seek(sec) or window.__timelines.");
    }

    const seekAndHash = async (t) => {
      const seekExpr = `(async () => {
        const t = ${JSON.stringify(t)};
        if (typeof window.__d27Seek === 'function') {
          await window.__d27Seek(t);
        } else if (window.__timelines) {
          Object.values(window.__timelines).forEach(tl => tl && tl.seek && tl.seek(t));
        }
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        return true;
      })()`;
      await send("Runtime.evaluate", { expression: seekExpr, returnByValue: true, awaitPromise: true }, timeoutMs);
      const { data } = await send("Page.captureScreenshot", { format: "png", fromSurface: true }, timeoutMs);
      return crypto.createHash("sha256").update(data, "base64").digest("hex");
    };

    const forwardHashes = new Array(beats.length);
    for (let i = 0; i < beats.length; i++) {
      forwardHashes[i] = await seekAndHash(beats[i]);
    }

    // Break final-beat adjacency before descending reverse pass
    if (beats.length >= 2) await seekAndHash(beats[0]);

    const reverseHashes = new Array(beats.length);
    for (let i = beats.length - 1; i >= 0; i--) {
      reverseHashes[i] = await seekAndHash(beats[i]);
    }

    return {
      engine: "chrome-cdp",
      ...evaluateDeterminismHashes({ beats, forwardHashes, reverseHashes }),
    };
  }, timeoutMs, { unsafeNoSandbox });
}
