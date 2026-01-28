import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RoadmapProgressCardProps = {
  completedSteps: number;
  totalSteps: number;
  hasRoadmap: boolean;
  className?: string;
};

export function RoadmapProgressCard({
  completedSteps,
  totalSteps,
  hasRoadmap,
  className,
}: RoadmapProgressCardProps) {
  const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <Card className={cn("flex flex-col shadow-sm ring-1 ring-border/60", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Roadmap progress</CardTitle>
        <CardDescription>Overall roadmap progress</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 justify-between min-h-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">
              <span className="text-primary">{completedSteps}</span>
              <span className="text-muted-foreground font-normal text-lg"> / {totalSteps}</span>
            </span>
          </div>
          {totalSteps > 0 && (
            <div
              className="h-2.5 w-full rounded-full bg-muted/80 overflow-hidden"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
        {hasRoadmap && (
          <Button asChild size="sm" variant="ghost" className="w-fit mt-auto">
            <Link href="/roadmap">View roadmap</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
