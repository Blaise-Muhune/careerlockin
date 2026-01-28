import "server-only";
import { getCurrentWeekStats } from "@/lib/server/db/analytics";
import { getRoadmapProgressStats } from "@/lib/server/db/analytics";
import { getCurrentWork } from "@/lib/server/db/currentWork";
import { getLatestRoadmapForUser } from "@/lib/server/db/roadmaps";
import { getEncouragementMessage } from "@/lib/server/analytics/encouragement";

export type WeeklyRecapData = {
  hoursLogged: number;
  stepsCompleted: number;
  totalSteps: number;
  currentPhase: string | null;
  currentStepTitle: string | null;
  encouragement: string;
  dashboardUrl: string;
};

/**
 * Builds plain-text body for the weekly recap email.
 */
export function buildWeeklyRecapBody(data: WeeklyRecapData): string {
  const lines: string[] = [];
  lines.push("Your week at a glance.");
  lines.push("");
  lines.push(`Hours logged this week: ${data.hoursLogged} h`);
  lines.push(
    `Steps completed: ${data.stepsCompleted}${data.totalSteps > 0 ? ` of ${data.totalSteps}` : ""}`
  );
  if (data.currentPhase || data.currentStepTitle) {
    const where =
      data.currentPhase && data.currentStepTitle
        ? `${data.currentPhase} · ${data.currentStepTitle}`
        : data.currentPhase ?? data.currentStepTitle ?? "";
    if (where) lines.push(`Current: ${where}`);
  }
  lines.push("");
  lines.push(data.encouragement);
  lines.push("");
  lines.push(`View dashboard: ${data.dashboardUrl}`);
  return lines.join("\n");
}

/**
 * Fetches recap data for a user. Used by the weekly recap job.
 */
export async function getWeeklyRecapData(
  userId: string,
  dashboardUrl: string
): Promise<WeeklyRecapData> {
  const [stats, roadmap, currentWork, encouragement] = await Promise.all([
    getCurrentWeekStats(userId),
    getLatestRoadmapForUser(userId),
    getCurrentWork(userId),
    getEncouragementMessage(userId),
  ]);
  const hoursLogged = stats.completed_minutes / 60;
  let stepsCompleted = 0;
  let totalSteps = 0;
  if (roadmap) {
    const progress = await getRoadmapProgressStats(userId, roadmap.id);
    stepsCompleted = progress.completed_steps;
    totalSteps = progress.total_steps;
  }
  const currentPhase = currentWork?.phase_title ?? null;
  const currentStepTitle =
    roadmap && currentWork?.step_id
      ? roadmap.steps.find((s) => s.id === currentWork.step_id)?.title ?? null
      : null;

  return {
    hoursLogged: Math.round(hoursLogged * 10) / 10,
    stepsCompleted,
    totalSteps,
    currentPhase,
    currentStepTitle,
    encouragement,
    dashboardUrl,
  };
}
