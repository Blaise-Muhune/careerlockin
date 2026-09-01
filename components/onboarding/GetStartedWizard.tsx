"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { OnboardingStepRail } from "@/components/onboarding/OnboardingStepRail";
import {
  completeGetStarted,
  type CompleteGetStartedState,
} from "@/app/actions/get-started";
import { submitOnboarding, type OnboardingState } from "@/app/actions/onboarding";
import { signInWithGoogle } from "@/app/actions/auth";
import {
  CURRENT_LEVELS,
  LEARNING_PREFERENCES,
  TIMELINE_WEEKS,
  defaultOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding/schema";
import {
  AUTHED_STEPS,
  GUEST_STEPS,
  GOAL_OPTIONS,
  LEARNING_LABELS,
  WEEKLY_HOUR_PRESETS,
} from "@/lib/onboarding/steps";
import {
  readOnboardingDraft,
  writeOnboardingDraft,
  markOnboardingOAuthPending,
} from "@/lib/onboarding/draft-storage";
import {
  TARGET_ROLES,
  ROLE_QUICK_ADD,
  PROFILE_PRIOR_EXPOSURE,
} from "@/lib/roadmap-options";
import {
  appEyebrowClass,
  appMonoStatClass,
  appNestedSurfaceClass,
  appPrimaryButtonClass,
  appSectionLabelClass,
  appSurfaceCardClass,
} from "@/lib/layout/app";
import {
  formChipClass,
  formChipSelectedClass,
  formGoalTileClass,
  formInputClass,
  formLearningPrefClass,
  formSelectClass,
  formTextareaClass,
} from "@/lib/layout/form";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

function togglePrior(current: string[] | undefined, value: string): string[] {
  const list = current ?? [];
  if (list.includes(value)) return list.filter((v) => v !== value);
  return [...list, value];
}

function ProfileHiddenFields({ draft }: { draft: OnboardingDraft }) {
  return (
    <>
      {draft.full_name ? (
        <input type="hidden" name="full_name" value={draft.full_name} />
      ) : null}
      <input type="hidden" name="target_role" value={draft.target_role} />
      {draft.target_role_job_description ? (
        <input
          type="hidden"
          name="target_role_job_description"
          value={draft.target_role_job_description}
        />
      ) : null}
      <input type="hidden" name="weekly_hours" value={String(draft.weekly_hours)} />
      {draft.current_level ? (
        <input type="hidden" name="current_level" value={draft.current_level} />
      ) : null}
      <input type="hidden" name="goal_intent" value={draft.goal_intent} />
      {draft.target_timeline_weeks ? (
        <input
          type="hidden"
          name="target_timeline_weeks"
          value={draft.target_timeline_weeks}
        />
      ) : null}
      {(draft.prior_exposure ?? []).map((value) => (
        <input key={value} type="hidden" name="prior_exposure" value={value} />
      ))}
      {draft.learning_preference ? (
        <input type="hidden" name="learning_preference" value={draft.learning_preference} />
      ) : null}
    </>
  );
}

function ProfilePreview({ draft }: { draft: OnboardingDraft }) {
  if (!draft.target_role.trim()) return null;

  const goalLabel =
    GOAL_OPTIONS.find((g) => g.value === draft.goal_intent)?.label ?? draft.goal_intent;

  return (
    <div
      className={cn(
        appNestedSurfaceClass,
        "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm"
      )}
    >
      <span className="font-semibold text-foreground truncate max-w-full">
        {draft.target_role}
      </span>
      <span className="text-muted-foreground hidden sm:inline" aria-hidden>
        ·
      </span>
      <span className={cn("text-muted-foreground", appMonoStatClass)}>
        {draft.weekly_hours}h/week
      </span>
      <span className="text-muted-foreground hidden sm:inline" aria-hidden>
        ·
      </span>
      <span className="text-muted-foreground truncate">{goalLabel}</span>
    </div>
  );
}

type GetStartedWizardProps = {
  isAuthed: boolean;
};

export function GetStartedWizard({ isAuthed }: GetStartedWizardProps) {
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role")?.trim() ?? "";

  const steps = isAuthed ? AUTHED_STEPS : GUEST_STEPS;
  const totalSteps = steps.length;
  const currentStepMeta = steps[0]!;

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    const stored = readOnboardingDraft();
    const base = stored ?? defaultOnboardingDraft();
    if (roleFromUrl && !base.target_role) {
      return { ...base, target_role: roleFromUrl };
    }
    return base;
  });

  const [completeState, completeAction, completePending] = useActionState<
    CompleteGetStartedState | null,
    FormData
  >(completeGetStarted, null);

  const [profileState, profileAction, profilePending] = useActionState<
    OnboardingState | null,
    FormData
  >(submitOnboarding, null);

  const [acceptLegal, setAcceptLegal] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const {
    register: registerSignup,
    formState: { errors: signupErrors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    writeOnboardingDraft(draft);
  }, [draft]);

  const updateDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const validateStep = useCallback(
    (index: number): boolean => {
      setStepError(null);
      if (index === 0 && !draft.target_role.trim()) {
        setStepError("Choose or enter a target role to continue.");
        return false;
      }
      if (index === 1) {
        if (!draft.goal_intent) {
          setStepError("Pick a goal to continue.");
          return false;
        }
        if (
          !Number.isFinite(draft.weekly_hours) ||
          draft.weekly_hours < 1 ||
          draft.weekly_hours > 60
        ) {
          setStepError("Enter weekly hours between 1 and 60.");
          return false;
        }
      }
      return true;
    },
    [draft]
  );

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  async function handleGoogleSignIn() {
    if (!validateStep(step)) return;
    writeOnboardingDraft(draft);
    markOnboardingOAuthPending();
    setGoogleError(null);
    setGooglePending(true);
    const result = await signInWithGoogle({ onboarding: true });
    setGooglePending(false);
    if ("url" in result) {
      window.location.href = result.url;
      return;
    }
    setGoogleError(result.error);
  }

  const progress = useMemo(
    () => Math.round(((step + 1) / totalSteps) * 100),
    [step, totalSteps]
  );

  const stepMeta = steps[step] ?? currentStepMeta;
  const errorMessage = stepError ?? completeState?.error ?? profileState?.error;

  const showEmailConfirm =
    completeState?.requiresEmailConfirm === true && completeState.email;

  if (showEmailConfirm) {
    return (
      <AuthPageShell width="narrow">
        <AuthCard>
          <CardHeader className="text-center pb-2 px-6 sm:px-8 pt-8">
            <div
              className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
              aria-hidden
            >
              <CheckCircle2 className="size-7" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base leading-relaxed mt-2">
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{completeState.email}</span>.
              After confirming, sign in and we&apos;ll save your profile.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4 px-6 sm:px-8 pb-8">
            <Button asChild className={cn("w-full min-h-12 rounded-full", appPrimaryButtonClass)}>
              <Link href="/login?next=%2Fget-started%2Ffinish">Sign in after confirming</Link>
            </Button>
          </CardFooter>
        </AuthCard>
      </AuthPageShell>
    );
  }

  const showFooterNav = step < totalSteps - 1 || (step === 2 && !isAuthed);
  const hideFooterNav = step === 2 && isAuthed;

  return (
    <AuthPageShell width="wide" className="pb-10">
      <div className="grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
        {/* Left rail */}
        <aside className="lg:sticky lg:top-8 space-y-6">
          <div className="space-y-3">
            <p className={appEyebrowClass}>Your roadmap</p>
            <p className="text-sm text-muted-foreground leading-relaxed hidden lg:block">
              {steps.length} quick steps, then Phase 1 free.
            </p>
          </div>
          <OnboardingStepRail steps={steps} currentStep={step} />
          <div className="hidden lg:block space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className={appMonoStatClass}>{progress}%</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Main panel */}
        <div className="min-w-0 space-y-4">
          <header className="space-y-4">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <p className={cn(appSectionLabelClass, "normal-case tracking-normal text-sm")}>
                Step {step + 1} of {totalSteps}
              </p>
              <span className={cn("text-sm text-muted-foreground", appMonoStatClass)}>
                {progress}%
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {stepMeta.title}
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                {stepMeta.lead}
              </p>
            </div>

            {step > 0 ? <ProfilePreview draft={draft} /> : null}
          </header>

          <div className={cn(appSurfaceCardClass, "overflow-hidden")}>
            {errorMessage ? (
              <div className="px-6 sm:px-8 pt-6">
                <AuthMessage>{errorMessage}</AuthMessage>
              </div>
            ) : null}

            {/* Step 0: Role */}
            {step === 0 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <Label className={appSectionLabelClass}>Popular roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_QUICK_ADD.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => updateDraft({ target_role: role })}
                        className={cn(
                          draft.target_role === role ? formChipSelectedClass : formChipClass
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="get_started_target_role" className="text-base font-medium">
                    Target role
                  </Label>
                  <SearchableSelect
                    options={TARGET_ROLES}
                    value={draft.target_role}
                    onChange={(value) => updateDraft({ target_role: value })}
                    name="target_role"
                    id="get_started_target_role"
                    placeholder="Search or type a custom role…"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label htmlFor="job_description" className="text-base font-medium">
                    Job description{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <textarea
                    id="job_description"
                    rows={3}
                    maxLength={2000}
                    placeholder="Paste requirements from a posting, or describe the work you want…"
                    className={formTextareaClass}
                    value={draft.target_role_job_description ?? ""}
                    onChange={(e) =>
                      updateDraft({ target_role_job_description: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 1: Goals */}
            {step === 1 && (
              <div className="p-6 sm:p-8 space-y-8">
                <div className="space-y-3">
                  <Label className={appSectionLabelClass}>Primary goal</Label>
                  <div className="grid grid-cols-2 gap-3" role="group">
                    {GOAL_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateDraft({ goal_intent: value })}
                        className={cn(
                          formGoalTileClass(draft.goal_intent === value),
                          "min-h-[5.5rem] gap-3"
                        )}
                      >
                        <Icon className="size-5 shrink-0 text-primary" aria-hidden />
                        <span className="text-sm sm:text-base font-semibold text-center leading-snug">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className={appSectionLabelClass}>Hours per week</Label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKLY_HOUR_PRESETS.map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => updateDraft({ weekly_hours: hours })}
                        className={cn(
                          draft.weekly_hours === hours ? formChipSelectedClass : formChipClass
                        )}
                      >
                        <span className={appMonoStatClass}>{hours}h</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekly_hours" className="text-sm text-muted-foreground">
                        Custom amount
                      </Label>
                      <Input
                        id="weekly_hours"
                        type="number"
                        min={1}
                        max={60}
                        className={formInputClass}
                        value={draft.weekly_hours}
                        onChange={(e) =>
                          updateDraft({ weekly_hours: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline" className="text-sm text-muted-foreground">
                        Target timeline (optional)
                      </Label>
                      <select
                        id="timeline"
                        className={formSelectClass}
                        value={draft.target_timeline_weeks ?? ""}
                        onChange={(e) =>
                          updateDraft({
                            target_timeline_weeks: e.target
                              .value as OnboardingDraft["target_timeline_weeks"],
                          })
                        }
                      >
                        <option value="">No deadline</option>
                        {TIMELINE_WEEKS.map((w) => (
                          <option key={w} value={String(w)}>
                            {w} weeks
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: About */}
            {step === 2 && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={cn(appNestedSurfaceClass, "p-4 space-y-2")}>
                    <Label htmlFor="full_name" className={appSectionLabelClass}>
                      Name
                    </Label>
                    <Input
                      id="full_name"
                      type="text"
                      autoComplete="name"
                      placeholder="Optional"
                      className={formInputClass}
                      value={draft.full_name ?? ""}
                      onChange={(e) => updateDraft({ full_name: e.target.value })}
                    />
                  </div>
                  <div className={cn(appNestedSurfaceClass, "p-4 space-y-2")}>
                    <Label htmlFor="current_level" className={appSectionLabelClass}>
                      Current level
                    </Label>
                    <select
                      id="current_level"
                      className={formSelectClass}
                      value={draft.current_level ?? ""}
                      onChange={(e) =>
                        updateDraft({
                          current_level: e.target.value as OnboardingDraft["current_level"],
                        })
                      }
                    >
                      <option value="">Select level</option>
                      {CURRENT_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={cn(appNestedSurfaceClass, "p-4 sm:p-5 space-y-3")}>
                  <div>
                    <p className={appSectionLabelClass}>Prior exposure</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tap what you already know — we skip basics where it makes sense.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PROFILE_PRIOR_EXPOSURE.map(({ value, label }) => {
                      const selected = (draft.prior_exposure ?? []).includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            updateDraft({
                              prior_exposure: togglePrior(draft.prior_exposure, value),
                            })
                          }
                          className={selected ? formChipSelectedClass : formChipClass}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={cn(appNestedSurfaceClass, "p-4 sm:p-5 space-y-3")}>
                  <p className={appSectionLabelClass}>Learning preference</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LEARNING_PREFERENCES.map((value) => {
                      const selected = draft.learning_preference === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateDraft({ learning_preference: value })}
                          className={cn(
                            formLearningPrefClass,
                            "justify-center flex-col gap-1 py-4 text-center",
                            selected &&
                              "border-foreground/20 bg-foreground/[0.04] ring-1 ring-foreground/10 text-foreground"
                          )}
                        >
                          <span className="text-sm font-semibold">
                            {LEARNING_LABELS[value]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isAuthed ? (
                  <form action={profileAction} className="pt-2">
                    <ProfileHiddenFields draft={draft} />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={profilePending}
                      className={cn(
                        "w-full min-h-12 rounded-full text-base touch-manipulation",
                        appPrimaryButtonClass
                      )}
                    >
                      {profilePending ? "Saving…" : "Continue to roadmap setup"}
                      <ArrowRight className="size-4 ml-1" aria-hidden />
                    </Button>
                  </form>
                ) : null}
              </div>
            )}

            {/* Step 3: Account */}
            {step === 3 && !isAuthed && (
              <form action={completeAction}>
                <ProfileHiddenFields draft={draft} />
                <div className="px-6 sm:px-8 pt-6 sm:pt-8">
                  <ProfilePreview draft={draft} />
                </div>
                <CardHeader className="space-y-1.5 pb-0 px-6 sm:px-8 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="size-4" aria-hidden />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Almost there</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Save your profile, then build Phase 1 immediately.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5 px-6 sm:px-8 pt-6 pb-2">
                  {googleError && <AuthMessage>{googleError}</AuthMessage>}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full min-h-12 rounded-xl"
                    disabled={googlePending || completePending}
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleIcon className="mr-2 size-4" aria-hidden />
                    {googlePending ? "Redirecting…" : "Continue with Google"}
                  </Button>
                  <AuthDivider />
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={formInputClass}
                      aria-invalid={Boolean(
                        signupErrors.email ?? completeState?.signupFields?.email
                      )}
                      {...registerSignup("email")}
                    />
                    {(signupErrors.email?.message ?? completeState?.signupFields?.email) && (
                      <p className="text-sm text-destructive">
                        {signupErrors.email?.message ?? completeState?.signupFields?.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      className={formInputClass}
                      aria-invalid={Boolean(
                        signupErrors.password ?? completeState?.signupFields?.password
                      )}
                      {...registerSignup("password")}
                    />
                    {(signupErrors.password?.message ??
                      completeState?.signupFields?.password) && (
                      <p className="text-sm text-destructive">
                        {signupErrors.password?.message ??
                          completeState?.signupFields?.password}
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/15 p-4">
                    <Checkbox
                      id="accept_legal"
                      checked={acceptLegal}
                      onCheckedChange={(checked) => setAcceptLegal(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="accept_legal" className="text-sm font-normal leading-snug">
                      I accept the{" "}
                      <Link
                        href="/legal"
                        target="_blank"
                        className="text-primary font-medium underline-offset-4 hover:underline"
                      >
                        Privacy Policy and Terms of Service
                      </Link>
                    </Label>
                  </div>
                  <input type="hidden" name="accept_legal" value={acceptLegal ? "on" : ""} />
                </CardContent>
                <CardFooter className="flex flex-col gap-3 px-6 sm:px-8 pb-8 pt-4 border-t border-border/50 bg-muted/10">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={completePending || !acceptLegal}
                    className={cn("w-full min-h-12 rounded-full text-base", appPrimaryButtonClass)}
                  >
                    {completePending ? "Creating account…" : "Create account & build roadmap"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Already have an account?{" "}
                    <Link
                      href="/login?next=%2Fget-started%2Ffinish"
                      className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            )}

            {showFooterNav && !hideFooterNav ? (
              <div className="flex items-center justify-between gap-3 border-t border-border/50 px-6 sm:px-8 py-4 bg-muted/10">
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 rounded-xl px-4"
                  onClick={goBack}
                  disabled={step === 0}
                >
                  <ArrowLeft className="size-4 mr-1" aria-hidden />
                  Back
                </Button>
                {step < totalSteps - 1 ? (
                  <Button
                    type="button"
                    className={cn("min-h-11 rounded-full px-6", appPrimaryButtonClass)}
                    onClick={goNext}
                  >
                    Continue
                    <ArrowRight className="size-4 ml-1" aria-hidden />
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {!isAuthed && step < 3 ? (
            <p className="text-sm text-center text-muted-foreground px-2">
              Already have an account?{" "}
              <Link
                href="/login?next=%2Fget-started%2Ffinish"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </AuthPageShell>
  );
}
