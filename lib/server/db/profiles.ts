import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ProfileWeeklyHours = {
  weekly_hours: number;
};

export type EmailPrefs = {
  email_weekly_recap: boolean;
  email_inactivity_nudge: boolean;
  email_milestones: boolean;
};

/**
 * Returns the profile's weekly_hours for the given user.
 * Use when the user and profile are already guaranteed (e.g. after requireUserAndProfile).
 */
export async function getProfileWeeklyHours(
  userId: string
): Promise<ProfileWeeklyHours | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("weekly_hours")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) return null;
  return { weekly_hours: data.weekly_hours as number };
}

/**
 * Returns email preferences for the user. Uses RLS (user must own profile).
 * Returns null if the email-prefs columns don't exist yet (run supabase/migrations/00007_email_preferences.sql).
 */
export async function getEmailPrefs(userId: string): Promise<EmailPrefs | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("email_weekly_recap, email_inactivity_nudge, email_milestones")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (/column .* does not exist|relation.*does not exist/i.test(error.message))
      return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  return {
    email_weekly_recap: Boolean(data.email_weekly_recap),
    email_inactivity_nudge: Boolean(data.email_inactivity_nudge),
    email_milestones: Boolean(data.email_milestones),
  };
}

/**
 * Updates email preferences. Only updates provided fields. Uses RLS.
 */
export async function updateEmailPrefs(
  userId: string,
  prefs: Partial<EmailPrefs>
): Promise<void> {
  const supabase = await createClient();
  const updates: Record<string, boolean> = {};
  if (typeof prefs.email_weekly_recap === "boolean")
    updates.email_weekly_recap = prefs.email_weekly_recap;
  if (typeof prefs.email_inactivity_nudge === "boolean")
    updates.email_inactivity_nudge = prefs.email_inactivity_nudge;
  if (typeof prefs.email_milestones === "boolean")
    updates.email_milestones = prefs.email_milestones;
  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
