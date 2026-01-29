"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
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
import { startStepAction } from "@/app/actions/startStep";
import { setWorkStatusAction } from "@/app/actions/setWorkStatus";
import { toggleStep } from "@/app/actions/toggleStep";
import type { RoadmapWithSteps } from "@/lib/server/db/roadmaps";
import type { CurrentWorkStatus } from "@/lib/server/db/currentWork";
import { cn } from "@/lib/utils";

type Step = RoadmapWithSteps["steps"][number];

type StepStatus = "not_started" | "in_progress" | "paused" | "done";

type PhaseProject = {
  title: string;
  short_description: string;
  goal: string;
  deliverables: string[];
  estimated_time_hours: number;
  is_optional: boolean;
};

type Practice = {
  type: "project" | "challenge";
  title: string;
  description: string;
  purpose: string;
  difficulty: "easy" | "medium" | "hard";
  is_optional: boolean;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function parsePhaseProject(x: unknown): PhaseProject | null {
  if (!isRecord(x)) return null;
  if (
    typeof x.title !== "string" ||
    typeof x.short_description !== "string" ||
    typeof x.goal !== "string" ||
    !Array.isArray(x.deliverables) ||
    typeof x.estimated_time_hours !== "number"
  ) {
    return null;
  }
  return {
    title: x.title,
    short_description: x.short_description,
    goal: x.goal,
    deliverables: x.deliverables.filter((d) => typeof d === "string"),
    estimated_time_hours: x.estimated_time_hours,
    is_optional: Boolean(x.is_optional),
  };
}

function parsePractices(x: unknown): Practice[] {
  if (!Array.isArray(x)) return [];
  return x
    .map((p) => (isRecord(p) ? p : null))
    .filter((p): p is Record<string, unknown> => p != null)
    .map((p) => {
      if (
        (p.type !== "project" && p.type !== "challenge") ||
        typeof p.title !== "string" ||
        typeof p.description !== "string" ||
        typeof p.purpose !== "string" ||
        (p.difficulty !== "easy" &&
          p.difficulty !== "medium" &&
          p.difficulty !== "hard")
      ) {
        return null;
      }
      return {
        type: p.type,
        title: p.title,
        description: p.description,
        purpose: p.purpose,
        difficulty: p.difficulty,
        is_optional: Boolean(p.is_optional),
      } satisfies Practice;
    })
    .filter((p): p is Practice => p != null);
}

function stepStatus(
  isDone: boolean,
  isCurrent: boolean,
  currentStatus: CurrentWorkStatus | null
): StepStatus {
  if (isDone) return "done";
  if (isCurrent && currentStatus === "in_progress") return "in_progress";
  if (isCurrent && currentStatus === "paused") return "paused";
  return "not_started";
}

function StatusBadge({ status }: { status: StepStatus }) {
  const styles: Record<StepStatus, string> = {
    not_started:
      "rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground",
    in_progress:
      "rounded-full px-2 py-0.5 text-xs font-medium bg-primary/15 text-primary border border-primary/30",
    paused:
      "rounded-full px-2 py-0.5 text-xs font-medium bg-warning/15 text-warning-foreground border border-warning/30",
    done: "rounded-full px-2 py-0.5 text-xs font-medium bg-success/15 text-success-foreground border border-success/30",
  };
  const labels: Record<StepStatus, string> = {
    not_started: "Not started",
    in_progress: "In progress",
    paused: "Paused",
    done: "Done",
  };
  return <span className={cn(styles[status])}>{labels[status]}</span>;
}

type StepDetailModalProps = {
  step: Step | null;
  isDone: boolean;
  isCurrent: boolean;
  currentStatus: CurrentWorkStatus | null;
  roadmapId: string;
  phaseTitle: string;
  networkingFocus?: string | null;
  messageOutlines?: Array<{
    purpose: "ask_for_advice" | "ask_for_referral" | "request_coffee_chat";
    subject_line: string;
    outline_points: string[];
    personalization_required_note: string;
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canUseTracking?: boolean;
  isLockedView?: boolean;
};

export function StepDetailModal({
  step,
  isDone,
  isCurrent,
  currentStatus,
  roadmapId,
  phaseTitle,
  networkingFocus = null,
  messageOutlines = [],
  open,
  onOpenChange,
  canUseTracking = true,
  isLockedView = false,
}: StepDetailModalProps) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!step) return null;
  const stepData = step;

  const status = stepStatus(isDone, isCurrent, currentStatus);
  const phaseProject = parsePhaseProject(stepData.phase_project);
  const practices = parsePractices(stepData.practices);

  function copyToClipboardFallback(text: string): boolean {
    if (typeof document === "undefined") return false;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }

  async function copyOutlineText(
    outline: {
      subject_line: string;
      outline_points: string[];
      personalization_required_note: string;
    },
    key: string
  ) {
    const text = [
      `Subject: ${outline.subject_line}`,
      "",
      ...outline.outline_points.map((p) => `- ${p}`),
      "",
      `Note: ${outline.personalization_required_note}`,
      "",
      "Rewrite in your own words. Keep it short and personal.",
    ].join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyToClipboardFallback(text);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      const ok = copyToClipboardFallback(text);
      if (ok) {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      }
    }
  }

  async function handleStartStep() {
    setActionError(null);
    setIsPending(true);
    const formData = new FormData();
    formData.set("step_id", stepData.id);
    formData.set("phase_title", phaseTitle);
    formData.set("roadmap_id", roadmapId);
    const result = await startStepAction(null, formData);
    setIsPending(false);
    if (result.ok) {
      router.refresh();
      onOpenChange(false);
    } else {
      setActionError(result.error);
    }
  }

  async function handleSetStatus(newStatus: CurrentWorkStatus) {
    setActionError(null);
    setIsPending(true);
    const formData = new FormData();
    formData.set("status", newStatus);
    const result = await setWorkStatusAction(null, formData);
    setIsPending(false);
    if (result.ok) {
      router.refresh();
      if (newStatus === "paused") {
        /* keep modal open */
      } else {
        onOpenChange(false);
      }
    } else {
      setActionError(result.error);
    }
  }

  async function handleComplete() {
    setActionError(null);
    setIsPending(true);
    const formData = new FormData();
    formData.set("step_id", stepData.id);
    formData.set("is_done", "true");
    const result = await toggleStep(formData);
    setIsPending(false);
    if (result.ok) {
      router.refresh();
      onOpenChange(false);
    } else {
      setActionError(result.error);
    }
  }

  async function handleMarkNotDone() {
    setActionError(null);
    setIsPending(true);
    const formData = new FormData();
    formData.set("step_id", stepData.id);
    formData.set("is_done", "false");
    const result = await toggleStep(formData);
    setIsPending(false);
    if (result.ok) {
      router.refresh();
      onOpenChange(false);
    } else {
      setActionError(result.error);
    }
  }

  const hasNetworking = Boolean(networkingFocus || messageOutlines.length > 0);
  const hasApply = Boolean(phaseProject || practices.length > 0);
  // Start collapsed so title + description + resources are the focus
  const defaultAccordion = undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[88dvh] w-[min(96vw,28rem)] max-w-none flex-col gap-0 p-0",
          "sm:w-[min(92vw,40rem)] sm:max-w-2xl",
          "md:max-h-[90dvh] md:w-[min(90vw,48rem)] md:max-w-3xl",
          "lg:w-[min(85vw,56rem)] lg:max-w-4xl"
        )}
        showCloseButton
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="shrink-0 space-y-2 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-6">
            <DialogTitle className="pr-10 text-lg sm:pr-8 md:text-xl">{step.title}</DialogTitle>
            <DialogDescription asChild>
              {isLockedView ? (
                <p className="text-sm text-muted-foreground">
                  Full step details are locked. Unlock your roadmap to see descriptions, estimates, and resources.
                </p>
              ) : (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                  <span>{step.description}</span>
                  {step.est_hours != null && (
                    <span className="text-xs">~{step.est_hours}h</span>
                  )}
                </div>
              )}
            </DialogDescription>
            {!isLockedView && (
              <div className="flex items-center gap-2 pt-0.5">
                <StatusBadge status={status} />
              </div>
            )}
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
            {actionError && (
              <p className="mb-3 text-sm text-destructive" role="alert">
                {actionError}
              </p>
            )}

            {/* Resources — compact, always visible */}
            <section className="mb-5 sm:mb-6" aria-label="Resources">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2.5">Resources</p>
              {isLockedView ? (
                <div className="space-y-2">
                  <div className="h-2 w-32 rounded-full bg-muted" />
                  <div className="h-2 w-40 rounded-full bg-muted" />
                </div>
              ) : step.resources.length > 0 ? (
                <ul className="space-y-1.5">
                  {step.resources.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 wrap-break-word"
                      >
                        {r.title}
                        <span aria-hidden className="text-muted-foreground">↗</span>
                      </a>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] font-medium uppercase tracking-wide rounded px-1.5 py-0.5",
                          r.is_free
                            ? "bg-success/15 text-success"
                            : "text-muted-foreground"
                        )}
                      >
                        {r.is_free ? "Free" : "Paid"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No resources for this step.
                </p>
              )}
            </section>

            <Accordion
              type="single"
              collapsible
              defaultValue={defaultAccordion}
              className="w-full space-y-0 border-t border-border/50"
            >
              {/* Apply what you learned */}
              {hasApply && (
                <AccordionItem value="apply" className="border-b border-border/50 px-0" aria-label={isLockedView ? "Locked preview" : "Apply what you learned"}>
                  <AccordionTrigger className="py-3.5 hover:no-underline text-sm font-medium text-foreground">
                    Apply what you learned
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-0">
                    <div className="space-y-4">
                      {phaseProject && (
                        <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-primary/15 text-primary">Project</span>
                            <span className="text-sm font-medium text-foreground">{phaseProject.title}</span>
                            {!isLockedView && (
                              <span className="text-xs text-muted-foreground">~{Math.round(phaseProject.estimated_time_hours)}h</span>
                            )}
                          </div>
                          {isLockedView ? (
                            <div className="space-y-2">
                              <div className="h-2 w-2/3 rounded-full bg-muted" />
                              <div className="h-2 w-1/2 rounded-full bg-muted" />
                            </div>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground">{phaseProject.short_description}</p>
                              <p className="text-xs text-muted-foreground mt-1.5"><span className="font-medium text-foreground">Goal:</span> {phaseProject.goal}</p>
                              <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1.5 space-y-0.5">
                                {phaseProject.deliverables.slice(0, 4).map((d) => (
                                  <li key={d}>{d}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      )}
                      {practices.length > 0 && (
                        <div className="space-y-3">
                          {practices.map((p) => (
                            <div key={`${p.type}:${p.title}`} className="rounded-xl border border-border/50 bg-background p-3">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                                    p.type === "project" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {p.type === "project" ? "Project" : "Optional"}
                                </span>
                                <span className="text-sm font-medium text-foreground">{p.title}</span>
                                {!isLockedView && (
                                  <span className="text-xs text-muted-foreground">{p.difficulty}</span>
                                )}
                              </div>
                              {isLockedView ? (
                                <div className="h-2 w-3/5 rounded-full bg-muted" />
                              ) : (
                                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Networking focus */}
              {hasNetworking && (
                <AccordionItem value="networking" className="border-b border-border/50 px-0" aria-label="Networking focus">
                  <AccordionTrigger className="py-3.5 hover:no-underline text-sm font-medium text-foreground">
                    Networking focus
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-0">
                    {networkingFocus && (
                      <p className="text-sm text-muted-foreground mb-3">{networkingFocus}</p>
                    )}
                    {messageOutlines.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Rewrite in your own words. Keep it short and personal.
                        </p>
                        {messageOutlines.map((o) => {
                          const outlineKey = `${o.purpose}:${o.subject_line}`;
                          return (
                          <div key={outlineKey} className="rounded-xl border border-border/50 bg-muted/10 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-medium text-foreground min-w-0">{o.subject_line}</p>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => copyOutlineText(o, outlineKey)}
                                className="shrink-0 min-w-18"
                              >
                                {copiedKey === outlineKey ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                            <ul className="mt-2 list-disc pl-4 space-y-0.5 text-xs text-muted-foreground">
                              {o.outline_points.slice(0, 4).map((p) => (
                                <li key={p}>{p}</li>
                              ))}
                            </ul>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        </div>
        <DialogFooter
          showCloseButton={false}
          className="shrink-0 flex-wrap gap-2 border-t border-border/50 bg-background px-4 py-4 sm:px-6 sm:py-4 md:px-8 md:py-5"
        >
          {isLockedView && (
            <>
              <Button
                onClick={() => onOpenChange(false)}
                variant="secondary"
                size="sm"
                className="min-h-[44px] touch-manipulation"
              >
                Close
              </Button>
              <Button size="sm" asChild className="min-h-[44px] touch-manipulation">
                <a href="/settings">Unlock full roadmap</a>
              </Button>
              <Button size="sm" variant="outline" asChild className="min-h-[44px] touch-manipulation">
                <a href="/settings">Upgrade to Pro</a>
              </Button>
            </>
          )}
          {!isLockedView && !canUseTracking && (
            <p className="text-sm text-muted-foreground w-full">
              Pro unlocks tracking.
            </p>
          )}
          {!isLockedView && canUseTracking && status !== "done" && (
            <Button
              onClick={handleComplete}
              disabled={isPending}
              className="min-h-[44px] gap-2 touch-manipulation"
            >
              <Check className="size-4" aria-hidden />
              {isPending ? "Saving…" : "Complete"}
            </Button>
          )}
          {!isLockedView && canUseTracking && status === "not_started" && (
            <Button variant="secondary" onClick={handleStartStep} disabled={isPending} className="min-h-[44px] touch-manipulation">
              {isPending ? "Starting…" : "Start"}
            </Button>
          )}
          {!isLockedView && canUseTracking && status === "in_progress" && (
            <Button
              variant="outline"
              onClick={() => handleSetStatus("paused")}
              disabled={isPending}
              className="min-h-[44px] touch-manipulation"
            >
              {isPending ? "…" : "Pause"}
            </Button>
          )}
          {!isLockedView && canUseTracking && status === "paused" && (
            <>
              <Button variant="secondary" onClick={() => handleSetStatus("in_progress")} disabled={isPending} className="min-h-[44px] touch-manipulation">
                {isPending ? "…" : "Resume"}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="min-h-[44px] touch-manipulation">
                Switch step
              </Button>
            </>
          )}
          {!isLockedView && canUseTracking && status === "done" && (
            <Button variant="ghost" size="sm" onClick={handleMarkNotDone} disabled={isPending} className="min-h-[44px] touch-manipulation">
              {isPending ? "…" : "Undo"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
