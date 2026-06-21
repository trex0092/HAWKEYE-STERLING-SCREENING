// ── AI threat detection (prompt-injection / jailbreak heuristics) ────────────
// A static catalog of known LLM attack patterns plus a pure detector that scans
// untrusted input (e.g. an adverse-media headline that will be fed to the model)
// for them. This is the *input-side* counterpart to the output coercion in
// `coerce.ts`: coercion stops a bad model *output* reaching a compliance field;
// this flags a hostile *input* before it is sent. Code-only — no external feed,
// no network. Detection is advisory: callers decide whether to log, strip, or
// proceed; it never throws and never mutates input.

export type ThreatCategory =
  | "prompt-injection"
  | "jailbreak"
  | "instruction-override"
  | "data-exfiltration"
  | "encoding-evasion";

export type ThreatSeverity = "low" | "medium" | "high";

export interface ThreatPattern {
  category: ThreatCategory;
  severity: ThreatSeverity;
  pattern: RegExp;
}

export interface ThreatMatch {
  category: ThreatCategory;
  severity: ThreatSeverity;
  /** The matched substring (truncated) — for logging, not for re-execution. */
  evidence: string;
}

export interface ThreatScan {
  clean: boolean;
  matches: ThreatMatch[];
  highestSeverity: ThreatSeverity | "none";
}

// Catalog of attack signatures. Deliberately conservative to limit false
// positives on legitimate news headlines; tuned for the screening input path.
const CATALOG: ReadonlyArray<ThreatPattern> = [
  {
    category: "instruction-override",
    severity: "high",
    pattern: /ignore (all |the )?(previous|prior|above) (instructions|prompts?)/i,
  },
  {
    category: "instruction-override",
    severity: "high",
    pattern: /disregard (all |the )?(previous|prior|above|earlier)/i,
  },
  {
    category: "prompt-injection",
    severity: "high",
    pattern: /system prompt|developer message|\bsystem:\s/i,
  },
  {
    category: "prompt-injection",
    severity: "medium",
    pattern: /you are now|from now on,? (you|act)/i,
  },
  { category: "prompt-injection", severity: "medium", pattern: /new instructions:/i },
  { category: "jailbreak", severity: "high", pattern: /\bDAN\b|do anything now|jailbreak/i },
  {
    category: "jailbreak",
    severity: "medium",
    pattern: /pretend (you are|to be)|act as if|roleplay as/i,
  },
  {
    category: "instruction-override",
    severity: "medium",
    pattern: /override (your|the) (rules|guidelines|safety)/i,
  },
  {
    category: "data-exfiltration",
    severity: "high",
    pattern: /reveal (your|the) (system )?(prompt|instructions|api key|secret)/i,
  },
  {
    category: "data-exfiltration",
    severity: "medium",
    pattern: /print (your|the) (instructions|configuration|env)/i,
  },
  { category: "encoding-evasion", severity: "low", pattern: /base64|rot13|\\u00[0-9a-f]{2}/i },
];

const RANK: Record<ThreatSeverity, number> = { low: 1, medium: 2, high: 3 };

/** Scan untrusted text for known AI attack patterns. Empty/non-string → clean. */
export function detectThreats(text: string): ThreatScan {
  const v = typeof text === "string" ? text : "";
  const matches: ThreatMatch[] = [];
  for (const sig of CATALOG) {
    const m = sig.pattern.exec(v);
    if (m) {
      matches.push({
        category: sig.category,
        severity: sig.severity,
        evidence: m[0].slice(0, 80),
      });
    }
  }
  const highest = matches.reduce<ThreatSeverity | "none">((acc, m) => {
    if (acc === "none") return m.severity;
    return RANK[m.severity] > RANK[acc] ? m.severity : acc;
  }, "none");
  return { clean: matches.length === 0, matches, highestSeverity: highest };
}
