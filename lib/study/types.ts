import type { StudyMode } from "@/lib/study/chooseMode";

export type StudyCardView = {
  id: string;
  stepId: string;
  mode: Exclude<StudyMode, "rest">;
  displayMode: StudyMode;
  example: string;
  steps: string[];
  stepIndex: number;
  tryThis: string;
  question: string;
  focus: string | null;
  resourceUrl: string | null;
  resourceTitle: string | null;
  due: string;
  reps: number;
  lastAnswer: string | null;
  lastCorrection: string | null;
  checkKind: "code" | "repo" | null;
  checkSummary: string | null;
};

export type StudyCardResult =
  | { ok: true; kind: "rest"; message: string }
  | { ok: true; kind: "empty" }
  | { ok: true; kind: "card"; card: StudyCardView }
  | { ok: false; error: string };
