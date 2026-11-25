#!/usr/bin/env node
// Sum tokens, cost and wall time from Claude Code subagent transcripts (JSONL).
// Usage: node evals/showcase/usage.mjs <label>=<a.jsonl>[,<nested.jsonl>...] ...
import fs from "node:fs";

// USD per 1M tokens, Anthropic first-party rates (claude-api skill, cached 2026-11-03).
// Cache write: 1.25x input (5m TTL), 2x input (1h TTL).
const PRICE = {
  "claude-sonnet-5-5": { in: 2, out: 10, read: 0.1 },
  "claude-opus-5-5": { in: 4, out: 20, read: 0.2 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5, read: 0.01 },
};

function tally(files) {
  const seen = new Set(), models = new Set();
  const t = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, first: Infinity, last: 0 };
  for (const f of files) {
    for (const line of fs.readFileSync(f, "utf8").split("\n")) {
      if (!line.trim()) continue;
      const o = JSON.parse(line);
      const ts = Date.parse(o.timestamp);
      if (ts) { t.first = Math.min(t.first, ts); t.last = Math.max(t.last, ts); }
      const m = o.message;
      // One API response is split across several JSONL lines that repeat the same usage.
      if (o.type !== "assistant" || !m?.usage || seen.has(m.id)) continue;
      seen.add(m.id);
      const u = m.usage, p = PRICE[m.model];
      if (!p) throw new Error(`no price for model ${m.model} in ${f}`);
      models.add(m.model);
      const w5 = u.cache_creation?.ephemeral_5m_input_tokens ?? u.cache_creation_input_tokens ?? 0;
      const w1 = u.cache_creation?.ephemeral_1h_input_tokens ?? 0;
      t.input += u.input_tokens; t.output += u.output_tokens;
      t.cacheRead += u.cache_read_input_tokens ?? 0; t.cacheWrite += w5 + w1;
      t.cost += (u.input_tokens * p.in + u.output_tokens * p.out + (u.cache_read_input_tokens ?? 0) * p.read
        + w5 * p.in * 1.25 + w1 * p.in * 2) / 1e6;
    }
  }
  return { ...t, models: [...models].join("+"), seconds: (t.last - t.first) / 1000, total: t.input + t.output + t.cacheRead + t.cacheWrite };
}

const rows = process.argv.slice(2).map(a => { const [label, list] = a.split("="); return { label, ...tally(list.split(",")) }; });
console.log("| Contender | Model | Wall time | Input | Output | Cache read | Cache write | Total tokens | Cost (USD) |");
console.log("|---|---|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) {
  const n = x => x.toLocaleString("en-US");
  console.log(`| \`${r.label}\` | ${r.models} | ${Math.floor(r.seconds / 60)}m ${Math.round(r.seconds % 60)}s | ${n(r.input)} | ${n(r.output)} | ${n(r.cacheRead)} | ${n(r.cacheWrite)} | ${n(r.total)} | $${r.cost.toFixed(2)} |`);
}
