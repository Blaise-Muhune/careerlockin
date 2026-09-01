"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { WeeklyMinutesPoint, PhaseCompletionPoint } from "@/lib/server/db/analytics";
import { Gated } from "@/components/billing/Gated";
import { LockedOverlay } from "@/components/billing/LockedOverlay";
import { WeeklyTrendChart } from "./weekly-trend-chart";
import { PhaseCompletionChart } from "./phase-completion-chart";
import { appSectionLabelClass, appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type DashboardInsightsProps = {
  canSeeCharts: boolean;
  weeklyTrend: WeeklyMinutesPoint[];
  phaseCompletion: PhaseCompletionPoint[];
};

export function DashboardInsights({
  canSeeCharts,
  weeklyTrend,
  phaseCompletion,
}: DashboardInsightsProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn("w-full overflow-hidden", appSurfaceCardClass)}
    >
      <AccordionItem value="insights" className="border-none">
        <AccordionTrigger className="px-5 py-4 text-sm font-bold text-foreground hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/50">
          Insights
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="min-h-0">
              <h3 className={cn(appSectionLabelClass, "mb-3")}>Weekly minutes</h3>
              <Gated
                allowed={canSeeCharts}
                fallback={
                  <div className="relative min-h-[180px]">
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 rounded-xl">
                      <LockedOverlay
                        title="Insights locked"
                        body="Upgrade to Pro for weekly trends."
                        primaryCtaLabel="Upgrade to Pro"
                        primaryHref="/settings"
                      />
                    </div>
                    <div className="pointer-events-none opacity-30 blur-[2px]" aria-hidden>
                      <WeeklyTrendChart data={weeklyTrend} />
                    </div>
                  </div>
                }
              >
                <WeeklyTrendChart data={weeklyTrend} />
              </Gated>
            </div>
            <div className="min-h-0">
              <h3 className={cn(appSectionLabelClass, "mb-3")}>Phase completion</h3>
              <Gated
                allowed={canSeeCharts}
                fallback={
                  <div className="relative min-h-[180px]">
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 rounded-xl">
                      <LockedOverlay
                        title="Breakdown locked"
                        body="Upgrade to Pro for phase insights."
                        primaryCtaLabel="Upgrade to Pro"
                        primaryHref="/settings"
                      />
                    </div>
                    <div className="pointer-events-none opacity-30 blur-[2px]" aria-hidden>
                      {phaseCompletion.length > 0 ? (
                        <PhaseCompletionChart data={phaseCompletion} />
                      ) : (
                        <p className="text-sm text-muted-foreground py-8">No data yet.</p>
                      )}
                    </div>
                  </div>
                }
              >
                {phaseCompletion.length > 0 ? (
                  <PhaseCompletionChart data={phaseCompletion} />
                ) : (
                  <p className="text-sm text-muted-foreground py-6">No data yet.</p>
                )}
              </Gated>
            </div>
          </div>
          {!canSeeCharts ? (
            <p className="text-xs text-muted-foreground mt-4">
              Charts are a Pro feature.{" "}
              <Link
                href="/settings"
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Upgrade
              </Link>
            </p>
          ) : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
