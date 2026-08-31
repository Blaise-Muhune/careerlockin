"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  updateProfile,
  type UpdateProfileState,
} from "@/app/actions/account";
import type { ProfileForSettings } from "@/lib/server/db/profiles";
import { PROFILE_PRIOR_EXPOSURE } from "@/lib/roadmap-options";

const PRIOR_OPTIONS = PROFILE_PRIOR_EXPOSURE;

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Career profile</CardTitle>
        <CardDescription>
          Update the inputs used for roadmap generation and weekly targets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile.full_name ?? ""}
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_role">Target role</Label>
            <Input
              id="target_role"
              name="target_role"
              required
              defaultValue={profile.target_role}
              maxLength={200}
              aria-invalid={Boolean(state?.fieldErrors?.target_role)}
            />
            {state?.fieldErrors?.target_role && (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.target_role}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_role_job_description">
              Job description (optional)
            </Label>
            <textarea
              id="target_role_job_description"
              name="target_role_job_description"
              defaultValue={profile.target_role_job_description ?? ""}
              maxLength={2000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
            />
          </div>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal_intent">Goal</Label>
            <select
              id="goal_intent"
              name="goal_intent"
              required
              defaultValue={profile.goal_intent ?? "skill_upgrade"}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="job">Job</option>
              <option value="internship">Internship</option>
              <option value="career_switch">Career switch</option>
              <option value="skill_upgrade">Skill upgrade</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_level">Current level</Label>
            <select
              id="current_level"
              name="current_level"
              defaultValue={profile.current_level ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
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
              defaultValue={
                profile.target_timeline_weeks != null
                  ? String(profile.target_timeline_weeks)
                  : ""
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Not specified</option>
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="16">16</option>
              <option value="24">24</option>
            </select>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Prior exposure</legend>
            <div className="grid grid-cols-2 gap-2">
              {PRIOR_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="prior_exposure"
                    value={opt.value}
                    defaultChecked={prior.has(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="learning_preference">Learning preference</Label>
            <select
              id="learning_preference"
              name="learning_preference"
              defaultValue={profile.learning_preference ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Not specified</option>
              <option value="reading">Reading</option>
              <option value="video">Video</option>
              <option value="project_first">Project first</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          {state?.ok && (
            <p className="text-sm text-muted-foreground" role="status">
              Profile saved.
            </p>
          )}
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
