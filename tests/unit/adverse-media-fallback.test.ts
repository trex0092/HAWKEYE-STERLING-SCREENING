import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Exercise the LIVE path of fetchAdverseMedia (Claude web search → GDELT → Google
// News RSS) with all network + the Anthropic SDK mocked, so the lifetime-first
// fallback ORDERING is verified deterministically and offline.

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

const GDELT_ONE_HIT = {
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
};

describe("fetchAdverseMedia — lifetime-first fallback ordering", () => {
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

  it("uses Claude web search as the primary lifetime source; skips GDELT and RSS when it returns hits", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    claudeReturns(
      '{"hits":[{"headline":"Refinery boss convicted in 2018 gold-laundering case","source":"Reuters",' +
        '"url":"https://example.com/1","date":"12 Jan 2018","sentiment":"negative","category":"Laundering"}]}',
    );

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Ozcan Halac");

    expect(live).toBe(true);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.headline).toContain("2018");
    expect(create).toHaveBeenCalled();
    expect(fetchJsonWithTimeout).not.toHaveBeenCalled(); // GDELT not consulted
    expect(fetchTextWithTimeout).not.toHaveBeenCalled(); // RSS not consulted
  });

  it("falls back to GDELT when the lifetime search finds nothing", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    claudeReturns('{"hits":[]}');
    fetchJsonWithTimeout.mockResolvedValue(GDELT_ONE_HIT);

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Ozcan Halac");

    expect(live).toBe(true);
    expect(hits[0]!.headline).toBe("Gold refinery hit by sanctions");
    expect(create).toHaveBeenCalled();
    expect(fetchTextWithTimeout).not.toHaveBeenCalled();
  });

  it("returns a genuine empty result (no RSS) when both Claude and GDELT are empty", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    claudeReturns('{"hits":[]}');
    fetchJsonWithTimeout.mockResolvedValue({ ok: true, status: 200, data: { articles: [] } });

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Nobody Clean");

    expect(live).toBe(true);
    expect(hits).toHaveLength(0);
    expect(fetchTextWithTimeout).not.toHaveBeenCalled(); // RSS skipped on a keyed deploy
  });

  it("falls through to the Google-News scrape when no Anthropic key (dev/local)", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    fetchJsonWithTimeout.mockResolvedValue({ ok: true, status: 200, data: { articles: [] } });
    fetchTextWithTimeout.mockResolvedValue({
      ok: true,
      status: 200,
      text: "<rss><channel><item><title>Refinery fraud charges filed</title><link>https://x/1</link><source>BBC</source></item></channel></rss>",
    });

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Ozcan Halac");

    expect(live).toBe(true);
    expect(create).not.toHaveBeenCalled();
    expect(fetchTextWithTimeout).toHaveBeenCalled();
    expect(hits.some((h) => h.headline === "Refinery fraud charges filed")).toBe(true);
  });
});
