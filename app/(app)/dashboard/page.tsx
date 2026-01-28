import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import {
  getLatestRoadmapForUser,
  getPhaseIndexForStep,
} from "@/lib/server/db/roadmaps";
import { getProfileWeeklyHours } from "@/lib/server/db/profiles";
import { listTimeLogsForWeek } from "@/lib/server/db/timeLogs";
import {
  getWeeklyCheckin,
  listRecentCheckins,
} from "@/lib/server/db/checkins";
import { getCurrentWork } from "@/lib/server/db/currentWork";
import { getProgressMapForRoadmap } from "@/lib/server/db/progress";
import { getPhaseProgress } from "@/lib/server/roadmap/estimates";
import {
  getDefaultWeekStartDetroit,
  getWeekEndFromStart,
  getWeekStartOffset,
} from "@/lib/weekStart";
import {
  getWeeklyMinutesTrend,
  getPhaseCompletion,
} from "@/lib/server/db/analytics";
import { getEncouragementMessage } from "@/lib/server/analytics/encouragement";
import { GenerateRoadmapButton } from "./generate-roadmap-button";
import { MomentumStrip } from "./momentum-strip";
import { EncouragementCard } from "./encouragement-card";
import { ThisWeekCard } from "./this-week-card";
import { RecentCheckins } from "./recent-checkins";
import { InProgressCard } from "./in-progress-card";
import { MomentumCard } from "./momentum-card";
import { RoadmapProgressCard } from "./roadmap-progress-card";
import { WeeklyTrendChart } from "./weekly-trend-chart";
import { PhaseCompletionChart } from "./phase-completion-chart";
import { Gated } from "@/components/billing/Gated";
import { LockedOverlay } from "@/components/billing/LockedOverlay";
import { ShareProgressButton } from "@/components/share/ShareProgressButton";

export default async function DashboardPage() {
  const { userId } = await requireUserAndProfile();
  const weekStart = getDefaultWeekStartDetroit();
  const weekEnd = getWeekEndFromStart(weekStart);

  const [
    roadmap,
    profileHours,
    timeLogsThisWeek,
    weeklyCheckinThisWeek,
    recentCheckins,
    currentWork,
    weeklyTrend,
    entitlements,
    encouragementMessage,
  ] = await Promise.all([
    getLatestRoadmapForUser(userId),
    getProfileWeeklyHours(userId),
    listTimeLogsForWeek(userId, weekStart, weekEnd),
    getWeeklyCheckin(userId, weekStart),
    listRecentCheckins(userId, 8),
    getCurrentWork(userId),
    getWeeklyMinutesTrend(userId, [
      getWeekStartOffset(weekStart, 3),
      getWeekStartOffset(weekStart, 2),
      getWeekStartOffset(weekStart, 1),
      weekStart,
    ]),
    getEntitlements(userId),
    getEncouragementMessage(userId),
  ]);

  const hasRoadmap = roadmap != null;
  const weeklyHours = profileHours?.weekly_hours ?? 0;
  const completedHours =
    timeLogsThisWeek.reduce((s, l) => s + l.minutes, 0) / 60;
  const today = new Date().toISOString().slice(0, 10);
  const daysLoggedThisWeek = new Set(timeLogsThisWeek.map((l) => l.log_date)).size;

  const progressMap =
    roadmap != null ? await getProgressMapForRoadmap(userId, roadmap.id) : {};
  const phaseProgress =
    currentWork?.phase_title && roadmap != null
      ? getPhaseProgress(roadmap, currentWork.phase_title, progressMap)
      : null;

  const completedSteps = roadmap
    ? Object.values(progressMap).filter((p) => p.is_done).length
    : 0;
  const totalSteps = roadmap?.steps.length ?? 0;
  const phaseCompletion =
    roadmap != null
      ? getPhaseCompletion(
          roadmap.steps.map((s) => ({ id: s.id, phase: s.phase })),
          progressMap
        )
      : [];

  const currentStepTitle =
    roadmap && currentWork?.step_id
      ? roadmap.steps.find((s) => s.id === currentWork.step_id)?.title ?? null
      : null;

  const currentStepPhaseIndex =
    currentWork?.step_id != null
      ? await getPhaseIndexForStep(currentWork.step_id)
      : null;
  const canUseTrackingInProgress =
    currentStepPhaseIndex === 0 || entitlements.canUseTracking;

  const canUseTimeLogs =
    currentStepPhaseIndex === null ||
    currentStepPhaseIndex === 0 ||
    entitlements.canUseTracking;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 w-full min-h-0">
      <PageHeader
        title="Dashboard"
        subtitle="Your progress and next steps."
        action={
          hasRoadmap ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link href="/roadmap">View roadmap</Link>
              </Button>
              <ShareProgressButton
                variant="outline"
                size="sm"
                milestonePercent={
                  totalSteps > 0
                    ? Math.round((completedSteps / totalSteps) * 100)
                    : undefined
                }
              />
            </div>
          ) : (
            <GenerateRoadmapButton />
          )
        }
      />

      <MomentumStrip
        hoursThisWeek={completedHours}
        daysActiveThisWeek={daysLoggedThisWeek}
        stepsCompleted={completedSteps}
      />

      <div className="w-full max-w-md">
        <EncouragementCard message={encouragementMessage} />
      </div>

      {(!entitlements.canViewFullRoadmap || entitlements.canViewFullRoadmap) && hasRoadmap && (
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
          {!entitlements.canViewFullRoadmap ? (
            <p className="text-sm text-muted-foreground">
              Plan preview: Phase 1 visible.{" "}
              <Link href="/settings" className="font-medium text-primary hover:underline">
                Unlock full roadmap
              </Link>
              {" "}in Settings.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground" data-plan-badge>
              You have{" "}
              <span className="font-semibold text-foreground">
                {entitlements.isPro ? "Pro" : "full roadmap"}
              </span>
              {entitlements.isPro
                ? " — tracking, time logs, and insights in all phases."
                : " — all phases and steps are visible."}
            </p>
          )}
        </div>
      )}

      <section className="grid gap-6 sm:grid-cols-2 items-start" aria-label="Weekly and current work">
        <ThisWeekCard
          weekStart={weekStart}
          weeklyHours={weeklyHours}
          completedHours={completedHours}
          timeLogs={timeLogsThisWeek}
          initialNotes={weeklyCheckinThisWeek?.notes ?? ""}
          defaultLogDate={today}
          canUseTracking={canUseTimeLogs}
        />
        <InProgressCard
          currentWork={currentWork}
          currentStepTitle={currentStepTitle}
          hasRoadmap={hasRoadmap}
          weeklyHours={weeklyHours}
          phaseProgress={phaseProgress}
          canUseTracking={canUseTrackingInProgress}
        />
      </section>

      <section className="space-y-4" aria-label="Progress summary">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 items-stretch lg:min-h-[220px]">
        <MomentumCard
          daysLoggedThisWeek={daysLoggedThisWeek}
          className="h-full"
        />
        <RoadmapProgressCard
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          hasRoadmap={hasRoadmap}
          className="h-full"
        />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Insights
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 items-stretch">
        <div className="rounded-xl border border-border/80 bg-card px-6 py-5 shadow-sm ring-1 ring-border/40 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold text-foreground mb-3 shrink-0">Weekly minutes</h3>
          <Gated
            allowed={entitlements.canSeeCharts}
            fallback={
              <div className="relative min-h-[200px]">
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60">
                  <LockedOverlay
                    title="Insights locked"
                    body="Upgrade to Pro to unlock weekly trends and deeper insights."
                    primaryCtaLabel="Upgrade to Pro"
                    primaryHref="/settings"
                  />
                </div>
                <div className="pointer-events-none opacity-40 blur-sm" aria-hidden>
                  <WeeklyTrendChart data={weeklyTrend} />
                </div>
              </div>
            }
          >
            <WeeklyTrendChart data={weeklyTrend} />
            <p className="text-xs text-muted-foreground mt-2">
              Consistency beats intensity.
            </p>
          </Gated>
        </div>
        <div className="rounded-xl border bg-card px-6 py-4 shadow-sm flex flex-col min-h-0">
          <h3 className="text-sm font-medium text-foreground mb-2 shrink-0">Phase completion</h3>
          <Gated
            allowed={entitlements.canSeeCharts}
            fallback={
              <div className="relative min-h-[200px]">
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60">
                  <LockedOverlay
                    title="Progress breakdown locked"
                    body="Upgrade to Pro to unlock phase completion insights."
                    primaryCtaLabel="Upgrade to Pro"
                    primaryHref="/settings"
                  />
                </div>
                <div className="pointer-events-none opacity-40 blur-sm" aria-hidden>
                  {phaseCompletion.length > 0 ? (
                    <PhaseCompletionChart data={phaseCompletion} />
                  ) : (
                    <p className="text-sm text-muted-foreground py-8">No roadmap yet.</p>
                  )}
                </div>
              </div>
            }
          >
            <div className="flex-1 min-h-0">
              {phaseCompletion.length > 0 ? (
                <PhaseCompletionChart data={phaseCompletion} />
              ) : (
                <p className="text-sm text-muted-foreground py-8">No roadmap yet.</p>
              )}
            </div>
          </Gated>
        </div>
        </div>
      </section>

      <RecentCheckins checkins={recentCheckins} />
    </div>
  );
}
