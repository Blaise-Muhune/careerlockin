import "server-only";
import { createClient } from "@/lib/supabase/server";

export type TimeLogRow = {
  id: string;
  user_id: string;
  log_date: string;
  minutes: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Adds a time log for the user. minutes must be 1–1440.
 */
export async function addTimeLog(
  userId: string,
  logDate: string,
  minutes: number,
  note: string | null
): Promise<TimeLogRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_logs")
    .insert({
      user_id: userId,
      log_date: logDate,
      minutes,
      note: note?.trim() || null,
    })
    .select("id, user_id, log_date, minutes, note, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as TimeLogRow;
}

/**
 * Updates an existing time log. Caller must ensure the log belongs to the user.
 */
export async function updateTimeLog(
  userId: string,
  id: string,
  minutes: number,
  note: string | null
): Promise<TimeLogRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_logs")
    .update({
      minutes,
      note: note?.trim() || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, user_id, log_date, minutes, note, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data as TimeLogRow;
}

/**
 * Deletes a time log. Caller must ensure the log belongs to the user.
 */
export async function deleteTimeLog(userId: string, id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("time_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Returns time logs for the given week (Monday through Sunday).
 * weekStart is YYYY-MM-DD (Monday); weekEnd is YYYY-MM-DD (Sunday).
 */
export async function listTimeLogsForWeek(
  userId: string,
  weekStart: string,
  weekEnd: string
): Promise<TimeLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_logs")
    .select("id, user_id, log_date, minutes, note, created_at, updated_at")
    .eq("user_id", userId)
    .gte("log_date", weekStart)
    .lte("log_date", weekEnd)
    .order("log_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as TimeLogRow[];
}
