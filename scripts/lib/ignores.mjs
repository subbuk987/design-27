/**
 * Design 27 — Inline Disable & Scoped Opt-Out Waiver Parser
 * Supports: d27-disable, d27-disable-next-line, d27-disable-line, d27-allow, and data-d27-allow="..."
 */

const DIRECTIVE_RE = /\b(d27-disable(?:-next-line|-line)?|d27-allow)\s*:\s*([a-z0-9_,\s-]+?)(?:\s*(?:—|--|-|:)\s*([^*/<>]+?))?(?:\s*(?:\*\/|-->|$))/i;

export function parseIgnores(content) {
  const lines = content.split(/\r?\n/);
  const directives = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const match = line.match(DIRECTIVE_RE);
    if (!match) return;
    const kind = match[1].toLowerCase();
    const rules = match[2]
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const reason = (match[3] || "").trim();

    let targetLine = null;
    if (kind === "d27-disable-line") targetLine = lineNum;
    else if (kind === "d27-disable-next-line") {
      let next = lineNum + 1;
      while (next <= lines.length && lines[next - 1].trim() === "") next++;
      targetLine = next;
    }

    directives.push({
      kind,
      rules: new Set(rules),
      reason,
      line: lineNum,
      targetLine, // null means whole-file
      hitCount: 0,
    });
  });

  return directives;
}

export function matchIgnore(directives, ruleId, lineNum) {
  const id = ruleId.toLowerCase();
  for (const d of directives) {
    const ruleMatch = d.rules.has(id) || d.rules.has("all");
    if (!ruleMatch) continue;
    if (d.targetLine === null || d.targetLine === lineNum) {
      d.hitCount += 1;
      return d;
    }
  }
  return null;
}

export function getUnusedIgnores(directives, relFile) {
  return directives
    .filter((d) => d.hitCount === 0)
    .map((d) => ({
      file: relFile,
      line: d.line,
      tier: "REFLEX",
      rule: "d27/unused-ignore",
      message: `Inline directive \`${d.kind}: ${[...d.rules].join(", ")}\` suppressed zero findings.`,
      fix: "Remove the stale inline ignore comment so future regressions are not silently swallowed.",
    }));
}
