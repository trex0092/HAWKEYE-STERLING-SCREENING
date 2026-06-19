// ── Sanctions (free / open lists) ────────────────────────────────────────────
// When SANCTIONS_LIVE=true, reads live list metadata from the free, open
// OpenSanctions data index and can match a name against the public
// OpenSanctions search API. Otherwise returns the deterministic seed sources,
// so the Sanctions module renders identically offline / in CI.

import { fetchJsonWithTimeout } from "@/lib/integrations/http";
import { liveEnabled } from "@/lib/integrations/config";
import { SOURCES, type SanctionSourceRow } from "@/lib/data/console-datasets";
import type { SanctionSource } from "@/lib/types";

// Map our display codes → OpenSanctions dataset names (free, open datasets).
const DATASET_BY_CODE: Record<string, string> = {
  OFAC: "us_ofac_sdn",
  UN: "un_sc_sanctions",
  EU: "eu_fsf",
  UK: "gb_hmt_sanctions",
  INTERPOL: "interpol_red_notices",
  EOCN: "ext_cy_eu_sanctions", // best-effort; falls back to seed when absent
};

// Reverse map (OpenSanctions dataset name → our display code) for tagging hits.
const CODE_BY_DATASET: Record<string, SanctionSource> = {
  us_ofac_sdn: "OFAC",
  us_ofac_cons: "OFAC",
  un_sc_sanctions: "UN",
  eu_fsf: "EU",
  gb_hmt_sanctions: "UK",
  interpol_red_notices: "INTERPOL",
};

/** Best-effort map of an OpenSanctions dataset name to one of our list codes. */
export function listCodeForDataset(dataset: string): SanctionSource | null {
  return CODE_BY_DATASET[dataset] ?? null;
}

interface OsDataset {
  name?: string;
  title?: string;
  thing_count?: number;
  entity_count?: number;
  target_count?: number;
  last_change?: string;
  updated_at?: string;
}
interface OsIndex {
  datasets?: OsDataset[];
}

function fmtCount(n: number | undefined): string | null {
  return typeof n === "number" && n > 0 ? n.toLocaleString("en-US") : null;
}

function fmtUpdated(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export interface SanctionSourcesResult {
  sources: SanctionSourceRow[];
  live: boolean;
}

export async function fetchSanctionSources(): Promise<SanctionSourcesResult> {
  const live = liveEnabled("SANCTIONS_LIVE");
  if (!live) return { sources: SOURCES, live: false };

  const res = await fetchJsonWithTimeout(
    "https://data.opensanctions.org/datasets/latest/index.json",
    {},
    8000,
  );
  const index = res.ok ? (res.data as OsIndex) : null;
  if (!index?.datasets) return { sources: SOURCES, live: false };

  const byName = new Map<string, OsDataset>();
  for (const d of index.datasets) if (d.name) byName.set(d.name, d);

  // Start from the seed rows so codes/names stay stable; overlay live numbers.
  const sources: SanctionSourceRow[] = SOURCES.map((row) => {
    const dsName = DATASET_BY_CODE[row.code];
    const ds = dsName ? byName.get(dsName) : undefined;
    if (!ds) return row;
    const entries = fmtCount(ds.target_count ?? ds.entity_count ?? ds.thing_count) ?? row.entries;
    const updated = fmtUpdated(ds.last_change ?? ds.updated_at) ?? row.updated;
    return { ...row, entries, updated, status: "current" };
  });

  return { sources, live: true };
}

export interface SanctionMatch {
  name: string;
  schema: string;
  score: number;
  datasets: string[];
  /** OpenSanctions topics, e.g. "sanction", "role.pep", "crime". */
  topics: string[];
}

interface OsSearchResult {
  results?: Array<{
    caption?: string;
    schema?: string;
    score?: number;
    datasets?: string[];
    properties?: { topics?: string[] };
  }>;
}

/** Match a name against the public OpenSanctions search API, or null offline. */
export async function screenName(name: string): Promise<SanctionMatch[] | null> {
  const live = liveEnabled("SANCTIONS_LIVE");
  if (!live || !name.trim()) return null;

  const url = `https://api.opensanctions.org/search/default?q=${encodeURIComponent(name)}&limit=5`;
  const res = await fetchJsonWithTimeout(url, {}, 8000);
  if (!res.ok) return null;
  const data = res.data as OsSearchResult;
  if (!data.results) return [];

  return data.results.map((r) => ({
    name: r.caption ?? name,
    schema: r.schema ?? "Entity",
    score: typeof r.score === "number" ? r.score : 0,
    datasets: Array.isArray(r.datasets) ? r.datasets : [],
    topics: Array.isArray(r.properties?.topics) ? r.properties.topics : [],
  }));
}

/** True when any topic marks the entity as a politically-exposed person. */
export function matchIsPep(m: SanctionMatch): boolean {
  return m.topics.some((t) => t.startsWith("role.pep") || t === "role.rca");
}

/** True when any topic marks the entity as sanctioned. */
export function matchIsSanctioned(m: SanctionMatch): boolean {
  return m.topics.includes("sanction");
}
