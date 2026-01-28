import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MomentumCardProps = {
  daysLoggedThisWeek: number;
  className?: string;
};

export function MomentumCard({ daysLoggedThisWeek, className }: MomentumCardProps) {
  return (
    <Card className={cn("flex flex-col shadow-sm ring-1 ring-border/60", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Momentum</CardTitle>
        <CardDescription>Days with time logged this week</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <p className="text-3xl font-semibold tabular-nums">
          <span className="text-primary">{daysLoggedThisWeek}</span>
          <span className="text-muted-foreground font-normal text-lg ml-1.5">
            {daysLoggedThisWeek === 1 ? "day" : "days"}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
