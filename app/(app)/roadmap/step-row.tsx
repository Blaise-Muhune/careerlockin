"use client";

import { RoadmapStepPill } from "@/components/roadmap/RoadmapStepPill";
import type { RoadmapWithSteps } from "@/lib/server/db/roadmaps";

type Step = RoadmapWithSteps["steps"][number];

type StepRowProps = {
  step: Step;
  initialDone: boolean;
  initialDoneAt: string | null;
  isCurrentStep: boolean;
  onStepClick: () => void;
  isLocked?: boolean;
};

export function StepRow({
  step,
  initialDone,
  initialDoneAt,
  isCurrentStep,
  onStepClick,
  isLocked = false,
}: StepRowProps) {
  const isDone = initialDone;
  const isCurrent = isCurrentStep && !isDone;

  return (
    <div className="flex flex-col gap-1.5">
      <RoadmapStepPill
        id={`step-${step.id}`}
        title={step.title}
        done={isDone}
        isCurrent={isCurrent}
        estHours={step.est_hours}
        onClick={onStepClick}
      />
      {isDone && initialDoneAt ? (
        <p className="px-1 text-xs text-muted-foreground">
          Completed {new Date(initialDoneAt).toLocaleDateString()}
        </p>
      ) : null}
      {isLocked && step.resources.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          Resources are locked in this preview.
        </p>
      ) : null}
    </div>
  );
}
