import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { grantAllowlistedAdminIfNeeded } from "@/lib/server/admin/grantAllowlistedAdmin";
import type { OnboardingProfileValues } from "@/lib/onboarding/schema";

type ParsedProfile = OnboardingProfileValues;

function normalizeTimelineWeeks(
  value: ParsedProfile["target_timeline_weeks"]
): number | null {
  if (value === "" || value == null) return null;
  return Number(value);
}

export async function upsertProfileForUser(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | undefined,
  parsed: ParsedProfile
): Promise<{ error?: string }> {
  const {
    full_name,
    target_role,
    target_role_job_description,
    weekly_hours,
    current_level,
    goal_intent,
    target_timeline_weeks,
    prior_exposure,
    learning_preference,
  } = parsed;

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      full_name: full_name?.trim() || null,
      target_role: target_role.trim(),
      target_role_job_description: target_role_job_description?.trim() || null,
      weekly_hours,
      current_level: current_level ?? null,
      goal_intent,
      target_timeline_weeks: normalizeTimelineWeeks(target_timeline_weeks),
      prior_exposure: (prior_exposure?.length ?? 0) > 0 ? prior_exposure : null,
      learning_preference:
        learning_preference === "" || learning_preference == null
          ? null
          : learning_preference,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  await grantAllowlistedAdminIfNeeded(userId, userEmail);
  return {};
}
