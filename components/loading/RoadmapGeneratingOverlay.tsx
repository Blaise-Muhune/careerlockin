"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Analyzing your profile…",
  "Generating phases…",
  "Finding resources…",
  "Almost there…",
] as const;

const STEP_INTERVAL_MS = 3500;

export function RoadmapGeneratingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, STEP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
      aria-label="Creating your roadmap"
    >
      <div className="flex flex-col items-center gap-8 px-6 max-w-sm w-full">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
          <Sparkles className="size-10 text-primary animate-pulse" aria-hidden />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Creating your roadmap
          </h2>
          <p className="text-sm text-muted-foreground min-h-5 transition-opacity duration-300">
            {STEPS[stepIndex]}
          </p>
        </div>
        <div className="w-full max-w-[220px] h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/70 transition-[width] duration-500 ease-out"
            style={{
              width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
