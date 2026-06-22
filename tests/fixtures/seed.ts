import type { Subject } from "@/lib/types";
import type { Operator } from "@/lib/data/operators";

// Representative records for component / shape tests. The production app ships
// with empty registers (see src/lib/data/*); these fixtures preserve render
// coverage without re-seeding the console.

export const SEED_SUBJECTS: Subject[] = [
  {
    id: "HS-10001",
    badge: "10001",
    badgeTone: "red",
    name: "Boris Volkov",
    aliases: ["Boris Volkof", "Борис Волков"],
    meta: "OFAC SDN · asset freeze · EO 14024",
    country: "RUSSIA",
    jurisdiction: "RU",
    type: "Individual · UBO",
    entityType: "individual",
    riskScore: 96,
    status: "escalated",
    cddPosture: "EDD",
    listCoverage: ["OFAC", "UN", "EU", "UK"],
    rca: { screened: true },
    exposureAED: "4,200,000",
    slaNotify: "+6h 00m",
    mostSerious: "critical",
    openedAgo: "13/06/2026",
    assignedTo: "analyst-A",
    analyst: "sentinel",
  },
  {
    id: "HS-10003",
    badge: "10003",
    badgeTone: "amber",
    name: "Vladimir Putin",
    meta: "PEP · tier 1 · head of state",
    country: "RUSSIA",
    jurisdiction: "RU",
    type: "Individual · PEP",
    entityType: "individual",
    riskScore: 72,
    status: "active",
    cddPosture: "EDD",
    listCoverage: [],
    pep: { tier: "tier_1", rationale: "Head of state" },
    rca: { screened: true },
    exposureAED: "0",
    slaNotify: "+48h 00m",
    mostSerious: "high",
    openedAgo: "13/06/2026",
    analyst: "ember",
  },
];

export const SEED_OPERATORS: Operator[] = [
  {
    id: "ember",
    img: "/personas/persona-ember.webp",
    pos: "50% 22%",
    name: "Ember",
    role: "PEP & Adverse Media",
    ac: "255,87,87",
  },
];
