import { describe, it, expect, afterAll } from "vitest";
import { gzipSync } from "node:zlib";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import {
  normalizeName,
  buildIndex,
  searchIndex,
  type RawEntity,
} from "@/lib/integrations/sanctions-index";

const SAMPLE: RawEntity[] = [
  {
    name: "Ozcan Halac",
    aliases: ["Özcan Halaç"],
    schema: "Person",
    country: "tr",
    datasets: ["us_ofac_sdn"],
    topics: ["sanction"],
  },
  {
    name: "Boris Volkov",
    schema: "Person",
    country: "ru",
    datasets: ["eu_fsf"],
    topics: ["sanction"],
  },
  {
    name: "Helena Vance",
    schema: "Person",
    country: "gb",
    datasets: ["peps"],
    topics: ["role.pep"],
  },
];

describe("normalizeName", () => {
  it("lowercases, strips diacritics and punctuation", () => {
    expect(normalizeName("Özcan Halaç")).toBe("ozcan halac");
    expect(normalizeName("  AL-RASHID,  Mohammed. ")).toBe("al rashid mohammed");
  });
});

describe("searchIndex", () => {
  const index = buildIndex(SAMPLE);

  it("returns no matches below the threshold", () => {
    expect(searchIndex(index, "Jane Smith")).toEqual([]);
  });

  it("exact-matches a listed name with full score", () => {
    const hits = searchIndex(index, "Ozcan Halac");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.name).toBe("Ozcan Halac");
    expect(hits[0]!.score).toBe(1);
    expect(hits[0]!.topics).toContain("sanction");
    expect(hits[0]!.datasets).toContain("us_ofac_sdn");
  });

  it("matches through diacritic-only alias differences", () => {
    const hits = searchIndex(index, "Özcan Halaç");
    expect(hits[0]?.name).toBe("Ozcan Halac");
  });

  it("matches regardless of token order", () => {
    const hits = searchIndex(index, "Volkov Boris");
    expect(hits[0]?.name).toBe("Boris Volkov");
  });

  it("surfaces PEP topics for PEP entries", () => {
    const hits = searchIndex(index, "Helena Vance");
    expect(hits[0]?.topics).toContain("role.pep");
  });

  it("returns empty for blank queries", () => {
    expect(searchIndex(index, "   ")).toEqual([]);
  });
});

// Exercises the file-backed glue: gz on disk → parseTsvGz → buildIndex → match.
describe("searchLocalIndex (file-backed)", () => {
  const GEN = path.join(process.cwd(), "src/lib/data/generated/sanctions-index.tsv.gz");

  afterAll(() => {
    try {
      rmSync(GEN);
    } catch {
      /* ignore */
    }
  });

  it("loads a bundled gz index and matches names", async () => {
    const tsv =
      ["Ozcan Halac", "Özcan Halaç", "Person", "tr", "us_ofac_sdn", "sanction"].join("\t") + "\n";
    mkdirSync(path.dirname(GEN), { recursive: true });
    writeFileSync(GEN, gzipSync(Buffer.from(tsv, "utf8")));

    // Opt in to index loading inside the test runner and get a fresh module
    // (module-level cache is per import).
    process.env.SANCTIONS_INDEX_TEST = "1";
    const { searchLocalIndex } = await import("@/lib/integrations/sanctions-index");

    const hits = searchLocalIndex("Ozcan Halac");
    expect(hits).not.toBeNull();
    expect(hits!.length).toBeGreaterThan(0);
    expect(hits![0]!.name).toBe("Ozcan Halac");
    expect(hits![0]!.topics).toContain("sanction");
    delete process.env.SANCTIONS_INDEX_TEST;
  });
});
