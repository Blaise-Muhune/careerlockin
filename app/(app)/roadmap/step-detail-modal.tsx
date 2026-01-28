"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { startStepAction } from "@/app/actions/startStep";
import { setWorkStatusAction } from "@/app/actions/setWorkStatus";
import { toggleStep } from "@/app/actions/toggleStep";
import type { RoadmapWithSteps } from "@/lib/server/db/roadmaps";
import type { CurrentWorkStatus } from "@/lib/server/db/currentWork";
import { cn } from "@/lib/utils";

type Step = RoadmapWithSteps["steps"][number];

type StepStatus = "not_started" | "in_progress" | "paused" | "done";

function stepStatus(
  isDone: boolean,
  isCurrent: boolean,
  currentStatus: CurrentWorkStatus | null
): StepStatus {
  if (isDone) return "done";
  if (isCurrent && currentStatus === "in_progress") return "in_progress";
  if (isCurrent && currentStatus === "paused") return "paused";
  return "not_started";
}

function StatusBadge({ status }: { status: StepStatus }) {
  const styles: Record<StepStatus, string> = {
    not_started:
      "rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground",
    in_progress:
      "rounded-full px-2 py-0.5 text-xs font-medium bg-primary/15 text-primary border border-primary/30",
    paused:
      "rounded-full px-2 py-0.5 text-xs font-medium bg-warning/15 text-warning-foreground border border-warning/30",
    done: "rounded-full px-2 py-0.5 text-xs font-medium bg-success/15 text-success-foreground border border-success/30",
  };
  const labels: Record<StepStatus, string> = {
    not_started: "Not started",
    in_progress: "In progress",
    paused: "Paused",
    done: "Done",
  };
  return <span className={cn(styles[status])}>{labels[status]}</span>;
}

type StepDetailModalProps = {
  step: Step | null;
  isDone: boolean;
  isCurrent: boolean;
  currentStatus: CurrentWorkStatus | null;
  roadmapId: string;
  phaseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canUseTracking?: boolean;
  isLockedView?: boolean;
};

export function StepDetailModal({
  step,
  isDone,
  isCurrent,
  currentStatus,
  roadmapId,
  phaseTitle,
  open,
  onOpenChange,
  canUseTracking = true,
  isLockedView = false,
}: StepDetailModalProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!step) return null;
  const stepData = step;

  const status = stepStatus(isDone, isCurrent, currentStatus);

  async function handleStartStep() {
    setActionError(null);
    setIsPending(true);
    const formData = new FormData();
    formData.set("step_id", stepData.id);
    formData.set("phase_title", phaseTitle);
    formData.set("roadmap_id", roadmapId);
    const result = await startStepAction(null, formData);
    setIsPending(false);
    if (result.ok) {
      router.refresh();
      onOpenChange(false);
    } else {
      setActionError(result.error);
    }
  }

  async function handleSetStatus(newStatus: CurrentWorkStatus) {
    setActionError(null);
    setIsPending(true);
    const formData = new FormData();
    formData.set("status", newStatus);
    const result = await setWorkStatusAction(null, formData);
    setIsPending(false);
    if (result.ok) {
      router.refresh();
      if (newStatus === "paused") {
        /* keep modal open */
      } else {
        onOpenChange(false);
      }
    } else {
      setActionError(result.error);
    }
  }

  async function handleComplete() {
    setActionError(null);
    setIsPending(true);
    const formData = new FormData();
    formData.set("step_id", stepData.id);
    formData.set("is_done", "true");
    const result = await toggleStep(formData);
    setIsPending(false);
    if (result.ok) {
      router.refresh();
      onOpenChange(false);
    } else {
      setActionError(result.error);
    }
  }

  async function handleMarkNotDone() {
    setActionError(null);
    setIsPending(true);
    const formData = new FormData();
    formData.set("step_id", stepData.id);
    formData.set("is_done", "false");
    const result = await toggleStep(formData);
    setIsPending(false);
    if (result.ok) {
      router.refresh();
      onOpenChange(false);
    } else {
      setActionError(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[90dvh] max-h-[90dvh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 p-0 sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:gap-4 sm:p-6"
        showCloseButton
      >
        <div className="flex min-h-0 flex-1 flex-col sm:block">
          <div className="shrink-0 px-4 pt-4 sm:px-0 sm:pt-0">
            <DialogHeader>
              <DialogTitle className="pr-10 sm:pr-6">{step.title}</DialogTitle>
              <DialogDescription>
                {isLockedView ? (
                  <p className="text-sm text-muted-foreground">
                    Full step details are locked. Unlock your roadmap to see descriptions, estimates, and resources.
                  </p>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span>{step.description}</span>
                    {step.est_hours != null && (
                      <span className="text-muted-foreground text-sm">~{step.est_hours}h</span>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-0 sm:pb-0">
        <div className="space-y-4">
          {!isLockedView && (
            <div className="flex items-center gap-2">
              <StatusBadge status={status} />
            </div>
          )}
          {isLockedView ? (
            <div>
              <p className="text-sm font-medium mb-1.5">Resources</p>
              <div className="space-y-2">
                <div className="h-2 w-32 rounded-full bg-muted" />
                <div className="h-2 w-40 rounded-full bg-muted" />
              </div>
            </div>
          ) : (
            step.resources.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1.5">Resources</p>
                <ul className="space-y-2">
                  {step.resources.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {r.title}
                        <span aria-hidden>↗</span>
                      </a>
                      <span
                        className={cn(
                          "text-xs font-medium rounded-full px-2 py-0.5",
                          r.is_free
                            ? "bg-success/15 text-success-foreground border border-success/30"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {r.is_free ? "Free" : "Paid"}
                      </span>
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
              </div>
            )
          )}
          {actionError && (
            <p className="text-sm text-destructive" role="alert">
              {actionError}
            </p>
          )}
        </div>
          </div>
        </div>
        <DialogFooter
          showCloseButton={false}
          className="shrink-0 flex-wrap gap-2 border-t bg-background px-4 py-4 sm:border-0 sm:px-0 sm:py-0 sm:gap-2"
        >
          {isLockedView && (
            <>
              <Button
                onClick={() => onOpenChange(false)}
                variant="secondary"
                size="sm"
                className="min-h-[44px] touch-manipulation"
              >
                Close
              </Button>
              <Button size="sm" asChild className="min-h-[44px] touch-manipulation">
                <a href="/settings">Unlock full roadmap</a>
              </Button>
              <Button size="sm" variant="outline" asChild className="min-h-[44px] touch-manipulation">
                <a href="/settings">Upgrade to Pro</a>
              </Button>
            </>
          )}
          {!isLockedView && !canUseTracking && (
            <p className="text-sm text-muted-foreground w-full">
              Pro unlocks tracking.
            </p>
          )}
          {!isLockedView && canUseTracking && status !== "done" && (
            <Button
              onClick={handleComplete}
              disabled={isPending}
              className="min-h-[44px] gap-2 touch-manipulation"
            >
              <Check className="size-4" aria-hidden />
              {isPending ? "Saving…" : "Complete"}
            </Button>
          )}
          {!isLockedView && canUseTracking && status === "not_started" && (
            <Button variant="secondary" onClick={handleStartStep} disabled={isPending} className="min-h-[44px] touch-manipulation">
              {isPending ? "Starting…" : "Start"}
            </Button>
          )}
          {!isLockedView && canUseTracking && status === "in_progress" && (
            <Button
              variant="outline"
              onClick={() => handleSetStatus("paused")}
              disabled={isPending}
              className="min-h-[44px] touch-manipulation"
            >
              {isPending ? "…" : "Pause"}
            </Button>
          )}
          {!isLockedView && canUseTracking && status === "paused" && (
            <>
              <Button variant="secondary" onClick={() => handleSetStatus("in_progress")} disabled={isPending} className="min-h-[44px] touch-manipulation">
                {isPending ? "…" : "Resume"}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="min-h-[44px] touch-manipulation">
                Switch step
              </Button>
            </>
          )}
          {!isLockedView && canUseTracking && status === "done" && (
            <Button variant="ghost" size="sm" onClick={handleMarkNotDone} disabled={isPending} className="min-h-[44px] touch-manipulation">
              {isPending ? "…" : "Undo"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
