"use client";

import { useActionState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Map,
  Briefcase,
  Clock,
  List,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";
import { appSectionLabelClass, appPrimaryButtonClass } from "@/lib/layout/app";
import {
  formChipClass,
  formChipSelectedClass,
  formGoalTileClass,
  formInputClass,
  formLearningPrefClass,
  formSelectClass,
  formTextareaClass,
} from "@/lib/layout/form";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  TARGET_ROLES,
  ROLE_QUICK_ADD,
  PROFILE_PRIOR_EXPOSURE,
} from "@/lib/roadmap-options";

const currentLevels = ["beginner", "intermediate", "advanced"] as const;
const goalIntents = ["job", "internship", "career_switch", "skill_upgrade"] as const;
const timelineWeeks = [8, 12, 16, 24] as const;
const learningPreferences = [
  { value: "reading", label: "Reading" },
  { value: "video", label: "Video" },
  { value: "project_first", label: "Projects first" },
  { value: "mixed", label: "Mixed" },
] as const;

const onboardingFormSchema = z.object({
  full_name: z.string().max(200).optional(),
  target_role: z.string().min(1, "Target role is required").max(200),
  target_role_job_description: z.string().max(2000).optional().or(z.literal("")),
  weekly_hours: z
    .number()
    .int("Must be a whole number")
    .min(1, "At least 1 hour per week")
    .max(60, "At most 60 hours per week"),
  current_level: z.enum(currentLevels).optional(),
  goal_intent: z.enum(goalIntents),
  target_timeline_weeks: z.union([z.enum(["8", "12", "16", "24"]), z.literal("")]).optional(),
  learning_preference: z
    .enum(["reading", "video", "project_first", "mixed"])
    .optional()
    .or(z.literal("")),
  prior_exposure: z.array(z.string().min(1).max(80)).max(20).optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

function togglePrior(
  current: string[] | undefined,
  value: string
): string[] {
  const list = current ?? [];
  if (list.includes(value)) {
    return list.filter((v) => v !== value);
  }
  return [...list, value];
}

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState<
    OnboardingState | null,
    FormData
  >(submitOnboarding, null);

  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      full_name: "",
      target_role: "",
      target_role_job_description: "",
      weekly_hours: 10,
      current_level: undefined,
      goal_intent: "skill_upgrade",
      target_timeline_weeks: "",
      learning_preference: "",
      prior_exposure: [],
    },
  });

  const goalIntent = useWatch({ control, name: "goal_intent", defaultValue: "skill_upgrade" });
  const targetRole = useWatch({ control, name: "target_role", defaultValue: "" });

  return (
    <form action={formAction} className="w-full max-w-2xl mx-auto">
      {state?.error && !state.fieldErrors && (
        <div
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium"
          role="alert"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-10">
        {/* About you */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="size-5 text-primary" aria-hidden />
            <h2 className={appSectionLabelClass}>
              About you
            </h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-base">
              Full name <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              className={formInputClass}
              aria-invalid={Boolean(errors.full_name ?? state?.fieldErrors?.full_name)}
              {...register("full_name")}
            />
            {(errors.full_name?.message ?? state?.fieldErrors?.full_name) && (
              <p className="text-sm text-destructive">
                {errors.full_name?.message ?? state?.fieldErrors?.full_name}
              </p>
            )}
          </div>
        </section>

        {/* Target role */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Map className="size-5 text-primary" aria-hidden />
            <h2 className={appSectionLabelClass}>
              Target role
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {ROLE_QUICK_ADD.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue("target_role", role, { shouldValidate: true })}
                  className={cn(
                    targetRole === role ? formChipSelectedClass : formChipClass
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
            <Controller
              name="target_role"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={TARGET_ROLES}
                  value={field.value}
                  onChange={field.onChange}
                  name="target_role"
                  id="target_role"
                  placeholder="Search or add custom role…"
                  aria-invalid={Boolean(errors.target_role ?? state?.fieldErrors?.target_role)}
                />
              )}
            />
            {(errors.target_role?.message ?? state?.fieldErrors?.target_role) && (
              <p className="text-sm text-destructive">
                {errors.target_role?.message ?? state?.fieldErrors?.target_role}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="target_role_job_description" className="text-base">
                Job description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Paste a job posting or describe the role. This helps us tailor your roadmap to real requirements.
              </p>
              <textarea
                id="target_role_job_description"
                rows={4}
                placeholder="e.g. Paste key requirements from a job posting, or describe the type of work you want to do…"
                maxLength={2000}
                className={formTextareaClass}
                aria-invalid={Boolean(
                  errors.target_role_job_description ?? state?.fieldErrors?.target_role_job_description
                )}
                {...register("target_role_job_description")}
              />
            </div>
          </div>
        </section>

        {/* Goal */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="size-5 text-primary" aria-hidden />
            <h2 className={appSectionLabelClass}>
              What&apos;s your goal?
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Goal intent">
            {goalIntents.map((value) => (
              <label
                key={value}
                className={formGoalTileClass(goalIntent === value)}
              >
                <input type="radio" value={value} {...register("goal_intent")} className="sr-only" />
                <span className="text-sm sm:text-base font-medium text-center">
                  {value === "job" && "Land a job"}
                  {value === "internship" && "Internship"}
                  {value === "career_switch" && "Career switch"}
                  {value === "skill_upgrade" && "Skill upgrade"}
                </span>
              </label>
            ))}
          </div>
          {(errors.goal_intent?.message ?? state?.fieldErrors?.goal_intent) && (
            <p className="text-sm text-destructive">
              {errors.goal_intent?.message ?? state?.fieldErrors?.goal_intent}
            </p>
          )}
        </section>

        {/* Pace & timeline */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" aria-hidden />
            <h2 className={appSectionLabelClass}>
              Pace & timeline
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weekly_hours" className="text-base">
                Hours per week
              </Label>
              <Input
                id="weekly_hours"
                type="number"
                min={1}
                max={60}
                placeholder="10"
                className={formInputClass}
                aria-invalid={Boolean(errors.weekly_hours ?? state?.fieldErrors?.weekly_hours)}
                {...register("weekly_hours", { valueAsNumber: true })}
              />
              <p className="text-sm text-muted-foreground">How much time can you dedicate? (1–60)</p>
              {(errors.weekly_hours?.message ?? state?.fieldErrors?.weekly_hours) && (
                <p className="text-sm text-destructive">
                  {errors.weekly_hours?.message ?? state?.fieldErrors?.weekly_hours}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_timeline_weeks" className="text-base">
                Target timeline <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <select
                id="target_timeline_weeks"
                className={formSelectClass}
                aria-invalid={Boolean(
                  errors.target_timeline_weeks ?? state?.fieldErrors?.target_timeline_weeks
                )}
                {...register("target_timeline_weeks", { setValueAs: (v) => (v === "" ? "" : v) })}
              >
                <option value="">No deadline</option>
                {timelineWeeks.map((w) => (
                  <option key={w} value={String(w)}>
                    {w} weeks
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Current level */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <List className="size-5 text-primary" aria-hidden />
            <h2 className={appSectionLabelClass}>
              Where you&apos;re starting
            </h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_level" className="text-base">
              Current level <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <select
              id="current_level"
              className={cn(formSelectClass, "max-w-xs")}
              aria-invalid={Boolean(errors.current_level ?? state?.fieldErrors?.current_level)}
              {...register("current_level", { setValueAs: (v) => (v === "" ? undefined : v) })}
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </section>

        {/* Prior exposure */}
        <section className="space-y-4">
          <h2 className={appSectionLabelClass}>
            Prior exposure <span className="text-muted-foreground font-normal">(optional)</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Tap what you already know so we can skip basics where it makes sense.
          </p>
          <Controller
            name="prior_exposure"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                {field.value?.map((v) => (
                  <input key={v} type="hidden" name="prior_exposure" value={v} />
                ))}
                <div className="flex flex-wrap gap-2">
                  {PROFILE_PRIOR_EXPOSURE.map(({ value, label }) => {
                    const selected = (field.value ?? []).includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(togglePrior(field.value, value))}
                        className={selected ? formChipSelectedClass : formChipClass}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          />
        </section>

        {/* Learning preference */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" aria-hidden />
            <h2 className={appSectionLabelClass}>
              Learning preference <span className="text-muted-foreground font-normal">(optional)</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3" role="group" aria-label="Learning preference">
            {learningPreferences.map(({ value, label }) => (
              <label
                key={value}
                className={formLearningPrefClass}
              >
                <input
                  type="radio"
                  value={value}
                  {...register("learning_preference", { setValueAs: (v) => (v === "" ? "" : v) })}
                  className="rounded-full border-input size-4"
                />
                <span className="text-sm sm:text-base font-medium">{label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-end pt-8 border-t border-border">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className={cn("w-full sm:w-auto sm:min-w-[200px] rounded-full min-h-12 text-base touch-manipulation", appPrimaryButtonClass)}
        >
          {isPending ? (
            "Saving…"
          ) : (
            <>
              Save and continue
              <ChevronRight className="size-4" aria-hidden />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
