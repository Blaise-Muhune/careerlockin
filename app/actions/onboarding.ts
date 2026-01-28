"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUserForOnboarding } from "@/lib/server/auth";

const currentLevels = ["beginner", "intermediate", "advanced"] as const;
const goalIntents = ["job", "internship", "career_switch", "skill_upgrade"] as const;
const priorExposureOptions = ["html_css", "javascript", "git", "react", "databases", "apis", "python", "none"] as const;
const learningPreferences = ["reading", "video", "project_first", "mixed"] as const;

const onboardingSchema = z.object({
  full_name: z.string().max(200).optional().or(z.literal("")),
  target_role: z.string().min(1, "Target role is required").max(200),
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
    .transform((v) => (v === "" ? null : (v != null ? Number(v) : null))),
  prior_exposure: z
    .array(z.enum(priorExposureOptions))
    .optional()
    .default([]),
  learning_preference: z
    .enum(learningPreferences)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v)),
});

export type OnboardingState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitOnboarding(
  _prev: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState> {
  const raw = Object.fromEntries(formData.entries());
  const priorExposureRaw = formData.getAll("prior_exposure");
  const priorExposureArr = Array.isArray(priorExposureRaw)
    ? (priorExposureRaw as string[]).filter((x) =>
        (priorExposureOptions as readonly string[]).includes(x)
      )
    : [];

  const parsed = onboardingSchema.safeParse({
    ...raw,
    full_name: raw.full_name === "" ? undefined : raw.full_name,
    current_level: raw.current_level === "" ? undefined : raw.current_level,
    target_timeline_weeks: raw.target_timeline_weeks === "" ? undefined : raw.target_timeline_weeks,
    learning_preference: raw.learning_preference === "" ? undefined : raw.learning_preference,
    prior_exposure: priorExposureArr,
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return {
      error: issues.formErrors[0] ?? "Invalid input",
      fieldErrors: issues.fieldErrors as Record<string, string>,
    };
  }

  const user = await requireUserForOnboarding();
  const {
    full_name,
    target_role,
    weekly_hours,
    current_level,
    goal_intent,
    target_timeline_weeks,
    prior_exposure: priorExposureVal,
    learning_preference,
  } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      full_name: full_name?.trim() || null,
      target_role: target_role.trim(),
      weekly_hours,
      current_level,
      goal_intent,
      target_timeline_weeks: target_timeline_weeks ?? null,
      prior_exposure: (priorExposureVal?.length ?? 0) > 0 ? priorExposureVal : null,
      learning_preference: learning_preference ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect("/dashboard");
}
