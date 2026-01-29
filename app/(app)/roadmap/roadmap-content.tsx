"use client";

import { useState, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Lock } from "lucide-react";
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
  networkingByPhaseIndex: Array<{
    focus_sentence: string;
    message_outlines: Array<{
      purpose: "ask_for_advice" | "ask_for_referral" | "request_coffee_chat";
      subject_line: string;
      outline_points: string[];
      personalization_required_note: string;
    }>;
  }>;
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
  networkingByPhaseIndex,
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

  const selectedNetworking =
    selectedPhaseIndex >= 0 ? networkingByPhaseIndex[selectedPhaseIndex] : null;

  const planLabel = isPro
    ? "Pro"
    : hasRoadmapUnlock
      ? "Full roadmap"
      : null;

  // Free users: only Phase 1 can be expanded; other phases stay locked
  const firstPhaseValue = phases.length > 0 ? phases[0]!.phase : "";
  const [openPhases, setOpenPhases] = useState<string[]>(
    firstPhaseValue ? [firstPhaseValue] : []
  );
  const handleAccordionChange = useCallback(
    (value: string[]) => {
      if (canViewFullRoadmap) {
        setOpenPhases(value);
        return;
      }
      // Free: only allow Phase 1 to be open
      setOpenPhases(value.filter((v) => v === firstPhaseValue));
    },
    [canViewFullRoadmap, firstPhaseValue]
  );

  const scrollToPricing = useCallback(() => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      {!canViewFullRoadmap && <LockBanner />}
      {canViewFullRoadmap && planLabel && (
        <p className="text-sm text-muted-foreground mb-4" data-plan-badge>
          You have <span className="font-medium text-foreground">{planLabel}</span> — {isPro ? "track in all phases, time logs, and insights." : "all phases and steps are visible."}
        </p>
      )}
      {phases.length === 0 ? (
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
          <p className="mb-2">
            This roadmap doesn&apos;t have any steps yet.
          </p>
          <p>
            You can go back to the{" "}
            <a href="/dashboard" className="text-primary underline-offset-4 hover:underline">
              dashboard
            </a>{" "}
            and create a new roadmap if something went wrong while saving.
          </p>
        </div>
      ) : (
      <Accordion
        type="multiple"
        value={openPhases}
        onValueChange={handleAccordionChange}
        className="w-full"
      >
        {phases.map(({ phase, phaseOrder, steps }, phaseIndex) => {
          const isLocked = !canViewFullRoadmap && phaseIndex > 0;
          const est = phaseMap[phase] ?? { hours: 0, weeks: 0 };
          const completed = steps.filter(
            (s) => progressMap[s.id]?.is_done ?? false
          ).length;
          const total = steps.length;
          return (
            <AccordionItem key={phase} value={phase}>
              <AccordionTrigger
                className="hover:no-underline data-[state=open]:border-b data-[state=open]:pb-4"
                onClick={isLocked ? scrollToPricing : undefined}
              >
                <div className="flex flex-col items-start gap-1.5 text-left w-full pr-2">
                  <span className="font-semibold">
                    Phase {phaseOrder}: {phase}
                    {isLocked && (
                      <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground font-normal text-xs">
                        <Lock className="size-3.5 shrink-0" aria-hidden />
                        Unlock to view
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
      )}
      <StepDetailModal
        step={selectedStep}
        isDone={selectedIsDone}
        isCurrent={selectedIsCurrent}
        currentStatus={selectedIsCurrent ? currentStatus : null}
        roadmapId={roadmapId}
        phaseTitle={selectedPhaseTitle}
        networkingFocus={selectedNetworking?.focus_sentence ?? null}
        messageOutlines={selectedNetworking?.message_outlines ?? []}
        open={selectedStepId !== null}
        onOpenChange={(o) => !o && setSelectedStepId(null)}
        canUseTracking={canUseTrackingInSelectedPhase}
        isLockedView={selectedIsLocked}
      />
    </>
  );
}
