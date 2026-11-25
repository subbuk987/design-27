/**
 * Design 27 v4.0.0 — Book Prose, Quantitative Sentence Burstiness (Desaire/Kobak) & Balanced-Paren Typst Audit
 */

function preserveLines(block) {
  return block.replace(/[^\r\n]/g, " ");
}

function maskHtmlNonProse(html) {
  return html
    .replace(/<(head|style|script|code|pre)\b[\s\S]*?<\/\1>/gi, preserveLines)
    .replace(/<!--[\s\S]*?-->/g, preserveLines);
}

function maskMarkdownNonProse(md) {
  let out = md;
  out = out.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/, preserveLines);
  out = out.replace(/```[\s\S]*?```/g, preserveLines);
  out = out.replace(/<!--[\s\S]*?-->/g, preserveLines);
  out = out.replace(/`[^`\r\n]+`/g, (m) => " ".repeat(m.length));
  out = out.replace(/^[ \t]*>.*$/gm, (m) => " ".repeat(m.length));
  return out;
}

function extractBalancedParBlocks(content) {
  const blocks = [];
  const startRe = /#set\s+par\s*\(/gi;
  let m;
  while ((m = startRe.exec(content)) !== null) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < content.length && depth > 0) {
      if (content[i] === "(") depth += 1;
      else if (content[i] === ")") depth -= 1;
      i += 1;
    }
    if (depth === 0) {
      blocks.push({ index: m.index, body: content.slice(m.index + m[0].length, i - 1) });
    }
  }
  return blocks;
}

const ABBREV_RE = /\b(?:e\.g|i\.e|etc|vs|Fig|Eq|Sec|Ch|Dr|Mr|Mrs|Ms|Prof|Sr|Jr|St|Inc|Ltd|Co|No|Vol)\./gi;
const VERSION_DOT_RE = /\b(v?\d+)\.(\d+(?:\.\d+)*)\b/gi;
const sentenceSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("en", { granularity: "sentence" })
    : null;

function maskAbbreviations(text) {
  return text
    .replace(ABBREV_RE, (m) => m.slice(0, -1) + "\u2024")
    .replace(VERSION_DOT_RE, (m) => m.replace(/\./g, "\u2024"));
}

function splitSentences(text) {
  const masked = maskAbbreviations(text);
  if (sentenceSegmenter) {
    return [...sentenceSegmenter.segment(masked)].map((s) => s.segment.trim()).filter(Boolean);
  }
  return masked
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Pure sentence-length burstiness analyzer (Desaire et al., 2023):
 * Computes coefficient of variation (CV = sigma / mu), 15-28w AI-cluster share, and short-strike count.
 */
export function computeBurstiness(paragraphs) {
  const lengths = [];
  for (const p of paragraphs) {
    if (p.nonNarrative) continue;
    const sentences = splitSentences(p.text);
    for (const s of sentences) {
      const words = s.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w));
      if (words.length >= 1) lengths.push(words.length);
    }
  }
  if (lengths.length < 10) {
    return { sentenceCount: lengths.length, mean: 0, sd: 0, cv: 1, aiBandShare: 0, shortStrikes: 0, metronomic: false };
  }
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
  const sd = Math.sqrt(variance);
  const cv = mean > 0 ? sd / mean : 0;
  const aiBandCount = lengths.filter((n) => n >= 15 && n <= 28).length;
  const aiBandShare = aiBandCount / lengths.length;
  const shortStrikes = lengths.filter((n) => n <= 10).length;
  const metronomic = cv < 0.35 || (aiBandShare > 0.75 && shortStrikes === 0);
  return {
    sentenceCount: lengths.length,
    mean: Number(mean.toFixed(2)),
    sd: Number(sd.toFixed(2)),
    cv: Number(cv.toFixed(3)),
    aiBandShare: Number(aiBandShare.toFixed(3)),
    shortStrikes,
    metronomic,
  };
}

export function auditTypstParagraphs({ content, rel, directives, recordFinding, lineNumberAt }) {
  for (const block of extractBalancedParBlocks(content)) {
    const argsStr = block.body;
    const indentMatch = argsStr.match(/first-line-indent\s*:\s*(?:\([^)]*amount\s*:\s*)?([0-9.]+)\s*(pt|em|mm|cm|in|%)?/i);
    const spacingMatch = argsStr.match(/spacing\s*:\s*([0-9.]+)\s*(pt|em|mm|cm|in|%)?/i);
    const leadingMatch = argsStr.match(/leading\s*:\s*([0-9.]+)\s*(pt|em|mm|cm|in|%)?/i);
    if (indentMatch && parseFloat(indentMatch[1]) > 0 && spacingMatch && parseFloat(spacingMatch[1]) > 0) {
      const sp = parseFloat(spacingMatch[1]);
      const ld = leadingMatch ? parseFloat(leadingMatch[1]) : 0;
      if (!leadingMatch || sp > ld * 1.25) {
        recordFinding({
          file: rel, line: lineNumberAt(content, block.index), tier: "FLOOR", rule: "no-double-signaled-paragraphs",
          message: "Typst `#set par(...)` combines positive `first-line-indent` with positive paragraph `spacing`.",
          fix: "Either set `first-line-indent: 0pt` when using vertical `spacing`, or match `spacing` to `leading`.",
        }, directives);
      }
    }
  }
}

export function auditBookProse({ content, ext, rel, effectiveMedium, directives, recordFinding }) {
  const isHtml = [".html", ".htm"].includes(ext);
  const proseSource = isHtml ? maskHtmlNonProse(content) : maskMarkdownNonProse(content);
  const proseLines = proseSource.split(/\r?\n/);

  // Kobak et al. (2025, Science Advances) high-ratio excess style markers + filler verbs
  const strictSlopRe = /\b(delve|delves|delving|tapestry|testament|pivotal|realm|vibrant|intricate|intricacies|multifaceted|overarching|garner|showcase|showcasing|leverage|embark|spearhead|meticulous|meticulously|unveil|bolster)\b/gi;
  const domainWarnRe = /\b(underscore|underscores|underscoring|landscape|beacon|foster)\b/gi;
  const negParallelRe = /\b(?:it(?:'s| is)\s+not\s+just\b[^.!?\n]{1,120}[—–-]+\s*it(?:'s| is)\b|\bnot\s+(?:just|merely|simply|only)\b[^.!?\n]{1,120},\s*but(?:\s+also)?\b)/i;
  const throatOpenerRe = /^(?:Moreover,|Furthermore,|Additionally,|Crucially,|Interestingly,|In conclusion,|It is worth noting\b|In today's rapidly evolving\b|It(?:'s| is) important to remember\b|When it comes to\b)/i;

  let strictHits = 0;
  const strictMatches = [];
  const domainMatches = [];

  const paragraphs = [];
  let curPara = null;
  proseLines.forEach((rawLine, idx) => {
    const textLine = isHtml ? rawLine.replace(/<[^>]+>/g, " ").trim() : rawLine.trim();
    const lineNum = idx + 1;
    const isMdStructural =
      !isHtml &&
      (/^#+\s/.test(textLine) ||
        /^(?:[-*+]\s+|\d+\.\s+)/.test(textLine) ||
        /^\|/.test(textLine) ||
        /^(?:[-*_]\s*){3,}$/.test(textLine));
    if (!textLine) {
      if (curPara) { paragraphs.push(curPara); curPara = null; }
      return;
    }

    const sHits = textLine.match(strictSlopRe);
    if (sHits) {
      strictHits += sHits.length;
      strictMatches.push({ lineNum, words: [...new Set(sHits.map((w) => w.toLowerCase()))] });
    }
    const dHits = textLine.match(domainWarnRe);
    if (dHits) {
      domainMatches.push({ lineNum, words: [...new Set(dHits.map((w) => w.toLowerCase()))] });
    }

    if (isMdStructural) {
      if (curPara) { paragraphs.push(curPara); curPara = null; }
      return;
    }

    if (isHtml && /<p\b/i.test(rawLine)) {
      if (curPara) paragraphs.push(curPara);
      curPara = { startLine: lineNum, text: textLine };
    } else if (!curPara) {
      curPara = { startLine: lineNum, text: textLine };
    } else {
      curPara.text += " " + textLine;
    }
  });
  if (curPara) paragraphs.push(curPara);

  for (const para of paragraphs) {
    if (negParallelRe.test(para.text)) {
      recordFinding({
        file: rel, line: para.startLine, tier: "REFLEX", rule: "no-negative-parallelism-tic",
        message: "Detected AI negative parallelism prose tic (`not just X — it's Y` / `not merely X, but Y`).",
        fix: "Rewrite as a direct affirmative statement.",
      }, directives);
    }
    if (throatOpenerRe.test(para.text)) {
      recordFinding({
        file: rel, line: para.startLine, tier: "REFLEX", rule: "no-throat-clearing-opener",
        message: "Paragraph opens with AI throat-clearing filler (`Moreover,`, `Furthermore,`, `In conclusion,`, `It is worth noting`, `In today's rapidly evolving`).",
        fix: "Delete the transition opener and start directly with the subject.",
      }, directives);
    }
    const emDashCount = (para.text.match(/—/g) || []).length;
    if (emDashCount > 2) {
      recordFinding({
        file: rel, line: para.startLine, tier: "REFLEX", rule: "no-em-dash-overload",
        message: `Paragraph uses ${emDashCount} em-dashes (ceiling is <= 2 per paragraph).`,
        fix: "Replace excess em-dashes with full stops, colons, or parentheses.",
      }, directives);
    }
  }

  // Quantitative burstiness check (Desaire et al., 2023) on chapters with >= 10 sentences
  const burst = computeBurstiness(paragraphs);
  if (burst.metronomic) {
    recordFinding({
      file: rel, line: paragraphs[0]?.startLine || 1, tier: "REFLEX", rule: "low-sentence-burstiness",
      message: `Metronomic prose cadence across ${burst.sentenceCount} sentences (CV=${burst.cv}, ${Math.round(burst.aiBandShare * 100)}% in 15–28w band, ${burst.shortStrikes} short strikes).`,
      fix: "Alternate short declarative strikes (5–10 words) with analytical clauses (22–35 words).",
    }, directives);
  }

  if (strictHits > 0) {
    const slopTier = effectiveMedium === "book" && strictHits >= 2 ? "FLOOR" : "REFLEX";
    for (const sm of strictMatches) {
      recordFinding({
        file: rel, line: sm.lineNum, tier: slopTier, rule: "no-ai-slop-vocabulary",
        message: `Detected AI cliché vocabulary (${sm.words.join(", ")}) [${strictHits} strict hit(s) in file].`,
        fix: "Replace generic AI vocabulary with concrete domain verbs and specific nouns.",
      }, directives);
    }
  }
  for (const dm of domainMatches) {
    recordFinding({
      file: rel, line: dm.lineNum, tier: "REFLEX", rule: "no-ai-slop-vocabulary",
      message: `Potential metaphorical AI vocabulary (${dm.words.join(", ")}) — keep only if literal domain terminology.`,
      fix: "Replace if used metaphorically, or add a targeted inline waiver if literal technical usage.",
    }, directives);
  }
}
