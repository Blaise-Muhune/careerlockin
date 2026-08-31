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

function phaseProjectHours(phaseProject: unknown): number {
  if (!phaseProject || typeof phaseProject !== "object") return 0;
  const hours = (phaseProject as { estimated_time_hours?: unknown })
    .estimated_time_hours;
  return typeof hours === "number" && Number.isFinite(hours) ? hours : 0;
}

/**
 * Per-phase estimates: step hours + phase project hours, weeks = hours / weeklyHours.
 */
export function calculatePhaseEstimates(
  roadmap: RoadmapWithSteps,
  weeklyHours: number
): PhaseEstimate[] {
  const byPhase = new Map<string, number>();
  const projectByPhase = new Map<string, number>();

  for (const step of roadmap.steps) {
    const h = stepHours(step.est_hours);
    byPhase.set(step.phase, (byPhase.get(step.phase) ?? 0) + h);
    if (step.phase_project != null && !projectByPhase.has(step.phase)) {
      projectByPhase.set(step.phase, phaseProjectHours(step.phase_project));
    }
  }

  const divisor = weeklyHours > 0 ? weeklyHours : 1;
  return Array.from(byPhase.entries()).map(([phase, stepHrs]) => {
    const hours = stepHrs + (projectByPhase.get(phase) ?? 0);
    return {
      phase,
      hours,
      weeks: hours / divisor,
    };
  });
}

/**
 * Total roadmap estimate including phase projects.
 */
export function calculateRoadmapTotal(
  roadmap: RoadmapWithSteps,
  weeklyHours: number
): RoadmapTotalEstimate {
  let totalHours = 0;
  const seenProjects = new Set<string>();
  for (const step of roadmap.steps) {
    totalHours += stepHours(step.est_hours);
    if (step.phase_project != null && !seenProjects.has(step.phase)) {
      seenProjects.add(step.phase);
      totalHours += phaseProjectHours(step.phase_project);
    }
  }
  const totalWeeks = weeklyHours > 0 ? totalHours / weeklyHours : 0;
  return { totalHours, totalWeeks };
}

export type PhaseProgress = {
  phaseHours: number;
  phaseCompletedHours: number;
};

/**
 * Phase hours include the phase project once. Completed hours count done steps
 * plus the project when all steps in the phase are done.
 */
export function getPhaseProgress(
  roadmap: RoadmapWithSteps,
  phaseTitle: string,
  progressMap: Record<string, { is_done: boolean }>
): PhaseProgress {
  let phaseHours = 0;
  let phaseCompletedHours = 0;
  let projectHours = 0;
  let stepCount = 0;
  let doneCount = 0;

  for (const step of roadmap.steps) {
    if (step.phase !== phaseTitle) continue;
    const h = stepHours(step.est_hours);
    phaseHours += h;
    stepCount += 1;
    if (progressMap[step.id]?.is_done) {
      phaseCompletedHours += h;
      doneCount += 1;
    }
    if (step.phase_project != null && projectHours === 0) {
      projectHours = phaseProjectHours(step.phase_project);
    }
  }

  phaseHours += projectHours;
  if (stepCount > 0 && doneCount === stepCount) {
    phaseCompletedHours += projectHours;
  }

  return { phaseHours, phaseCompletedHours };
}
