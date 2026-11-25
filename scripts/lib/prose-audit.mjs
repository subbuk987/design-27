/**
 * Design 27 v4.0.0 — Book Prose & Balanced-Paren Typst Paragraph Audit
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
  // Mask YAML frontmatter at top of file
  out = out.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/, preserveLines);
  // Mask fenced code blocks
  out = out.replace(/```[\s\S]*?```/g, preserveLines);
  // Mask HTML comments
  out = out.replace(/<!--[\s\S]*?-->/g, preserveLines);
  // Mask inline code spans (`...`)
  out = out.replace(/`[^`\r\n]+`/g, (m) => " ".repeat(m.length));
  // Mask Markdown blockquotes (direct quotes shouldn't trip AI-prose checks)
  out = out.replace(/^[ \t]*>.*$/gm, (m) => " ".repeat(m.length));
  return out;
}

/**
 * Balanced-parenthesis extractor for Typst `#set par(...)` so nested values like
 * `first-line-indent: (amount: 1.4em, all: false)` parse accurately without truncating.
 */
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

export function auditTypstParagraphs({ content, rel, directives, recordFinding, lineNumberAt }) {
  for (const block of extractBalancedParBlocks(content)) {
    const argsStr = block.body;
    // Matches both `first-line-indent: 1.4em` and Typst 0.13+ `first-line-indent: (amount: 1.4em, all: false)`
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

  const strictSlopRe = /\b(delve|delves|delving|tapestry|testament|pivotal|realm|vibrant|intricate|multifaceted|overarching|garner|showcase|leverage|embark|spearhead)\b/gi;
  const domainWarnRe = /\b(underscore|underscores|underscoring|landscape|beacon|foster)\b/gi;
  const negParallelRe = /\b(?:it(?:'s| is)\s+not\s+just\b[^.!?\n]{1,120}[—–-]+\s*it(?:'s| is)\b|\bnot\s+(?:just|merely|simply|only)\b[^.!?\n]{1,120},\s*but(?:\s+also)?\b)/i;
  const throatOpenerRe = /^(?:Moreover,|Furthermore,|Additionally,|Crucially,|Interestingly,|In conclusion,|It is worth noting\b|In today's rapidly evolving\b|It(?:'s| is) important to remember\b|When it comes to\b)/i;

  let strictHits = 0;
  const strictMatches = [];
  const domainMatches = [];

  // Build normalized paragraphs (preserving starting line numbers) so wrapped Markdown lines don't evade checks
  const paragraphs = [];
  let curPara = null;
  proseLines.forEach((rawLine, idx) => {
    const textLine = isHtml ? rawLine.replace(/<[^>]+>/g, " ").trim() : rawLine.trim();
    const lineNum = idx + 1;
    if (!textLine || (!isHtml && /^#+\s/.test(textLine))) {
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
