import "server-only";
import { createClient } from "@/lib/supabase/server";

export type WeeklyCheckinRow = {
  id: string;
  week_start: string;
  completed_hours: number | null;
  notes: string | null;
  created_at: string;
};

export type WeeklyCheckinSnapshot = {
  id: string;
  week_start: string;
  completed_hours: number | null;
  notes: string | null;
  created_at: string;
};

/**
 * Upserts a weekly check-in for the user. planned_hours is no longer used;
 * completed_hours is an optional snapshot (e.g. when saving notes).
 * Respects unique(user_id, week_start).
 */
export async function upsertWeeklyCheckin(
  userId: string,
  weekStart: string,
  completedHours: number | null,
  notes: string | null
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("weekly_checkins").upsert(
    {
      user_id: userId,
      week_start: weekStart,
      completed_hours: completedHours,
      notes: notes?.trim() || null,
    },
    { onConflict: "user_id,week_start" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Returns the weekly check-in for the user and week, or null.
 */
export async function getWeeklyCheckin(
  userId: string,
  weekStart: string
): Promise<WeeklyCheckinSnapshot | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_checkins")
    .select("id, week_start, completed_hours, notes, created_at")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return {
    id: data.id,
    week_start: data.week_start,
    completed_hours: data.completed_hours,
    notes: data.notes,
    created_at: data.created_at,
  };
}

/**
 * Returns the most recent weekly check-ins for the user, newest first.
 * completed_hours is the stored snapshot (e.g. from when notes were saved).
 */
export async function listRecentCheckins(
  userId: string,
  limit = 8
): Promise<WeeklyCheckinRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_checkins")
    .select("id, week_start, completed_hours, notes, created_at")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    week_start: row.week_start,
    completed_hours: row.completed_hours,
    notes: row.notes,
    created_at: row.created_at,
  }));
}
