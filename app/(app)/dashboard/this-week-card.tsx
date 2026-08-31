"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
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
  addTimeLogAction,
  type AddTimeLogState,
} from "@/app/actions/addTimeLog";
import { editTimeLogAction } from "@/app/actions/editTimeLog";
import { deleteTimeLogAction } from "@/app/actions/deleteTimeLog";
import type { TimeLogRow } from "@/lib/server/db/timeLogs";
import { cn } from "@/lib/utils";

type ThisWeekCardProps = {
  weeklyHours: number;
  completedHours: number;
  timeLogs: TimeLogRow[];
  defaultLogDate: string;
  canUseTracking?: boolean;
};

export function ThisWeekCard({
  weeklyHours,
  completedHours,
  timeLogs,
  defaultLogDate,
  canUseTracking = true,
}: ThisWeekCardProps) {
  const router = useRouter();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const formRef = useRef<HTMLFormElement>(null);
  const [isAddPending, startAddTransition] = useTransition();
  const [justLogged, setJustLogged] = useState(false);
  const [celebrateNewest, setCelebrateNewest] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const clearLoggedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearCelebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [delState, delFormAction] = useActionState(deleteTimeLogAction, null);
  const [editState, editFormAction] = useActionState(editTimeLogAction, null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (delState?.ok || editState?.ok) {
      router.refresh();
    }
  }, [delState?.ok, editState?.ok, router]);

  function flashLoggedSuccess() {
    setJustLogged(true);
    setCelebrateNewest(true);
    setAddError(null);
    formRef.current?.reset();
    router.refresh();
    if (clearLoggedTimer.current) clearTimeout(clearLoggedTimer.current);
    if (clearCelebrateTimer.current) clearTimeout(clearCelebrateTimer.current);
    clearLoggedTimer.current = setTimeout(() => setJustLogged(false), 2400);
    clearCelebrateTimer.current = setTimeout(
      () => setCelebrateNewest(false),
      1100
    );
  }

  function submitAdd(formData: FormData) {
    startAddTransition(async () => {
      const result: AddTimeLogState = await addTimeLogAction(null, formData);
      if (result.ok) {
        flashLoggedSuccess();
      } else {
        setAddError(result.error);
      }
    });
  }

  const celebrateId = celebrateNewest ? (timeLogs[0]?.id ?? null) : null;

  const progressPct =
    weeklyHours > 0
      ? Math.min(100, (completedHours / weeklyHours) * 100)
      : 0;
  const quickTemplates = [
    { label: "Quick 15 min", minutes: 15, note: "Quick session" },
    { label: "Focused 30 min", minutes: 30, note: "Focused practice" },
    { label: "Deep 60 min", minutes: 60, note: "Deep work session" },
  ] as const;

  return (
    <Card
      className={cn(
        "shadow-sm ring-1 ring-border/60 transition-[box-shadow] duration-500",
        justLogged && "ring-primary/40 shadow-primary/10"
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">This week</CardTitle>
        <CardDescription className="text-muted-foreground">
          Planned: {weeklyHours}h · Done:{" "}
          <span
            className={cn(
              "font-medium text-foreground tabular-nums transition-colors duration-300",
              justLogged && "text-primary"
            )}
          >
            {completedHours.toFixed(1)}h
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {weeklyHours > 0 && (
          <div
            className={cn(
              "h-2 w-full rounded-full bg-muted/80 overflow-hidden",
              justLogged &&
                "ring-2 ring-primary/25 ring-offset-2 ring-offset-background"
            )}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-[width] duration-700 ease-out",
                justLogged && "animate-pulse"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {!canUseTracking ? (
          <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
            <p className="mb-2">Pro unlocks time logging.</p>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/settings">Upgrade to Pro</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="space-y-2 pt-1 border-t border-border/60">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Quick add
              </h3>
              <p className="text-xs text-muted-foreground">
                One-click templates add a log for today. You can still customize
                below.
              </p>
              <div className="flex flex-wrap gap-2">
                {quickTemplates.map((template) => (
                  <form
                    key={template.label}
                    action={submitAdd}
                  >
                    <input type="hidden" name="log_date" value={today} />
                    <input
                      type="hidden"
                      name="minutes"
                      value={template.minutes}
                    />
                    <input type="hidden" name="note" value={template.note} />
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      disabled={isAddPending}
                      className="min-h-[36px]"
                    >
                      {template.label}
                    </Button>
                  </form>
                ))}
              </div>
              <form
                ref={formRef}
                action={submitAdd}
                className="flex flex-wrap items-end gap-2"
              >
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="quick-log-date"
                    className="text-xs text-muted-foreground"
                  >
                    Date
                  </Label>
                  <Input
                    id="quick-log-date"
                    type="date"
                    name="log_date"
                    defaultValue={defaultLogDate}
                    required
                    className="w-32 h-9 text-sm"
                    aria-label="Date"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="quick-log-minutes"
                    className="text-xs text-muted-foreground"
                  >
                    Minutes
                  </Label>
                  <Input
                    id="quick-log-minutes"
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
                <div className="flex flex-col gap-1 flex-1 min-w-[100px]">
                  <Label
                    htmlFor="quick-log-note"
                    className="text-xs text-muted-foreground"
                  >
                    Note (optional)
                  </Label>
                  <Input
                    id="quick-log-note"
                    type="text"
                    name="note"
                    placeholder="What did you work on?"
                    maxLength={501}
                    className="h-9 text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAddPending}
                  className="min-h-[44px] touch-manipulation shrink-0 gap-1.5"
                  aria-live="polite"
                >
                  {isAddPending ? (
                    "Adding…"
                  ) : justLogged ? (
                    <>
                      <Check className="size-4" aria-hidden />
                      Logged
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
              </form>

              {justLogged ? (
                <p
                  className="flex items-center gap-1.5 text-sm text-primary animate-in fade-in slide-in-from-bottom-1 duration-300"
                  role="status"
                >
                  <Check className="size-3.5 shrink-0" aria-hidden />
                  Time logged. Keep going.
                </p>
              ) : null}

              {addError ? (
                <p className="text-sm text-destructive" role="alert">
                  {addError}
                </p>
              ) : null}
            </section>

            {timeLogs.length > 0 ? (
              <section className="space-y-2 pt-1 border-t border-border/60">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Time logs
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {timeLogs.map((log) => (
                    <li
                      key={log.id}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm transition-[background-color,box-shadow] duration-500",
                        celebrateId === log.id &&
                          "bg-primary/15 ring-1 ring-primary/30 animate-in fade-in slide-in-from-top-2 duration-400"
                      )}
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
                              {new Date(
                                log.log_date + "T12:00:00"
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-muted-foreground">
                              {log.minutes} min
                            </span>
                            {log.note && (
                              <span
                                className="text-muted-foreground truncate max-w-[200px]"
                                title={log.note}
                              >
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
  );
}
