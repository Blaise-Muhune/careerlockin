"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { addTimeLogAction } from "@/app/actions/addTimeLog";
import { editTimeLogAction } from "@/app/actions/editTimeLog";
import { deleteTimeLogAction } from "@/app/actions/deleteTimeLog";
import { logNetworkingAction } from "@/app/actions/logNetworkingAction";
import { updateNetworkingGoalAction } from "@/app/actions/updateNetworkingGoal";
import type { TimeLogRow } from "@/lib/server/db/timeLogs";

type ThisWeekCardProps = {
  weeklyHours: number;
  completedHours: number;
  timeLogs: TimeLogRow[];
  defaultLogDate: string;
  canUseTracking?: boolean;
  networkingGoal: number;
};

export function ThisWeekCard({
  weeklyHours,
  completedHours,
  timeLogs,
  defaultLogDate,
  canUseTracking = true,
  networkingGoal,
}: ThisWeekCardProps) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [addState, addFormAction, isAddPending] = useActionState(
    addTimeLogAction,
    null
  );
  const [delState, delFormAction] = useActionState(deleteTimeLogAction, null);
  const [editState, editFormAction] = useActionState(editTimeLogAction, null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [networkState, networkFormAction, isNetworkPending] = useActionState(
    logNetworkingAction,
    null
  );
  const [goalState, goalFormAction, isGoalPending] = useActionState(
    updateNetworkingGoalAction,
    null
  );

  useEffect(() => {
    if (
      addState?.ok ??
      delState?.ok ??
      editState?.ok ??
      networkState?.ok ??
      goalState?.ok
    ) {
      if (networkState?.ok) closeRef.current?.click();
      router.refresh();
    }
  }, [
    addState?.ok,
    delState?.ok,
    editState?.ok,
    networkState?.ok,
    goalState?.ok,
    router,
  ]);

  const progressPct =
    weeklyHours > 0
      ? Math.min(100, (completedHours / weeklyHours) * 100)
      : 0;

  return (
    <>
    <Dialog>
    <Card className="shadow-sm ring-1 ring-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">This week</CardTitle>
        <CardDescription className="text-muted-foreground">
          Planned: {weeklyHours}h · Done: <span className="font-medium text-foreground">{completedHours.toFixed(1)}h</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {weeklyHours > 0 && (
          <div
            className="h-2 w-full rounded-full bg-muted/80 overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {!canUseTracking ? (
          <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
            <p className="mb-2">Pro unlocks tracking.</p>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/settings">Upgrade to Pro</Link>
            </Button>
          </div>
        ) : (
          <>
        <section className="space-y-2 pt-1 border-t border-border/60">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Networking
            </h3>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="min-h-[36px]"
                aria-label="Log a networking action"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" aria-hidden />
                Log
              </Button>
            </DialogTrigger>
          </div>
          <form action={goalFormAction} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="networking-weekly-goal" className="text-xs text-muted-foreground">
                Weekly goal (attempts)
              </Label>
              <Input
                id="networking-weekly-goal"
                type="number"
                name="networking_weekly_goal"
                min={0}
                max={14}
                defaultValue={networkingGoal}
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
        <DialogClose asChild>
          <button ref={closeRef} type="button" className="hidden" aria-hidden />
        </DialogClose>

        <section className="space-y-2 pt-1 border-t border-border/60">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick add</h3>
          <form action={addFormAction} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <Input
                type="date"
                name="log_date"
                defaultValue={defaultLogDate}
                required
                className="w-32 h-9 text-sm"
                aria-label="Date"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                name="minutes"
                min={1}
                max={1440}
                placeholder="30"
                className="w-20 h-9 text-sm"
                required
                aria-label="Minutes"
              />
            </div>
            <Input
              type="text"
              name="note"
              placeholder="Note (optional)"
              maxLength={501}
              className="flex-1 min-w-[100px] h-9 text-sm"
            />
            <Button type="submit" size="sm" disabled={isAddPending} className="min-h-[44px] touch-manipulation shrink-0">
              {isAddPending ? "Adding…" : "Add"}
            </Button>
          </form>
          {addState && !addState.ok && (
            <p className="text-sm text-destructive" role="alert">
              {addState.error}
            </p>
          )}
        </section>

        {timeLogs.length > 0 ? (
          <section className="space-y-2 pt-1 border-t border-border/60">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Time logs</h3>
            <ul className="flex flex-col gap-1.5">
              {timeLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                >
                  {editingId === log.id ? (
                    <form
                      action={editFormAction}
                      className="flex flex-1 flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="id" value={log.id} />
                      <Input
                        type="number"
                        name="minutes"
                        defaultValue={log.minutes}
                        min={1}
                        max={1440}
                        className="w-20"
                      />
                      <Input
                        type="text"
                        name="note"
                        defaultValue={log.note ?? ""}
                        placeholder="Note"
                        className="min-w-[100px] flex-1"
                        maxLength={501}
                      />
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-medium">
                          {new Date(log.log_date + "T12:00:00").toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {log.minutes} min
                        </span>
                        {log.note && (
                          <span className="text-muted-foreground truncate max-w-[200px]" title={log.note}>
                            {log.note}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(log.id)}
                        >
                          Edit
                        </Button>
                        <form action={delFormAction} className="inline">
                          <input type="hidden" name="id" value={log.id} />
                          <Button type="submit" size="sm" variant="ghost">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="text-sm text-muted-foreground pt-1 border-t border-border/60">
            No time logged this week yet. Add some above.
          </p>
        )}

          </>
        )}
      </CardContent>
    </Card>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Log a networking action</DialogTitle>
        <DialogDescription>
          Optional and measurable. Keep it short and personal.
        </DialogDescription>
      </DialogHeader>

      <form action={networkFormAction} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="network-action-type-weekly">Action</Label>
          <select
            id="network-action-type-weekly"
            name="action_type"
            defaultValue={"outreach_sent"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="outreach_sent">Outreach sent</option>
            <option value="follow_up_sent">Follow-up sent</option>
            <option value="comment_left">Comment left</option>
            <option value="post_published">Post published</option>
            <option value="coffee_chat_requested">Coffee chat requested</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="network-action-date-weekly">Date</Label>
          <Input
            id="network-action-date-weekly"
            type="date"
            name="action_date"
            defaultValue={today}
            required
            className="h-10"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="network-action-notes-weekly">Note (optional)</Label>
          <Input
            id="network-action-notes-weekly"
            type="text"
            name="notes"
            maxLength={140}
            placeholder="e.g. Asked about stack + interview loop"
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">Max 140 characters.</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isNetworkPending}>
            {isNetworkPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>

        {networkState && !networkState.ok && (
          <p className="text-sm text-destructive" role="alert">
            {networkState.error}
          </p>
        )}
      </form>
    </DialogContent>
    </Dialog>
    </>
  );
}
