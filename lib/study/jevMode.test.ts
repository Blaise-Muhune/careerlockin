import { describe, expect, it } from "vitest";
import { applyJevChoice } from "@/lib/study/jevMode";

describe("applyJevChoice", () => {
  it("keeps rest and recall even when Jev picks something else", () => {
    expect(applyJevChoice("rest", "build", 0.9)).toBe("rest");
    expect(applyJevChoice("recall", "example", 0.9)).toBe("recall");
  });

  it("uses a confident example or build choice", () => {
    expect(applyJevChoice("example", "build", 0.6)).toBe("build");
    expect(applyJevChoice("build", "example", 0.8)).toBe("example");
  });

  it("keeps the rule when Jev is unsure or returns an unknown option", () => {
    expect(applyJevChoice("example", "build", 0.59)).toBe("example");
    expect(applyJevChoice("build", "recall", 0.9)).toBe("build");
    expect(applyJevChoice("example", null, null)).toBe("example");
  });
});
