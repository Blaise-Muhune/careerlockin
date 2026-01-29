"use client";

import { ChevronRight, Link2 } from "lucide-react";
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
        "group rounded-xl border p-4 min-h-[52px] flex flex-col gap-2 transition-all cursor-pointer text-left touch-manipulation",
        "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
        "active:scale-[0.995] active:bg-primary/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isDone && "border-border bg-muted/40",
        !isDone && "border-border/80 bg-card",
        isCurrentStep && "border-l-4 border-l-primary pl-4 border-primary/30",
        isCurrentStep && !currentStatus && "ring-2 ring-primary/30"
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
            <span className="font-semibold text-foreground">{step.title}</span>
            {step.est_hours != null && (
              <span className="text-muted-foreground text-sm">
                ~{step.est_hours}h
              </span>
            )}
            {step.resources.length > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-0.5 text-muted-foreground"
                title={`${step.resources.length} resource${step.resources.length === 1 ? "" : "s"} — tap for details`}
              >
                <Link2 className="size-3.5 shrink-0" aria-hidden />
                <span className="text-xs font-medium">{step.resources.length}</span>
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
        <ChevronRight
          className="shrink-0 mt-1 size-5 text-muted-foreground/70 group-hover:text-primary transition-colors"
          aria-hidden
        />
      </div>
      <p className="text-xs text-muted-foreground ml-7 -mt-0.5">
        Tap for details
      </p>
      {isLocked && step.resources.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1 ml-7">
          Resources are locked in this preview.
        </p>
      )}
    </div>
  );
}
