import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getLatestRoadmapForUser } from "@/lib/server/db/roadmaps";
import { getProgressMapForRoadmap } from "@/lib/server/db/progress";
import { getCurrentWork } from "@/lib/server/db/currentWork";

export type ProgressSnapshot = {
  target_role: string;
  percent_complete: number;
  current_phase: string | null;
  current_step: string | null;
  total_hours: number;
  generated_at: string;
};

const CAPTION = "Working toward my tech career with a clear plan.";

/**
 * Returns a progress snapshot for sharing. No username, email, or internal IDs.
 * For Free users, percent_complete and scope are Phase 1 only.
 * Server-only; call with authenticated userId.
 */
export async function getProgressSnapshot(
  userId: string
): Promise<ProgressSnapshot | null> {
  const [roadmap, currentWork, entitlements] = await Promise.all([
    getLatestRoadmapForUser(userId),
    getCurrentWork(userId),
    getEntitlements(userId),
  ]);

  if (!roadmap) {
    return null;
  }

  const canViewFull = entitlements.canViewFullRoadmap;
  const progressMap = await getProgressMapForRoadmap(userId, roadmap.id);

  const phases = [...new Set(roadmap.steps.map((s) => s.phase))].sort();
  const firstPhase = phases[0] ?? null;

  let percent_complete: number;
  let current_phase: string | null = currentWork?.phase_title ?? null;
  let current_step: string | null = currentWork?.step_id
    ? (roadmap.steps.find((s) => s.id === currentWork.step_id)?.title ?? null)
    : null;

  if (!canViewFull && firstPhase != null) {
    const phase1Steps = roadmap.steps.filter((s) => s.phase === firstPhase);
    const total = phase1Steps.length;
    const completed = phase1Steps.filter((s) => progressMap[s.id]?.is_done).length;
    percent_complete = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (current_phase !== firstPhase) {
      current_phase = firstPhase;
      current_step = phase1Steps.find((s) => !progressMap[s.id]?.is_done)?.title ?? null;
    }
  } else {
    const total = roadmap.steps.length;
    const completed = Object.values(progressMap).filter((p) => p.is_done).length;
    percent_complete = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  const supabase = await createClient();
  const { data: timeRows } = await supabase
    .from("time_logs")
    .select("minutes")
    .eq("user_id", userId);
  const total_minutes = (timeRows ?? []).reduce((s, r) => s + (r.minutes ?? 0), 0);
  const total_hours = Math.round((total_minutes / 60) * 10) / 10;

  return {
    target_role: roadmap.target_role,
    percent_complete,
    current_phase,
    current_step,
    total_hours,
    generated_at: new Date().toISOString(),
  };
}

export { CAPTION as PROGRESS_SNAPSHOT_CAPTION };
