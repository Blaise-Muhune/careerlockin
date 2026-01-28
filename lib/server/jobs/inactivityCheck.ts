import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/server/email/sendEmail";
import { buildInactivityNudgeBody } from "@/lib/server/email/templates/inactivityNudge";
import { getBaseUrl } from "@/lib/server/env";

const SUBJECT = "Pick up where you left off";
const MIN_DAYS_BETWEEN_NUDGES = 14;

function last7DaysIso(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/**
 * Finds users who have logged 0 minutes in the last 7 days,
 * have email_inactivity_nudge = true, and either never received a nudge
 * or last_inactivity_nudge_at is more than 14 days ago.
 * Sends one email per eligible user and updates last_inactivity_nudge_at.
 */
export async function runInactivityCheckJob(): Promise<{
  sent: number;
  errors: string[];
}> {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard`;

  const supabase = createServiceRoleClient();
  const { start, end } = last7DaysIso();

  const { data: activeLast7 } = await supabase
    .from("time_logs")
    .select("user_id")
    .gte("log_date", start)
    .lte("log_date", end);
  const activeUserIds = new Set((activeLast7 ?? []).map((r) => r.user_id));

  // All users with email_inactivity_nudge = true
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id, last_inactivity_nudge_at")
    .eq("email_inactivity_nudge", true);

  if (profilesError || !profiles?.length) {
    return { sent: 0, errors: profilesError ? [profilesError.message] : [] };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MIN_DAYS_BETWEEN_NUDGES);
  const cutoffIso = cutoff.toISOString();

  const eligible = profiles.filter(
    (p) =>
      !activeUserIds.has(p.user_id) &&
      (p.last_inactivity_nudge_at == null || p.last_inactivity_nudge_at < cutoffIso)
  );

  const errors: string[] = [];
  let sent = 0;

  for (const row of eligible) {
    const userId = row.user_id as string;
    let email: string;
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.admin.getUserById(userId);
      if (userError || !user?.email) {
        errors.push(`user ${userId}: no email`);
        continue;
      }
      email = user.email;
    } catch (e) {
      errors.push(`user ${userId}: ${e instanceof Error ? e.message : "fetch failed"}`);
      continue;
    }

    try {
      const body = buildInactivityNudgeBody(dashboardUrl);
      const result = await sendEmail(email, SUBJECT, body);
      if (result.ok) {
        sent += 1;
        await supabase
          .from("profiles")
          .update({ last_inactivity_nudge_at: new Date().toISOString() })
          .eq("user_id", userId);
      } else {
        errors.push(`user ${userId}: ${result.error}`);
      }
    } catch (e) {
      errors.push(`user ${userId}: ${e instanceof Error ? e.message : "send failed"}`);
    }
  }

  return { sent, errors };
}
