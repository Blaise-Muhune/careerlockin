import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  appEyebrowClass,
  appMonoStatClass,
  appSurfaceCardClass,
} from "@/lib/layout/app";

type WeekStoryProps = {
  hoursThisWeek: number;
  weeklyHours: number;
  daysActiveThisWeek: number;
  stepsCompleted: number;
  networkingActionsThisWeek: number;
  encouragement: string;
  showUnlockCta?: boolean;
  className?: string;
};

export function WeekStory({
  hoursThisWeek,
  weeklyHours,
  daysActiveThisWeek,
  stepsCompleted,
  networkingActionsThisWeek,
  encouragement,
  showUnlockCta = false,
  className,
}: WeekStoryProps) {
  const planned = weeklyHours > 0 ? weeklyHours : 0;
  const progressPct =
    planned > 0 ? Math.min(100, (hoursThisWeek / planned) * 100) : 0;
  const remaining = planned > 0 ? Math.max(0, planned - hoursThisWeek) : 0;

  const lead =
    encouragement.trim() ||
    (planned > 0 && remaining === 0
      ? "Weekly hours locked in. Keep the streak gentle."
      : planned > 0
        ? `You're ${remaining.toFixed(1)} hours from your weekly goal.`
        : daysActiveThisWeek > 0
          ? "You showed up this week. Log a bit more when you can."
          : "A short session today starts the week.");

  const beats = [
    {
      value: hoursThisWeek.toFixed(1),
      unit: "h",
      label: hoursThisWeek >= 1 ? "practiced" : "so far",
    },
    {
      value: String(daysActiveThisWeek),
      unit: "",
      label: daysActiveThisWeek === 1 ? "day in" : "days in",
    },
    stepsCompleted > 0
      ? {
          value: String(stepsCompleted),
          unit: "",
          label: stepsCompleted === 1 ? "step closed" : "steps closed",
        }
      : {
          value: String(networkingActionsThisWeek),
          unit: "",
          label:
            networkingActionsThisWeek === 1 ? "outreach sent" : "outreaches",
        },
  ];

  return (
    <section
      className={cn(
        appSurfaceCardClass,
        "relative overflow-hidden px-5 py-6 sm:px-8 sm:py-7",
        className
      )}
      aria-label="This week’s story"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-muted/40 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6">
        <div className="space-y-3 max-w-3xl">
          <p className={appEyebrowClass}>This week</p>
          <p className="text-2xl sm:text-[1.75rem] font-bold tracking-tight text-foreground text-balance leading-[1.15]">
            {lead}
          </p>
        </div>

        {planned > 0 ? (
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
              <span>Toward your {planned}h goal</span>
              <span className={cn("text-foreground/80", appMonoStatClass)}>
                {hoursThisWeek.toFixed(1)}h
                {progressPct >= 100 ? " · done" : ` · ${remaining.toFixed(1)}h left`}
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-border/40"
              role="progressbar"
              aria-valuenow={Math.round(progressPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Weekly hours progress"
            >
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}

        <dl className="grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/60 bg-muted/15 max-w-xl overflow-hidden">
          {beats.map((b) => (
            <div key={b.label} className="min-w-0 px-4 py-3 sm:px-5 sm:py-4">
              <dt className="sr-only">{b.label}</dt>
              <dd className="flex flex-col gap-1">
                <span
                  className={cn(
                    "text-2xl sm:text-3xl font-bold tracking-tight text-foreground",
                    appMonoStatClass
                  )}
                >
                  {b.value}
                  {b.unit ? (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {b.unit}
                    </span>
                  ) : null}
                </span>
                <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground truncate">
                  {b.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        {showUnlockCta ? (
          <p className="text-xs text-muted-foreground">
            Phase 1 is open on Free.{" "}
            <Link
              href="/settings"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Unlock the full roadmap
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
