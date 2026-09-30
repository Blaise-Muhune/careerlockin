export function fallbackLessonSteps(title: string, description: string): string[] {
  const sentences = description
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24 && sentence.length <= 240);
  if (sentences.length >= 3) return sentences.slice(0, 5);
  return [
    `${title} starts with one concrete case.`,
    "The next move uses that same case on a slightly different input.",
    "The last move is doing it once without looking back at the case.",
  ];
}

export function lessonStepsFromModel(raw: string[]): string[] {
  const cleaned = raw.map((step) => step.trim()).filter((step) => step.length > 0 && step.length <= 240);
  return cleaned.length >= 3 ? cleaned.slice(0, 5) : [];
}

/** How many steps are already on screen. The first step is visible immediately. */
export function visibleStepCount(stepIndex: number, total: number): number {
  if (total <= 0) return 0;
  const index = stepIndex < 1 ? 1 : stepIndex;
  return Math.min(index, total);
}

export function lessonWalkOpen(stepIndex: number, total: number, recall: boolean): boolean {
  if (recall || total < 3) return false;
  return visibleStepCount(stepIndex, total) < total;
}
