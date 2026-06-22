import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Exercise the LIVE path of fetchAdverseMedia (GDELT → bounded Claude web search →
// Google-News RSS) with all network + the Anthropic SDK mocked, so the GDELT-first
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

const GDELT_EMPTY = { ok: true, status: 200, data: { articles: [] } };
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

describe("fetchAdverseMedia — GDELT-first fallback ordering", () => {
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

  it("uses GDELT as the fast primary; skips Claude and RSS when it returns hits", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    fetchJsonWithTimeout.mockResolvedValue(GDELT_ONE_HIT);

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Ozcan Halac");

    expect(live).toBe(true);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.headline).toBe("Gold refinery hit by sanctions");
    expect(fetchJsonWithTimeout).toHaveBeenCalled(); // GDELT consulted first
    expect(create).not.toHaveBeenCalled(); // Claude web search not needed
    expect(fetchTextWithTimeout).not.toHaveBeenCalled(); // RSS not consulted
  });

  it("falls back to the bounded Claude web search when GDELT is empty (keyed deploy)", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    fetchJsonWithTimeout.mockResolvedValue(GDELT_EMPTY);
    claudeReturns(
      '{"hits":[{"headline":"Refinery boss convicted in 2018 gold-laundering case","source":"Reuters",' +
        '"url":"https://example.com/1","date":"12 Jan 2018","sentiment":"negative","category":"Laundering"}]}',
    );

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Ozcan Halac");

    expect(live).toBe(true);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.headline).toContain("2018"); // lifetime coverage the recent index missed
    expect(create).toHaveBeenCalled();
    expect(fetchTextWithTimeout).not.toHaveBeenCalled(); // RSS skipped on a keyed deploy
  });

  it("returns a genuine empty result (no RSS) when both GDELT and Claude are empty", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    fetchJsonWithTimeout.mockResolvedValue(GDELT_EMPTY);
    claudeReturns('{"hits":[]}');

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Nobody Clean");

    expect(live).toBe(true);
    expect(hits).toHaveLength(0);
    expect(create).toHaveBeenCalled();
    expect(fetchTextWithTimeout).not.toHaveBeenCalled();
  });

  it("falls through to the Google-News scrape when no Anthropic key (dev/local)", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    fetchJsonWithTimeout.mockResolvedValue(GDELT_EMPTY);
    fetchTextWithTimeout.mockResolvedValue({
      ok: true,
      status: 200,
      text: "<rss><channel><item><title>Refinery fraud charges filed</title><link>https://x/1</link><source>BBC</source></item></channel></rss>",
    });

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Ozcan Halac");

    expect(live).toBe(true);
    expect(create).not.toHaveBeenCalled(); // no key → Claude not attempted
    expect(fetchTextWithTimeout).toHaveBeenCalled();
    expect(hits.some((h) => h.headline === "Refinery fraud charges filed")).toBe(true);
  });

  it("falls through to RSS when the bounded Claude search errors/times out (keyed deploy)", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    fetchJsonWithTimeout.mockResolvedValue(GDELT_EMPTY);
    create.mockRejectedValue(new Error("timeout")); // researchAdverseMedia → null
    fetchTextWithTimeout.mockResolvedValue({
      ok: true,
      status: 200,
      text: "<rss><channel><item><title>Bribery probe opened</title><link>https://x/2</link><source>BBC</source></item></channel></rss>",
    });

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("Ozcan Halac");

    expect(live).toBe(true);
    expect(create).toHaveBeenCalled(); // Claude attempted, then threw
    expect(fetchTextWithTimeout).toHaveBeenCalled(); // null result → RSS fallback
    expect(hits.some((h) => h.headline === "Bribery probe opened")).toBe(true);
  });

  it("uses GDELT for the general feed (no subject) and never calls Claude", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key";
    fetchJsonWithTimeout.mockResolvedValue(GDELT_ONE_HIT);

    const { fetchAdverseMedia } = await import("@/lib/integrations/adverse-media");
    const { hits, live } = await fetchAdverseMedia("");

    expect(live).toBe(true);
    expect(hits).toHaveLength(1);
    expect(hits[0]!.subject).toBe("Watchlist");
    expect(create).not.toHaveBeenCalled();
    expect(fetchTextWithTimeout).not.toHaveBeenCalled();
  });
});
