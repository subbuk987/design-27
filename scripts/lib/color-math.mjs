/**
 * Design 27 v4.0.0 — Pure-JS WCAG 2.1 Contrast & Suggested-Color Math
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
