// ── Root-cause analysis (override aggregation) ───────────────────────────────
// The `/api/override` route already captures every analyst override with a
// mandatory reason. This module turns a batch of those records into the
// recalibration signal a periodic review needs: the override rate, the most
// common decision changes ("block→review"), and recurring themes mined from the
// free-text reasons. Pure and offline-safe — the analytics layer the override
// capture was missing. No automated retraining; output drives a human review.

export interface OverrideRecord {
  caseId: string;
  analyst: string;
  systemDecision: string;
  analystDecision: string;
  overridden: boolean;
  reason: string;
}

export interface ThemeCount {
  theme: string;
  count: number;
}

export interface RootCauseSummary {
  total: number;
  overrides: number;
  /** Overrides ÷ total, 0–1, rounded to 2dp. */
  overrideRate: number;
  /** Counts of decision changes, keyed "system→analyst" (overrides only). */
  byDirection: Record<string, number>;
  /** Recurring themes mined from override reasons, most frequent first. */
  themes: ThemeCount[];
}

// Keyword → canonical theme. Reasons are matched case-insensitively; a reason
// can contribute to several themes. Tuned for AML override rationales.
const THEME_KEYWORDS: ReadonlyArray<[string, RegExp]> = [
  ["false-positive", /false[ -]?positive|not a match|no match/i],
  ["name-collision", /common[ -]?name|name collision|homonym|same name/i],
  ["dob-mismatch", /\bdob\b|date of birth|d\.o\.b|birth date|age mismatch/i],
  ["identity-confirmed", /confirmed identity|verified identity|is the same|positive id/i],
  ["adverse-media", /adverse media|press|news|article/i],
  ["sanctions-confirmed", /sanction|ofac|watchlist|listed/i],
  ["pep", /\bpep\b|politically exposed/i],
  ["stale-data", /stale|outdated|out of date|old record/i],
  ["data-quality", /data quality|missing data|incomplete|bad data/i],
];

function mineThemes(reasons: string[]): ThemeCount[] {
  const counts = new Map<string, number>();
  for (const reason of reasons) {
    for (const [theme, pattern] of THEME_KEYWORDS) {
      if (pattern.test(reason)) counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count || a.theme.localeCompare(b.theme));
}

/** Aggregate analyst override records into a root-cause summary. */
export function analyseOverrides(records: OverrideRecord[]): RootCauseSummary {
  const list = Array.isArray(records) ? records : [];
  const total = list.length;
  const overrideRecords = list.filter((r) => r.overridden);
  const byDirection: Record<string, number> = {};
  for (const r of overrideRecords) {
    const key = `${r.systemDecision}→${r.analystDecision}`;
    byDirection[key] = (byDirection[key] ?? 0) + 1;
  }
  return {
    total,
    overrides: overrideRecords.length,
    overrideRate: total === 0 ? 0 : Number((overrideRecords.length / total).toFixed(2)),
    byDirection,
    themes: mineThemes(overrideRecords.map((r) => r.reason || "")),
  };
}
