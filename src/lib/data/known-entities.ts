export interface KnownPEP {
  tier: string;
  rationale: string;
  jurisdiction: string;
}

/**
 * Curated PEP lookup, keyed by normalised name. Ships empty — real deployments
 * populate this from a PEP database (or hit one live). With no entries every
 * lookup returns null, so intake never auto-flags from seed data.
 */
const KNOWN_PEPS: Record<string, KnownPEP> = {};

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
