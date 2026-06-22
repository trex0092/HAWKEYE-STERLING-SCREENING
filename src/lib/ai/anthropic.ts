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
import type { MediaHit } from "@/lib/data/console-datasets";

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
    const res = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 200,
        system:
          "You are a financial-crime adverse-media analyst. For a news headline about a screened subject, " +
          'return ONLY compact JSON: {"sentiment":"negative|positive|neutral","category":"<2-3 word category>"}.',
        messages: [{ role: "user", content: `Subject: ${subject}\nHeadline: ${headline}` }],
      },
      { timeout: 8_000, maxRetries: 1 },
    );
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
    const res = await client.messages.create(
      {
        model: MODEL,
        max_tokens: 400,
        system:
          "You are an AML/sanctions screening analyst. Given a subject and its watchlist hits, return ONLY " +
          'compact JSON: {"summary":"<one sentence>","decision":"clear|review|escalate|block",' +
          '"score":<0-100>,"factors":["<short factor>", ...]}.',
        messages: [{ role: "user", content }],
      },
      { timeout: 8_000, maxRetries: 1 },
    );
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

/** Concatenate every text block of a Claude response (skips refusals). */
function allText(res: Anthropic.Message): string {
  if ((res.stop_reason as string) === "refusal") return "";
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
}

/** Validate raw model JSON into MediaHit[]; silently drops malformed entries. */
function coerceMediaHits(subject: string, raw: unknown): MediaHit[] {
  if (!Array.isArray(raw)) return [];
  const out: MediaHit[] = [];
  for (const r of raw.slice(0, 12)) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const headline = typeof o.headline === "string" ? o.headline.trim() : "";
    if (!headline) continue;
    const sent =
      o.sentiment === "positive" ? "positive" : o.sentiment === "neutral" ? "neutral" : "negative";
    const url = typeof o.url === "string" && /^https?:\/\//.test(o.url) ? o.url : undefined;
    out.push({
      subject,
      cat:
        typeof o.category === "string" && o.category.trim()
          ? o.category.trim().slice(0, 40)
          : "News",
      source: typeof o.source === "string" && o.source.trim() ? o.source.trim() : "Web",
      date: typeof o.date === "string" ? o.date.trim() : "",
      sent,
      headline: headline.slice(0, 300),
      ...(url ? { url } : {}),
    });
  }
  return out;
}

/**
 * Research real adverse media for a subject using Claude's server-side web
 * search tool. Returns genuine, structured MediaHit[] (an empty array means
 * "searched, found nothing"), or null when the client is unavailable / the call
 * fails so callers can fall back to the Google-News feed. The search runs on
 * Anthropic's infrastructure, so it works where direct news-site scraping is
 * blocked (e.g. serverless deploys). Never fabricates — instructed to return no
 * hits rather than invent coverage.
 */
export async function researchAdverseMedia(subject: string): Promise<MediaHit[] | null> {
  const name = subject.trim();
  if (!name) return [];
  const client = getAnthropic();
  if (!client) return null;
  const started = Date.now();
  const promptHash = hashText(`adverse-media:${name}`);
  recordThreatScan("researchAdverseMedia", MODEL, promptHash, name);
  const tools = [
    { type: "web_search_20260209" as const, name: "web_search" as const, max_uses: 3 },
  ];
  const system =
    "You are a financial-crime adverse-media analyst. Use web search to find REAL negative " +
    "news about the named subject from ANY point in the subject's ENTIRE history — not just " +
    "recent coverage, however many years old: sanctions, fraud, money laundering, corruption, " +
    "bribery, investigations, arrests, indictments, convictions, lawsuits, or regulatory " +
    'action. Return ONLY compact JSON: {"hits":[{"headline":"","source":"","url":"",' +
    '"date":"DD Mon YYYY","sentiment":"negative|neutral|positive","category":"<2-3 words>"}]} ' +
    "with up to 15 of the most significant items, most recent first. Use ONLY facts from the " +
    "search results — never invent articles, sources, or URLs. If nothing about THIS subject " +
    'is found, return {"hits":[]}.';
  // Hard wall-clock budget for the whole server-tool loop so this can never exceed the
  // serverless function timeout (Netlify caps synchronous functions at ~26s). Each call
  // gets the remaining budget as its timeout and no retries — the SDK default is a 10-min
  // timeout with 2 retries, and timeouts are retried, which is fatal on serverless. On a
  // timeout the SDK throws → caught below → returns null so the caller falls back cleanly.
  const deadline = Date.now() + 12_000;
  const reqOpts = () => ({ timeout: Math.max(1, deadline - Date.now()), maxRetries: 0 });
  try {
    let messages: Anthropic.MessageParam[] = [{ role: "user", content: name }];
    let res = await client.messages.create(
      { model: MODEL, max_tokens: 2000, system, tools, messages },
      reqOpts(),
    );
    // Server-tool loop: the model pauses while it runs searches. Bounded by both the
    // iteration cap and the wall-clock deadline above.
    for (let i = 0; i < 2 && (res.stop_reason as string) === "pause_turn"; i++) {
      if (deadline - Date.now() <= 0) break;
      messages = [...messages, { role: "assistant", content: res.content }];
      res = await client.messages.create(
        { model: MODEL, max_tokens: 2000, system, tools, messages },
        reqOpts(),
      );
    }
    const parsed = safeJson<{ hits?: unknown }>(allText(res));
    if (!parsed || !Array.isArray(parsed.hits)) {
      recordLlmCall({
        task: "researchAdverseMedia",
        model: MODEL,
        promptHash,
        outcome: "rejected",
        ms: Date.now() - started,
      });
      return null;
    }
    const hits = coerceMediaHits(name, parsed.hits);
    recordLlmCall({
      task: "researchAdverseMedia",
      model: MODEL,
      promptHash,
      outcome: "ok",
      ms: Date.now() - started,
    });
    return hits;
  } catch {
    recordLlmCall({
      task: "researchAdverseMedia",
      model: MODEL,
      promptHash,
      outcome: "error",
      ms: Date.now() - started,
    });
    return null;
  }
}
