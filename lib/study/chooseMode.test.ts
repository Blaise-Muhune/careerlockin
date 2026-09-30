import { describe, expect, it } from "vitest";
import { chooseStudyMode } from "@/lib/study/chooseMode";

const now = new Date("2026-09-29T12:00:00Z");

describe("chooseStudyMode", () => {
  it("rests when the weekly hours are already logged", () => {
    expect(
      chooseStudyMode({
        weeklyHours: 10,
        loggedHours: 10,
        learningPreference: "reading",
        reps: 0,
        due: null,
        now,
      })
    ).toBe("rest");
  });

  it("asks a recall question when a review is due", () => {
    expect(
      chooseStudyMode({
        weeklyHours: 10,
        loggedHours: 2,
        learningPreference: "reading",
        reps: 2,
        due: new Date("2026-09-28T12:00:00Z"),
        now,
      })
    ).toBe("recall");
  });

  it("starts with a build when the person prefers projects", () => {
    expect(
      chooseStudyMode({
        weeklyHours: 10,
        loggedHours: 1,
        learningPreference: "project_first",
        reps: 0,
        due: null,
        now,
      })
    ).toBe("build");
  });
});
