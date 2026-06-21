import { describe, it, expect } from "vitest";
import { classifyAdverseMedia } from "@/lib/ai/anthropic";

// Golden eval set for the only LLM in the platform. When ANTHROPIC_API_KEY is
// set (CI secret / local), these run live and FAIL on drift — a known headline
// that stops classifying as expected breaks the build. Without a key they skip,
// preserving the offline-first contract, and we assert the safe null fallback.
const GOLDEN: ReadonlyArray<{ headline: string; expected: "negative" | "positive" | "neutral" }> = [
  { headline: "Firm fined $5m for money-laundering breaches", expected: "negative" },
  { headline: "Executives charged in international fraud probe", expected: "negative" },
  { headline: "Company wins industry sustainability award", expected: "positive" },
];

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

describe("Claude adverse-media classification — golden eval", () => {
  const maybe = hasKey ? it : it.skip;
  for (const c of GOLDEN) {
    maybe(`classifies "${c.headline}" as ${c.expected}`, async () => {
      const res = await classifyAdverseMedia(c.headline, "Acme Trading LLC");
      expect(res?.sentiment).toBe(c.expected);
    });
  }

  it("offline contract: returns null without an API key (no fabrication)", async () => {
    if (hasKey) return;
    const res = await classifyAdverseMedia("Anything at all", "Acme Trading LLC");
    expect(res).toBeNull();
  });
});
