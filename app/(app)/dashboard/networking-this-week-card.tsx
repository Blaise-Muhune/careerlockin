"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { toggleNetworkingAttemptAction } from "@/app/actions/toggleNetworkingAttempt";
import { updateNetworkingGoalAction } from "@/app/actions/updateNetworkingGoal";
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
  /** Calendar date (YYYY-MM-DD) used for checkbox counts and toggles. */
  today: string;
  todayCounts: Record<NetworkingActionType, number>;
  goal: number;
  completed: number;
  weeklyFocusTitle: string;
  weeklyFocusDescription: string;
  recommendedAction: SuggestedAction | null;
  /** When false, goal + tracking are hidden (same gating as time logs). */
  canUseTracking?: boolean;
};

const ACTION_LABELS: Record<NetworkingActionType, string> = {
  outreach_sent: "Outreach sent",
  follow_up_sent: "Follow-up sent",
  comment_left: "Comment left",
  post_published: "Post published",
  coffee_chat_requested: "Coffee chat requested",
};

export function NetworkingThisWeekCard({
  weekStart: _weekStart,
  today,
  todayCounts,
  goal,
  completed,
  weeklyFocusTitle,
  weeklyFocusDescription,
  recommendedAction,
  canUseTracking = true,
}: NetworkingThisWeekCardProps) {
  void _weekStart;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingType, setPendingType] = useState<NetworkingActionType | null>(
    null
  );
  const [toggleError, setToggleError] = useState<string | null>(null);

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

  const goalText =
    goal <= 0 ? "Optional this week" : `${completed}/${goal} attempts this week`;

  return (
    <Card className="shadow-sm ring-1 ring-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Networking this week
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {goalText}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium text-foreground">{weeklyFocusTitle}</p>
          <p className="text-sm text-muted-foreground">{weeklyFocusDescription}</p>
        </div>

        {recommendedAction ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">Recommended</p>
            <p className="text-sm text-muted-foreground">{recommendedAction.label}</p>
          </div>
        ) : null}

        {!canUseTracking ? (
          <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
            <p className="mb-2">Pro unlocks networking tracking.</p>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/settings">Upgrade to Pro</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="space-y-2 border-t border-border/60 pt-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Weekly goal
              </h3>
              <p className="text-xs text-muted-foreground">
                How many networking attempts you want to aim for this week (each
                checkbox below counts one attempt for today).
              </p>
              <form
                action={goalFormAction}
                className="flex flex-wrap items-end gap-2"
              >
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="networking-weekly-goal-card"
                    className="text-xs text-muted-foreground"
                  >
                    Target (attempts)
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
                  className="min-h-[44px] touch-manipulation"
                >
                  {isGoalPending ? "Saving…" : "Save"}
                </Button>
              </form>
              {goalState && !goalState.ok && (
                <p className="text-sm text-destructive" role="alert">
                  {goalState.error}
                </p>
              )}
            </section>

            <section className="space-y-2 border-t border-border/60 pt-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Today
              </h3>
              <p className="text-xs text-muted-foreground">
                Check to record one attempt for{" "}
                <span className="font-medium text-foreground">{today}</span>.
                Uncheck removes your most recent attempt of that type for that day.
              </p>
              {toggleError && (
                <p className="text-sm text-destructive" role="alert">
                  {toggleError}
                </p>
              )}
              <ul className="flex flex-col gap-2" role="list">
                {NETWORKING_ACTION_TYPES.map((action_type) => {
                  const count = todayCounts[action_type] ?? 0;
                  const checked = count > 0;
                  const isRowPending = isPending && pendingType === action_type;
                  const isRecommended =
                    recommendedAction?.action_type === action_type;
                  return (
                    <li
                      key={action_type}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-background px-3 py-2.5",
                        isRecommended && "ring-1 ring-primary/35 border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
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
                          className="text-sm font-normal cursor-pointer leading-snug"
                        >
                          {ACTION_LABELS[action_type]}
                          {count > 1 ? (
                            <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">
                              ({count} today)
                            </span>
                          ) : null}
                        </Label>
                      </div>
                      {count > 0 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 shrink-0 text-xs text-muted-foreground"
                          disabled={isPending}
                          onClick={() => runToggle(action_type, "true")}
                        >
                          + Another
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
