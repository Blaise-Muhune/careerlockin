import type { WeeklyCheckinRow } from "@/lib/server/db/checkins";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RecentCheckinsProps = {
  checkins: WeeklyCheckinRow[];
};

export function RecentCheckins({ checkins }: RecentCheckinsProps) {
  if (checkins.length === 0) {
    return (
      <Card className="shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent check-ins</CardTitle>
          <CardDescription>Your last 8 weeks.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nothing logged yet. Add one above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm ring-1 ring-border/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent check-ins</CardTitle>
        <CardDescription>Your last 8 weeks.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {checkins.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2.5 text-sm"
            >
              <span className="font-medium">
                Week of {new Date(c.week_start).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-muted-foreground">
                Done: {c.completed_hours != null ? `${c.completed_hours}h` : "—"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
