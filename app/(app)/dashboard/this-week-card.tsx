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
import {
  appMonoStatClass,
  appNestedSurfaceClass,
  appPrimaryButtonClass,
  appSectionLabelClass,
} from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type ThisWeekCardProps = {
  weeklyHours: number;
  completedHours: number;
  timeLogs: TimeLogRow[];
  defaultLogDate: string;
  canUseTracking?: boolean;
};

const quickChipClass =
  "rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted/50 hover:border-border transition-colors min-h-9";

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

  const quickTemplates = [
    { label: "Quick 15 min", minutes: 15, note: "Quick session" },
    { label: "Focused 30 min", minutes: 30, note: "Focused practice" },
    { label: "Deep 60 min", minutes: 60, note: "Deep work session" },
  ] as const;

  return (
    <Card
      className={cn(
        "border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-14px_rgba(0,0,0,0.1)] transition-[box-shadow] duration-500",
        justLogged && "ring-1 ring-foreground/10"
      )}
    >
      <CardHeader className="pb-2 border-b border-border/40">
        <CardTitle className="text-lg font-bold tracking-tight">Log time</CardTitle>
        <CardDescription className="text-muted-foreground">
          Planned{" "}
          <span className={cn("font-semibold text-foreground", appMonoStatClass)}>
            {weeklyHours}h
          </span>{" "}
          · Logged{" "}
          <span
            className={cn(
              "font-semibold text-foreground transition-colors duration-300",
              appMonoStatClass,
              justLogged && "text-primary"
            )}
          >
            {completedHours.toFixed(1)}h
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-5">
        {!canUseTracking ? (
          <div
            className={cn(
              appNestedSurfaceClass,
              "px-4 py-4 text-sm text-muted-foreground text-center"
            )}
          >
            <p className="mb-3">Pro unlocks time logging.</p>
            <Button size="sm" variant="outline" className="rounded-full" asChild>
              <Link href="/settings">Upgrade to Pro</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h3 className={appSectionLabelClass}>Quick add</h3>
              <div className="flex flex-wrap gap-2">
                {quickTemplates.map((template) => (
                  <form key={template.label} action={submitAdd}>
                    <input type="hidden" name="log_date" value={today} />
                    <input type="hidden" name="minutes" value={template.minutes} />
                    <input type="hidden" name="note" value={template.note} />
                    <button
                      type="submit"
                      disabled={isAddPending}
                      className={quickChipClass}
                    >
                      {template.label}
                    </button>
                  </form>
                ))}
              </div>
            </section>

            <section className={cn(appNestedSurfaceClass, "p-4 space-y-3")}>
              <h3 className={appSectionLabelClass}>Manual entry</h3>
              <form
                ref={formRef}
                action={submitAdd}
                className="flex flex-wrap items-end gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="quick-log-date" className="text-xs text-muted-foreground">
                    Date
                  </Label>
                  <Input
                    id="quick-log-date"
                    type="date"
                    name="log_date"
                    defaultValue={defaultLogDate}
                    required
                    className="w-36 h-10 rounded-xl text-sm"
                    aria-label="Date"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="quick-log-minutes" className="text-xs text-muted-foreground">
                    Minutes
                  </Label>
                  <Input
                    id="quick-log-minutes"
                    type="number"
                    name="minutes"
                    min={1}
                    max={1440}
                    placeholder="30"
                    className="w-24 h-10 rounded-xl text-sm"
                    required
                    aria-label="Minutes"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                  <Label htmlFor="quick-log-note" className="text-xs text-muted-foreground">
                    Note (optional)
                  </Label>
                  <Input
                    id="quick-log-note"
                    type="text"
                    name="note"
                    placeholder="What did you work on?"
                    maxLength={501}
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isAddPending}
                  className={cn(
                    "min-h-10 touch-manipulation shrink-0 gap-1.5 rounded-full px-5",
                    appPrimaryButtonClass
                  )}
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
                  className="flex items-center gap-1.5 text-sm text-foreground animate-in fade-in slide-in-from-bottom-1 duration-300"
                  role="status"
                >
                  <Check className="size-3.5 shrink-0 text-primary" aria-hidden />
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
              <section className="space-y-2">
                <h3 className={appSectionLabelClass}>Time logs</h3>
                <ul className="flex flex-col gap-2">
                  {timeLogs.map((log) => (
                    <li
                      key={log.id}
                      className={cn(
                        appNestedSurfaceClass,
                        "flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm transition-[background-color,box-shadow] duration-500",
                        celebrateId === log.id &&
                          "bg-primary/10 ring-1 ring-primary/25 animate-in fade-in slide-in-from-top-2 duration-400"
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
                            className="w-20 rounded-xl"
                          />
                          <Input
                            type="text"
                            name="note"
                            defaultValue={log.note ?? ""}
                            placeholder="Note"
                            className="min-w-[100px] flex-1 rounded-xl"
                            maxLength={501}
                          />
                          <Button type="submit" size="sm" className="rounded-full">
                            Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
                            <span className="font-semibold text-foreground">
                              {new Date(log.log_date + "T12:00:00").toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className={cn("text-muted-foreground", appMonoStatClass)}>
                              {log.minutes} min
                            </span>
                            {log.note ? (
                              <span
                                className="text-muted-foreground truncate max-w-[200px]"
                                title={log.note}
                              >
                                {log.note}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 rounded-full text-xs"
                              onClick={() => setEditingId(log.id)}
                            >
                              Edit
                            </Button>
                            <form action={delFormAction} className="inline">
                              <input type="hidden" name="id" value={log.id} />
                              <Button
                                type="submit"
                                size="sm"
                                variant="ghost"
                                className="h-8 rounded-full text-xs"
                              >
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
              <p className="text-sm text-muted-foreground">
                No time logged this week yet. Add some above.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
