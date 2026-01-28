"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { RoadmapWithSteps } from "@/lib/server/db/roadmaps";
import type { CurrentWorkStatus } from "@/lib/server/db/currentWork";
import { cn } from "@/lib/utils";

type Step = RoadmapWithSteps["steps"][number];

type StepRowProps = {
  step: Step;
  initialDone: boolean;
  initialDoneAt: string | null;
  isCurrentStep: boolean;
  currentStatus: CurrentWorkStatus | null;
  onStepClick: () => void;
  isLocked?: boolean;
};

export function StepRow({
  step,
  initialDone,
  initialDoneAt,
  isCurrentStep,
  currentStatus,
  onStepClick,
  isLocked = false,
}: StepRowProps) {
  const isDone = initialDone;
  const doneAt = initialDoneAt;

  const showStatusBadge =
    isCurrentStep &&
    !isDone &&
    currentStatus &&
    (currentStatus === "in_progress" || currentStatus === "paused");

  return (
    <div
      id={`step-${step.id}`}
      role="button"
      tabIndex={0}
      onClick={onStepClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStepClick();
        }
      }}
      className={cn(
        "rounded-lg p-4 min-h-[44px] flex flex-col gap-2 transition-colors cursor-pointer text-left touch-manipulation active:bg-muted/60",
        isDone ? "bg-muted/50" : "bg-muted/30",
        isCurrentStep && "border-l-4 border-primary pl-3",
        isCurrentStep && !currentStatus && "ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`step-cb-${step.id}`}
          checked={isDone}
          disabled
          className="mt-0.5 shrink-0 pointer-events-none"
          aria-label={isDone ? `"${step.title}" completed` : `"${step.title}" not completed`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{step.title}</span>
            {step.est_hours != null && (
              <span className="text-muted-foreground text-sm">
                ~{step.est_hours}h
              </span>
            )}
            {showStatusBadge && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                  currentStatus === "in_progress" &&
                    "bg-primary/15 text-primary border border-primary/30",
                  currentStatus === "paused" &&
                    "bg-warning/15 text-warning-foreground border border-warning/30"
                )}
              >
                {currentStatus === "in_progress" ? "In progress" : "Paused"}
              </span>
            )}
          </div>
          {isDone && doneAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Completed {new Date(doneAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {!isLocked && step.resources.length > 0 && (
        <ul className="flex flex-col gap-1 mt-1 ml-7">
          {step.resources.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {r.title}
                <span aria-hidden>↗</span>
              </a>
              {r.resource_type === "unverified" ? (
                <span className="text-muted-foreground text-xs" title="Link not yet verified">
                  Verify later
                </span>
              ) : (
                r.resource_type && (
                  <span className="text-muted-foreground text-xs">
                    ({r.resource_type})
                  </span>
                )
              )}
            </li>
          ))}
        </ul>
      )}
      {isLocked && (
        <p className="text-xs text-muted-foreground mt-1 ml-7">
          Resources are locked in this preview.
        </p>
      )}
    </div>
  );
}
