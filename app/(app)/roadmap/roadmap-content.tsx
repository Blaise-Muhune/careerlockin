"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StepRow } from "./step-row";
import { StepDetailModal } from "./step-detail-modal";
import { LockBanner } from "./lock-banner";
import type { RoadmapWithSteps } from "@/lib/server/db/roadmaps";
import type { ProgressEntry } from "@/lib/server/db/progress";
import type { CurrentWorkRow } from "@/lib/server/db/currentWork";

function formatWeeks(w: number): string {
  if (w < 0.1 && w > 0) return "< 0.1 weeks";
  if (w < 1) return `${Math.round(w * 10) / 10} weeks`;
  return `${Math.round(w * 10) / 10} weeks`;
}

export type PhaseGroup = {
  phase: string;
  phaseOrder: number;
  steps: RoadmapWithSteps["steps"];
};

type RoadmapContentProps = {
  roadmapId: string;
  phases: PhaseGroup[];
  progressMap: Record<string, ProgressEntry>;
  currentWork: CurrentWorkRow | null;
  phaseMap: Record<string, { hours: number; weeks: number }>;
  weeklyHours: number;
  canViewFullRoadmap: boolean;
  canUseTracking: boolean;
  hasRoadmapUnlock?: boolean;
  isPro?: boolean;
};

export function RoadmapContent({
  roadmapId,
  phases,
  progressMap,
  currentWork,
  phaseMap,
  weeklyHours,
  canViewFullRoadmap,
  canUseTracking,
  hasRoadmapUnlock = false,
  isPro = false,
}: RoadmapContentProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const currentStepId = currentWork?.step_id ?? null;
  const currentStatus = currentWork?.status ?? null;

  const selectedStep = selectedStepId
    ? (() => {
        for (const { steps } of phases) {
          const s = steps.find((st) => st.id === selectedStepId);
          if (s) return s;
        }
        return null;
      })()
    : null;

  const selectedPhaseTitle = selectedStepId
    ? (() => {
        const g = phases.find((p) =>
          p.steps.some((st) => st.id === selectedStepId)
        );
        return g?.phase ?? "";
      })()
    : "";

  const selectedIsDone = selectedStepId
    ? (progressMap[selectedStepId]?.is_done ?? false)
    : false;
  const selectedIsCurrent = selectedStepId === currentStepId;

  const selectedPhaseIndex = selectedStepId
    ? phases.findIndex((p) =>
        p.steps.some((st) => st.id === selectedStepId)
      )
    : -1;

  const selectedIsLocked = selectedStepId
    ? !canViewFullRoadmap && selectedPhaseIndex > 0
    : false;

  const canUseTrackingInSelectedPhase =
    selectedPhaseIndex === 0 || canUseTracking;

  const planLabel = isPro
    ? "Pro"
    : hasRoadmapUnlock
      ? "Full roadmap"
      : null;

  return (
    <>
      {!canViewFullRoadmap && <LockBanner />}
      {canViewFullRoadmap && planLabel && (
        <p className="text-sm text-muted-foreground mb-4" data-plan-badge>
          You have <span className="font-medium text-foreground">{planLabel}</span> — {isPro ? "track in all phases, time logs, and insights." : "all phases and steps are visible."}
        </p>
      )}
      <Accordion type="multiple" defaultValue={[]} className="w-full">
        {phases.map(({ phase, phaseOrder, steps }, phaseIndex) => {
          const isLocked = !canViewFullRoadmap && phaseIndex > 0;
          const est = phaseMap[phase] ?? { hours: 0, weeks: 0 };
          const completed = steps.filter(
            (s) => progressMap[s.id]?.is_done ?? false
          ).length;
          const total = steps.length;
          return (
            <AccordionItem key={phase} value={phase}>
              <AccordionTrigger className="hover:no-underline data-[state=open]:border-b data-[state=open]:pb-4">
                <div className="flex flex-col items-start gap-1.5 text-left w-full pr-2">
                  <span className="font-semibold">
                    Phase {phaseOrder}: {phase}
                    {isLocked && (
                      <span className="ml-2 text-muted-foreground font-normal text-xs">
                        (locked)
                      </span>
                    )}
                    {!isLocked && total > 0 && completed === total && (
                      <span className="ml-2 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                        Phase completed
                      </span>
                    )}
                  </span>
                  <div className="flex flex-col gap-1 w-full max-w-[200px]">
                    <span className="text-sm font-normal text-muted-foreground">
                      {completed}/{total}
                      {weeklyHours > 0 && est.hours > 0 && ` · ${formatWeeks(est.weeks)}`}
                    </span>
                    {total > 0 && (
                      <div
                        className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                        role="progressbar"
                        aria-valuenow={completed}
                        aria-valuemin={0}
                        aria-valuemax={total}
                      >
                        <div
                          className="h-full rounded-full bg-primary/80 transition-[width]"
                          style={{ width: `${(completed / total) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 pt-1">
                  {steps.map((step) => {
                    const prog = progressMap[step.id];
                    return (
                      <StepRow
                        key={step.id}
                        step={step}
                        initialDone={prog?.is_done ?? false}
                        initialDoneAt={prog?.done_at ?? null}
                        isCurrentStep={currentStepId === step.id}
                        currentStatus={
                          currentStepId === step.id ? currentStatus : null
                        }
                        onStepClick={() => setSelectedStepId(step.id)}
                        isLocked={isLocked}
                      />
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <StepDetailModal
        step={selectedStep}
        isDone={selectedIsDone}
        isCurrent={selectedIsCurrent}
        currentStatus={selectedIsCurrent ? currentStatus : null}
        roadmapId={roadmapId}
        phaseTitle={selectedPhaseTitle}
        open={selectedStepId !== null}
        onOpenChange={(o) => !o && setSelectedStepId(null)}
        canUseTracking={canUseTrackingInSelectedPhase}
        isLockedView={selectedIsLocked}
      />
    </>
  );
}
