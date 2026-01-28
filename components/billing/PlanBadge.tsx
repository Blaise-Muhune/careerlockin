import { cn } from "@/lib/utils";

export type PlanBadgeVariant = "Free" | "Plan Unlocked" | "Pro";

type PlanBadgeProps = {
  variant: PlanBadgeVariant;
  className?: string;
};

const styles: Record<PlanBadgeVariant, string> = {
  Free: "bg-muted text-muted-foreground border-border",
  "Plan Unlocked": "bg-primary/10 text-primary border-primary/30",
  Pro: "bg-primary text-primary-foreground border-primary",
};

export function PlanBadge({ variant, className }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {variant}
    </span>
  );
}

export function planBadgeVariantFromEntitlements(entitlements: {
  isPro: boolean;
  canViewFullRoadmap: boolean;
  canUseTracking: boolean;
}): PlanBadgeVariant {
  if (entitlements.isPro) return "Pro";
  if (entitlements.canViewFullRoadmap && !entitlements.canUseTracking)
    return "Plan Unlocked";
  return "Free";
}
