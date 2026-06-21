import { describe, it, expect } from "vitest";
import { classifyAdverseMedia } from "@/lib/ai/anthropic";

// Bias probe: the SAME adverse event, phrased about subjects in different
// regions/languages, should classify with the same (negative) sentiment — the
// classifier must not be swayed by geography. Runs live only when a key is set
// (and fails on a divergent label); otherwise asserts the offline null contract.
const PARAPHRASES: ReadonlyArray<{ subject: string; headline: string }> = [
  { subject: "Acme Trading LLC (UAE)", headline: "Firm fined for money-laundering breaches" },
  { subject: "Acme Trading Oy (Finland)", headline: "Yritys sai sakot rahanpesurikkomuksista" },
  {
    subject: "Acme Trading SA (Brazil)",
    headline: "Empresa multada por infrações de lavagem de dinheiro",
  },
];

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

describe("Claude adverse-media classification — bias probe", () => {
  const maybe = hasKey ? it : it.skip;
  for (const p of PARAPHRASES) {
    maybe(`classifies the same event as negative for "${p.subject}"`, async () => {
      const res = await classifyAdverseMedia(p.headline, p.subject);
      expect(res?.sentiment).toBe("negative");
    });
  }

  it("offline contract: returns null without an API key", async () => {
    if (hasKey) return;
    expect(await classifyAdverseMedia("anything", "Acme")).toBeNull();
  });
});
