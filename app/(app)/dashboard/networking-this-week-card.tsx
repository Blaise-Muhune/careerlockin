"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toggleNetworkingAttemptAction } from "@/app/actions/toggleNetworkingAttempt";
import { updateNetworkingGoalAction } from "@/app/actions/updateNetworkingGoal";
import { MessageDraftCard } from "@/components/networking/MessageDraftCard";
import type { MessageDraft } from "@/lib/networking/draftTypes";
import {
  NETWORKING_ACTION_TYPES,
  type NetworkingActionType,
} from "@/lib/networking/actionTypes";
import { cn } from "@/lib/utils";

type SuggestedAction = {
  action_type: NetworkingActionType;
  label: string;
  why_it_matters: string;
};

type NetworkingThisWeekCardProps = {
  weekStart: string;
  today: string;
  todayCounts: Record<NetworkingActionType, number>;
  goal: number;
  completed: number;
  weeklyFocusTitle: string;
  weeklyFocusDescription: string;
  recommendedAction: SuggestedAction | null;
  primaryDraft?: MessageDraft | null;
  canUseTracking?: boolean;
};

const ACTION_LABELS: Record<NetworkingActionType, string> = {
  outreach_sent: "Outreach",
  follow_up_sent: "Follow-up",
  comment_left: "Comment",
  post_published: "Post",
  coffee_chat_requested: "Coffee chat",
};

/**
 * Progressive disclosure: default = status + one action + optional draft.
 * Goal editor + full attempt list stay behind "More".
 */
export function NetworkingThisWeekCard({
  weekStart: _weekStart,
  today,
  todayCounts,
  goal,
  completed,
  weeklyFocusTitle,
  weeklyFocusDescription,
  recommendedAction,
  primaryDraft = null,
  canUseTracking = true,
}: NetworkingThisWeekCardProps) {
  void _weekStart;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingType, setPendingType] = useState<NetworkingActionType | null>(
    null
  );
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [showDraft, setShowDraft] = useState(false);

  const [goalState, goalFormAction, isGoalPending] = useActionState(
    updateNetworkingGoalAction,
    null
  );

  useEffect(() => {
    if (goalState?.ok) router.refresh();
  }, [goalState?.ok, router]);

  function runToggle(
    action_type: NetworkingActionType,
    checked: "true" | "false"
  ) {
    setToggleError(null);
    setPendingType(action_type);
    const fd = new FormData();
    fd.set("action_date", today);
    fd.set("action_type", action_type);
    fd.set("checked", checked);
    startTransition(() => {
      toggleNetworkingAttemptAction(null, fd).then((res) => {
        setPendingType(null);
        if (res.ok) router.refresh();
        else setToggleError(res.error);
      });
    });
  }

  const primaryType = recommendedAction?.action_type ?? "outreach_sent";
  const primaryCount = todayCounts[primaryType] ?? 0;
  const primaryDone = primaryCount > 0;
  const goalMet = goal > 0 && completed >= goal;
  const progressLabel =
    goal <= 0
      ? "No weekly target"
      : goalMet
        ? `Done · ${completed}/${goal}`
        : `${completed}/${goal} this week`;

  return (
    <Card className="shadow-sm ring-1 ring-border/60">
      <CardHeader className="pb-3 space-y-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <CardTitle className="text-base font-semibold">Networking</CardTitle>
          <p className="text-xs tabular-nums text-muted-foreground">
            {progressLabel}
          </p>
        </div>
        <CardDescription className="text-muted-foreground">
          <span className="font-medium text-foreground/90">
            {weeklyFocusTitle}
          </span>
          {" — "}
          {weeklyFocusDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {recommendedAction ? (
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-3 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                This week’s move
              </p>
              <p className="text-sm text-foreground leading-snug">
                {recommendedAction.label}
              </p>
            </div>

            {canUseTracking ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={primaryDone ? "secondary" : "default"}
                  disabled={isPending && pendingType === primaryType}
                  className="min-h-9"
                  onClick={() =>
                    runToggle(primaryType, primaryDone ? "false" : "true")
                  }
                >
                  {isPending && pendingType === primaryType
                    ? "Saving…"
                    : primaryDone
                      ? "Undo log"
                      : "Mark done"}
                </Button>
                {primaryDraft ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="min-h-9 gap-1"
                    onClick={() => setShowDraft((v) => !v)}
                    aria-expanded={showDraft}
                  >
                    {showDraft ? "Hide message" : "Copy message"}
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform",
                        showDraft && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </Button>
                ) : null}
              </div>
            ) : (
              <Button size="sm" variant="secondary" asChild>
                <Link href="/settings">Upgrade to track</Link>
              </Button>
            )}

            {showDraft && primaryDraft ? (
              <MessageDraftCard draft={primaryDraft} compact />
            ) : null}
          </div>
        ) : null}

        {toggleError ? (
          <p className="text-sm text-destructive" role="alert">
            {toggleError}
          </p>
        ) : null}

        {canUseTracking ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="more" className="border-border/50">
              <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline hover:text-foreground">
                Log other attempts · adjust goal
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-2">
                <form
                  action={goalFormAction}
                  className="flex flex-wrap items-end gap-2"
                >
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="networking-weekly-goal-card"
                      className="text-xs text-muted-foreground"
                    >
                      Weekly target
                    </Label>
                    <Input
                      id="networking-weekly-goal-card"
                      type="number"
                      name="networking_weekly_goal"
                      min={0}
                      max={14}
                      defaultValue={goal}
                      className="w-24 h-9 text-sm"
                      aria-label="Weekly networking goal"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    disabled={isGoalPending}
                    className="min-h-9"
                  >
                    {isGoalPending ? "Saving…" : "Save"}
                  </Button>
                </form>
                {goalState && !goalState.ok ? (
                  <p className="text-sm text-destructive" role="alert">
                    {goalState.error}
                  </p>
                ) : null}

                <ul className="flex flex-col gap-1.5" role="list">
                  {NETWORKING_ACTION_TYPES.map((action_type) => {
                    const count = todayCounts[action_type] ?? 0;
                    const checked = count > 0;
                    const isRowPending =
                      isPending && pendingType === action_type;
                    return (
                      <li
                        key={action_type}
                        className="flex items-center justify-between gap-2 rounded-md px-1 py-1.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            id={`network-today-${action_type}`}
                            checked={checked}
                            disabled={isRowPending}
                            onCheckedChange={(value) => {
                              if (value === "indeterminate") return;
                              const nextChecked = value === true;
                              if (nextChecked === checked) return;
                              runToggle(
                                action_type,
                                nextChecked ? "true" : "false"
                              );
                            }}
                            aria-label={`${ACTION_LABELS[action_type]} for ${today}`}
                          />
                          <Label
                            htmlFor={`network-today-${action_type}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {ACTION_LABELS[action_type]}
                            {count > 1 ? (
                              <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                                ×{count}
                              </span>
                            ) : null}
                          </Label>
                        </div>
                        {count > 0 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 shrink-0 text-xs text-muted-foreground"
                            disabled={isPending}
                            onClick={() => runToggle(action_type, "true")}
                          >
                            +1
                          </Button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}
      </CardContent>
    </Card>
  );
}
