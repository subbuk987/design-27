/**
 * Design 27 v4.0.0 — Pure 16x16 Mascot Negative-Space Cutout Bitmap Analyzer
 * Self-contained (zero outer closures/imports) so chrome-cdp.mjs can inject `.toString()`
 * into headless Chrome while evals/run-eval.mjs tests it deterministically in pure Node.
 */

export function analyzeCutoutBitmap(rgba, width = 16, height = 16, lumaThreshold = 200) {
  const total = width * height;
  const isLight = new Uint8Array(total);
  const visited = new Uint8Array(total);
  let darkPixels = 0;

  for (let i = 0; i < total; i++) {
    const p = i * 4;
    const a = rgba[p + 3] / 255;
    const luma = (0.2126 * rgba[p] + 0.7152 * rgba[p + 1] + 0.0722 * rgba[p + 2]) * a + 255 * (1 - a);
    if (luma > lumaThreshold) isLight[i] = 1;
    else darkPixels++;
  }

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

  const inkCoverage = Number((darkPixels / total).toFixed(4));
  const collapsed = interiorCutoutPixels < 2 || inkCoverage < 0.20 || inkCoverage > 0.88;
  return { width, height, darkPixels, inkCoverage, interiorCutoutPixels, collapsed };
}
