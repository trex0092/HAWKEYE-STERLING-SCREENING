import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Exercise the LIVE path of fetchAdverseMedia (GDELT → Claude web search → Google
// News RSS) with all network + the Anthropic SDK mocked, so the fallback ORDERING
// is verified deterministically and offline.

const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));

const { fetchJsonWithTimeout, fetchTextWithTimeout } = vi.hoisted(() => ({
  fetchJsonWithTimeout: vi.fn(),
  fetchTextWithTimeout: vi.fn(),
}));
vi.mock("@/lib/integrations/http", () => ({
  fetchJsonWithTimeout,
  fetchTextWithTimeout,
  isTransportSecure: () => true,
}));

function claudeReturns(json: string) {
  create.mockResolvedValue({
    stop_reason: "end_turn",
    content: [{ type: "text", text: json }],
  });
}

describe("fetchAdverseMedia — live fallback ordering", () => {
  beforeEach(() => {
    vi.resetModules();
    create.mockReset();
    fetchJsonWithTimeout.mockReset();
    fetchTextWithTimeout.mockReset();
    process.env.ADVERSE_MEDIA_LIVE = "true";
  });

  afterEach(() => {
    delete process.env.ADVERSE_MEDIA_LIVE;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("uses GDELT directly and consults neither Claude nor RSS when GDELT has hits", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    fetchJsonWithTimeout.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        articles: [
          {
            title: "Gold refinery hit by sanctions",
            domain: "ft.com",
            url: "https://ft.com/x",
            seendate: "20260610T120000Z",
          },
        ],
      },
    });

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Istanbul Gold Refinery");

    expect(live).toBe(true);
    expect(hits[0]!.headline).toBe("Gold refinery hit by sanctions");
    expect(hits[0]!.date).toBe("10 Jun 2026");
    expect(create).not.toHaveBeenCalled();
    expect(fetchTextWithTimeout).not.toHaveBeenCalled();
  });

  it("falls back to Claude web search when GDELT is empty (serverless-safe path)", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    fetchJsonWithTimeout.mockResolvedValue({ ok: true, status: 200, data: { articles: [] } });
    claudeReturns(
      '{"hits":[{"headline":"Refinery named in laundering probe","source":"Reuters",' +
        '"url":"https://example.com/1","date":"10 Jun 2026","sentiment":"negative","category":"Laundering"}]}',
    );

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Istanbul Gold Refinery");

    expect(live).toBe(true);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.headline).toBe("Refinery named in laundering probe");
    expect(hits[0]!.sent).toBe("negative");
    expect(create).toHaveBeenCalled();
    // Claude answered, so the (IP-blocked-on-serverless) RSS scrape is never attempted.
    expect(fetchTextWithTimeout).not.toHaveBeenCalled();
  });

  it("falls through to the Google-News scrape when no Anthropic key (research → null)", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    fetchJsonWithTimeout.mockResolvedValue({ ok: true, status: 200, data: { articles: [] } });
    fetchTextWithTimeout.mockResolvedValue({
      ok: true,
      status: 200,
      text: "<rss><channel><item><title>Refinery fraud charges filed</title><link>https://x/1</link><source>BBC</source></item></channel></rss>",
    });

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Istanbul Gold Refinery");

    expect(live).toBe(true);
    expect(create).not.toHaveBeenCalled();
    expect(fetchTextWithTimeout).toHaveBeenCalled();
    expect(hits.some((h) => h.headline === "Refinery fraud charges filed")).toBe(true);
  });
});
