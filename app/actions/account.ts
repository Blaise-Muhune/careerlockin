"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { trackProductEvent } from "@/lib/server/analytics/productEvents";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const currentLevels = ["beginner", "intermediate", "advanced"] as const;
const goalIntents = ["job", "internship", "career_switch", "skill_upgrade"] as const;
const learningPreferences = ["reading", "video", "project_first", "mixed"] as const;

const skillString = z.string().trim().min(1).max(80);

const updateProfileSchema = z.object({
  full_name: z.string().max(200).optional().or(z.literal("")),
  target_role: z.string().min(1, "Target role is required").max(200),
  target_role_job_description: z.string().max(2000).optional().or(z.literal("")),
  weekly_hours: z.coerce
    .number()
    .int("Must be a whole number")
    .min(1, "At least 1 hour per week")
    .max(60, "At most 60 hours per week"),
  current_level: z
    .enum(currentLevels)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
  goal_intent: z.enum(goalIntents),
  target_timeline_weeks: z
    .union([z.enum(["8", "12", "16", "24"]), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? null : v != null ? Number(v) : null)),
  prior_exposure: z.array(skillString).max(20).optional().default([]),
  learning_preference: z
    .enum(learningPreferences)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
});

export type UpdateProfileState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateProfile(
  _prev: UpdateProfileState | null,
  formData: FormData
): Promise<UpdateProfileState> {
  const { userId } = await requireUserAndProfile();
  const raw = Object.fromEntries(formData.entries());
  const priorExposureRaw = formData.getAll("prior_exposure");
  const priorExposureArr = Array.isArray(priorExposureRaw)
    ? (priorExposureRaw as string[])
        .map((x) => x.trim())
        .filter((x) => x.length > 0 && x.length <= 80)
        .slice(0, 20)
    : [];

  const parsed = updateProfileSchema.safeParse({
    ...raw,
    full_name: raw.full_name === "" ? undefined : raw.full_name,
    current_level: raw.current_level === "" ? undefined : raw.current_level,
    target_timeline_weeks:
      raw.target_timeline_weeks === "" ? undefined : raw.target_timeline_weeks,
    learning_preference:
      raw.learning_preference === "" ? undefined : raw.learning_preference,
    prior_exposure: priorExposureArr,
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return {
      error: issues.formErrors[0] ?? "Invalid input",
      fieldErrors: Object.fromEntries(
        Object.entries(issues.fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid"])
      ),
    };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name?.trim() || null,
      target_role: data.target_role.trim(),
      target_role_job_description: data.target_role_job_description?.trim() || null,
      weekly_hours: data.weekly_hours,
      current_level: data.current_level,
      goal_intent: data.goal_intent,
      target_timeline_weeks: data.target_timeline_weeks ?? null,
      prior_exposure:
        (data.prior_exposure?.length ?? 0) > 0 ? data.prior_exposure : null,
      learning_preference: data.learning_preference ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  void trackProductEvent(userId, "profile_updated");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export type DeleteRoadmapState =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteRoadmap(
  roadmapId: string
): Promise<DeleteRoadmapState> {
  const { userId } = await requireUserAndProfile();
  if (!roadmapId.trim()) {
    return { ok: false, error: "Roadmap ID is required." };
  }

  const supabase = await createClient();
  const { data: owned, error: findError } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("id", roadmapId)
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) {
    return { ok: false, error: findError.message };
  }
  if (!owned) {
    return { ok: false, error: "Roadmap not found." };
  }

  const { error } = await supabase
    .from("roadmaps")
    .delete()
    .eq("id", roadmapId)
    .eq("user_id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  void trackProductEvent(userId, "roadmap_deleted", { roadmap_id: roadmapId });
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  revalidatePath("/settings");
  return { ok: true };
}

export type DeleteAccountState =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Permanently deletes the auth user (cascade cleans owned rows).
 * Requires explicit confirmation string from the client.
 */
export async function deleteAccount(
  confirmation: string
): Promise<DeleteAccountState> {
  const { userId } = await requireUserAndProfile();
  if (confirmation.trim().toUpperCase() !== "DELETE") {
    return {
      ok: false,
      error: 'Type DELETE to confirm account deletion.',
    };
  }

  void trackProductEvent(userId, "account_deleted");

  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { ok: false, error: error.message };
  }

  const sessionClient = await createClient();
  await sessionClient.auth.signOut();
  redirect("/");
}
