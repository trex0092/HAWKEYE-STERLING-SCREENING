// ── LLM output coercion (pure, untrusted-input guardrails) ───────────────────
// The model's free-text output is never trusted. These pure functions coerce a
// raw, already-JSON-parsed value into a safe typed shape — a `decision` outside
// the allowed set or an out-of-range `score` must never reach a typed compliance
// field. Extracted from the Anthropic helpers so the guardrails can be unit-
// tested offline (no API key, no network) and red-teamed directly.

export interface MediaClassification {
  sentiment: "negative" | "positive" | "neutral";
  category: string;
}

export interface ScreeningReasoning {
  summary: string;
  decision: "clear" | "review" | "escalate" | "block";
  score: number;
  factors: string[];
}

const DECISIONS: ReadonlyArray<ScreeningReasoning["decision"]> = [
  "clear",
  "review",
  "escalate",
  "block",
];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Coerce a parsed media classification. Sentiment falls back to the most
 * cautious label ("negative") when not an explicit positive/neutral; category
 * is forced to a non-empty string. Returns null for non-object input.
 */
export function coerceClassification(parsed: unknown): MediaClassification | null {
  if (!isObject(parsed)) return null;
  const sentiment =
    parsed.sentiment === "positive" || parsed.sentiment === "neutral"
      ? parsed.sentiment
      : "negative";
  const category =
    typeof parsed.category === "string" && parsed.category.trim() ? parsed.category : "News";
  return { sentiment, category };
}

/**
 * Coerce a parsed screening rationale. `decision` is forced onto the whitelist
 * (defaulting to the cautious "review"); `score` is rounded and clamped to
 * 0–100; free-text fields are stringified. Returns null for non-object input.
 */
export function coerceReasoning(parsed: unknown): ScreeningReasoning | null {
  if (!isObject(parsed)) return null;
  const decision = DECISIONS.includes(parsed.decision as ScreeningReasoning["decision"])
    ? (parsed.decision as ScreeningReasoning["decision"])
    : "review";
  const rawScore = parsed.score;
  const score =
    typeof rawScore === "number" && Number.isFinite(rawScore)
      ? Math.max(0, Math.min(100, Math.round(rawScore)))
      : 0;
  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : String(parsed.summary ?? ""),
    decision,
    score,
    factors: Array.isArray(parsed.factors) ? parsed.factors.map((f) => String(f)) : [],
  };
}
