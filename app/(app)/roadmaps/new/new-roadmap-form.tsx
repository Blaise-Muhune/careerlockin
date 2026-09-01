"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Map,
  Briefcase,
  Clock,
  List,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRoadmap, type GenerateRoadmapState } from "@/app/actions/generateRoadmap";
import { RoadmapGeneratingOverlay } from "@/components/loading/RoadmapGeneratingOverlay";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import {
  TARGET_ROLES,
  PRIOR_EXPOSURE_OPTIONS,
  ROLE_QUICK_ADD,
  PRIOR_EXPOSURE_QUICK_ADD,
} from "@/lib/roadmap-options";
import { cn } from "@/lib/utils";
import { appPrimaryButtonClass, appSectionLabelClass } from "@/lib/layout/app";
import {
  formAiProofModuleCheckboxLabel,
  formAiProofModuleClass,
  formAiProofModuleDescription,
  formAiProofModuleTitle,
  formChipClass,
  formChipSelectedClass,
  formGoalTileClass,
  formInputClass,
  formLearningPrefClass,
  formSelectClass,
  formTextareaClass,
} from "@/lib/layout/form";

const currentLevels = ["beginner", "intermediate", "advanced"] as const;
const goalIntents = ["job", "internship", "career_switch", "skill_upgrade"] as const;
const timelineWeeks = [8, 12, 16, 24] as const;
const learningPreferences = [
  { value: "reading", label: "Reading" },
  { value: "video", label: "Video" },
  { value: "project_first", label: "Projects first" },
  { value: "mixed", label: "Mixed" },
] as const;

const schema = z.object({
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
  prior_exposure: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

async function submitNewRoadmap(
  _prev: GenerateRoadmapState | null,
  formData: FormData
): Promise<GenerateRoadmapState> {
  return generateRoadmap(formData);
}

export function NewRoadmapForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(submitNewRoadmap, null);

  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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

  useEffect(() => {
    if (state?.ok) {
      router.push("/roadmap");
    }
  }, [state?.ok, router]);

  return (
    <>
      {isPending && <RoadmapGeneratingOverlay />}
      <form action={formAction} className="w-full max-w-2xl mx-auto">
        {state && !state.ok && (
          <div
            className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium"
            role="alert"
          >
            {state.error}
          </div>
        )}

        <div className="space-y-10">
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
                    className={targetRole === role ? formChipSelectedClass : formChipClass}
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
                    aria-invalid={Boolean(errors.target_role)}
                  />
                )}
              />
              {errors.target_role?.message && (
                <p className="text-sm text-destructive">{errors.target_role.message}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="target_role_job_description" className="text-base">
                  Job description (optional)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Paste a job posting or describe the role. This helps us tailor the roadmap to real requirements.
                </p>
                <textarea
                  id="target_role_job_description"
                  rows={4}
                  placeholder="e.g. Paste key requirements from a job posting, or describe the type of work you want to do…"
                  maxLength={2000}
                  className={formTextareaClass}
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
                  <input
                    type="radio"
                    value={value}
                    {...register("goal_intent")}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-center">
                    {value === "job" && "Land a job"}
                    {value === "internship" && "Internship"}
                    {value === "career_switch" && "Career switch"}
                    {value === "skill_upgrade" && "Skill upgrade"}
                  </span>
                </label>
              ))}
            </div>
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
                  aria-invalid={Boolean(errors.weekly_hours)}
                  {...register("weekly_hours", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  How much time can you dedicate? (1–60)
                </p>
                {errors.weekly_hours?.message && (
                  <p className="text-sm text-destructive">{errors.weekly_hours.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_timeline_weeks" className="text-base">
                  Target timeline (optional)
                </Label>
                <select
                  id="target_timeline_weeks"
                  className={formSelectClass}
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
                Current level (optional)
              </Label>
              <select
                id="current_level"
                className={cn(formSelectClass, "max-w-xs")}
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
              Prior exposure (optional)
            </h2>
            <p className="text-sm text-muted-foreground">
              Search and add skills or experience you already have.
            </p>
            <Controller
              name="prior_exposure"
              control={control}
              render={({ field }) => (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {PRIOR_EXPOSURE_QUICK_ADD.map((skill) => {
                      const selected = (field.value ?? []).includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            const current = field.value ?? [];
                            if (selected) {
                              field.onChange(current.filter((v) => v !== skill));
                            } else {
                              field.onChange([...current, skill]);
                            }
                          }}
                          className={selected ? formChipSelectedClass : formChipClass}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  <SearchableMultiSelect
                    options={PRIOR_EXPOSURE_OPTIONS}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    name="prior_exposure"
                    id="prior_exposure"
                    placeholder="Search or add custom skill…"
                  />
                </div>
              )}
            />
          </section>

          {/* Learning preference */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" aria-hidden />
              <h2 className={appSectionLabelClass}>
                Learning preference (optional)
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
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Extra phase (optional) */}
        <section className={cn(formAiProofModuleClass, "mt-10")}>
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">{formAiProofModuleTitle}</h2>
                <span className={appSectionLabelClass}>Optional</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {formAiProofModuleDescription}
              </p>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent py-1 hover:border-border/80">
                <input
                  type="checkbox"
                  name="include_ai_proof_module"
                  value="on"
                  className="mt-1 size-4 shrink-0 rounded border-input"
                />
                <span className="text-sm font-medium text-foreground leading-snug">
                  {formAiProofModuleCheckboxLabel}
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-8 border-t border-border">
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/roadmap">Cancel</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className={cn("min-w-[180px] rounded-full", appPrimaryButtonClass)}
          >
            {isPending ? (
              "Building…"
            ) : (
              <>
                Create roadmap
                <ChevronRight className="size-4" aria-hidden />
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
