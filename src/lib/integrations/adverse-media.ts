// ── Adverse media (AI + free, worldwide, lifetime) ───────────────────────────
// The feed is LIVE by default everywhere (dev + prod). When an ANTHROPIC_API_KEY
// is present its PRIMARY source is Claude web search (researchAdverseMedia),
// which covers the subject's ENTIRE history — not just recent months — and works
// from serverless / cloud IPs. GDELT DOC 2.0 (a free, keyless global news index)
// and Google-News RSS are keyless fallbacks used when the lifetime search is
// empty or unavailable: GDELT covers only ~recent months, and RSS is kept for
// dev/local since it blocks cloud IPs in production. Every source restricts to
// negative financial-crime coverage. Live results are never replaced with mock
// data — a failed/empty fetch returns no headlines. Only the deterministic
// unit-test runner (NODE_ENV=test), or an explicit ADVERSE_MEDIA_LIVE=false,
// falls back to the seed fixtures.

import { fetchTextWithTimeout, fetchJsonWithTimeout } from "@/lib/integrations/http";
import { liveEnabled } from "@/lib/integrations/config";
import { classifyAdverseMedia, researchAdverseMedia } from "@/lib/ai/anthropic";
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

// ── GDELT DOC 2.0 (primary live source) ──────────────────────────────────────
// A free, keyless global news index reachable from serverless / cloud IPs —
// unlike Google News RSS, which blocks those IPs and returns nothing in
// production. We restrict the query to negative financial-crime keywords so the
// result set is adverse coverage, newest first.
interface GdeltArticle {
  url?: string;
  title?: string;
  seendate?: string;
  domain?: string;
}

const GDELT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// GDELT stamps articles like "20260610T120000Z" → render as "10 Jun 2026".
function gdeltDate(s: string | undefined): string {
  if (!s || s.length < 8) return "";
  const mo = parseInt(s.slice(4, 6), 10);
  if (!Number.isFinite(mo) || mo < 1 || mo > 12) return "";
  return `${s.slice(6, 8)} ${GDELT_MONTHS[mo - 1]} ${s.slice(0, 4)}`;
}

async function fetchGdelt(subject: string): Promise<MediaHit[]> {
  const query = `"${subject}" (sanction OR sanctions OR fraud OR laundering OR corruption OR bribery OR investigation OR arrest OR indictment OR probe OR raid)`;
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}` +
    `&mode=artlist&format=json&maxrecords=25&sort=datedesc`;
  const res = await fetchJsonWithTimeout(url, {
    headers: { "user-agent": "Mozilla/5.0 HawkeyeSterlingScreening/1.0" },
  });
  if (!res.ok || !res.data || typeof res.data !== "object") return [];
  const articles = (res.data as { articles?: unknown }).articles;
  if (!Array.isArray(articles)) return [];

  const seen = new Set<string>();
  const out: MediaHit[] = [];
  for (const a of articles as GdeltArticle[]) {
    const headline = (a.title ?? "").trim();
    if (!headline) continue;
    const key = headline.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      subject,
      cat: "News",
      source: a.domain ?? "GDELT",
      date: gdeltDate(a.seendate),
      sent: "negative",
      headline,
      url: a.url ?? "",
    });
  }
  return out.slice(0, 25);
}

export interface AdverseMediaResult {
  hits: MediaHit[];
  live: boolean;
}

// ── Worldwide coverage ───────────────────────────────────────────────────────
// Adverse media is searched across every major Google-News locale edition (not
// just US/English) so coverage is global and multi-language — a subject's local
// press (e.g. Turkish, Arabic, Russian) surfaces alongside the wire services.
// Each edition is a free, keyless RSS endpoint; we query them all in parallel.
interface NewsEdition {
  hl: string; // interface language
  gl: string; // geo edition
  ceid: string; // country:language id
}

const NEWS_EDITIONS: ReadonlyArray<NewsEdition> = [
  { hl: "en-US", gl: "US", ceid: "US:en" }, // United States
  { hl: "en-GB", gl: "GB", ceid: "GB:en" }, // United Kingdom
  { hl: "tr", gl: "TR", ceid: "TR:tr" }, // Türkiye
  { hl: "ar", gl: "AE", ceid: "AE:ar" }, // Arabic / Gulf
  { hl: "ru", gl: "RU", ceid: "RU:ru" }, // Russia
  { hl: "es-419", gl: "US", ceid: "US:es-419" }, // Spanish (Latin America)
  { hl: "es", gl: "ES", ceid: "ES:es" }, // Spanish (Spain)
  { hl: "fr", gl: "FR", ceid: "FR:fr" }, // France / Francophone
  { hl: "de", gl: "DE", ceid: "DE:de" }, // Germany / DACH
  { hl: "pt-BR", gl: "BR", ceid: "BR:pt-419" }, // Brazil / Portuguese
  { hl: "it", gl: "IT", ceid: "IT:it" }, // Italy
  { hl: "hi", gl: "IN", ceid: "IN:hi" }, // India (Hindi)
  { hl: "en-IN", gl: "IN", ceid: "IN:en" }, // India (English)
  { hl: "zh-CN", gl: "CN", ceid: "CN:zh-Hans" }, // China (Simplified)
  { hl: "zh-TW", gl: "TW", ceid: "TW:zh-Hant" }, // Taiwan (Traditional)
  { hl: "ja", gl: "JP", ceid: "JP:ja" }, // Japan
  { hl: "ko", gl: "KR", ceid: "KR:ko" }, // South Korea
  { hl: "id", gl: "ID", ceid: "ID:id" }, // Indonesia
  { hl: "uk", gl: "UA", ceid: "UA:uk" }, // Ukraine
  { hl: "fa", gl: "IR", ceid: "IR:fa" }, // Iran (Persian)
];

function editionUrl(query: string, ed: NewsEdition): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${ed.hl}&gl=${ed.gl}&ceid=${encodeURIComponent(ed.ceid)}`;
}

/** Merge per-edition hits, drop duplicate headlines, newest first. */
function mergeWorldwide(lists: MediaHit[][]): MediaHit[] {
  const seen = new Set<string>();
  const out: MediaHit[] = [];
  for (const list of lists) {
    for (const h of list) {
      const key = h.headline.toLowerCase().replace(/\s+/g, " ").trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(h);
    }
  }
  out.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
  });
  return out;
}

export async function fetchAdverseMedia(subject: string): Promise<AdverseMediaResult> {
  const live = liveEnabled("ADVERSE_MEDIA_LIVE");
  // Offline only (the deterministic unit-test runner): seed fixtures. Live
  // deployments NEVER serve seed/mock news — the feed is all live.
  if (!live) return { hits: seedFeed(subject), live: false };

  // Primary live source: GDELT DOC 2.0 — a free, keyless global news index that
  // is reachable from serverless / cloud IPs (unlike Google News RSS, which
  // blocks them and returns nothing in production). Falls through to the
  // Google-News scrape only when GDELT returns nothing.
  if (subject) {
    // Primary: lifetime adverse media via Claude web search — covers the subject's ENTIRE
    // history (any year, not just recent) and works from serverless IPs where Google-News
    // RSS is blocked. Returns MediaHit[] with hits, [] when it searched and found nothing,
    // or null when there is no API key (dev/local) or the call errors.
    const researched = await researchAdverseMedia(subject);
    if (researched && researched.length) return { hits: researched, live: true };

    // Supplement / fallback: GDELT covers only ~recent months but is free and keyless —
    // used when the lifetime search found nothing or is unavailable.
    const gdelt = await fetchGdelt(subject);
    if (gdelt.length) return { hits: gdelt, live: true };

    // Claude ran (key present) but found nothing and GDELT is empty → genuine empty result;
    // skip the RSS scrape, which is IP-blocked on serverless anyway.
    if (researched) return { hits: [], live: true };
  }

  const query = subject
    ? `${subject} (sanction OR fraud OR laundering OR investigation OR bribery OR corruption OR arrest OR indictment)`
    : "sanctions enforcement OR money laundering";

  // Query every world edition in parallel; each helper resolves (never throws).
  const results = await Promise.all(
    NEWS_EDITIONS.map((ed) =>
      fetchTextWithTimeout(editionUrl(query, ed), {
        headers: { "user-agent": "Mozilla/5.0 HawkeyeSterlingScreening/1.0" },
      }),
    ),
  );

  const lists = results.map((res) =>
    res.ok && res.text ? parseGoogleNewsRss(res.text, subject || "Watchlist") : [],
  );
  const hits = mergeWorldwide(lists).slice(0, 30);

  // Live source attempted: return ONLY real coverage. When no edition returns
  // anything, return an empty live result — never fabricated seed news.
  if (!hits.length) return { hits: [], live: true };

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
