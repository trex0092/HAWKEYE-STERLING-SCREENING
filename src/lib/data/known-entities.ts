export interface KnownPEP {
  tier: string;
  rationale: string;
  jurisdiction: string;
}

/**
 * Tiny curated PEP lookup. Real deployments hit a 1M+ row PEP database; this is
 * an offline stand-in keyed by normalised name so intake auto-flags the obvious
 * high-profile cases and bumps them to EDD.
 */
const KNOWN_PEPS: Record<string, KnownPEP> = {
  "vladimir putin": {
    tier: "tier_1",
    rationale: "Head of state — President of the Russian Federation",
    jurisdiction: "RU",
  },
  "bashar al assad": {
    tier: "tier_1",
    rationale: "Head of state — President of Syria; OFAC/EU designated",
    jurisdiction: "SY",
  },
  "kim jong un": {
    tier: "tier_1",
    rationale: "Head of state — Supreme Leader, DPRK; UNSC sanctioned regime",
    jurisdiction: "KP",
  },
  "nicolas maduro": {
    tier: "tier_1",
    rationale: "Head of state — President of Venezuela; OFAC designated",
    jurisdiction: "VE",
  },
  "sergei lavrov": {
    tier: "tier_2",
    rationale: "Senior cabinet minister — Foreign Minister of Russia",
    jurisdiction: "RU",
  },
  "gamal mubarak": {
    tier: "tier_3",
    rationale: "Close family of former head of state (Egypt)",
    jurisdiction: "EG",
  },
};

function normalise(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lookupKnownPEP(name: string): KnownPEP | null {
  const key = normalise(name);
  if (!key) return null;
  if (KNOWN_PEPS[key]) return KNOWN_PEPS[key];
  // Also match on a "first last" reduction so middle particles don't block hits.
  const tokens = key.split(" ").filter(Boolean);
  if (tokens.length > 2) {
    const reduced = `${tokens[0]} ${tokens[tokens.length - 1]}`;
    if (KNOWN_PEPS[reduced]) return KNOWN_PEPS[reduced];
  }
  return null;
}
