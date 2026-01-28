"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { setWorkStatusAction } from "@/app/actions/setWorkStatus";
import { GenerateRoadmapButton } from "./generate-roadmap-button";
import type { CurrentWorkRow } from "@/lib/server/db/currentWork";
import type { PhaseProgress } from "@/lib/server/roadmap/estimates";

type InProgressCardProps = {
  currentWork: CurrentWorkRow | null;
  currentStepTitle?: string | null;
  hasRoadmap: boolean;
  weeklyHours: number;
  phaseProgress: PhaseProgress | null;
  canUseTracking?: boolean;
};

function daysSince(startedAt: string): number {
  const start = new Date(startedAt);
  const now = new Date();
  const ms = now.getTime() - start.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function formatWeeks(w: number): string {
  if (w < 0.1 && w > 0) return "< 0.1 weeks";
  return `${Math.round(w * 10) / 10} weeks`;
}

export function InProgressCard({
  currentWork,
  currentStepTitle,
  hasRoadmap,
  weeklyHours,
  phaseProgress,
  canUseTracking = true,
}: InProgressCardProps) {
  const router = useRouter();
  const [statusState, statusFormAction, isStatusPending] = useActionState(
    setWorkStatusAction,
    null
  );

  useEffect(() => {
    if (statusState?.ok) {
      router.refresh();
    }
  }, [statusState?.ok, router]);

  if (!hasRoadmap) {
    return (
      <Card className="shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">In progress</CardTitle>
          <CardDescription>Create a roadmap to track your work.</CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateRoadmapButton />
        </CardContent>
      </Card>
    );
  }

  if (!currentWork || !currentWork.step_id || !currentWork.phase_title) {
    return (
      <Card className="shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">In progress</CardTitle>
          <CardDescription>
            Pick a step to start working on it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/roadmap">Pick a step to start</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const days = daysSince(currentWork.started_at);
  const startedDate = new Date(currentWork.started_at).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const statusLabel =
    currentWork.status === "in_progress" ? "In progress" : currentWork.status === "paused" ? "Paused" : "";

  return (
    <Card className="shadow-sm ring-1 ring-border/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold">In progress</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted-foreground">
          <span>{currentWork.phase_title}{currentStepTitle ? ` · ${currentStepTitle}` : ""}</span>
          {statusLabel ? (
            <span className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {statusLabel}
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Started {startedDate} · {days} {days === 1 ? "day" : "days"}
        </p>
        {phaseProgress != null && phaseProgress.phaseHours > 0 && (
            <p className="text-sm text-muted-foreground">
              Phase: {phaseProgress.phaseCompletedHours}h of {phaseProgress.phaseHours}h done
              {weeklyHours > 0 && (
                <> · ~{formatWeeks(phaseProgress.phaseHours / weeklyHours)} at {weeklyHours}h/week</>
              )}
            </p>
          )}
        <div className="flex flex-wrap items-center gap-2">
          {canUseTracking && currentWork.status === "in_progress" && (
            <form action={statusFormAction} className="inline">
              <input type="hidden" name="status" value="paused" />
              <Button type="submit" size="sm" variant="secondary" disabled={isStatusPending}>
                {isStatusPending ? "Updating…" : "Pause"}
              </Button>
            </form>
          )}
          {canUseTracking && currentWork.status === "paused" && (
            <form action={statusFormAction} className="inline">
              <input type="hidden" name="status" value="in_progress" />
              <Button type="submit" size="sm" variant="secondary" disabled={isStatusPending}>
                {isStatusPending ? "Updating…" : "Resume"}
              </Button>
            </form>
          )}
          {!canUseTracking && (
            <Button asChild size="sm" variant="secondary">
              <Link href="/settings">Pro unlocks tracking</Link>
            </Button>
          )}
          <Button asChild size="sm" variant="ghost">
            <Link href={`/roadmap#step-${currentWork.step_id}`}>
              View on roadmap
            </Link>
          </Button>
        </div>
        {statusState && !statusState.ok && (
          <p className="text-sm text-destructive" role="alert">
            {statusState.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
