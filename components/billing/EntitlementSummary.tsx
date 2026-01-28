import { Lock, Unlock, Map, Activity, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type EntitlementSummaryProps = {
  roadmapDetails: "Locked" | "Unlocked";
  tracking: "Locked" | "Unlocked";
  insights: "Locked" | "Unlocked";
  className?: string;
};

const rowConfig = [
  {
    key: "roadmapDetails" as const,
    label: "Roadmap details",
    icon: Map,
  },
  {
    key: "tracking" as const,
    label: "Tracking",
    icon: Activity,
  },
  {
    key: "insights" as const,
    label: "Insights",
    icon: BarChart3,
  },
];

export function EntitlementSummary({
  roadmapDetails,
  tracking,
  insights,
  className,
}: EntitlementSummaryProps) {
  const map: Record<string, "Locked" | "Unlocked"> = {
    roadmapDetails,
    tracking,
    insights,
  };

  return (
    <div className={cn("flex flex-col gap-1.5 text-sm", className)}>
      {rowConfig.map(({ key, label, icon: Icon }) => {
        const status = map[key];
        const unlocked = status === "Unlocked";
        return (
          <div
            key={key}
            className="flex items-center gap-2 text-muted-foreground"
          >
            {unlocked ? (
              <Unlock className="size-4 shrink-0 text-primary" aria-hidden />
            ) : (
              <Lock className="size-4 shrink-0" aria-hidden />
            )}
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{label}:</span>
            <span className={cn(unlocked && "text-foreground font-medium")}>
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function entitlementSummaryFromEntitlements(entitlements: {
  canViewFullRoadmap: boolean;
  canUseTracking: boolean;
  canSeeCharts: boolean;
}): {
  roadmapDetails: "Locked" | "Unlocked";
  tracking: "Locked" | "Unlocked";
  insights: "Locked" | "Unlocked";
} {
  return {
    roadmapDetails: entitlements.canViewFullRoadmap ? "Unlocked" : "Locked",
    tracking: entitlements.canUseTracking ? "Unlocked" : "Locked",
    insights: entitlements.canSeeCharts ? "Unlocked" : "Locked",
  };
}
