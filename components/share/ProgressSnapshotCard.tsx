"use client";

import type { ProgressSnapshotData } from "@/app/actions/getProgressSnapshot";
import { appMonoStatClass, appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

const CAPTION = "Working toward my tech career with a clear plan.";
const APP_NAME = "CareerLockin";

type ProgressSnapshotCardProps = {
  snapshot: ProgressSnapshotData;
  includeCurrentStep?: boolean;
  includeTotalHours?: boolean;
  width?: number;
  height?: number;
  forExport?: boolean;
};

export function ProgressSnapshotCard({
  snapshot,
  includeCurrentStep = true,
  includeTotalHours = true,
  width = 480,
  height = 320,
  forExport = false,
}: ProgressSnapshotCardProps) {
  return (
    <div
      className={cn(appSurfaceCardClass, "flex flex-col overflow-hidden p-0")}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="flex-1 px-6 py-5 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {snapshot.target_role}
        </p>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-4xl font-bold text-foreground", appMonoStatClass)}>
            {snapshot.percent_complete}%
          </span>
          <span className="text-sm text-muted-foreground">complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted/80 ring-1 ring-border/40 overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full transition-all"
            style={{ width: `${Math.min(100, snapshot.percent_complete)}%` }}
          />
        </div>
        {includeCurrentStep && (snapshot.current_phase ?? snapshot.current_step) ? (
          <p className="text-sm text-muted-foreground">
            {[snapshot.current_phase, snapshot.current_step].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {includeTotalHours && snapshot.total_hours > 0 ? (
          <p className={cn("text-sm text-muted-foreground", appMonoStatClass)}>
            {snapshot.total_hours} hours invested
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground mt-auto pt-2">{CAPTION}</p>
      </div>
      {!forExport ? (
        <div className="px-6 py-2 border-t border-border/50 bg-muted/20">
          <p className="text-[10px] text-muted-foreground">Created with {APP_NAME}</p>
        </div>
      ) : null}
    </div>
  );
}
