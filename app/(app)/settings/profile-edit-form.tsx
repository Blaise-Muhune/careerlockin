"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import {
  updateProfile,
  type UpdateProfileState,
} from "@/app/actions/account";
import type { ProfileForSettings } from "@/lib/server/db/profiles";
import { PROFILE_PRIOR_EXPOSURE } from "@/lib/roadmap-options";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { appPrimaryButtonClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

const PRIOR_OPTIONS = PROFILE_PRIOR_EXPOSURE;

const fieldClassName =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type ProfileEditFormProps = {
  profile: ProfileForSettings;
};

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    null as UpdateProfileState | null
  );

  const prior = new Set(profile.prior_exposure ?? []);

  return (
    <SettingsCard>
      <CardContent className="pt-6">
        <form action={formAction} className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} maxLength={200} className="h-10 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_role">Target role</Label>
            <Input
              id="target_role"
              name="target_role"
              required
              defaultValue={profile.target_role}
              maxLength={200}
              className="h-10 rounded-xl"
              aria-invalid={Boolean(state?.fieldErrors?.target_role)}
            />
            {state?.fieldErrors?.target_role ? (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.target_role}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_role_job_description">Job description (optional)</Label>
            <textarea
              id="target_role_job_description"
              name="target_role_job_description"
              defaultValue={profile.target_role_job_description ?? ""}
              maxLength={2000}
              rows={3}
              className={cn(fieldClassName, "min-h-[88px] resize-y py-2")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weekly_hours">Weekly hours</Label>
              <Input
                id="weekly_hours"
                name="weekly_hours"
                type="number"
                min={1}
                max={60}
                required
                defaultValue={profile.weekly_hours}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal_intent">Goal</Label>
              <select id="goal_intent" name="goal_intent" required defaultValue={profile.goal_intent ?? "skill_upgrade"} className={fieldClassName}>
                <option value="job">Job</option>
                <option value="internship">Internship</option>
                <option value="career_switch">Career switch</option>
                <option value="skill_upgrade">Skill upgrade</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_level">Current level</Label>
              <select id="current_level" name="current_level" defaultValue={profile.current_level ?? ""} className={fieldClassName}>
                <option value="">Not specified</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_timeline_weeks">Timeline (weeks)</Label>
              <select
                id="target_timeline_weeks"
                name="target_timeline_weeks"
                defaultValue={profile.target_timeline_weeks != null ? String(profile.target_timeline_weeks) : ""}
                className={fieldClassName}
              >
                <option value="">Not specified</option>
                <option value="8">8</option>
                <option value="12">12</option>
                <option value="16">16</option>
                <option value="24">24</option>
              </select>
            </div>
          </div>
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Prior exposure</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRIOR_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm">
                  <input type="checkbox" name="prior_exposure" value={opt.value} defaultChecked={prior.has(opt.value)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="learning_preference">Learning preference</Label>
            <select id="learning_preference" name="learning_preference" defaultValue={profile.learning_preference ?? ""} className={fieldClassName}>
              <option value="">Not specified</option>
              <option value="reading">Reading</option>
              <option value="video">Video</option>
              <option value="project_first">Project first</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          {state?.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          {state?.ok ? (
            <p className="text-sm text-muted-foreground" role="status">
              Profile saved.
            </p>
          ) : null}
          <Button type="submit" disabled={isPending} className={cn("w-fit", appPrimaryButtonClass)}>
            {isPending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </SettingsCard>
  );
}
