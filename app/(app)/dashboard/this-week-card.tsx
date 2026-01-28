"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addTimeLogAction } from "@/app/actions/addTimeLog";
import { editTimeLogAction } from "@/app/actions/editTimeLog";
import { deleteTimeLogAction } from "@/app/actions/deleteTimeLog";
import { saveWeeklyNotesAction } from "@/app/actions/saveWeeklyNotes";
import type { TimeLogRow } from "@/lib/server/db/timeLogs";

type ThisWeekCardProps = {
  weekStart: string;
  weeklyHours: number;
  completedHours: number;
  timeLogs: TimeLogRow[];
  initialNotes: string;
  defaultLogDate: string;
  canUseTracking?: boolean;
};

export function ThisWeekCard({
  weekStart,
  weeklyHours,
  completedHours,
  timeLogs,
  initialNotes,
  defaultLogDate,
  canUseTracking = true,
}: ThisWeekCardProps) {
  const router = useRouter();
  const [addState, addFormAction, isAddPending] = useActionState(
    addTimeLogAction,
    null
  );
  const [notesState, notesFormAction, isNotesPending] = useActionState(
    saveWeeklyNotesAction,
    null
  );
  const [delState, delFormAction] = useActionState(deleteTimeLogAction, null);
  const [editState, editFormAction] = useActionState(editTimeLogAction, null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (addState?.ok ?? notesState?.ok ?? delState?.ok ?? editState?.ok) {
      router.refresh();
    }
  }, [addState?.ok, notesState?.ok, delState?.ok, editState?.ok, router]);

  const progressPct =
    weeklyHours > 0
      ? Math.min(100, (completedHours / weeklyHours) * 100)
      : 0;

  return (
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

        <section className="space-y-2 pt-1 border-t border-border/60">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Week notes</h3>
          <form action={notesFormAction} className="space-y-2">
            <input type="hidden" name="week_start" value={weekStart} />
            <textarea
              id="week-notes"
              name="notes"
              rows={2}
              defaultValue={initialNotes}
              placeholder="Reflections, blockers…"
              maxLength={1001}
              className="w-full rounded-md border border-input bg-muted/20 px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:opacity-50 resize-y min-h-[60px]"
            />
            <Button type="submit" size="sm" disabled={isNotesPending} className="min-h-[44px] touch-manipulation">
              {isNotesPending ? "Saving…" : "Save notes"}
            </Button>
          </form>
          {notesState && !notesState.ok && (
            <p className="text-sm text-destructive" role="alert">
              {notesState.error}
            </p>
          )}
        </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
