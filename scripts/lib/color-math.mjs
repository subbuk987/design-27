/**
 * Design 27 v4.0.0 — Pure-JS WCAG 2.1 Contrast, APCA 0.0.98G-4g Perceptual Contrast, OKLCH & Suggested-Color Math
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
 * Polarity-aware APCA 0.0.98G-4g Lightness Contrast (Lc); matches apca-w3@0.1.9 within rounding.
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

/** sRGB [r,g,b] 0-255 -> OKLCH { L, C, H } (Björn Ottosson's Oklab matrices). */
export function rgbToOklch([r, g, b]) {
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const H = C < 1e-4 ? 0 : (Math.atan2(B, A) * 180) / Math.PI;
  return { L, C, H: H < 0 ? H + 360 : H };
}

/** OKLCH -> unclamped sRGB [r,g,b] 0-255 (values outside 0-255 mean out of gamut). */
export function oklchToRgb({ L, C, H }) {
  const hr = (H * Math.PI) / 180;
  const A = C * Math.cos(hr), B = C * Math.sin(hr);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const enc = (v) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055);
  return [
    enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    enc(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -0.5 && v <= 255.5);

/** Largest in-gamut sRGB chroma at this OKLCH lightness + hue (binary search). */
export function maxChroma(L, H) {
  let lo = 0, hi = 0.5;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToRgb({ L, C: mid, H }))) lo = mid; else hi = mid;
  }
  return lo;
}

/** Chroma as a share of what sRGB allows at that L and H (0-1): comparable across hues, unlike raw C. */
export function relativeChroma(rgb) {
  const { L, C, H } = rgbToOklch(rgb);
  const max = maxChroma(L, H);
  return max > 1e-4 ? Math.min(1, C / max) : 0;
}

/** Parse a CSS colour token value: #rgb/#rrggbb, oklch(L[%] C[%] H), rgb()/rgba(). Returns [r,g,b] 0-255 or null. */
export function parseCssColor(value) {
  if (typeof value !== "string") return null;
  const v = value.trim();
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})\b/i);
  if (hex) return parseHex(hex[0]);
  const ok = v.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+([\d.]+)(?:deg)?/i);
  if (ok) {
    const L = Number(ok[1]) / (ok[2] ? 100 : 1);
    const C = ok[4] ? (Number(ok[3]) / 100) * 0.4 : Number(ok[3]);
    return oklchToRgb({ L, C, H: Number(ok[5]) }).map((x) => Math.max(0, Math.min(255, x)));
  }
  const rgb = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])].map((x) => Math.max(0, Math.min(255, x)));
  return null;
}

/** OKLCH chroma of a CSS colour value (reads oklch() C directly, percent = share of 0.4). */
export function cssChroma(value) {
  const ok = typeof value === "string" && value.trim().match(/^oklch\(\s*[\d.]+%?\s+([\d.]+)(%?)/i);
  if (ok) return ok[2] ? (Number(ok[1]) / 100) * 0.4 : Number(ok[1]);
  const rgb = parseCssColor(value);
  return rgb ? rgbToOklch(rgb).C : null;
}

export function rgbToHex([r, g, b]) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Smallest OKLCH-lightness move that makes fg pass BOTH WCAG `minRatio` and APCA |Lc| >= `minLc` on bg.
 * Hue is kept; chroma is reduced only when the new lightness pushes it out of sRGB gamut.
 * Returns null when no lightness passes: the canvas itself must change.
 */
export function suggestContrastingHex(fg, bg, minRatio = 4.5, minLc = 0) {
  const { L: L0, C, H } = rgbToOklch(fg);
  const at = (L) => {
    const c = Math.min(C, maxChroma(L, H));
    return oklchToRgb({ L, C: c, H }).map((x) => Math.max(0, Math.min(255, Math.round(x))));
  };
  const passes = (rgb) => contrastRatio(rgb, bg) >= minRatio && Math.abs(computeApcaLc(rgb, bg)) >= minLc;
  let best = null;
  for (const target of [0, 1]) {
    if (!passes(at(target))) continue;
    let near = L0, far = target;
    for (let i = 0; i < 24; i++) {
      const mid = (near + far) / 2;
      if (passes(at(mid))) far = mid; else near = mid;
    }
    if (!best || Math.abs(far - L0) < best.dist) best = { dist: Math.abs(far - L0), rgb: at(far) };
  }
  return best ? rgbToHex(best.rgb) : null;
}
