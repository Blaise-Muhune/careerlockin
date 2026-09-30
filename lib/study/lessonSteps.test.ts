import { describe, expect, it } from "vitest";
import {
  fallbackLessonSteps,
  lessonStepsFromModel,
  lessonWalkOpen,
  visibleStepCount,
} from "@/lib/study/lessonSteps";

describe("lesson steps", () => {
  it("keeps a model list only when it has at least three short steps", () => {
    expect(lessonStepsFromModel(["One.", "Two.", "Three."])).toEqual(["One.", "Two.", "Three."]);
    expect(lessonStepsFromModel(["Only one."])).toEqual([]);
    expect(lessonStepsFromModel(["A", "B", "C", "D", "E", "F"])).toHaveLength(5);
  });

  it("builds three fallback steps from a short description", () => {
    expect(fallbackLessonSteps("SQL filters", "Too short.")).toHaveLength(3);
  });

  it("shows the first step immediately and closes the walk on the last step", () => {
    expect(visibleStepCount(0, 4)).toBe(1);
    expect(visibleStepCount(2, 4)).toBe(2);
    expect(lessonWalkOpen(1, 4, false)).toBe(true);
    expect(lessonWalkOpen(4, 4, false)).toBe(false);
    expect(lessonWalkOpen(1, 4, true)).toBe(false);
    expect(lessonWalkOpen(1, 0, false)).toBe(false);
  });
});
