import { describe, it, expect } from "vitest";
import {
  riskColor,
  severityWord,
  statusTone,
  cddTone,
  slaHours,
  slaColor,
  sortRows,
  listChip,
  analystForType,
  draftRisk,
  fmtUptime,
  accentRgb,
  threatLabel,
} from "@/lib/console/derive";

describe("risk bands", () => {
  it("maps scores to the handoff colours", () => {
    expect(riskColor(96)).toBe("#FF6B6B");
    expect(riskColor(72)).toBe("#FF9F45");
    expect(riskColor(45)).toBe("#E0B341");
    expect(riskColor(20)).toBe("#4FD6A0");
    expect(riskColor(0)).toBe("#646F86");
  });
  it("words and threat labels track the same thresholds", () => {
    expect(severityWord(90).w).toBe("critical");
    expect(severityWord(0).w).toBe("none");
    expect(threatLabel(96).t).toBe("CRITICAL");
    expect(threatLabel(0).t).toBe("NOMINAL");
  });
});

describe("status / cdd tones", () => {
  it("uses the escalated red and EDD red", () => {
    expect(statusTone("escalated").c).toBe("#FF8A8A");
    expect(statusTone("active").c).toBe("#7FB3E8");
    expect(cddTone("EDD").c).toBe("#FF8A8A");
    expect(cddTone("CDD").c).toBe("#7FB3E8");
  });
});

describe("sla", () => {
  it("parses hours and colours by urgency", () => {
    expect(slaHours("+6h 00m")).toBe(6);
    expect(slaHours("")).toBe(999);
    expect(slaColor("+6h 00m")).toBe("#FF8A8A");
    expect(slaColor("+18h 00m")).toBe("#FFAE57");
    expect(slaColor("+72h 00m")).toBe("#A3ADC0");
  });
});

describe("sortRows", () => {
  const rows = [
    { name: "Bravo", riskScore: 50, slaNotify: "+30h 00m", status: "active" },
    { name: "Alpha", riskScore: 90, slaNotify: "+6h 00m", status: "escalated" },
    { name: "Charlie", riskScore: 70, slaNotify: "+12h 00m", status: "review" },
  ];
  it("sorts by risk desc by default", () => {
    expect(sortRows(rows, "risk").map((r) => r.riskScore)).toEqual([90, 70, 50]);
  });
  it("sorts by name, sla asc, and status rank", () => {
    expect(sortRows(rows, "name").map((r) => r.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
    expect(sortRows(rows, "sla").map((r) => r.slaNotify)).toEqual([
      "+6h 00m",
      "+12h 00m",
      "+30h 00m",
    ]);
    expect(sortRows(rows, "status").map((r) => r.status)).toEqual([
      "escalated",
      "review",
      "active",
    ]);
  });
  it("does not mutate the input", () => {
    const before = rows.map((r) => r.name);
    sortRows(rows, "name");
    expect(rows.map((r) => r.name)).toEqual(before);
  });
});

describe("list chips", () => {
  it("reds the sanctions families and ambers the rest", () => {
    expect(listChip("OFAC").c).toBe("#FF8A8A");
    expect(listChip("INTERPOL").c).toBe("#FFB169");
    expect(listChip("—").t).toBe("—");
  });
});

describe("analyst assignment", () => {
  it("maps both intake and subject entity types", () => {
    expect(analystForType("vessel")).toBe("talon");
    expect(analystForType("aircraft")).toBe("sterling");
    expect(analystForType("corporate")).toBe("lattice");
    expect(analystForType("organisation")).toBe("lattice");
    expect(analystForType("entity")).toBe("cypher");
    expect(analystForType("other")).toBe("cypher");
    expect(analystForType("individual")).toBe("ember");
  });
});

describe("projected risk", () => {
  it("combines country risk, entity premium and issuing-country weight", () => {
    // RUSSIA(42) + vessel(10) + round(42*0.4=16.8 -> 17) = 69
    expect(draftRisk({ type: "vessel", country: "RUSSIA", issuingCountry: "RUSSIA" })).toBe(69);
    // GERMANY(5) + individual(0) + round(5*0.4=2) = 7
    expect(draftRisk({ type: "individual", country: "GERMANY" })).toBe(7);
  });
  it("clamps to 0..99", () => {
    const r = draftRisk({ type: "vessel", country: "RUSSIA", issuingCountry: "RUSSIA" });
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(99);
  });
});

describe("misc", () => {
  it("formats uptime hh:mm:ss", () => {
    expect(fmtUptime(5)).toBe("00:00:05");
    expect(fmtUptime(3661)).toBe("01:01:01");
  });
  it("resolves accents with a pink default", () => {
    expect(accentRgb("Cyan")).toBe("59,229,208");
    expect(accentRgb("nonsense")).toBe("255,92,168");
  });
});
