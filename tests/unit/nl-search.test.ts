import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/cases/nl-search/route";

const subjects = [
  {
    id: "A",
    name: "Sanctioned One",
    meta: "",
    country: "RU",
    jurisdiction: "RU",
    entityType: "individual",
    riskScore: 90,
    cddPosture: "EDD",
    listCoverage: ["OFAC"],
    status: "active",
    pep: null,
    adverseMedia: null,
    aliases: [],
  },
  {
    id: "B",
    name: "Clean Two",
    meta: "",
    country: "DE",
    jurisdiction: "DE",
    entityType: "individual",
    riskScore: 10,
    cddPosture: "CDD",
    listCoverage: [],
    status: "active",
    pep: null,
    adverseMedia: null,
    aliases: [],
  },
];

function search(query: string): Promise<Response> {
  return POST(
    new Request("http://localhost/api/cases/nl-search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, subjects }),
    }),
  );
}

describe("POST /api/cases/nl-search", () => {
  it("resolves a sanctions query to the sanctioned subject", async () => {
    const data = await (await search("show sanctioned subjects")).json();
    expect(data.ok).toBe(true);
    expect(data.matchIds).toEqual(["A"]);
    expect(data.confidence).toBeGreaterThan(0);
  });

  it("applies a numeric risk floor", async () => {
    const data = await (await search("subjects over 50")).json();
    expect(data.matchIds).toEqual(["A"]);
  });
});
