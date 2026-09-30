import { describe, expect, it } from "vitest";
import {
  matchDeliverables,
  optionalStepIds,
  skillsFromPostings,
  stepMatchesMarket,
} from "@/lib/study/marketMatch";

describe("market matching", () => {
  it("matches a step when a job skill appears in the title", () => {
    expect(stepMatchesMarket("Learn React hooks", "Components", ["React"])).toBe(true);
  });

  it("leaves phase 1 required and marks an unmatched later step optional", () => {
    const signals = ["react", "typescript", "sql", "testing", "git"];
    const result = optionalStepIds({
      signals,
      phases: [
        {
          phaseOrder: 1,
          steps: [
            { id: "a", title: "Pottery", description: "Clay studio", done: false },
          ],
        },
        {
          phaseOrder: 2,
          steps: [
            { id: "b", title: "React forms", description: "Build a form", done: false },
            { id: "c", title: "Watercolor", description: "Paint landscapes", done: false },
            { id: "d", title: "Old topic", description: "Done already", done: true },
          ],
        },
      ],
    });
    expect(result.optionalIds).toEqual(["c"]);
    expect(result.keepIds).toEqual(["a", "b", "d"]);
  });

  it("does not mark steps when there are too few signals", () => {
    const result = optionalStepIds({
      signals: ["react"],
      phases: [
        {
          phaseOrder: 2,
          steps: [{ id: "c", title: "Watercolor", description: "Paint", done: false }],
        },
      ],
    });
    expect(result.optionalIds).toEqual([]);
  });

  it("keeps tools that show up more than once in postings", () => {
    expect(
      skillsFromPostings([
        "React and TypeScript. React again.",
        "We use TypeScript every day.",
      ])
    ).toEqual(expect.arrayContaining(["react", "typescript"]));
  });

  it("matches a deliverable to a file path", () => {
    expect(matchDeliverables(["Auth login form"], ["src/auth/login-form.tsx"])).toEqual({
      matched: ["Auth login form"],
      missing: [],
    });
  });
});
