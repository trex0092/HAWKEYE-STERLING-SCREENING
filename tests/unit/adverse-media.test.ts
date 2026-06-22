import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/adverse-media/route";
import { parseGoogleNewsRss, fetchAdverseMedia } from "@/lib/integrations/adverse-media";

function verdict(
  subject: string,
): Promise<{ ok: boolean; live: boolean; verdict: { riskTier: string } }> {
  return POST(
    new Request("http://localhost/api/adverse-media", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject }),
    }),
  ).then((r) => r.json());
}

describe("POST /api/adverse-media (offline)", () => {
  it("returns a clear, non-live verdict for test names", async () => {
    const data = await verdict("test");
    expect(data.ok).toBe(true);
    expect(data.live).toBe(false);
    expect(data.verdict.riskTier).toBe("clear");
  });

  it("is deterministic for a given name", async () => {
    const a = await verdict("Boris Volkov");
    const b = await verdict("Boris Volkov");
    expect(a.verdict.riskTier).toBe(b.verdict.riskTier);
  });
});

describe("parseGoogleNewsRss", () => {
  it("parses RSS items into adverse-media hits", () => {
    const xml = `<rss><channel>
      <item><title>Sanctions designation expanded on subject</title><link>https://example.com/1</link><pubDate>Sat, 14 Jun 2026 09:00:00 GMT</pubDate><source url="https://reuters.com">Reuters</source></item>
      <item><title>Second story about subject</title><link>https://example.com/2</link></item>
    </channel></rss>`;
    const hits = parseGoogleNewsRss(xml, "Subject X");
    expect(hits).toHaveLength(2);
    expect(hits[0]!.headline).toContain("Sanctions designation");
    expect(hits[0]!.source).toBe("Reuters");
    expect(hits[0]!.subject).toBe("Subject X");
    expect(hits[0]!.url).toBe("https://example.com/1");
  });

  it("decodes CDATA and entities", () => {
    const xml = `<rss><channel><item><title><![CDATA[Fraud & laundering probe]]></title><link>https://x/3</link></item></channel></rss>`;
    const hits = parseGoogleNewsRss(xml, "Y");
    expect(hits[0]!.headline).toBe("Fraud & laundering probe");
  });
});

describe("fetchAdverseMedia (offline)", () => {
  it("returns an empty, non-live seed feed without network", async () => {
    const { hits, live } = await fetchAdverseMedia("Boris Volkov");
    expect(live).toBe(false);
    expect(hits).toHaveLength(0);
  });
});
