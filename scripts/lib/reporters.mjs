/**
 * Design 27 v4.0.0 — Zero-Dependency SARIF 2.1.0 & GitHub Annotations Formatter
 */
import crypto from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function toSarifUri(absPath, workspaceRoot = process.cwd()) {
  const rel = path.relative(workspaceRoot, absPath);
  if (rel && !rel.startsWith("..") && !path.isAbsolute(rel)) {
    return rel.split(path.sep).join("/");
  }
  return pathToFileURL(absPath).href;
}

export function buildSarif({ version = "4.0.0", rules = [], findings = [], executionSuccessful = true, workspaceRoot }) {
  const ruleMap = new Map();
  for (const r of rules) {
    ruleMap.set(r.id, {
      id: r.id,
      shortDescription: { text: r.message || r.id },
      defaultConfiguration: { level: r.tier === "FLOOR" ? "error" : "warning" },
      properties: { tags: ["design27", r.tier.toLowerCase(), r.medium || "all"] },
    });
  }
  for (const f of findings) {
    if (!ruleMap.has(f.rule)) {
      ruleMap.set(f.rule, {
        id: f.rule,
        shortDescription: { text: f.message || f.rule },
        defaultConfiguration: { level: f.tier === "FLOOR" ? "error" : "warning" },
        properties: { tags: ["design27", (f.tier || "reflex").toLowerCase()] },
      });
    }
  }

  const results = findings.map((f) => {
    const absFile = path.isAbsolute(f.file) ? f.file : path.resolve(process.cwd(), f.file);
    const uri = toSarifUri(absFile, workspaceRoot);
    const location = {
      physicalLocation: {
        artifactLocation: { uri },
      },
    };
    if (f.line && f.line > 0) {
      location.physicalLocation.region = { startLine: f.line };
    }
    const fingerprint = crypto
      .createHash("sha256")
      .update(`${f.rule}:${uri}:${f.line || 1}:${f.message || ""}`)
      .digest("hex")
      .slice(0, 16);
    return {
      ruleId: f.rule,
      level: f.tier === "FLOOR" ? "error" : "warning",
      message: { text: f.fix ? `${f.message} Fix: ${f.fix}` : f.message },
      locations: [location],
      partialFingerprints: { primaryLocationLineHash: fingerprint },
    };
  });

  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "Design 27",
            version,
            rules: [...ruleMap.values()],
          },
        },
        invocations: [{ executionSuccessful }],
        results,
      },
    ],
  };
}
