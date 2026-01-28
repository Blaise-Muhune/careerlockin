"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShareProgressModal } from "./ShareProgressModal";
import { getProgressSnapshotAction } from "@/app/actions/getProgressSnapshot";
import type { ProgressSnapshotData } from "@/app/actions/getProgressSnapshot";

const MILESTONE_PERCENTS = [25, 50, 75, 100];

type ShareProgressButtonProps = {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  /** When progress hits one of these (25,50,75,100), show a gentle "Want to share?" prompt. */
  milestonePercent?: number;
};

export function ShareProgressButton({
  variant = "secondary",
  size = "sm",
  className,
  milestonePercent,
}: ShareProgressButtonProps) {
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<ProgressSnapshotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSnapshot(null);
      setError(null);
      setLoading(false);
    }
  }

  function handleClick() {
    setOpen(true);
    setLoading(true);
    setError(null);
    setSnapshot(null);
    getProgressSnapshotAction()
      .then((result) => {
        if (result.ok) setSnapshot(result.data);
        else setError(result.error);
      })
      .finally(() => setLoading(false));
  }

  const atMilestone =
    milestonePercent != null && MILESTONE_PERCENTS.includes(milestonePercent);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button variant={variant} size={size} className={className} onClick={handleClick}>
        Share progress
      </Button>
      {atMilestone && (
        <p className="text-xs text-muted-foreground">
          Want to share your progress?
        </p>
      )}
      <ShareProgressModal
        open={open}
        onOpenChange={handleOpenChange}
        snapshot={snapshot}
        loading={loading}
        error={error}
      />
    </div>
  );
}
