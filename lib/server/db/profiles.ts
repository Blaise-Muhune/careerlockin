import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ProfileWeeklyHours = {
  weekly_hours: number;
};

export type ProfileForRoadmapEdit = {
  target_role: string;
  target_role_job_description: string | null;
  weekly_hours: number;
  current_level: string | null;
  goal_intent: string | null;
  target_timeline_weeks: number | null;
  prior_exposure: string[] | null;
  learning_preference: string | null;
};

export type EmailPrefs = {
  email_weekly_recap: boolean;
  email_inactivity_nudge: boolean;
  email_milestones: boolean;
};

/**
 * Returns profile fields needed to pre-fill the roadmap edit/regenerate form.
 */
export async function getProfileForRoadmapEdit(
  userId: string
): Promise<ProfileForRoadmapEdit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "target_role, target_role_job_description, weekly_hours, current_level, goal_intent, target_timeline_weeks, prior_exposure, learning_preference"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    target_role: (data.target_role as string) ?? "",
    target_role_job_description: (data.target_role_job_description as string | null) ?? null,
    weekly_hours: (data.weekly_hours as number) ?? 10,
    current_level: (data.current_level as string | null) ?? null,
    goal_intent: (data.goal_intent as string | null) ?? null,
    target_timeline_weeks: (data.target_timeline_weeks as number | null) ?? null,
    prior_exposure: (data.prior_exposure as string[] | null) ?? null,
    learning_preference: (data.learning_preference as string | null) ?? null,
  };
}

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

export type ProfileForSettings = ProfileForRoadmapEdit & {
  full_name: string | null;
};

/**
 * Returns profile fields for the Settings edit form.
 */
export async function getProfileForSettings(
  userId: string
): Promise<ProfileForSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "full_name, target_role, target_role_job_description, weekly_hours, current_level, goal_intent, target_timeline_weeks, prior_exposure, learning_preference"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    full_name: (data.full_name as string | null) ?? null,
    target_role: (data.target_role as string) ?? "",
    target_role_job_description:
      (data.target_role_job_description as string | null) ?? null,
    weekly_hours: (data.weekly_hours as number) ?? 10,
    current_level: (data.current_level as string | null) ?? null,
    goal_intent: (data.goal_intent as string | null) ?? null,
    target_timeline_weeks: (data.target_timeline_weeks as number | null) ?? null,
    prior_exposure: (data.prior_exposure as string[] | null) ?? null,
    learning_preference: (data.learning_preference as string | null) ?? null,
  };
}
