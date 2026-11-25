/**
 * Design 27 v4.0.0 — Linear Comment-Only Inline Disable & Scoped Opt-Out Waiver Parser
 * Supports: d27-disable, d27-disable-next-line, d27-disable-line, d27-allow, and data-d27-allow="..."
 * Security: linear-time parsing (no ReDoS), comment-only extraction (no string-literal spoofing),
 *           and blanket `all` waivers can NEVER suppress unwaivable Tier 1 FLOOR rules.
 */

const MAX_DIRECTIVE_LINE_LEN = 512;
const KIND_PREFIX_RE = /^(d27-(?:disable-next-line|disable-line|allow-next-line|allow-line|ignore-next-line|ignore-line|disable|allow|ignore))(?:\s*:\s*|\s+)(.+)$/i;

function extractCommentBody(line) {
  // Block comment /* ... */
  const blockIdx = line.indexOf("/*");
  if (blockIdx !== -1) {
    const endIdx = line.indexOf("*/", blockIdx + 2);
    const body = endIdx !== -1 ? line.slice(blockIdx + 2, endIdx) : line.slice(blockIdx + 2);
    if (body.toLowerCase().includes("d27-")) return body.trim();
  }
  // HTML comment <!-- ... -->
  const htmlIdx = line.indexOf("<!--");
  if (htmlIdx !== -1) {
    const endIdx = line.indexOf("-->", htmlIdx + 4);
    const body = endIdx !== -1 ? line.slice(htmlIdx + 4, endIdx) : line.slice(htmlIdx + 4);
    if (body.toLowerCase().includes("d27-")) return body.trim();
  }
  // Line comment // ... (ensure not inside http:// or https://)
  const slashIdx = line.indexOf("//");
  if (slashIdx !== -1 && (slashIdx === 0 || line[slashIdx - 1] !== ":")) {
    const body = line.slice(slashIdx + 2);
    if (body.toLowerCase().includes("d27-")) return body.trim();
  }
  return null;
}

export function parseIgnores(content) {
  const lines = content.split(/\r?\n/);
  const directives = [];

  lines.forEach((line, idx) => {
    if (line.length > MAX_DIRECTIVE_LINE_LEN || !line.toLowerCase().includes("d27-")) return;
    const commentBody = extractCommentBody(line);
    if (!commentBody) return;

    const d27Pos = commentBody.toLowerCase().indexOf("d27-");
    const slice = commentBody.slice(d27Pos).trim();
    const match = slice.match(KIND_PREFIX_RE);
    if (!match) return;

    const kind = match[1].toLowerCase();
    const rest = match[2].trim();

    // Split rules from optional reason (` — reason`, ` -- reason`, ` - reason`)
    let rulesPart = rest;
    let reason = "";
    const sepMatch = rest.match(/\s+(?:—|--|-)\s+/);
    if (sepMatch) {
      rulesPart = rest.slice(0, sepMatch.index).trim();
      reason = rest.slice(sepMatch.index + sepMatch[0].length).trim();
    }

    const rules = rulesPart
      .split(/[\s,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^[a-z0-9_/-]+$/.test(s));
    if (rules.length === 0) return;

    const lineNum = idx + 1;
    let targetLine = null;
    if (kind.endsWith("-line") && !kind.endsWith("-next-line")) {
      targetLine = lineNum;
    } else if (kind.endsWith("-next-line")) {
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

export function matchIgnore(directives, ruleId, lineNum, tier = "REFLEX") {
  const id = ruleId.toLowerCase();
  for (const d of directives) {
    const explicitMatch = d.rules.has(id);
    const wildcardMatch = d.rules.has("all");
    // Blanket `all` waivers cannot silence unwaivable Tier 1 FLOOR rules
    if (!explicitMatch && !(wildcardMatch && tier !== "FLOOR")) continue;
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
