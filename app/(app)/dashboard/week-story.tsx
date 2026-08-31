import Link from "next/link";
import { cn } from "@/lib/utils";

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

/**
 * One composed “this week” beat: story line + goal arc + three supporting facts.
 * Attractive without stacking cards or instructional clutter.
 */
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
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-primary/[0.07] via-background to-background",
        "px-5 py-5 sm:px-6 sm:py-6",
        className
      )}
      aria-label="This week’s story"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary/80">
            This week
          </p>
          <p className="text-lg sm:text-xl font-medium tracking-tight text-foreground text-balance leading-snug">
            {lead}
          </p>
        </div>

        {planned > 0 ? (
          <div className="space-y-2 max-w-md">
            <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
              <span>Toward your {planned}h goal</span>
              <span className="tabular-nums text-foreground/80">
                {hoursThisWeek.toFixed(1)}h
                {progressPct >= 100 ? " · done" : ` · ${remaining.toFixed(1)}h left`}
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80"
              role="progressbar"
              aria-valuenow={Math.round(progressPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Weekly hours progress"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}

        <dl className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
          {beats.map((b) => (
            <div key={b.label} className="min-w-0">
              <dt className="sr-only">{b.label}</dt>
              <dd className="flex flex-col gap-0.5">
                <span className="text-2xl sm:text-[1.75rem] font-semibold tracking-tight tabular-nums text-foreground">
                  {b.value}
                  {b.unit ? (
                    <span className="text-base font-medium text-muted-foreground">
                      {b.unit}
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground truncate">
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
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Unlock the full roadmap
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
