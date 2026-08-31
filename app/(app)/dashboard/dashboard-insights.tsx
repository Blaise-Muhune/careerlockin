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

type DashboardInsightsProps = {
  canSeeCharts: boolean;
  weeklyTrend: WeeklyMinutesPoint[];
  phaseCompletion: PhaseCompletionPoint[];
};

/**
 * Insights stay available but collapsed by default to cut above-the-fold noise.
 */
export function DashboardInsights({
  canSeeCharts,
  weeklyTrend,
  phaseCompletion,
}: DashboardInsightsProps) {
  return (
    <Accordion type="single" collapsible className="w-full border-t border-border/50 pt-2">
      <AccordionItem value="insights" className="border-none">
        <AccordionTrigger className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:no-underline">
          Insights
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-6 sm:grid-cols-2 pb-2">
            <div className="min-h-0">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Weekly minutes
              </h3>
              <Gated
                allowed={canSeeCharts}
                fallback={
                  <div className="relative min-h-[180px]">
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
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
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Phase completion
              </h3>
              <Gated
                allowed={canSeeCharts}
                fallback={
                  <div className="relative min-h-[180px]">
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
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
            <p className="text-xs text-muted-foreground">
              Charts are a Pro feature.{" "}
              <Link href="/settings" className="text-primary hover:underline">
                Upgrade
              </Link>
            </p>
          ) : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
