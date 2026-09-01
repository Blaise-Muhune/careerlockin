"use client";

import { useEffect, useState } from "react";
import { BookOpen, Compass, ListChecks, Map } from "lucide-react";
import { appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

const STEPS = [
  "Reviewing your profile…",
  "Mapping phases and steps…",
  "Finding the best resources…",
  "Almost ready…",
] as const;

const STEP_INTERVAL_MS = 3500;

const PULSE_RINGS = [
  { size: "7.5rem", delay: "0s" },
  { size: "9.5rem", delay: "0.8s" },
  { size: "11.5rem", delay: "1.6s" },
] as const;

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
      className="fixed inset-0 z-50 flex items-center justify-center marketing-dot-grid bg-background/92 backdrop-blur-sm animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
      aria-label="Building your roadmap"
    >
      <div className="flex flex-col items-center gap-6 px-6 w-full max-w-md">
        <div
          className={cn(
            appSurfaceCardClass,
            "relative aspect-5/4 w-full overflow-hidden bg-card/95"
          )}
        >
          <ListChecks
            className="absolute left-8 top-8 size-5 text-primary/75 motion-safe:animate-pulse"
            aria-hidden
          />
          <Compass
            className="absolute right-8 top-8 size-5 text-primary/75 motion-safe:animate-pulse"
            aria-hidden
          />
          <BookOpen
            className="absolute bottom-8 left-8 size-5 text-primary/75 motion-safe:animate-pulse"
            aria-hidden
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex size-28 items-center justify-center">
              {PULSE_RINGS.map((ring) => (
                <span
                  key={ring.size}
                  className="roadmap-loader-ring pointer-events-none absolute rounded-full border border-primary/20"
                  style={{
                    width: ring.size,
                    height: ring.size,
                    animationDelay: ring.delay,
                  }}
                  aria-hidden
                />
              ))}

              <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-border/50 bg-card shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]">
                <Map className="size-7 text-primary" aria-hidden />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-base font-semibold text-foreground">Building your roadmap</p>
          <p className="text-sm text-muted-foreground min-h-5 transition-opacity duration-300">
            {STEPS[stepIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
