import {
  BookOpen,
  Compass,
  ListChecks,
  Route,
} from "lucide-react";
import { RoadmapRoleHeader } from "@/components/roadmap/RoadmapRoleHeader";
import { RoadmapStepPill } from "@/components/roadmap/RoadmapStepPill";

export function StepOneIllustration() {
  return (
    <RoadmapRoleHeader
      targetRole="front-end developer"
      skills={["React", "TypeScript", "CSS"]}
    />
  );
}

export function StepTwoIllustration() {
  return (
    <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-card p-8 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.15)]">
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="size-40 rounded-full border border-border/60" />
        <div className="absolute size-28 rounded-full border border-border/50" />
        <div className="absolute size-16 rounded-full border border-primary/20 bg-primary/5" />
      </div>
      <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background shadow-md">
        <Route className="size-6 text-primary" aria-hidden />
      </div>
      <Compass className="absolute top-8 right-10 size-4 text-primary/70" aria-hidden />
      <BookOpen className="absolute bottom-10 left-10 size-4 text-muted-foreground" aria-hidden />
      <ListChecks className="absolute top-12 left-16 size-4 text-muted-foreground" aria-hidden />
    </div>
  );
}

export function StepThreeIllustration() {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.15)]">
      <RoadmapStepPill title="Set up dev environment" done />
      <RoadmapStepPill title="Build first React component" done />
      <RoadmapStepPill title="Deploy a portfolio page" isCurrent />
    </div>
  );
}
