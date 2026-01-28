import "server-only";
import { getCurrentWeekStats } from "@/lib/server/db/analytics";

/**
 * Returns one encouragement message per user based on current-week stats.
 * Message is deterministic from stats; effectively changes at most when stats change (e.g. once per day after logging).
 * Rule order: goal hit > zero progress > consistency > hours-away.
 */
export async function getEncouragementMessage(
  userId: string
): Promise<string> {
  const { planned_hours, completed_minutes, days_logged_count } =
    await getCurrentWeekStats(userId);
  const plannedMinutes = planned_hours * 60;

  if (plannedMinutes > 0 && completed_minutes >= plannedMinutes) {
    return "You hit your weekly goal. Nice work.";
  }
  if (completed_minutes === 0) {
    return "Start with 15 minutes today.";
  }
  if (days_logged_count >= 3) {
    return "Consistency is building.";
  }
  if (plannedMinutes > 0 && completed_minutes < plannedMinutes) {
    const hoursAway = (plannedMinutes - completed_minutes) / 60;
    const h = Math.round(hoursAway * 10) / 10;
    return `You're ${h} hours away from your weekly goal.`;
  }
  return "Every bit of progress counts.";
}
