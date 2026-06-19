// ── AI-analyst personas ──────────────────────────────────────────────────────
// The 14 operators that front the animated radar HUD. Each carries an accent
// RGB used to theme the HUD when that analyst is active, and a per-persona
// background-position so the circular avatar crops nicely. Images live in
// public/personas/ (sourced from the design handoff; relicense for production).

export interface Operator {
  id: string;
  img: string;
  /** CSS background-position for the circular avatar crop. */
  pos: string;
  name: string;
  role: string;
  /** Accent as an "r,g,b" string, used as rgb(var(--ac)) / rgba(var(--ac),a). */
  ac: string;
}

export const OPERATORS: Operator[] = [
  {
    id: "cypher",
    img: "/personas/persona-cypher.webp",
    pos: "48% 22%",
    name: "Cypher",
    role: "Transaction Monitoring",
    ac: "255,92,168",
  },
  {
    id: "sterling",
    img: "/personas/persona-sterling.webp",
    pos: "48% 20%",
    name: "Sterling",
    role: "Entity Risk Assessment",
    ac: "59,229,208",
  },
  {
    id: "vale",
    img: "/personas/persona-vale.webp",
    pos: "50% 20%",
    name: "Vale",
    role: "KYC & Onboarding",
    ac: "120,170,255",
  },
  {
    id: "ember",
    img: "/personas/persona-ember.webp",
    pos: "50% 22%",
    name: "Ember",
    role: "PEP & Adverse Media",
    ac: "255,87,87",
  },
  {
    id: "sentinel",
    img: "/personas/persona-sentinel.webp",
    pos: "55% 18%",
    name: "Sentinel",
    role: "Sanctions Evasion & Watchlists",
    ac: "255,70,90",
  },
  {
    id: "cinder",
    img: "/personas/persona-cinder.webp",
    pos: "46% 24%",
    name: "Cinder",
    role: "Terror & Proliferation",
    ac: "70,150,255",
  },
  {
    id: "talon",
    img: "/personas/persona-talon.webp",
    pos: "55% 18%",
    name: "Talon",
    role: "Trade Sanctions & Export",
    ac: "170,90,255",
  },
  {
    id: "lattice",
    img: "/personas/persona-lattice.webp",
    pos: "55% 16%",
    name: "Lattice",
    role: "Beneficial Ownership & UBO",
    ac: "90,160,255",
  },
  {
    id: "quartz",
    img: "/personas/persona-quartz.webp",
    pos: "55% 18%",
    name: "Quartz",
    role: "Source of Wealth / Funds",
    ac: "60,210,120",
  },
  {
    id: "cobalt",
    img: "/personas/persona-cobalt.webp",
    pos: "55% 20%",
    name: "Cobalt",
    role: "Trade-Based ML & Finance",
    ac: "235,190,90",
  },
  {
    id: "bullion",
    img: "/personas/persona-bullion.webp",
    pos: "50% 18%",
    name: "Bullion",
    role: "Precious Metals & Stones",
    ac: "255,90,200",
  },
  {
    id: "iris",
    img: "/personas/persona-iris.webp",
    pos: "48% 24%",
    name: "Iris",
    role: "Typologies & Training",
    ac: "180,92,255",
  },
  {
    id: "brass",
    img: "/personas/persona-brass.webp",
    pos: "50% 24%",
    name: "Brass",
    role: "Records & Audit",
    ac: "247,197,60",
  },
  {
    id: "verde",
    img: "/personas/persona-verde.webp",
    pos: "50% 24%",
    name: "Verde",
    role: "ESG & Human Rights",
    ac: "60,200,130",
  },
];

const OPERATOR_BY_ID: Record<string, Operator> = Object.fromEntries(
  OPERATORS.map((o) => [o.id, o]),
);

/** Resolve an operator by id, falling back to the first persona. */
export function operatorById(id: string | undefined): Operator {
  return (id ? OPERATOR_BY_ID[id] : undefined) ?? OPERATORS[0]!;
}
