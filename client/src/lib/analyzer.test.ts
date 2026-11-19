import { describe, expect, it } from "vitest";
import { analyzeSubmission, containsSecrets, DEMO_MESSAGE } from "./analyzer";

describe("BASIRA local analyzer", () => {
  it("keeps a benign URL low and does not make a network request", () => {
    const result = analyzeSubmission("https://example.com/about", "url");
    expect(result.inputType).toBe("url");
    expect(result.risk).toBe("low");
    expect(result.parsed.hostname).toBe("example.com");
    expect(result.timeline[0].detail).toContain("locally");
  });

  it("flags a brand-impersonating URL with structural signals", () => {
    const result = analyzeSubmission("https://emiratesnbd-secure-check.xyz/verify/account?session=48291", "url");
    expect(result.risk).toBe("high");
    expect(result.indicators.map((item) => item.id)).toEqual(expect.arrayContaining(["brand-impersonation", "tld", "action-path"]));
    expect(result.evidence.some((item) => item.kind === "inference")).toBe(true);
  });

  it("detects pressure and sensitive-data requests in a message", () => {
    const result = analyzeSubmission(DEMO_MESSAGE, "message");
    expect(result.inputType).toBe("message");
    expect(result.indicators.map((item) => item.id)).toEqual(expect.arrayContaining(["urgency", "sensitive-request", "message-link"]));
    expect(result.timeline.some((event) => event.kind === "hypothesis")).toBe(true);
  });

  it("does not overstate a benign message", () => {
    const result = analyzeSubmission("Your meeting is confirmed for tomorrow at 10:00.", "message");
    expect(result.risk).toBe("low");
    expect(result.score).toBe(3);
  });

  it("warns before secrets enter the analyzer", () => {
    expect(containsSecrets("Please enter your password and OTP")).toBe(true);
    expect(containsSecrets("Can you check this link for me?")).toBe(false);
  });
});
