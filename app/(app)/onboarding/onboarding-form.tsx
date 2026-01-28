"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  submitOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";

const currentLevels = ["beginner", "intermediate", "advanced"] as const;
const goalIntents = ["job", "internship", "career_switch", "skill_upgrade"] as const;
const timelineWeeks = [8, 12, 16, 24] as const;
const priorExposureOptions = [
  { value: "html_css", label: "HTML/CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "git", label: "Git" },
  { value: "react", label: "React" },
  { value: "databases", label: "Databases" },
  { value: "apis", label: "APIs" },
  { value: "python", label: "Python" },
  { value: "none", label: "None" },
] as const;
const learningPreferences = [
  { value: "reading", label: "Reading" },
  { value: "video", label: "Video" },
  { value: "project_first", label: "Projects first" },
  { value: "mixed", label: "Mixed" },
] as const;

const onboardingFormSchema = z.object({
  full_name: z.string().max(200).optional(),
  target_role: z.string().min(1, "Target role is required").max(200),
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
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState<
    OnboardingState | null,
    FormData
  >(submitOnboarding, null);

  const {
    register,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      full_name: "",
      target_role: "",
      weekly_hours: 10,
      current_level: undefined,
      goal_intent: "skill_upgrade",
      target_timeline_weeks: "",
      learning_preference: "",
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set up your profile</CardTitle>
        <CardDescription>
          A few details so we can build your plan.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-destructive font-medium" role="alert">
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">Full name (optional)</Label>
            <Input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              aria-invalid={Boolean(errors.full_name ?? state?.fieldErrors?.full_name)}
              {...register("full_name")}
            />
            {(errors.full_name?.message ?? state?.fieldErrors?.full_name) && (
              <p className="text-sm text-destructive">
                {errors.full_name?.message ?? state?.fieldErrors?.full_name}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="target_role">Target role</Label>
            <Input
              id="target_role"
              type="text"
              placeholder="e.g. Frontend Engineer"
              aria-invalid={Boolean(errors.target_role ?? state?.fieldErrors?.target_role)}
              {...register("target_role")}
            />
            {(errors.target_role?.message ?? state?.fieldErrors?.target_role) && (
              <p className="text-sm text-destructive">
                {errors.target_role?.message ?? state?.fieldErrors?.target_role}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Goal</span>
            <div className="flex flex-wrap gap-3" role="group" aria-label="Goal intent">
              {(["job", "internship", "career_switch", "skill_upgrade"] as const).map((value) => (
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
            {(errors.goal_intent?.message ?? state?.fieldErrors?.goal_intent) && (
              <p className="text-sm text-destructive">
                {errors.goal_intent?.message ?? state?.fieldErrors?.goal_intent}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="weekly_hours">Hours/week (1–60)</Label>
              <Input
                id="weekly_hours"
                type="number"
                min={1}
                max={60}
                placeholder="10"
                aria-invalid={Boolean(errors.weekly_hours ?? state?.fieldErrors?.weekly_hours)}
                {...register("weekly_hours", { valueAsNumber: true })}
              />
              {(errors.weekly_hours?.message ?? state?.fieldErrors?.weekly_hours) && (
                <p className="text-sm text-destructive">
                  {errors.weekly_hours?.message ?? state?.fieldErrors?.weekly_hours}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="target_timeline_weeks">Timeline (optional)</Label>
              <select
                id="target_timeline_weeks"
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
                )}
                aria-invalid={Boolean(errors.target_timeline_weeks ?? state?.fieldErrors?.target_timeline_weeks)}
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="current_level">Current level (optional)</Label>
            <select
              id="current_level"
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
              )}
              aria-invalid={Boolean(errors.current_level ?? state?.fieldErrors?.current_level)}
              {...register("current_level", { setValueAs: (v) => (v === "" ? undefined : v) })}
            >
              <option value="">—</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Prior exposure (optional)</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2" role="group" aria-label="Prior exposure">
              {priorExposureOptions.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="prior_exposure"
                    value={value}
                    className="rounded border-input"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Learning preference (optional)</span>
            <div className="flex flex-wrap gap-3" role="group" aria-label="Learning preference">
              {learningPreferences.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value={value}
                    {...register("learning_preference", { setValueAs: (v) => (v === "" ? "" : v) })}
                    className="rounded-full border-input"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Saving…" : "Save and continue"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
