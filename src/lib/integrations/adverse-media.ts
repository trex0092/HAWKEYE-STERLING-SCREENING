// ── Adverse media (free, Google News) ────────────────────────────────────────
// The feed is LIVE by default everywhere (dev + prod): it pulls negative-news
// headlines for a subject from the free Google News RSS endpoint (no API key
// required) and optionally enriches sentiment/category with Claude. Live results
// are never replaced with mock data — a failed/empty fetch returns no headlines.
// Only the deterministic unit-test runner (NODE_ENV=test), or an explicit
// ADVERSE_MEDIA_LIVE=false, falls back to the seed fixtures.

import { fetchTextWithTimeout } from "@/lib/integrations/http";
import { liveEnabled } from "@/lib/integrations/config";
import { classifyAdverseMedia } from "@/lib/ai/anthropic";
import { MEDIA, type MediaHit } from "@/lib/data/console-datasets";

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function tag(raw: string, name: string): string | null {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(raw);
  return m?.[1] ?? null;
}

/** Parse a Google News RSS document into adverse-media hits. */
export function parseGoogleNewsRss(xml: string, subject: string): MediaHit[] {
  const items = xml.split("<item>").slice(1);
  const out: MediaHit[] = [];
  for (const raw of items.slice(0, 8)) {
    const headline = decodeEntities(tag(raw, "title") ?? "");
    if (!headline) continue;
    const pub = tag(raw, "pubDate");
    const date = pub
      ? new Date(pub).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";
    out.push({
      subject,
      cat: "News",
      source: decodeEntities(tag(raw, "source") ?? "Google News"),
      date,
      sent: "negative",
      headline,
      url: decodeEntities(tag(raw, "link") ?? ""),
    });
  }
  return out;
}

function seedFeed(subject: string): MediaHit[] {
  // No subject → the general demo feed. With a subject, only return genuine
  // seed matches; never attribute unrelated negative news to an unknown name.
  if (!subject) return MEDIA;
  const lc = subject.toLowerCase();
  return MEDIA.filter((m) => m.subject.toLowerCase().includes(lc));
}

export interface AdverseMediaResult {
  hits: MediaHit[];
  live: boolean;
}

export async function fetchAdverseMedia(subject: string): Promise<AdverseMediaResult> {
  const live = liveEnabled("ADVERSE_MEDIA_LIVE");
  // Offline only (the deterministic unit-test runner): seed fixtures. Live
  // deployments NEVER serve seed/mock news — the feed is all live.
  if (!live) return { hits: seedFeed(subject), live: false };

  const query = subject
    ? `${subject} (sanction OR fraud OR laundering OR investigation OR bribery)`
    : "sanctions enforcement OR money laundering";
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetchTextWithTimeout(url, {
    headers: { "user-agent": "Mozilla/5.0 HawkeyeSterlingScreening/1.0" },
  });
  // Live source attempted: return ONLY real coverage. On a failed or empty
  // fetch, return an empty live result — never fall back to fabricated seed news.
  if (!res.ok || !res.text) return { hits: [], live: true };

  const hits = parseGoogleNewsRss(res.text, subject || "Watchlist");

  // Best-effort AI enrichment of the top few headlines (no-op without a key).
  await Promise.all(
    hits.slice(0, 4).map(async (hit) => {
      const cls = await classifyAdverseMedia(hit.headline, hit.subject);
      if (cls) {
        hit.sent = cls.sentiment;
        hit.cat = cls.category;
      }
    }),
  );

  return { hits, live: true };
}
