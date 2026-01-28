import "server-only";
import type { RoadmapWithSteps } from "@/lib/server/db/roadmaps";

export type PhaseEstimate = {
  phase: string;
  hours: number;
  weeks: number;
};

export type RoadmapTotalEstimate = {
  totalHours: number;
  totalWeeks: number;
};

/** Treat null est_hours as 0 for calculations. */
function stepHours(estHours: number | null): number {
  return estHours != null && Number.isFinite(estHours) ? Number(estHours) : 0;
}

/**
 * Returns per-phase estimates: hours (sum of est_hours in phase) and weeks (hours / weeklyHours).
 * weeklyHours must be > 0; if 0, weeks is 0 for all phases.
 */
export function calculatePhaseEstimates(
  roadmap: RoadmapWithSteps,
  weeklyHours: number
): PhaseEstimate[] {
  const byPhase = new Map<string, number>();
  for (const step of roadmap.steps) {
    const h = stepHours(step.est_hours);
    byPhase.set(step.phase, (byPhase.get(step.phase) ?? 0) + h);
  }
  const divisor = weeklyHours > 0 ? weeklyHours : 1;
  return Array.from(byPhase.entries()).map(([phase, hours]) => ({
    phase,
    hours,
    weeks: hours / divisor,
  }));
}

/**
 * Returns total roadmap estimate: sum of all step est_hours and total weeks (totalHours / weeklyHours).
 * weeklyHours must be > 0; if 0, totalWeeks is 0.
 */
export function calculateRoadmapTotal(
  roadmap: RoadmapWithSteps,
  weeklyHours: number
): RoadmapTotalEstimate {
  const totalHours = roadmap.steps.reduce(
    (s, step) => s + stepHours(step.est_hours),
    0
  );
  const totalWeeks = weeklyHours > 0 ? totalHours / weeklyHours : 0;
  return { totalHours, totalWeeks };
}

export type PhaseProgress = {
  phaseHours: number;
  phaseCompletedHours: number;
};

/**
 * Returns total hours and completed hours (by est_hours of done steps) for the given phase.
 * Used to show "how far through the phase" when current_work is in that phase.
 */
export function getPhaseProgress(
  roadmap: RoadmapWithSteps,
  phaseTitle: string,
  progressMap: Record<string, { is_done: boolean }>
): PhaseProgress {
  let phaseHours = 0;
  let phaseCompletedHours = 0;
  for (const step of roadmap.steps) {
    if (step.phase !== phaseTitle) continue;
    const h = stepHours(step.est_hours);
    phaseHours += h;
    if (progressMap[step.id]?.is_done) phaseCompletedHours += h;
  }
  return { phaseHours, phaseCompletedHours };
}
