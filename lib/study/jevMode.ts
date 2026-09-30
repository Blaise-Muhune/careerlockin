import type { StudyMode } from "@/lib/study/chooseMode";

/** Below this, the example/build split stays with the local rule. */
export const JEV_CONFIDENCE_FLOOR = 0.6;

/**
 * Rest and recall stay with the local rules. Jev may only switch a new card
 * between example and build when it is sure.
 */
export function applyJevChoice(
  rule: StudyMode,
  choice: string | null,
  confidence: number | null
): StudyMode {
  if (rule === "rest" || rule === "recall") return rule;
  if (choice !== "example" && choice !== "build") return rule;
  if (confidence == null || confidence < JEV_CONFIDENCE_FLOOR) return rule;
  return choice;
}
