import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CurrentWorkStatus = "in_progress" | "paused" | "completed";

export type CurrentWorkRow = {
  user_id: string;
  roadmap_id: string | null;
  phase_title: string | null;
  step_id: string | null;
  status: CurrentWorkStatus;
  started_at: string;
  updated_at: string;
};

/**
 * Returns the current work row for the user, or null.
 */
export async function getCurrentWork(
  userId: string
): Promise<CurrentWorkRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("current_work")
    .select("user_id, roadmap_id, phase_title, step_id, status, started_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return {
    user_id: data.user_id,
    roadmap_id: data.roadmap_id,
    phase_title: data.phase_title,
    step_id: data.step_id,
    status: data.status as CurrentWorkStatus,
    started_at: data.started_at,
    updated_at: data.updated_at,
  };
}

/**
 * Sets or updates the user's current work. Verifies step ownership is done by the caller.
 * Sets status to in_progress and started_at to now.
 */
export async function setCurrentWork(
  userId: string,
  roadmapId: string,
  phaseTitle: string,
  stepId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("current_work").upsert(
    {
      user_id: userId,
      roadmap_id: roadmapId,
      phase_title: phaseTitle,
      step_id: stepId,
      status: "in_progress",
      started_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Updates the status (in_progress | paused | completed) for the user's current work.
 */
export async function setCurrentWorkStatus(
  userId: string,
  status: CurrentWorkStatus
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("current_work")
    .update({ status })
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Clears the user's current work row.
 */
export async function clearCurrentWork(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("current_work")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
