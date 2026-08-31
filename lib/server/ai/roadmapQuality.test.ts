import { describe, expect, it } from "vitest";
import {
  buildGroundingIndexes,
  diversifyPhaseHours,
  findSourceIdForUrl,
  isUniformStepHours,
  rewriteLegacyResourceUrl,
} from "@/lib/server/ai/roadmapQuality";
import { detectRoleFamily } from "@/lib/server/ai/marketGuidance";

describe("rewriteLegacyResourceUrl", () => {
  it("rewrites reactjs.org to react.dev", () => {
    const out = rewriteLegacyResourceUrl(
      "https://reactjs.org/docs/optimizing-performance.html"
    );
    expect(out).toContain("react.dev");
    expect(out).not.toContain("reactjs.org");
  });
});

describe("findSourceIdForUrl", () => {
  it("matches exact and same-host sources", () => {
    const { normalizedToSourceId, hostToSourceId } = buildGroundingIndexes([
      { id: "src_01", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
      { id: "src_02", url: "https://react.dev/learn" },
    ]);

    expect(
      findSourceIdForUrl(
        "https://www.typescriptlang.org/docs/handbook/intro.html",
        normalizedToSourceId,
        hostToSourceId
      )
    ).toBe("src_01");

    expect(
      findSourceIdForUrl(
        "https://typescriptlang.org/docs/",
        normalizedToSourceId,
        hostToSourceId
      )
    ).toBe("src_01");

    expect(
      findSourceIdForUrl(
        "https://evil.example/fake",
        normalizedToSourceId,
        hostToSourceId
      )
    ).toBeNull();
  });
});

describe("diversifyPhaseHours", () => {
  it("detects uniform hours and redistributes", () => {
    expect(isUniformStepHours([10, 10, 10, 10])).toBe(true);
    expect(isUniformStepHours([4, 8, 12, 6])).toBe(false);

    const phases = diversifyPhaseHours([
      {
        phase_project: { estimated_time_hours: 40 },
        steps: [
          { est_hours: 10, title: "Deepen JavaScript Knowledge", description: "basics" },
          { est_hours: 10, title: "Master TypeScript", description: "types" },
          { est_hours: 10, title: "Build production feature", description: "implement deploy" },
          { est_hours: 10, title: "Performance and a11y", description: "accessibility testing" },
        ],
      },
    ]);

    const hours = phases[0].steps.map((s) => s.est_hours);
    expect(new Set(hours).size).toBeGreaterThan(1);
    expect(phases[0].steps[0].est_hours).toBeLessThan(
      phases[0].steps[2].est_hours
    );
  });
});

describe("detectRoleFamily", () => {
  it("classifies common roles", () => {
    expect(detectRoleFamily("Frontend Engineer")).toBe("frontend");
    expect(detectRoleFamily("Backend Engineer")).toBe("backend");
    expect(detectRoleFamily("iOS Developer")).toBe("mobile");
    expect(detectRoleFamily("Product Manager")).toBe("product");
  });
});
