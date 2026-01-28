"use client";

import type { ProgressSnapshotData } from "@/app/actions/getProgressSnapshot";

const CAPTION = "Working toward my tech career with a clear plan.";
const APP_NAME = "CareerLockin";

type ProgressSnapshotCardProps = {
  snapshot: ProgressSnapshotData;
  includeCurrentStep?: boolean;
  includeTotalHours?: boolean;
  /** Fixed dimensions for image export; default 480×320 */
  width?: number;
  height?: number;
  /** When true, card is rendered for canvas capture (no footer). */
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
      className="rounded-xl border-2 border-primary/20 bg-card shadow-md flex flex-col overflow-hidden"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="flex-1 px-6 py-5 flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {snapshot.target_role}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold text-foreground tabular-nums">
            {snapshot.percent_complete}%
          </span>
          <span className="text-sm text-muted-foreground">complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.min(100, snapshot.percent_complete)}%` }}
          />
        </div>
        {includeCurrentStep && (snapshot.current_phase ?? snapshot.current_step) && (
          <p className="text-sm text-muted-foreground">
            {[snapshot.current_phase, snapshot.current_step].filter(Boolean).join(" · ")}
          </p>
        )}
        {includeTotalHours && snapshot.total_hours > 0 && (
          <p className="text-sm text-muted-foreground">
            {snapshot.total_hours} hours invested
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-auto pt-2">
          {CAPTION}
        </p>
      </div>
      {!forExport && (
        <div className="px-6 py-2 border-t bg-muted/30">
          <p className="text-[10px] text-muted-foreground">
            Created with {APP_NAME}
          </p>
        </div>
      )}
    </div>
  );
}
