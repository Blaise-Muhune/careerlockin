import { Clock, CalendarDays, CheckCircle } from "lucide-react";

type MomentumStripProps = {
  hoursThisWeek: number;
  daysActiveThisWeek: number;
  stepsCompleted: number;
};

export function MomentumStrip({
  hoursThisWeek,
  daysActiveThisWeek,
  stepsCompleted,
}: MomentumStripProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-primary/10 bg-primary/5 px-5 py-4 text-sm"
      role="group"
      aria-label="This week at a glance"
    >
      <span className="flex items-center gap-2.5 font-medium tabular-nums text-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Clock className="h-4 w-4" aria-hidden />
        </span>
        <span>
          <span className="text-primary">{hoursThisWeek.toFixed(1)}h</span>
          <span className="text-muted-foreground font-normal"> this week</span>
        </span>
      </span>
      <span className="flex items-center gap-2.5 font-medium tabular-nums text-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarDays className="h-4 w-4" aria-hidden />
        </span>
        <span>
          <span className="text-primary">{daysActiveThisWeek}</span>
          <span className="text-muted-foreground font-normal">
            {" "}{daysActiveThisWeek === 1 ? "day" : "days"} active
          </span>
        </span>
      </span>
      <span className="flex items-center gap-2.5 font-medium tabular-nums text-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CheckCircle className="h-4 w-4" aria-hidden />
        </span>
        <span>
          <span className="text-primary">{stepsCompleted}</span>
          <span className="text-muted-foreground font-normal"> steps completed</span>
        </span>
      </span>
    </div>
  );
}
