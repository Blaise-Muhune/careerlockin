"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressSnapshotCard } from "./ProgressSnapshotCard";
import type { ProgressSnapshotData } from "@/app/actions/getProgressSnapshot";

const CAPTION = "Working toward my tech career with a clear plan.";
const APP_NAME = "CareerLockin";
const CARD_WIDTH = 480;
const CARD_HEIGHT = 320;

type ShareProgressModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: ProgressSnapshotData | null;
  loading: boolean;
  error: string | null;
};

export function ShareProgressModal({
  open,
  onOpenChange,
  snapshot,
  loading,
  error,
}: ShareProgressModalProps) {
  const [includeCurrentStep, setIncludeCurrentStep] = useState(true);
  const [includeTotalHours, setIncludeTotalHours] = useState(true);

  const downloadImage = useCallback(() => {
    if (!snapshot) return;
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = 24;
    const lineHeight = 20;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CARD_WIDTH - 2, CARD_HEIGHT - 2);

    ctx.fillStyle = "#71717a";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText(snapshot.target_role.toUpperCase(), pad, pad + 12);

    ctx.fillStyle = "#18181b";
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.fillText(`${snapshot.percent_complete}%`, pad, pad + 52);
    ctx.fillStyle = "#71717a";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("complete", pad + 60, pad + 52);

    const barY = pad + 68;
    ctx.fillStyle = "#f4f4f5";
    ctx.fillRect(pad, barY, CARD_WIDTH - pad * 2, 8);
    ctx.fillStyle = "#18181b";
    const barW = ((CARD_WIDTH - pad * 2) * Math.min(100, snapshot.percent_complete)) / 100;
    ctx.fillRect(pad, barY, barW, 8);

    let y = barY + 36;
    if (includeCurrentStep && (snapshot.current_phase ?? snapshot.current_step)) {
      ctx.fillStyle = "#71717a";
      ctx.font = "12px system-ui, sans-serif";
      const line = [snapshot.current_phase, snapshot.current_step].filter(Boolean).join(" · ");
      ctx.fillText(line.slice(0, 50) + (line.length > 50 ? "…" : ""), pad, y);
      y += lineHeight;
    }
    if (includeTotalHours && snapshot.total_hours > 0) {
      ctx.fillText(`${snapshot.total_hours} hours invested`, pad, y);
      y += lineHeight;
    }

    y = CARD_HEIGHT - 44;
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText(CAPTION, pad, y);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "10px system-ui, sans-serif";
    ctx.fillText(`Created with ${APP_NAME}`, pad, CARD_HEIGHT - 16);

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `careerlockin-progress-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  }, [snapshot, includeCurrentStep, includeTotalHours]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]" showCloseButton>
        <DialogHeader>
          <DialogTitle>Share progress</DialogTitle>
          <DialogDescription>
            Download an image to share. No personal data is included.
          </DialogDescription>
        </DialogHeader>
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {snapshot && !loading && (
          <>
            <div className="flex justify-center">
              <ProgressSnapshotCard
                snapshot={snapshot}
                includeCurrentStep={includeCurrentStep}
                includeTotalHours={includeTotalHours}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="share-include-step"
                  checked={includeCurrentStep}
                  onCheckedChange={(v) => setIncludeCurrentStep(!!v)}
                />
                <Label htmlFor="share-include-step" className="text-sm font-normal cursor-pointer">
                  Include current phase and step
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="share-include-hours"
                  checked={includeTotalHours}
                  onCheckedChange={(v) => setIncludeTotalHours(!!v)}
                />
                <Label htmlFor="share-include-hours" className="text-sm font-normal cursor-pointer">
                  Include total hours
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={downloadImage}>Download image</Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
