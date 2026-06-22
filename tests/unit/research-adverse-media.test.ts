import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Anthropic SDK so researchAdverseMedia exercises its real
// parsing/validation logic against a canned web-search response — no network.
const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));

describe("researchAdverseMedia", () => {
  beforeEach(() => {
    create.mockReset();
    vi.resetModules(); // reset the cached client in anthropic.ts
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  it("maps web-search JSON into MediaHit[] for the subject", async () => {
    create.mockResolvedValue({
      stop_reason: "end_turn",
      content: [
        { type: "web_search_tool_result", content: [] },
        {
          type: "text",
          text: '{"hits":[{"headline":"Gold-fraud refinery raid","source":"Reuters","url":"https://example.com/1","date":"10 Jun 2026","sentiment":"negative","category":"Fraud"}]}',
        },
      ],
    });
    const { researchAdverseMedia } = await import("@/lib/ai/anthropic");
    const hits = await researchAdverseMedia("Ozcan Halac");
    expect(hits).not.toBeNull();
    expect(hits!).toHaveLength(1);
    expect(hits![0]!.headline).toBe("Gold-fraud refinery raid");
    expect(hits![0]!.source).toBe("Reuters");
    expect(hits![0]!.sent).toBe("negative");
    expect(hits![0]!.subject).toBe("Ozcan Halac");
    expect(hits![0]!.url).toBe("https://example.com/1");
  });

  it("drops malformed entries and a bogus url", async () => {
    create.mockResolvedValue({
      stop_reason: "end_turn",
      content: [
        {
          type: "text",
          text: '{"hits":[{"source":"X"},{"headline":"Real story","url":"not-a-url"}]}',
        },
      ],
    });
    const { researchAdverseMedia } = await import("@/lib/ai/anthropic");
    const hits = await researchAdverseMedia("Acme Ltd");
    expect(hits).toHaveLength(1); // the entry with no headline is dropped
    expect(hits![0]!.headline).toBe("Real story");
    expect(hits![0]!.url).toBeUndefined(); // non-http url rejected
    expect(hits![0]!.source).toBe("Web"); // missing source → "Web"
  });

  it("returns [] when the model reports no coverage", async () => {
    create.mockResolvedValue({
      stop_reason: "end_turn",
      content: [{ type: "text", text: '{"hits":[]}' }],
    });
    const { researchAdverseMedia } = await import("@/lib/ai/anthropic");
    expect(await researchAdverseMedia("Nobody Clean")).toEqual([]);
  });

  it("returns null (→ caller falls back) when no API key is configured", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    vi.resetModules();
    const { researchAdverseMedia } = await import("@/lib/ai/anthropic");
    expect(await researchAdverseMedia("Anyone")).toBeNull();
  });
});
