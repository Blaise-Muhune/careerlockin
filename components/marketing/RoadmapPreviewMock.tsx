"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { RoadmapRoleHeader } from "@/components/roadmap/RoadmapRoleHeader";
import { RoadmapStepPill } from "@/components/roadmap/RoadmapStepPill";
import {
  appMonoStatClass,
  appNestedSurfaceClass,
  appPrimaryButtonClass,
  appSectionLabelClass,
  appSurfaceCardClass,
} from "@/lib/layout/app";
import { marketingMockupShadowClass } from "@/lib/layout/marketing";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

const PREVIEW_SKILLS = ["React", "TypeScript", "CSS"] as const;
const PREVIEW_ROLE = "Front-end developer";
const weeklyHours = 10;
const phase1Weeks = "~3 weeks";

const resources = [
  { name: "react.dev", isFree: true },
  { name: "developer.mozilla.org", isFree: true },
];

type PreviewStep = {
  title: string;
  description: string;
  estHours: number;
  whatYouDo: string;
  outcome: string;
  status: "in_progress" | "done" | "plain";
};

const phase1Steps: PreviewStep[] = [
  {
    title: "JavaScript fundamentals",
    description: "Variables, functions, async/await, DOM basics.",
    estHours: 12,
    whatYouDo: "Learn core JS: variables, functions, async/await, DOM basics.",
    outcome: "You can write and debug JavaScript in the browser.",
    status: "in_progress",
  },
  {
    title: "React basics",
    description: "Components, hooks, state, and props.",
    estHours: 16,
    whatYouDo: "Build components with hooks, state, and props.",
    outcome: "You can build a small React app from scratch.",
    status: "done",
  },
  {
    title: "Build a small project",
    description: "Apply React and JS in a portfolio piece.",
    estHours: 20,
    whatYouDo: "Apply React and JS in a portfolio piece.",
    outcome: "A project you can show in interviews.",
    status: "plain",
  },
  {
    title: "Next steps and resources",
    description: "Routing, data fetching, deployment.",
    estHours: 8,
    whatYouDo: "Routing, data fetching, deployment.",
    outcome: "Ready to move to Phase 2.",
    status: "plain",
  },
];

const phase2StepTitles = ["API design and backend concepts", "Full-stack project"];

function scrollToPricing() {
  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
}

function PreviewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary",
        className
      )}
    >
      Preview
    </span>
  );
}

type RoadmapPreviewMockProps = {
  /** Tighter layout for hero embed. */
  compact?: boolean;
};

export function RoadmapPreviewMock({ compact = false }: RoadmapPreviewMockProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<PreviewStep | null>(null);

  const openStepModal = useCallback((step: PreviewStep) => {
    setSelectedStep(step);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedStep(null);
  }, []);

  const doneCount = phase1Steps.filter((s) => s.status === "done").length;
  const totalSteps = phase1Steps.length;

  return (
    <>
      <div
        className={cn(
          "w-full overflow-hidden bg-card text-card-foreground",
          compact
            ? cn(appSurfaceCardClass, marketingMockupShadowClass, "max-w-none border-border/60")
            : cn(appSurfaceCardClass, "max-w-2xl mx-auto")
        )}
        aria-label="Example roadmap preview"
      >
        <div className={cn(compact ? "space-y-3 px-4 pb-3 pt-4 sm:px-5" : "space-y-3 px-6 pb-4 pt-6")}>
          <div className="flex items-center justify-between gap-2">
            {compact ? (
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Example roadmap
              </p>
            ) : (
              <p className="m-0 text-sm text-muted-foreground">
                Phases, steps, and time estimates sized to your weekly hours.
              </p>
            )}
            <PreviewBadge />
          </div>

          <RoadmapRoleHeader
            embedded
            targetRole={PREVIEW_ROLE}
            skills={[...PREVIEW_SKILLS]}
            showActiveDot
          />

          <p className="text-sm text-muted-foreground min-w-0">
            <span className={appMonoStatClass}>{weeklyHours}h/week</span>
            {!compact ? " · sized to your weekly hours" : null}
          </p>
        </div>

        <div className={cn("px-1 pb-1", !compact && "px-6 pb-6")}>
          <Accordion
            type="multiple"
            defaultValue={["phase-1"]}
            className="w-full"
            aria-label="Roadmap phases"
          >
            <AccordionItem value="phase-1" className="border-border/50 px-3 sm:px-4">
              <AccordionTrigger className="py-4 hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/50 data-[state=open]:pb-4 [&[data-state=open]>svg]:rotate-180">
                <div className="flex w-full flex-col items-start gap-2 pr-2 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-xs font-bold text-primary", appMonoStatClass)}>
                      01
                    </span>
                    <span className="font-semibold text-foreground">Foundations</span>
                  </div>
                  <div className="flex w-full max-w-xs flex-col gap-1.5">
                    <span className={cn("text-sm text-muted-foreground", appMonoStatClass)}>
                      {doneCount}/{totalSteps} · {phase1Weeks}
                    </span>
                    <div
                      className="h-1 w-full overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={doneCount}
                      aria-valuemin={0}
                      aria-valuemax={totalSteps}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${(doneCount / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 pb-4 pt-1">
                  {phase1Steps.map((step) => (
                    <RoadmapStepPill
                      key={step.title}
                      title={step.title}
                      done={step.status === "done"}
                      isCurrent={step.status === "in_progress"}
                      estHours={step.estHours}
                      onClick={() => openStepModal(step)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="phase-2" className="border-border/50 border-b-0 px-3 sm:px-4">
              <AccordionTrigger
                className="py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180"
                onClick={scrollToPricing}
              >
                <div className="flex w-full flex-col items-start gap-2 pr-2 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("text-xs font-bold text-primary", appMonoStatClass)}>
                      02
                    </span>
                    <span className="font-semibold text-foreground">Build</span>
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                      <Lock className="size-3.5 shrink-0" aria-hidden />
                      Unlock to view
                    </span>
                  </div>
                  <span className={cn("text-sm text-muted-foreground", appMonoStatClass)}>
                    0/{phase2StepTitles.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0">
                <div aria-label="Locked preview">
                  <div
                    className={cn(
                      appNestedSurfaceClass,
                      "mb-3 flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
                    )}
                  >
                    <p className="text-sm text-muted-foreground">
                      Later phases unlock with a paid plan
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={scrollToPricing}
                      className="h-auto p-0 text-xs font-medium text-primary"
                      aria-label="See pricing"
                    >
                      See pricing →
                    </Button>
                  </div>
                  <div className="relative overflow-hidden rounded-xl">
                    <ul className="space-y-3 opacity-70 select-none" role="list">
                      {phase2StepTitles.map((title) => (
                        <li key={title}>
                          <RoadmapStepPill title={title} />
                        </li>
                      ))}
                    </ul>
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]"
                      aria-hidden
                    >
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
                        <Lock className="size-3.5 shrink-0" />
                        Unlock full roadmap
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className={cn(
            "flex max-h-[88dvh] w-[min(96vw,28rem)] max-w-none flex-col gap-0 overflow-hidden rounded-2xl border-border/60 p-0 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.22)]",
            "sm:w-[min(92vw,40rem)] sm:max-w-2xl",
            "md:max-h-[90dvh] md:w-[min(90vw,48rem)] md:max-w-3xl"
          )}
          showCloseButton
          aria-describedby={selectedStep ? "preview-step-detail-desc" : undefined}
        >
          {selectedStep ? (
            <>
              <DialogHeader className="shrink-0 space-y-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <DialogTitle className="pr-10 text-xl font-bold sm:pr-8">
                  {selectedStep.title}
                </DialogTitle>
                <DialogDescription id="preview-step-detail-desc" asChild>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                    <span>{selectedStep.description}</span>
                    <span className={cn("text-xs", appMonoStatClass)}>
                      ~{selectedStep.estHours}h
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
                <section className="mb-5 sm:mb-6" aria-label="Resources">
                  <p className={cn("mb-2.5", appSectionLabelClass)}>Resources</p>
                  <ul className="space-y-1.5">
                    {resources.map((r) => (
                      <li key={r.name} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-primary">{r.name}</span>
                        <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-success/15 text-success">
                          Free
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <ul
                  className="list-disc space-y-2 pl-5 text-sm text-muted-foreground"
                  aria-labelledby="preview-step-detail-desc"
                >
                  <li>
                    <strong className="text-foreground">What you&apos;ll do:</strong>{" "}
                    {selectedStep.whatYouDo}
                  </li>
                  <li>
                    <strong className="text-foreground">Outcome:</strong> {selectedStep.outcome}
                  </li>
                  <li>
                    <strong className="text-foreground">Estimated time:</strong>{" "}
                    <span className={appMonoStatClass}>~{selectedStep.estHours}h</span>
                  </li>
                </ul>
              </div>

              <DialogFooter className="shrink-0 flex-wrap gap-2 border-t border-border/50 bg-background px-4 py-4 sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="min-h-11 touch-manipulation rounded-full"
                >
                  Close
                </Button>
                <Button
                  disabled
                  className={cn("min-h-11 touch-manipulation rounded-full", appPrimaryButtonClass)}
                  aria-disabled="true"
                >
                  Start this step
                </Button>
              </DialogFooter>
              <p className="pb-4 text-center text-xs text-muted-foreground" aria-hidden>
                Preview. Sign up to start.
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
