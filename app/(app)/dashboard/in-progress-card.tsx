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
import {
  appMonoStatClass,
  appNestedSurfaceClass,
  appPrimaryButtonClass,
  appSectionLabelClass,
} from "@/lib/layout/app";
import { cn } from "@/lib/utils";

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
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight">In progress</CardTitle>
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
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold tracking-tight">Next step</CardTitle>
          <CardDescription>
            Choose one roadmap step so it shows up here while you work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className={cn("rounded-full", appPrimaryButtonClass)}>
            <Link href="/roadmap">Open roadmap</Link>
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
    currentWork.status === "in_progress"
      ? "In progress"
      : currentWork.status === "paused"
        ? "Paused"
        : "";

  return (
    <Card className="border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-14px_rgba(0,0,0,0.08)]">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold tracking-tight">In progress</CardTitle>
          {statusLabel ? (
            <span className="inline-flex shrink-0 items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
              {statusLabel}
            </span>
          ) : null}
        </div>
        <CardDescription className="text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">
            {currentWork.phase_title}
          </span>
          {currentStepTitle ? (
            <>
              <span className="text-muted-foreground"> · </span>
              <span>{currentStepTitle}</span>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-5">
        <div className={cn(appNestedSurfaceClass, "px-4 py-3 space-y-2")}>
          <p className={appSectionLabelClass}>Session</p>
          <p className="text-sm text-muted-foreground">
            Started {startedDate} ·{" "}
            <span className={cn("font-semibold text-foreground", appMonoStatClass)}>
              {days}
            </span>{" "}
            {days === 1 ? "day" : "days"}
          </p>
          {phaseProgress != null && phaseProgress.phaseHours > 0 ? (
            <p className="text-sm text-muted-foreground">
              Phase:{" "}
              <span className={cn("font-semibold text-foreground", appMonoStatClass)}>
                {phaseProgress.phaseCompletedHours}h
              </span>{" "}
              of{" "}
              <span className={cn("font-semibold text-foreground", appMonoStatClass)}>
                {phaseProgress.phaseHours}h
              </span>{" "}
              done
              {weeklyHours > 0 ? (
                <>
                  {" "}
                  · ~{formatWeeks(phaseProgress.phaseHours / weeklyHours)} at{" "}
                  {weeklyHours}h/week
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canUseTracking && currentWork.status === "in_progress" ? (
            <form action={statusFormAction} className="inline">
              <input type="hidden" name="status" value="paused" />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="rounded-full min-h-9"
                disabled={isStatusPending}
              >
                {isStatusPending ? "Updating…" : "Pause"}
              </Button>
            </form>
          ) : null}
          {canUseTracking && currentWork.status === "paused" ? (
            <form action={statusFormAction} className="inline">
              <input type="hidden" name="status" value="in_progress" />
              <Button
                type="submit"
                size="sm"
                className={cn("rounded-full min-h-9", appPrimaryButtonClass)}
                disabled={isStatusPending}
              >
                {isStatusPending ? "Updating…" : "Resume"}
              </Button>
            </form>
          ) : null}
          {!canUseTracking ? (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/settings">Unlock to track this phase</Link>
            </Button>
          ) : null}
          <Button asChild size="sm" variant="ghost" className="rounded-full font-semibold">
            <Link href={`/roadmap#step-${currentWork.step_id}`}>View on roadmap</Link>
          </Button>
        </div>
        {statusState && !statusState.ok ? (
          <p className="text-sm text-destructive" role="alert">
            {statusState.error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
