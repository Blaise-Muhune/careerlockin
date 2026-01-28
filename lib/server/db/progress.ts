import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ProgressEntry = {
  is_done: boolean;
  done_at: string | null;
};

/**
 * Returns a map of step_id -> { is_done, done_at } for the given user and roadmap.
 * Only includes steps that belong to that roadmap.
 */
export async function getProgressMapForRoadmap(
  userId: string,
  roadmapId: string
): Promise<Record<string, ProgressEntry>> {
  const supabase = await createClient();

  const { data: steps } = await supabase
    .from("roadmap_steps")
    .select("id")
    .eq("roadmap_id", roadmapId);

  const stepIds = (steps ?? []).map((s) => s.id);
  if (stepIds.length === 0) return {};

  const { data: progressRows } = await supabase
    .from("progress")
    .select("step_id, is_done, done_at")
    .eq("user_id", userId)
    .in("step_id", stepIds);

  const map: Record<string, ProgressEntry> = {};
  const stepSet = new Set(stepIds);
  for (const row of progressRows ?? []) {
    if (stepSet.has(row.step_id)) {
      map[row.step_id] = {
        is_done: row.is_done ?? false,
        done_at: row.done_at,
      };
    }
  }
  return map;
}

/**
 * Verifies that stepId belongs to a roadmap owned by userId, then upserts progress.
 * Throws if ownership cannot be verified.
 */
export async function setStepDone(
  userId: string,
  stepId: string,
  isDone: boolean
): Promise<void> {
  const supabase = await createClient();

  const { data: step } = await supabase
    .from("roadmap_steps")
    .select("id, roadmap_id")
    .eq("id", stepId)
    .single();

  if (!step) {
    throw new Error("Step not found");
  }

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("id", step.roadmap_id)
    .eq("user_id", userId)
    .single();

  if (!roadmap) {
    throw new Error("Step does not belong to your roadmap");
  }

  const { error } = await supabase.from("progress").upsert(
    {
      user_id: userId,
      step_id: stepId,
      is_done: isDone,
      done_at: isDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,step_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
