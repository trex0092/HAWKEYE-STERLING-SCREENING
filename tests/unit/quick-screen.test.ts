import { describe, it, expect, vi } from "vitest";
import { POST, adverseMediaScore } from "@/app/api/quick-screen/route";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/quick-screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/quick-screen", () => {
  it("returns a well-formed verdict", async () => {
    const res = await post({
      subject: { name: "Boris Volkov", entityType: "individual", jurisdiction: "RU" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.topScore).toBeGreaterThanOrEqual(0);
    expect(data.topScore).toBeLessThanOrEqual(99);
    expect(["critical", "high", "medium", "low"]).toContain(data.severity);
    expect(Array.isArray(data.hits)).toBe(true);
    expect(data.reasoning.factors.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same name", async () => {
    const a = await (await post({ subject: { name: "Acme Holdings" } })).json();
    const b = await (await post({ subject: { name: "Acme Holdings" } })).json();
    expect(a.topScore).toBe(b.topScore);
  });

  it("never throws on an empty body", async () => {
    const res = await POST(new Request("http://localhost/api/quick-screen", { method: "POST" }));
    expect(res.status).toBe(200);
  });

  it("fabricates nothing without a live list source", async () => {
    // No SANCTIONS_LIVE in test → no live source → must claim no findings.
    const data = await (await post({ subject: { name: "Ozcan Halac" } })).json();
    expect(data.live).toBe(false);
    expect(data.sanctioned).toBe(false);
    expect(data.pep).toBe(false);
    expect(data.lists).toEqual([]);
    expect(data.hits).toEqual([]);
    expect(data.topScore).toBe(0);
  });

  it("scales the adverse-media score with negative coverage volume", () => {
    expect(adverseMediaScore(0)).toBe(0);
    expect(adverseMediaScore(1)).toBe(35);
    expect(adverseMediaScore(3)).toBe(55);
    expect(adverseMediaScore(5)).toBe(65);
    expect(adverseMediaScore(8)).toBe(75);
    // Adverse media alone never reaches the auto-block band (>=90).
    expect(adverseMediaScore(100)).toBeLessThan(90);
  });
});

// Adverse media must drive the verdict even when the list source is unreachable.
describe("POST /api/quick-screen — adverse media wiring", () => {
  it("raises the score and routes to review/escalate on negative press", async () => {
    vi.resetModules();
    vi.doMock("@/lib/integrations/adverse-media", () => ({
      fetchAdverseMedia: async () => ({
        live: true,
        hits: Array.from({ length: 6 }, (_, i) => ({
          subject: "Ozcan Halac",
          cat: "News",
          source: "Reuters",
          date: "06 Oct 2025",
          sent: "negative" as const,
          headline: `Istanbul gold refinery fraud probe ${i}`,
          url: "https://example.com",
        })),
      }),
    }));
    const { POST: PostWithMock } = await import("@/app/api/quick-screen/route");
    const res = await PostWithMock(
      new Request("http://localhost/api/quick-screen", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject: { name: "Ozcan Halac", jurisdiction: "TR" } }),
      }),
    );
    const data = await res.json();
    // No live LIST source in test, but adverse media is live and must surface.
    expect(data.live).toBe(false);
    expect(data.sanctioned).toBe(false);
    expect(data.adverseMedia.negativeCount).toBe(6);
    expect(data.topScore).toBe(75);
    expect(["review", "escalate"]).toContain(data.reasoning.decision);
    expect(data.reasoning.factors.some((f: { label: string }) => f.label === "Adverse media")).toBe(
      true,
    );
    vi.doUnmock("@/lib/integrations/adverse-media");
    vi.resetModules();
  });
});
