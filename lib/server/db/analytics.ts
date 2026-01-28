import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  getDefaultWeekStartDetroit,
  getWeekEndFromStart,
  getWeekStartOffset,
} from "@/lib/weekStart";
import { getProfileWeeklyHours } from "@/lib/server/db/profiles";
import { listTimeLogsForWeek } from "@/lib/server/db/timeLogs";
import { getProgressMapForRoadmap } from "@/lib/server/db/progress";

export type WeeklyMinutesPoint = {
  weekStart: string;
  minutes: number;
};

export type WeeklyHoursTrendPoint = {
  week_start: string;
  total_minutes: number;
};

export type CurrentWeekStats = {
  planned_hours: number;
  completed_minutes: number;
  days_logged_count: number;
};

export type RoadmapProgressStats = {
  total_steps: number;
  completed_steps: number;
  percent_complete: number;
};

export type PhaseProgressStatsItem = {
  phase_title: string;
  total_steps: number;
  completed_steps: number;
  phase_percent: number;
};

/**
 * Returns total minutes per week for the last N weeks (current week + N-1 past).
 * weekStarts should be [currentWeekStart, current-7d, current-14d, current-21d].
 */
export async function getWeeklyMinutesTrend(
  userId: string,
  weekStarts: string[]
): Promise<WeeklyMinutesPoint[]> {
  if (weekStarts.length === 0) return [];

  const supabase = await createClient();
  const results: WeeklyMinutesPoint[] = [];

  for (const ws of weekStarts) {
    const weekEnd = getWeekEndFromStart(ws);
    const { data } = await supabase
      .from("time_logs")
      .select("minutes")
      .eq("user_id", userId)
      .gte("log_date", ws)
      .lte("log_date", weekEnd);
    const minutes = (data ?? []).reduce((s, r) => s + (r.minutes ?? 0), 0);
    results.push({ weekStart: ws, minutes });
  }

  return results;
}

/**
 * Returns total minutes per week for the last N weeks. Server-only.
 */
export async function getWeeklyHoursTrend(
  userId: string,
  weeks = 4
): Promise<WeeklyHoursTrendPoint[]> {
  const weekStart = getDefaultWeekStartDetroit();
  const weekStarts: string[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    weekStarts.push(getWeekStartOffset(weekStart, i));
  }
  const points = await getWeeklyMinutesTrend(userId, weekStarts);
  return points.map((p) => ({ week_start: p.weekStart, total_minutes: p.minutes }));
}

/**
 * Returns current-week stats: planned hours, completed minutes, distinct days logged.
 * Server-only, uses authenticated userId.
 */
export async function getCurrentWeekStats(
  userId: string
): Promise<CurrentWeekStats> {
  const weekStart = getDefaultWeekStartDetroit();
  const weekEnd = getWeekEndFromStart(weekStart);
  const [profile, logs] = await Promise.all([
    getProfileWeeklyHours(userId),
    listTimeLogsForWeek(userId, weekStart, weekEnd),
  ]);
  const planned_hours = profile?.weekly_hours ?? 0;
  const completed_minutes = logs.reduce((s, r) => s + r.minutes, 0);
  const days_logged_count = new Set(logs.map((r) => r.log_date)).size;
  return { planned_hours, completed_minutes, days_logged_count };
}

/**
 * Returns total steps, completed steps, and percent complete for a roadmap.
 * Server-only.
 */
export async function getRoadmapProgressStats(
  userId: string,
  roadmapId: string
): Promise<RoadmapProgressStats> {
  const supabase = await createClient();
  const { data: steps } = await supabase
    .from("roadmap_steps")
    .select("id")
    .eq("roadmap_id", roadmapId);
  const total_steps = steps?.length ?? 0;
  if (total_steps === 0) {
    return { total_steps: 0, completed_steps: 0, percent_complete: 0 };
  }
  const progressMap = await getProgressMapForRoadmap(userId, roadmapId);
  const completed_steps = Object.values(progressMap).filter((p) => p.is_done).length;
  const percent_complete =
    total_steps > 0 ? Math.round((completed_steps / total_steps) * 100) : 0;
  return { total_steps, completed_steps, percent_complete };
}

/**
 * Returns per-phase progress: phase_title, total_steps, completed_steps, phase_percent.
 * Server-only, efficient (single progress lookup, grouped by phase).
 */
export async function getPhaseProgressStats(
  userId: string,
  roadmapId: string
): Promise<PhaseProgressStatsItem[]> {
  const supabase = await createClient();
  const { data: steps } = await supabase
    .from("roadmap_steps")
    .select("id, phase")
    .eq("roadmap_id", roadmapId);
  if (!steps?.length) return [];
  const progressMap = await getProgressMapForRoadmap(userId, roadmapId);
  const byPhase = new Map<
    string,
    { total: number; completed: number }
  >();
  for (const s of steps) {
    const cur = byPhase.get(s.phase) ?? { total: 0, completed: 0 };
    cur.total += 1;
    if (progressMap[s.id]?.is_done) cur.completed += 1;
    byPhase.set(s.phase, cur);
  }
  return Array.from(byPhase.entries()).map(([phase_title, { total, completed }]) => ({
    phase_title,
    total_steps: total,
    completed_steps: completed,
    phase_percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  }));
}

export type PhaseCompletionPoint = {
  phase: string;
  completed: number;
  total: number;
};

/**
 * Returns per-phase completed/total steps for the given roadmap.
 * Uses roadmap steps and progress map (server should pass already-fetched or fetch here).
 */
export function getPhaseCompletion(
  steps: Array<{ id: string; phase: string }>,
  progressMap: Record<string, { is_done: boolean }>
): PhaseCompletionPoint[] {
  const byPhase = new Map<string, { completed: number; total: number }>();
  for (const step of steps) {
    const cur = byPhase.get(step.phase) ?? { completed: 0, total: 0 };
    cur.total += 1;
    if (progressMap[step.id]?.is_done) cur.completed += 1;
    byPhase.set(step.phase, cur);
  }
  return Array.from(byPhase.entries()).map(([phase, { completed, total }]) => ({
    phase,
    completed,
    total,
  }));
}
