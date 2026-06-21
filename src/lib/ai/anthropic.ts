// ── Anthropic (Claude) helper ────────────────────────────────────────────────
// Optional AI enrichment for the screening console. Activates only when
// ANTHROPIC_API_KEY is present; every helper returns null when the client is
// unavailable or the call fails, so callers fall back to deterministic logic.
//
// Model: claude-opus-4-8 (Anthropic's current Opus-tier model). Short, cheap
// calls — no sampling params, no thinking budget (removed on this model).

import Anthropic from "@anthropic-ai/sdk";
import {
  coerceClassification,
  coerceReasoning,
  type MediaClassification,
  type ScreeningReasoning,
} from "./coerce";
import { hashText, recordLlmCall } from "./llm-log";
import { detectThreats } from "../threat";

/**
 * Scan untrusted input headed for the model for prompt-injection / jailbreak
 * patterns. Advisory: we record a TRACE entry so a flagged input is visible in
 * the call log, then let coercion guard the output. Never throws.
 */
function recordThreatScan(task: string, model: string, promptHash: string, text: string): void {
  const scan = detectThreats(text);
  if (!scan.clean) {
    recordLlmCall({ task: `threat:${task}`, model, promptHash, outcome: "rejected", ms: 0 });
  }
}

// Re-export the coerced output types so existing importers stay stable.
export type { MediaClassification, ScreeningReasoning };

let cached: Anthropic | null | undefined;

export function getAnthropic(): Anthropic | null {
  if (cached !== undefined) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  cached = apiKey ? new Anthropic({ apiKey }) : null;
  return cached;
}

export function anthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const MODEL = "claude-opus-4-8";

/** Pull the first text block out of a Claude response, or null. */
function firstText(res: Anthropic.Message): string | null {
  if ((res.stop_reason as string) === "refusal") return null;
  for (const block of res.content) {
    if (block.type === "text") return block.text;
  }
  return null;
}

function safeJson<T>(text: string | null): T | null {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/** Classify a news headline's sentiment + a short category for a subject. */
export async function classifyAdverseMedia(
  headline: string,
  subject: string,
): Promise<MediaClassification | null> {
  const client = getAnthropic();
  if (!client) return null;
  const started = Date.now();
  const promptHash = hashText(`${subject}\n${headline}`);
  recordThreatScan("classifyAdverseMedia", MODEL, promptHash, headline);
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system:
        "You are a financial-crime adverse-media analyst. For a news headline about a screened subject, " +
        'return ONLY compact JSON: {"sentiment":"negative|positive|neutral","category":"<2-3 word category>"}.',
      messages: [{ role: "user", content: `Subject: ${subject}\nHeadline: ${headline}` }],
    });
    const parsed = coerceClassification(safeJson(firstText(res)));
    recordLlmCall({
      task: "classifyAdverseMedia",
      model: MODEL,
      promptHash,
      outcome: parsed ? "ok" : "rejected",
      ms: Date.now() - started,
    });
    return parsed;
  } catch {
    recordLlmCall({
      task: "classifyAdverseMedia",
      model: MODEL,
      promptHash,
      outcome: "error",
      ms: Date.now() - started,
    });
    return null;
  }
}

/** Produce a short compliance screening rationale for a subject + its hits. */
export async function screeningReasoning(
  subject: { name: string; country?: string; riskScore?: number; lists?: string[] },
  hits: string[],
): Promise<ScreeningReasoning | null> {
  const client = getAnthropic();
  if (!client) return null;
  const started = Date.now();
  const content = `Subject: ${subject.name}\nCountry: ${subject.country ?? "?"}\nRisk: ${
    subject.riskScore ?? "?"
  }\nLists: ${(subject.lists ?? []).join(", ") || "none"}\nHits: ${hits.join("; ") || "none"}`;
  const promptHash = hashText(content);
  recordThreatScan("screeningReasoning", MODEL, promptHash, content);
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system:
        "You are an AML/sanctions screening analyst. Given a subject and its watchlist hits, return ONLY " +
        'compact JSON: {"summary":"<one sentence>","decision":"clear|review|escalate|block",' +
        '"score":<0-100>,"factors":["<short factor>", ...]}.',
      messages: [{ role: "user", content }],
    });
    // The model's free-text fields are untrusted; coerceReasoning forces the
    // decision onto a whitelist and clamps the score before it reaches a typed
    // compliance field.
    const parsed = coerceReasoning(safeJson(firstText(res)));
    recordLlmCall({
      task: "screeningReasoning",
      model: MODEL,
      promptHash,
      outcome: parsed ? "ok" : "rejected",
      ms: Date.now() - started,
    });
    return parsed;
  } catch {
    recordLlmCall({
      task: "screeningReasoning",
      model: MODEL,
      promptHash,
      outcome: "error",
      ms: Date.now() - started,
    });
    return null;
  }
}
