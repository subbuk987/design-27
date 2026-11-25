/**
 * Design 27 v4.0.0 — Pure 16x16 Mascot Negative-Space Cutout, Partial-Alpha Blur & Island Analyzer
 * Self-contained (zero outer closures/imports) so chrome-cdp.mjs can inject `.toString()`
 * into headless Chrome while evals/run-eval.mjs tests it deterministically in pure Node.
 */

export function analyzeCutoutBitmap(rgba, width = 16, height = 16, lumaThreshold = 200) {
  const total = width * height;
  const isLight = new Uint8Array(total);
  const visited = new Uint8Array(total);
  let darkPixels = 0;
  let nonZeroAlpha = 0;
  let partialAlpha = 0;

  for (let i = 0; i < total; i++) {
    const p = i * 4;
    const alphaRaw = rgba[p + 3];
    if (alphaRaw > 0) {
      nonZeroAlpha++;
      if (alphaRaw < 255) partialAlpha++;
    }
    const a = alphaRaw / 255;
    const luma = (0.2126 * rgba[p] + 0.7152 * rgba[p + 1] + 0.0722 * rgba[p + 2]) * a + 255 * (1 - a);
    if (luma > lumaThreshold) isLight[i] = 1;
    else darkPixels++;
  }

  // BFS from 4 border edges over light pixels to separate exterior background from interior cutouts
  const q = new Int32Array(total);
  let head = 0;
  let tail = 0;
  const push = (n) => {
    if (isLight[n] && !visited[n]) {
      visited[n] = 1;
      q[tail++] = n;
    }
  };

  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y++) {
    push(y * width);
    push(y * width + (width - 1));
  }

  while (head < tail) {
    const idx = q[head++];
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) push(idx - 1);
    if (x < width - 1) push(idx + 1);
    if (y > 0) push(idx - width);
    if (y < height - 1) push(idx + width);
  }

  let interiorCutoutPixels = 0;
  for (let i = 0; i < total; i++) {
    if (isLight[i] && !visited[i]) interiorCutoutPixels++;
  }

  // Count 8-connected significant dark-ink islands (ignoring 1px AA specks)
  const darkSeen = new Uint8Array(total);
  let inkComponents = 0;
  for (let i = 0; i < total; i++) {
    if (!isLight[i] && !darkSeen[i]) {
      let h = 0;
      let t = 0;
      let compPixels = 0;
      darkSeen[i] = 1;
      q[t++] = i;
      while (h < t) {
        const cur = q[h++];
        compPixels++;
        const cx = cur % width;
        const cy = (cur - cx) / width;
        for (let dy = -1; dy <= 1; dy++) {
          const ny = cy + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            if (nx < 0 || nx >= width) continue;
            const nb = ny * width + nx;
            if (!isLight[nb] && !darkSeen[nb]) {
              darkSeen[nb] = 1;
              q[t++] = nb;
            }
          }
        }
      }
      if (compPixels >= 2) inkComponents++;
    }
  }

  const inkCoverage = Number((darkPixels / total).toFixed(4));
  const partialAlphaRatio = nonZeroAlpha > 0 ? Number((partialAlpha / nonZeroAlpha).toFixed(4)) : 0;
  const collapsed =
    interiorCutoutPixels < 2 ||
    inkCoverage < 0.20 ||
    inkCoverage > 0.88 ||
    partialAlphaRatio > 0.80 ||
    inkComponents > 5;

  return { width, height, darkPixels, inkCoverage, interiorCutoutPixels, partialAlphaRatio, inkComponents, collapsed };
}
