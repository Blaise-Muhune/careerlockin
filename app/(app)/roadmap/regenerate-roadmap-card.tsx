"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { regenerateRoadmap } from "@/app/actions/generateRoadmap";
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
import type { ProfileForRoadmapEdit } from "@/lib/server/db/profiles";

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

type RegenerateRoadmapCardProps = {
  roadmapId: string;
  targetRole: string;
  profile: ProfileForRoadmapEdit | null;
  regenerationCount: number;
};

export function RegenerateRoadmapCard({
  roadmapId,
  targetRole,
  profile,
  regenerationCount,
}: RegenerateRoadmapCardProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(regenerateRoadmap, null);

  const canRegenerate = regenerationCount < 1;

  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      target_role: targetRole,
      target_role_job_description: profile?.target_role_job_description ?? "",
      weekly_hours: profile?.weekly_hours ?? 10,
      current_level: (profile?.current_level as FormValues["current_level"]) ?? undefined,
      goal_intent: (profile?.goal_intent as FormValues["goal_intent"]) ?? "skill_upgrade",
      target_timeline_weeks:
        profile?.target_timeline_weeks != null &&
        [8, 12, 16, 24].includes(profile.target_timeline_weeks)
          ? (String(profile.target_timeline_weeks) as FormValues["target_timeline_weeks"])
          : "",
      learning_preference:
        (profile?.learning_preference as FormValues["learning_preference"]) ?? "",
      prior_exposure: profile?.prior_exposure ?? [],
    },
  });

  const targetRoleWatch = useWatch({ control, name: "target_role", defaultValue: targetRole });

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state?.ok, router]);

  if (!canRegenerate) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        You&apos;ve used your 1 regeneration for this roadmap.
      </div>
    );
  }

  return (
    <>
      {isPending && <RoadmapGeneratingOverlay />}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="regenerate" className="rounded-xl border border-border">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <RotateCw className="size-4 text-muted-foreground" aria-hidden />
              <span className="font-medium">Edit & Regenerate</span>
              <span className="text-sm font-normal text-muted-foreground">
                — 1 regeneration left
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="roadmap_id" value={roadmapId} />
              {state && !state.ok && (
                <p className="text-sm text-destructive font-medium" role="alert">
                  {state.error}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {ROLE_QUICK_ADD.slice(0, 6).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setValue("target_role", role, { shouldValidate: true })}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      targetRoleWatch === role
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg_target_role">Target role</Label>
                <Controller
                  name="target_role"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={TARGET_ROLES}
                      value={field.value}
                      onChange={field.onChange}
                      name="target_role"
                      id="reg_target_role"
                      placeholder="Search or add custom role…"
                      aria-invalid={Boolean(errors.target_role)}
                    />
                  )}
                />
                {errors.target_role?.message && (
                  <p className="text-sm text-destructive">{errors.target_role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg_target_role_job_description">Job description (optional)</Label>
                <textarea
                  id="reg_target_role_job_description"
                  rows={3}
                  placeholder="Paste a job posting or describe the role…"
                  maxLength={2000}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-y"
                  {...register("target_role_job_description")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_weekly_hours">Hours/week</Label>
                  <Input
                    id="reg_weekly_hours"
                    type="number"
                    min={1}
                    max={60}
                    {...register("weekly_hours", { valueAsNumber: true })}
                  />
                  {errors.weekly_hours?.message && (
                    <p className="text-sm text-destructive">{errors.weekly_hours.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg_target_timeline_weeks">Timeline (optional)</Label>
                  <select
                    id="reg_target_timeline_weeks"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <div className="space-y-2">
                <Label>Goal</Label>
                <div className="flex flex-wrap gap-2" role="group">
                  {goalIntents.map((value) => (
                    <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        value={value}
                        {...register("goal_intent")}
                        className="rounded-full border-input"
                      />
                      <span>
                        {value === "job" && "Job"}
                        {value === "internship" && "Internship"}
                        {value === "career_switch" && "Career switch"}
                        {value === "skill_upgrade" && "Skill upgrade"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg_current_level">Current level (optional)</Label>
                <select
                  id="reg_current_level"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring max-w-[180px]"
                  {...register("current_level", { setValueAs: (v) => (v === "" ? undefined : v) })}
                >
                  <option value="">—</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Prior exposure (optional)</Label>
                <Controller
                  name="prior_exposure"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {PRIOR_EXPOSURE_QUICK_ADD.slice(0, 5).map((skill) => {
                          const selected = (field.value ?? []).includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                const current = field.value ?? [];
                                field.onChange(
                                  selected ? current.filter((v) => v !== skill) : [...current, skill]
                                );
                              }}
                              className={cn(
                                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                                selected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
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
                        id="reg_prior_exposure"
                        placeholder="Search or add skill…"
                      />
                    </div>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Learning preference (optional)</Label>
                <div className="flex flex-wrap gap-2" role="group">
                  {learningPreferences.map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        value={value}
                        {...register("learning_preference", {
                          setValueAs: (v) => (v === "" ? "" : v),
                        })}
                        className="rounded-full border-input"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? "Regenerating…" : "Regenerate roadmap"}
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
