import { z } from "zod";

export const CURRENT_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const GOAL_INTENTS = ["job", "internship", "career_switch", "skill_upgrade"] as const;
export const TIMELINE_WEEKS = [8, 12, 16, 24] as const;
export const LEARNING_PREFERENCES = ["reading", "video", "project_first", "mixed"] as const;

const skillString = z.string().trim().min(1).max(80);

/** Client + server profile fields collected before account creation. */
export const onboardingProfileSchema = z.object({
  full_name: z.string().max(200).optional().or(z.literal("")),
  target_role: z.string().min(1, "Target role is required").max(200),
  target_role_job_description: z.string().max(2000).optional().or(z.literal("")),
  weekly_hours: z.coerce
    .number()
    .int("Must be a whole number")
    .min(1, "At least 1 hour per week")
    .max(60, "At most 60 hours per week"),
  current_level: z
    .enum(CURRENT_LEVELS)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  goal_intent: z.enum(GOAL_INTENTS),
  target_timeline_weeks: z
    .union([z.enum(["8", "12", "16", "24"]), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? "" : v ?? "")),
  prior_exposure: z.array(skillString).max(20).optional().default([]),
  learning_preference: z
    .enum(LEARNING_PREFERENCES)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? "" : v ?? "")),
});

export type OnboardingProfileInput = z.input<typeof onboardingProfileSchema>;
export type OnboardingProfileValues = z.output<typeof onboardingProfileSchema>;

/** Stored in sessionStorage between wizard steps. */
export type OnboardingDraft = {
  full_name?: string;
  target_role: string;
  target_role_job_description?: string;
  weekly_hours: number;
  current_level?: (typeof CURRENT_LEVELS)[number] | "";
  goal_intent: (typeof GOAL_INTENTS)[number];
  target_timeline_weeks?: "" | "8" | "12" | "16" | "24";
  prior_exposure?: string[];
  learning_preference?: (typeof LEARNING_PREFERENCES)[number] | "";
};

export const defaultOnboardingDraft = (): OnboardingDraft => ({
  full_name: "",
  target_role: "",
  target_role_job_description: "",
  weekly_hours: 10,
  current_level: "",
  goal_intent: "skill_upgrade",
  target_timeline_weeks: "",
  prior_exposure: [],
  learning_preference: "",
});

export function parseOnboardingFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const priorExposureRaw = formData.getAll("prior_exposure");
  const priorExposureArr = priorExposureRaw
    .map((x) => String(x).trim())
    .filter((x) => x.length > 0 && x.length <= 80)
    .slice(0, 20);

  return onboardingProfileSchema.safeParse({
    ...raw,
    full_name: raw.full_name === "" ? undefined : raw.full_name,
    current_level: raw.current_level === "" ? undefined : raw.current_level,
    target_timeline_weeks: raw.target_timeline_weeks === "" ? undefined : raw.target_timeline_weeks,
    learning_preference: raw.learning_preference === "" ? undefined : raw.learning_preference,
    prior_exposure: priorExposureArr,
  });
}

export function draftToFormData(draft: OnboardingDraft): FormData {
  const formData = new FormData();
  if (draft.full_name) formData.set("full_name", draft.full_name);
  formData.set("target_role", draft.target_role);
  if (draft.target_role_job_description) {
    formData.set("target_role_job_description", draft.target_role_job_description);
  }
  formData.set("weekly_hours", String(draft.weekly_hours));
  if (draft.current_level) formData.set("current_level", draft.current_level);
  formData.set("goal_intent", draft.goal_intent);
  if (draft.target_timeline_weeks) {
    formData.set("target_timeline_weeks", draft.target_timeline_weeks);
  }
  for (const value of draft.prior_exposure ?? []) {
    formData.append("prior_exposure", value);
  }
  if (draft.learning_preference) {
    formData.set("learning_preference", draft.learning_preference);
  }
  return formData;
}
