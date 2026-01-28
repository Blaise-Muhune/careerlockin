import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/server/email/sendEmail";
import {
  getWeeklyRecapData,
  buildWeeklyRecapBody,
} from "@/lib/server/email/templates/weeklyRecap";
import { getBaseUrl } from "@/lib/server/env";

const SUBJECT = "Your week at a glance";

/**
 * Runs the weekly recap job: finds users with email_weekly_recap = true,
 * fetches their recap data, and sends a plain-text email.
 * Call from cron (e.g. Sunday evening). Uses service role to read profiles and get user emails.
 */
export async function runWeeklyRecapJob(): Promise<{
  sent: number;
  errors: string[];
}> {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard`;

  const supabase = createServiceRoleClient();
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email_weekly_recap", true);

  if (profilesError || !profiles?.length) {
    return { sent: 0, errors: profilesError ? [profilesError.message] : [] };
  }

  const errors: string[] = [];
  let sent = 0;

  for (const row of profiles) {
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
      const data = await getWeeklyRecapData(userId, dashboardUrl);
      const body = buildWeeklyRecapBody(data);
      const result = await sendEmail(email, SUBJECT, body);
      if (result.ok) sent += 1;
      else errors.push(`user ${userId}: ${result.error}`);
    } catch (e) {
      errors.push(`user ${userId}: ${e instanceof Error ? e.message : "send failed"}`);
    }
  }

  return { sent, errors };
}
