// ── Free integration gating ──────────────────────────────────────────────────
// The OpenSanctions (sanctions + PEP) and Google-News (adverse media) sources
// are free and need no API key, so they default ON in production deploys. They
// stay OFF in dev/test/CI so unit + e2e runs remain deterministic and offline.
// An explicit env value always wins: "true" forces on, "false" forces off.

export type FreeFlag = "SANCTIONS_LIVE" | "ADVERSE_MEDIA_LIVE";

export function liveEnabled(flag: FreeFlag): boolean {
  const v = process.env[flag];
  if (v === "true") return true;
  if (v === "false") return false;
  return process.env.NODE_ENV === "production";
}

// ── OpenSanctions / yente endpoints ──────────────────────────────────────────
// Default to the free public OpenSanctions API + data index. Point these at a
// self-hosted yente instance (https://www.opensanctions.org/docs/yente/) for
// unlimited, rate-limit-free screening — still 100% free, just self-run.

const DEFAULT_OS_API = "https://api.opensanctions.org";
const DEFAULT_OS_INDEX = "https://data.opensanctions.org/datasets/latest/index.json";

/** Base URL of the OpenSanctions/yente search+match API (no trailing slash). */
export function opensanctionsApiBase(): string {
  return (process.env.OPENSANCTIONS_API_URL || DEFAULT_OS_API).replace(/\/+$/, "");
}

/** URL of the dataset metadata index (counts / last-updated). */
export function opensanctionsIndexUrl(): string {
  return process.env.OPENSANCTIONS_INDEX_URL || DEFAULT_OS_INDEX;
}
