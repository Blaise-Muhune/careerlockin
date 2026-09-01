"use client";

import { CalendarClock, Check, Compass } from "lucide-react";
import { appMonoStatClass, roadmapStepPillClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type RoadmapStepPillProps = {
  title: string;
  done?: boolean;
  isCurrent?: boolean;
  estHours?: number | null;
  onClick?: () => void;
  className?: string;
  id?: string;
};

export function RoadmapStepPill({
  title,
  done = false,
  isCurrent = false,
  estHours,
  onClick,
  className,
  id,
}: RoadmapStepPillProps) {
  const interactive = Boolean(onClick);
  const Comp = interactive ? "button" : "div";

  return (
    <Comp
      id={id}
      type={interactive ? "button" : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        roadmapStepPillClass,
        interactive &&
          "w-full cursor-pointer text-left touch-manipulation hover:border-primary/25 hover:bg-muted/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isCurrent && !done && "border-primary/25 ring-1 ring-primary/10",
        className
      )}
      aria-label={
        interactive
          ? `${title}${done ? ", completed" : isCurrent ? ", current step" : ""}. Open details.`
          : undefined
      }
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border",
          done
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground"
        )}
        aria-hidden
      >
        {done ? <Check className="size-3 stroke-[2.5]" /> : null}
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 text-base sm:text-sm",
          done ? "text-muted-foreground line-through" : "font-medium text-foreground"
        )}
      >
        {title}
      </span>

      {estHours != null ? (
        <span className={cn("shrink-0 text-xs text-muted-foreground", appMonoStatClass)}>
          ~{estHours}h
        </span>
      ) : null}

      {done ? (
        <CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : isCurrent ? (
        <Compass className="size-4 shrink-0 text-primary" aria-hidden />
      ) : null}
    </Comp>
  );
}
