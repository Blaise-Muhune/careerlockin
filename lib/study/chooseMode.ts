export type StudyMode = "example" | "build" | "recall" | "rest";

export function chooseStudyMode(input: {
  weeklyHours: number;
  loggedHours: number;
  learningPreference: string | null;
  reps: number;
  due: Date | null;
  now?: Date;
}): StudyMode {
  const now = input.now ?? new Date();
  if (input.weeklyHours > 0 && input.loggedHours >= input.weeklyHours) {
    return "rest";
  }
  if (input.reps > 0 && input.due != null && input.due.getTime() <= now.getTime()) {
    return "recall";
  }
  if (input.learningPreference === "project_first") return "build";
  return "example";
}
