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
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

const resources = ["react.dev", "developer.mozilla.org"];

const phase1Steps = [
  {
    title: "JavaScript fundamentals",
    description: "Variables, functions, async/await, DOM basics.",
    estHours: 12,
    whatYouDo: "Learn core JS: variables, functions, async/await, DOM basics.",
    outcome: "You can write and debug JavaScript in the browser.",
    status: "in_progress" as const,
  },
  {
    title: "React basics",
    description: "Components, hooks, state, and props.",
    estHours: 16,
    whatYouDo: "Build components with hooks, state, and props.",
    outcome: "You can build a small React app from scratch.",
    status: "done" as const,
  },
  {
    title: "Build a small project",
    description: "Apply React and JS in a portfolio piece.",
    estHours: 20,
    whatYouDo: "Apply React and JS in a portfolio piece.",
    outcome: "A project you can show in interviews.",
    status: "plain" as const,
  },
  {
    title: "Next steps and resources",
    description: "Routing, data fetching, deployment.",
    estHours: 8,
    whatYouDo: "Routing, data fetching, deployment.",
    outcome: "Ready to move to Phase 2.",
    status: "plain" as const,
  },
];

const phase2StepTitles = ["API design and backend concepts", "Full-stack project"];

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
            <CardTitle className="text-base sm:text-lg">Example roadmap</CardTitle>
            <span
              className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              aria-hidden
            >
              Preview
            </span>
          </div>
          <CardDescription className="text-sm mt-1">
            Personalized with your weekly hours
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Accordion
            type="multiple"
            defaultValue={["phase-1"]}
            className="w-full"
            aria-label="Roadmap phases"
          >
            {/* Phase 1 — open by default */}
            <AccordionItem value="phase-1" className="border-b border-border">
              <AccordionTrigger className="py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex flex-wrap items-center gap-2 gap-y-1 text-left">
                  <span className="font-medium text-foreground">Phase 1</span>
                  <span className="text-xs text-muted-foreground">
                    ~3 weeks (10h/week)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {doneCount}/{totalSteps} steps
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0">
                <ul className="space-y-2" role="list">
                  {phase1Steps.map((step) => (
                    <li key={step.title}>
                      <button
                        type="button"
                        onClick={() => openStepModal(step)}
                        className={cn(
                          "w-full rounded-lg p-3 sm:p-4 min-h-[44px] border-l-4 text-left transition-colors cursor-pointer touch-manipulation",
                          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          step.status === "in_progress" &&
                            "border-primary bg-primary/5 pl-3",
                          step.status === "done" && "border-transparent bg-muted/40 pl-4",
                          step.status === "plain" && "border-transparent bg-muted/30 pl-4"
                        )}
                        aria-label={`${step.title}, ${step.description}. Click to view details.`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm text-foreground">
                              {step.title}
                            </span>
                            {step.status === "in_progress" && (
                              <span
                                className="inline-flex items-center rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
                                aria-hidden
                              >
                                In progress
                              </span>
                            )}
                            {step.status === "done" && (
                              <span
                                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                                aria-hidden
                              >
                                Done
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {step.description}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            ~{step.estHours}h
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Resources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resources.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                        aria-hidden
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Phase 2 — collapsed, locked */}
            <AccordionItem value="phase-2" className="border-b-0">
              <AccordionTrigger className="py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex flex-wrap items-center gap-2 gap-y-1 text-left">
                  <span className="font-medium text-foreground">Phase 2</span>
                  <span className="text-xs text-muted-foreground">
                    Locked
                  </span>
                  <span className="text-xs text-muted-foreground">
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

      {/* Step detail modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={true}
          aria-describedby={selectedStep ? "step-detail-desc" : undefined}
        >
          {selectedStep && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedStep.title}</DialogTitle>
                <DialogDescription id="step-detail-desc">
                  Step details — preview only
                </DialogDescription>
              </DialogHeader>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground" aria-labelledby="step-detail-desc">
                <li>
                  <strong className="text-foreground">What you&apos;ll do:</strong>{" "}
                  {selectedStep.whatYouDo}
                </li>
                <li>
                  <strong className="text-foreground">Outcome:</strong>{" "}
                  {selectedStep.outcome}
                </li>
                <li>
                  <strong className="text-foreground">Estimated time:</strong>{" "}
                  ~{selectedStep.estHours}h
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Resources
                </p>
                <div className="flex flex-wrap gap-2">
                  {resources.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  Close
                </Button>
                <Button disabled className="w-full sm:w-auto" aria-disabled="true">
                  Start this step
                </Button>
              </DialogFooter>
              <p className="text-xs text-muted-foreground text-center -mt-2" aria-hidden>
                Preview — sign up to start
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
