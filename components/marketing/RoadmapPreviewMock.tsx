"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, ChevronRight, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

const resources = [
  { name: "react.dev", isFree: true },
  { name: "developer.mozilla.org", isFree: true },
];

const phase1Steps = [
  {
    title: "JavaScript fundamentals",
    description: "Variables, functions, async/await, DOM basics.",
    estHours: 12,
    resourceCount: 2,
    whatYouDo: "Learn core JS: variables, functions, async/await, DOM basics.",
    outcome: "You can write and debug JavaScript in the browser.",
    status: "in_progress" as const,
  },
  {
    title: "React basics",
    description: "Components, hooks, state, and props.",
    estHours: 16,
    resourceCount: 2,
    whatYouDo: "Build components with hooks, state, and props.",
    outcome: "You can build a small React app from scratch.",
    status: "done" as const,
  },
  {
    title: "Build a small project",
    description: "Apply React and JS in a portfolio piece.",
    estHours: 20,
    resourceCount: 1,
    whatYouDo: "Apply React and JS in a portfolio piece.",
    outcome: "A project you can show in interviews.",
    status: "plain" as const,
  },
  {
    title: "Next steps and resources",
    description: "Routing, data fetching, deployment.",
    estHours: 8,
    resourceCount: 1,
    whatYouDo: "Routing, data fetching, deployment.",
    outcome: "Ready to move to Phase 2.",
    status: "plain" as const,
  },
];

const phase2StepTitles = ["API design and backend concepts", "Full-stack project"];
const weeklyHours = 10;
const phase1Weeks = "~3 weeks";

function scrollToPricing() {
  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
}

export function RoadmapPreviewMock() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<(typeof phase1Steps)[number] | null>(null);

  const openStepModal = useCallback((step: (typeof phase1Steps)[number]) => {
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
      <Card
        className="w-full max-w-2xl mx-auto overflow-hidden border-border bg-card text-card-foreground"
        aria-label="Example roadmap preview"
      >
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <CardTitle className="text-base sm:text-lg">Your roadmap, built for you</CardTitle>
            <span
              className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              aria-hidden
            >
              Preview
            </span>
          </div>
          <CardDescription className="text-sm mt-1">
            Phases, steps, resources, and time estimates—personalized with your weekly hours
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Accordion
            type="multiple"
            defaultValue={["phase-1"]}
            className="w-full"
            aria-label="Roadmap phases"
          >
            {/* Phase 1 — open by default, matches app roadmap phase trigger */}
            <AccordionItem value="phase-1" className="border-b border-border">
              <AccordionTrigger className="hover:no-underline data-[state=open]:border-b data-[state=open]:pb-4 [&[data-state=open]>svg]:rotate-180">
                <div className="flex flex-col items-start gap-1.5 text-left w-full pr-2">
                  <span className="font-semibold">
                    Phase 1: Foundations
                    {totalSteps > 0 && doneCount === totalSteps && (
                      <span className="ml-2 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                        Phase completed
                      </span>
                    )}
                  </span>
                  <div className="flex flex-col gap-1 w-full max-w-[200px]">
                    <span className="text-sm font-normal text-muted-foreground">
                      {doneCount}/{totalSteps}
                      {weeklyHours > 0 && ` · ${phase1Weeks}`}
                    </span>
                    <div
                      className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                      role="progressbar"
                      aria-valuenow={doneCount}
                      aria-valuemin={0}
                      aria-valuemax={totalSteps}
                    >
                      <div
                        className="h-full rounded-full bg-primary/80 transition-[width]"
                        style={{ width: `${(doneCount / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 pt-1">
                  {phase1Steps.map((step) => (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => openStepModal(step)}
                      className={cn(
                        "group rounded-xl border p-4 min-h-[52px] flex flex-col gap-2 transition-all cursor-pointer text-left touch-manipulation w-full",
                        "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
                        "active:scale-[0.995] active:bg-primary/10",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        step.status === "done" && "border-border bg-muted/40",
                        (step.status === "plain" || step.status === "in_progress") && "border-border/80 bg-card",
                        step.status === "in_progress" && "border-l-4 border-l-primary pl-4 border-primary/30"
                      )}
                      aria-label={`${step.title}, ${step.description}. Tap for details.`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={step.status === "done"}
                          disabled
                          className="mt-0.5 shrink-0 pointer-events-none"
                          aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">{step.title}</span>
                            <span className="text-muted-foreground text-sm">~{step.estHours}h</span>
                            <span
                              className="inline-flex items-center gap-1 rounded-md bg-muted/80 px-1.5 py-0.5 text-muted-foreground"
                              aria-hidden
                            >
                              <Link2 className="size-3.5 shrink-0" />
                              <span className="text-xs font-medium">{step.resourceCount}</span>
                            </span>
                            {step.status === "in_progress" && (
                              <span className="rounded-full px-2 py-0.5 text-xs font-medium shrink-0 bg-primary/15 text-primary border border-primary/30">
                                In progress
                              </span>
                            )}
                            {step.status === "done" && (
                              <span className="rounded-full px-2 py-0.5 text-xs font-medium shrink-0 bg-muted text-muted-foreground">
                                Done
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          className="shrink-0 mt-1 size-5 text-muted-foreground/70 group-hover:text-primary transition-colors"
                          aria-hidden
                        />
                      </div>
                      <p className="text-xs text-muted-foreground ml-7 -mt-0.5">Tap for details</p>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Phase 2 — collapsed, locked, matches app locked phase */}
            <AccordionItem value="phase-2" className="border-b-0">
              <AccordionTrigger
                className="hover:no-underline [&[data-state=open]>svg]:rotate-180"
                onClick={scrollToPricing}
              >
                <div className="flex flex-col items-start gap-1.5 text-left w-full pr-2">
                  <span className="font-semibold">
                    Phase 2: Build
                    <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground font-normal text-xs">
                      <Lock className="size-3.5 shrink-0" aria-hidden />
                      Unlock to view
                    </span>
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    0/{phase2StepTitles.length} steps
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0">
                <div aria-label="Locked preview">
                  {/* Lock row at top — CTAs scroll to pricing */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-lg border border-border bg-muted/30 px-3 py-2 mb-3">
                    <p className="text-sm text-muted-foreground">
                      Unlock full roadmap to view details
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={scrollToPricing}
                        className="text-xs"
                        aria-label="Unlock full roadmap — scroll to pricing"
                      >
                        Unlock full roadmap
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={scrollToPricing}
                        className="text-xs"
                        aria-label="Upgrade to Pro — scroll to pricing"
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  </div>
                  {/* Blurred steps + overlay (overlay only over this block) */}
                  <div className="relative rounded-b-lg overflow-hidden">
                    <div className="space-y-3 opacity-70 select-none">
                      <ul className="space-y-2" role="list">
                        {phase2StepTitles.map((title) => (
                          <li
                            key={title}
                            className="rounded-lg p-3 sm:p-4 min-h-[44px] bg-muted/30 pl-4"
                          >
                            <span className="font-medium text-sm text-foreground">
                              {title}
                            </span>
                            <div
                              className="mt-2 h-3 w-full max-w-xs rounded bg-muted/60 blur-[1px]"
                              aria-hidden
                            />
                            <div
                              className="mt-1 h-3 w-32 rounded bg-muted/40 blur-[1px]"
                              aria-hidden
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      className="absolute inset-0 pointer-events-none flex items-center justify-center rounded-b-lg bg-background/60 backdrop-blur-[2px]"
                      aria-hidden
                    >
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
                        <Lock className="h-3.5 w-3.5 shrink-0" />
                        Unlock full roadmap
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Step detail modal — matches app step-detail-modal layout and sizing */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className={cn(
            "flex max-h-[88dvh] w-[min(96vw,28rem)] max-w-none flex-col gap-0 p-0",
            "sm:w-[min(92vw,40rem)] sm:max-w-2xl",
            "md:max-h-[90dvh] md:w-[min(90vw,48rem)] md:max-w-3xl",
            "lg:w-[min(85vw,56rem)] lg:max-w-4xl"
          )}
          showCloseButton
          aria-describedby={selectedStep ? "step-detail-desc" : undefined}
        >
          {selectedStep && (
            <>
              <DialogHeader className="shrink-0 space-y-2 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-6">
                <DialogTitle className="pr-10 text-lg sm:pr-8 md:text-xl">{selectedStep.title}</DialogTitle>
                <DialogDescription id="step-detail-desc" asChild>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                    <span>{selectedStep.description}</span>
                    <span className="text-xs">~{selectedStep.estHours}h</span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
                <section className="mb-5 sm:mb-6" aria-label="Resources">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2.5">Resources</p>
                  <ul className="space-y-1.5">
                    {resources.map((r) => (
                      <li key={r.name} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-primary">{r.name}</span>
                        <span className={cn(
                          "shrink-0 text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5",
                          r.isFree ? "bg-success/15 text-success" : "text-muted-foreground"
                        )}>
                          {r.isFree ? "Free" : "Paid"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground" aria-labelledby="step-detail-desc">
                  <li><strong className="text-foreground">What you&apos;ll do:</strong> {selectedStep.whatYouDo}</li>
                  <li><strong className="text-foreground">Outcome:</strong> {selectedStep.outcome}</li>
                  <li><strong className="text-foreground">Estimated time:</strong> ~{selectedStep.estHours}h</li>
                </ul>
              </div>
              <DialogFooter className="shrink-0 flex-wrap gap-2 border-t border-border/50 bg-background px-4 py-4 sm:px-6 sm:py-4 md:px-8 md:py-5" showCloseButton={false}>
                <Button type="button" variant="secondary" onClick={closeModal} className="min-h-[44px] touch-manipulation">
                  Close
                </Button>
                <Button disabled className="min-h-[44px] touch-manipulation" aria-disabled="true">
                  Start this step
                </Button>
              </DialogFooter>
              <p className="text-xs text-muted-foreground text-center pb-4" aria-hidden>
                Preview — sign up to start
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
