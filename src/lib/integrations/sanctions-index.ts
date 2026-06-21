// ── Local sanctions/PEP index (free, keyless, in-process) ────────────────────
// Screening matches a subject name against a compact index compiled at BUILD
// time from the free, openly-licensed OpenSanctions consolidated lists (OFAC,
// UN, EU, UK, Interpol) and the free PEP dataset — see
// scripts/build-sanctions-index.mjs. No API key and no network are needed at
// runtime: the index ships inside the deployment and is matched in memory.
//
// The exported pure helpers (normalizeName / buildIndex / searchIndex) are unit-
// tested directly; searchLocalIndex() is the file-backed entry point used by the
// screening route, and returns null when no index is bundled (→ honest "not
// screened", never a fabricated verdict).

import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import type { SanctionMatch } from "@/lib/integrations/sanctions";

/** A raw entity row as produced by the build script (one per list membership). */
export interface RawEntity {
  name: string;
  aliases?: string[];
  schema?: string;
  country?: string;
  datasets?: string[];
  topics?: string[];
}

interface CompiledEntry {
  name: string;
  schema: string;
  country: string;
  datasets: string[];
  topics: string[];
  norms: string[]; // normalized name + aliases used as match keys
}

export interface SanctionsIndex {
  entries: CompiledEntry[];
  exact: Map<string, number>; // normalized key → entry index
  token: Map<string, number[]>; // token → entry indices (capped)
  size: number;
}

const MATCH_THRESHOLD = 0.72; // Dice coefficient on name tokens
const MAX_POSTINGS = 6000; // cap per-token postings to bound common-name cost
const MAX_CANDIDATES = 8000;

/** Lowercase, strip diacritics and punctuation, collapse whitespace. */
export function normalizeName(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(norm: string): string[] {
  return norm ? norm.split(" ").filter(Boolean) : [];
}

function dice(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return (2 * inter) / (a.size + b.size);
}

/** Compile raw entities into an in-memory, searchable index. */
export function buildIndex(raw: RawEntity[]): SanctionsIndex {
  const entries: CompiledEntry[] = [];
  const exact = new Map<string, number>();
  const token = new Map<string, number[]>();

  for (const r of raw) {
    if (!r.name) continue;
    const keys = [r.name, ...(r.aliases ?? [])].map(normalizeName).filter(Boolean);
    const norms = Array.from(new Set(keys));
    if (!norms.length) continue;

    const idx = entries.length;
    entries.push({
      name: r.name,
      schema: r.schema || "Entity",
      country: r.country || "",
      datasets: r.datasets ?? [],
      topics: r.topics ?? [],
      norms,
    });

    const seenTok = new Set<string>();
    for (const n of norms) {
      if (!exact.has(n)) exact.set(n, idx);
      for (const t of tokens(n)) {
        if (seenTok.has(t)) continue;
        seenTok.add(t);
        const list = token.get(t);
        if (!list) token.set(t, [idx]);
        else if (list.length < MAX_POSTINGS) list.push(idx);
      }
    }
  }

  return { entries, exact, token, size: entries.length };
}

function toMatch(e: CompiledEntry, score: number): SanctionMatch {
  return {
    name: e.name,
    schema: e.schema,
    score,
    datasets: e.datasets,
    topics: e.topics,
  };
}

/** Match a query name against the index; returns scored matches (0..1). */
export function searchIndex(index: SanctionsIndex, query: string, limit = 5): SanctionMatch[] {
  const nq = normalizeName(query);
  if (!nq) return [];
  const qTokens = tokens(nq);
  const qSet = new Set(qTokens);

  const scored = new Map<number, number>();

  // Exact normalized full-name / alias hit.
  const ex = index.exact.get(nq);
  if (ex !== undefined) scored.set(ex, 1);

  // Gather fuzzy candidates that share at least one token.
  const candidates = new Set<number>();
  for (const t of qTokens) {
    const list = index.token.get(t);
    if (!list) continue;
    for (const idx of list) {
      candidates.add(idx);
      if (candidates.size >= MAX_CANDIDATES) break;
    }
    if (candidates.size >= MAX_CANDIDATES) break;
  }

  for (const idx of candidates) {
    if (scored.get(idx) === 1) continue;
    const e = index.entries[idx]!;
    let best = 0;
    for (const n of e.norms) {
      const nSet = new Set(tokens(n));
      let s = dice(qSet, nSet);
      // Boost when every query token is present (handles extra middle names).
      if (s > 0 && qTokens.every((t) => nSet.has(t))) s = Math.min(1, s + 0.08);
      if (s > best) best = s;
    }
    if (best >= MATCH_THRESHOLD) {
      const prev = scored.get(idx) ?? 0;
      if (best > prev) scored.set(idx, best);
    }
  }

  return Array.from(scored.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([idx, score]) => toMatch(index.entries[idx]!, score));
}

// ── File-backed index (loaded once, cached) ──────────────────────────────────

const GEN_REL = "src/lib/data/generated/sanctions-index.tsv.gz";

// undefined = not yet loaded; null = unavailable (no/empty bundle).
let cached: SanctionsIndex | null | undefined;

function parseTsvGz(buf: Buffer): RawEntity[] {
  const text = gunzipSync(buf).toString("utf8");
  const out: RawEntity[] = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    // name \t aliases(|) \t schema \t country \t datasets(,) \t topics(,)
    const [name, aliases, schema, country, datasets, topics] = line.split("\t");
    if (!name) continue;
    out.push({
      name,
      aliases: aliases ? aliases.split("|").filter(Boolean) : [],
      schema: schema || "Entity",
      country: country || "",
      datasets: datasets ? datasets.split(",").filter(Boolean) : [],
      topics: topics ? topics.split(",").filter(Boolean) : [],
    });
  }
  return out;
}

function loadIndex(): SanctionsIndex | null {
  const candidates = [
    path.join(process.cwd(), GEN_REL),
    path.join(process.cwd(), ".next/standalone", GEN_REL),
  ];
  for (const file of candidates) {
    try {
      const raw = parseTsvGz(readFileSync(file));
      if (raw.length) return buildIndex(raw);
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

/**
 * Match a name against the bundled free index. Returns:
 *  - SanctionMatch[] (possibly empty) when an index is available — a real screen.
 *  - null when no index is bundled, so the caller reports an honest
 *    "not screened" verdict instead of fabricating a clear result.
 */
export function searchLocalIndex(name: string, limit = 5): SanctionMatch[] | null {
  // Keep the unit-test runner deterministic and offline unless explicitly opted in.
  if (process.env.NODE_ENV === "test" && process.env.SANCTIONS_INDEX_TEST !== "1") {
    return null;
  }
  if (cached === undefined) cached = loadIndex();
  if (!cached) return null;
  return searchIndex(cached, name, limit);
}
