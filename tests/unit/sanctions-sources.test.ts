import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/sanctions/sources/route";
import { SOURCES } from "@/lib/data/console-datasets";

describe("GET /api/sanctions/sources (offline)", () => {
  it("returns the deterministic seed sources when SANCTIONS_LIVE is unset", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.live).toBe(false);
    expect(data.sources).toHaveLength(SOURCES.length);
    expect(data.sources[0].code).toBe("OFAC");
  });
});
