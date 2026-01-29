"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logNetworkingAction } from "@/app/actions/logNetworkingAction";
import type { NetworkingActionType } from "@/lib/server/db/networking";

type SuggestedAction = {
  action_type: NetworkingActionType;
  label: string;
  why_it_matters: string;
};

type NetworkingThisWeekCardProps = {
  weekStart: string;
  goal: number;
  completed: number;
  weeklyFocusTitle: string;
  weeklyFocusDescription: string;
  recommendedAction: SuggestedAction | null;
};

const ACTION_LABELS: Record<NetworkingActionType, string> = {
  outreach_sent: "Outreach sent",
  follow_up_sent: "Follow-up sent",
  comment_left: "Comment left",
  post_published: "Post published",
  coffee_chat_requested: "Coffee chat requested",
};

export function NetworkingThisWeekCard({
  weekStart,
  goal,
  completed,
  weeklyFocusTitle,
  weeklyFocusDescription,
  recommendedAction,
}: NetworkingThisWeekCardProps) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [state, formAction, isPending] = useActionState(logNetworkingAction, null);

  useEffect(() => {
    if (state?.ok) {
      closeRef.current?.click();
      router.refresh();
    }
  }, [state?.ok, router]);

  const goalText =
    goal <= 0 ? "Optional this week" : `${completed}/${goal} actions logged`;

  return (
    <>
      <Card className="shadow-sm ring-1 ring-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Networking this week</CardTitle>
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

          <div className="flex flex-wrap items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  className="min-h-[44px] touch-manipulation"
                  aria-label="Log a networking action"
                >
                  <MessageSquarePlus className="h-4 w-4 mr-2" aria-hidden />
                  Log outreach
                </Button>
              </DialogTrigger>

              {/* Hidden close target to close on success (no setState-in-effect). */}
              <DialogClose asChild>
                <button ref={closeRef} type="button" className="hidden" aria-hidden />
              </DialogClose>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Log outreach</DialogTitle>
                  <DialogDescription>
                    Track attempts, not outcomes. Keep it short and optional.
                  </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="week_start" value={weekStart} aria-hidden />

                  <div className="grid gap-2">
                    <Label htmlFor="network-action-type">Action</Label>
                    <select
                      id="network-action-type"
                      name="action_type"
                      defaultValue={recommendedAction?.action_type ?? "outreach_sent"}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Networking action type"
                    >
                      {(
                        Object.keys(ACTION_LABELS) as Array<keyof typeof ACTION_LABELS>
                      ).map((k) => (
                        <option key={k} value={k}>
                          {ACTION_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="network-action-date">Date</Label>
                    <Input
                      id="network-action-date"
                      type="date"
                      name="action_date"
                      defaultValue={today}
                      required
                      className="h-10"
                      aria-label="Action date"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="network-action-notes">Note (optional)</Label>
                    <Input
                      id="network-action-notes"
                      type="text"
                      name="notes"
                      maxLength={140}
                      placeholder="e.g. Asked about interview loop (kept it short)"
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Keep it under 140 characters.
                    </p>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Saving…" : "Save"}
                    </Button>
                  </DialogFooter>

                  {state && !state.ok && (
                    <p className="text-sm text-destructive" role="alert">
                      {state.error}
                    </p>
                  )}
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {state && !state.ok && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

