import { Check } from "lucide-react";
import type { OnboardingStepMeta } from "@/lib/onboarding/steps";
import { cn } from "@/lib/utils";

type OnboardingStepRailProps = {
  steps: OnboardingStepMeta[];
  currentStep: number;
};

export function OnboardingStepRail({ steps, currentStep }: OnboardingStepRailProps) {
  return (
    <>
      {/* Mobile: compact dots */}
      <ol
        className="flex items-center gap-2 lg:hidden"
        aria-label="Setup progress"
      >
        {steps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <li key={step.id} className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors",
                  done && "bg-foreground text-background",
                  active && !done && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    "h-px w-6 sm:w-10",
                    index < currentStep ? "bg-foreground/40" : "bg-border"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* Desktop: vertical rail */}
      <ol className="hidden lg:flex flex-col gap-1" aria-label="Setup progress">
        {steps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          const Icon = step.icon;
          return (
            <li key={step.id}>
              <div
                className={cn(
                  "flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors",
                  active && "bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.1)] border border-border/60",
                  !active && "border border-transparent"
                )}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                    done && "bg-foreground text-background",
                    active && !done && "bg-primary/10 text-primary",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? (
                    <Check className="size-4" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <Icon className="size-4" aria-hidden />
                  )}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p
                    className={cn(
                      "text-xs font-semibold uppercase tracking-[0.12em]",
                      active ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Step {index + 1}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold mt-0.5",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
