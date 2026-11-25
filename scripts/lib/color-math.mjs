/**
 * Design 27 v4.0.0 — Pure-JS WCAG 2.1 Contrast, APCA 0.98G-4g-W3 Perceptual Contrast & Suggested-Color Math
 */

export function parseHex(hex) {
  if (typeof hex !== "string") return null;
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function relLuminance([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrastRatio(c1, c2) {
  const l1 = relLuminance(c1);
  const l2 = relLuminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Polarity-aware APCA 0.98G-4g-W3 Lightness Contrast (Lc).
 * Positive Lc = dark text on light background; negative Lc = light text on dark background.
 */
export function computeApcaLc(textRgb, bgRgb) {
  const toY = ([r, g, b]) => {
    const y =
      0.2126729 * Math.pow(r / 255, 2.4) +
      0.7151522 * Math.pow(g / 255, 2.4) +
      0.0721750 * Math.pow(b / 255, 2.4);
    return y < 0.022 ? y + Math.pow(0.022 - y, 1.414) : y;
  };
  const yTxt = toY(textRgb);
  const yBg = toY(bgRgb);
  if (Math.abs(yBg - yTxt) < 0.0005) return 0;

  let sapc = 0;
  let out = 0;
  if (yBg > yTxt) {
    sapc = (Math.pow(yBg, 0.56) - Math.pow(yTxt, 0.57)) * 1.14;
    out = sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  } else {
    sapc = (Math.pow(yBg, 0.65) - Math.pow(yTxt, 0.62)) * 1.14;
    out = sapc > -0.1 ? 0 : (sapc + 0.027) * 100;
  }
  return Number(out.toFixed(1));
}

export function rgbToHex([r, g, b]) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function suggestContrastingHex(fg, bg, minRatio = 4.5) {
  const bgLum = relLuminance(bg);
  const darken = bgLum > 0.4;
  for (let step = 1; step <= 20; step++) {
    const factor = step / 20;
    const cand = fg.map((v) => (darken ? v * (1 - factor) : v + (255 - v) * factor));
    if (contrastRatio(cand, bg) >= minRatio) return rgbToHex(cand);
  }
  return darken ? "#111214" : "#F7F7F5";
}
