import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import {
  getLatestRoadmapForUser,
  getPhaseIndexForStep,
  listRoadmapsForUser,
} from "@/lib/server/db/roadmaps";
import { getProfileWeeklyHours } from "@/lib/server/db/profiles";
import { listTimeLogsForWeek } from "@/lib/server/db/timeLogs";
import { getCurrentWork } from "@/lib/server/db/currentWork";
import { getProgressMapForRoadmap } from "@/lib/server/db/progress";
import { getPhaseProgress } from "@/lib/server/roadmap/estimates";
import {
  countNetworkingActionsForWeek,
  getNetworkingCountsByTypeForDate,
  getProfileNetworkingSettings,
} from "@/lib/server/db/networking";
import { getNetworkingGuidance, getPrimaryDraft } from "@/lib/server/networking/guidance";
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
import { WeekStory } from "./week-story";
import { ThisWeekCard } from "./this-week-card";
import { InProgressCard } from "./in-progress-card";
import { NetworkingThisWeekCard } from "./networking-this-week-card";
import { DashboardInsights } from "./dashboard-insights";
import { ShareProgressButton } from "@/components/share/ShareProgressButton";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DashboardPage() {
  const { userId } = await requireUserAndProfile();
  const weekStart = getDefaultWeekStartDetroit();
  const weekEnd = getWeekEndFromStart(weekStart);

  const today = new Date().toISOString().slice(0, 10);

  const [
    roadmap,
    roadmapsList,
    profileHours,
    networkingSettings,
    networkingCompletedThisWeek,
    networkingTodayByType,
    timeLogsThisWeek,
    currentWork,
    weeklyTrend,
    entitlements,
    encouragementMessage,
  ] = await Promise.all([
    getLatestRoadmapForUser(userId),
    listRoadmapsForUser(userId),
    getProfileWeeklyHours(userId),
    getProfileNetworkingSettings(userId),
    countNetworkingActionsForWeek(userId, weekStart),
    getNetworkingCountsByTypeForDate(userId, today),
    listTimeLogsForWeek(userId, weekStart, weekEnd),
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
  const roadmapPct =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
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
    currentStepPhaseIndex === 0 || entitlements.canTrackAllPhases;

  const canUseTimeLogs =
    currentStepPhaseIndex === null ||
    currentStepPhaseIndex === 0 ||
    entitlements.canUseTracking;

  const networkingGoal = networkingSettings?.networking_weekly_goal ?? 1;
  const networkingGuidance = getNetworkingGuidance({
    profile: networkingSettings,
    targetRole: roadmap?.target_role ?? null,
    currentPhaseIndex: currentStepPhaseIndex ?? 0,
    currentPhaseTitle: currentWork?.phase_title ?? null,
    currentStepTitle,
  });
  const recommendedNetworkingAction =
    networkingGuidance.suggested_actions[0] ?? null;
  const primaryNetworkingDraft = getPrimaryDraft(networkingGuidance);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full min-h-0">
      <PageHeader
        title="Dashboard"
        subtitle="Your week in motion."
        action={
          hasRoadmap ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link href="/roadmap">View roadmap</Link>
              </Button>
              {entitlements.isPro && roadmapsList.length < 5 && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/roadmaps/new">Create another</Link>
                </Button>
              )}
              <ShareProgressButton
                variant="outline"
                size="sm"
                milestonePercent={
                  totalSteps > 0 ? roadmapPct : undefined
                }
              />
            </div>
          ) : undefined
        }
      />

      {!hasRoadmap ? (
        <EmptyState
          title="Create your free Phase 1 roadmap"
          description="We’ll build a personalized plan from your profile. Generation usually takes about a minute."
          action={<GenerateRoadmapButton />}
        />
      ) : (
        <>
          <WeekStory
            hoursThisWeek={completedHours}
            weeklyHours={weeklyHours}
            daysActiveThisWeek={daysLoggedThisWeek}
            stepsCompleted={completedSteps}
            networkingActionsThisWeek={networkingCompletedThisWeek}
            encouragement={encouragementMessage}
            showUnlockCta={!entitlements.canViewFullRoadmap}
          />

          <section
            className="grid gap-6 lg:grid-cols-2 items-start"
            aria-label="This week"
          >
            <ThisWeekCard
              weeklyHours={weeklyHours}
              completedHours={completedHours}
              timeLogs={timeLogsThisWeek}
              defaultLogDate={today}
              canUseTracking={canUseTimeLogs}
            />
            <div className="grid gap-6">
              <InProgressCard
                currentWork={currentWork}
                currentStepTitle={currentStepTitle}
                hasRoadmap={hasRoadmap}
                weeklyHours={weeklyHours}
                phaseProgress={phaseProgress}
                canUseTracking={canUseTrackingInProgress}
              />
              <NetworkingThisWeekCard
                weekStart={weekStart}
                today={today}
                todayCounts={networkingTodayByType}
                goal={networkingGoal}
                completed={networkingCompletedThisWeek}
                weeklyFocusTitle={networkingGuidance.weekly_focus_title}
                weeklyFocusDescription={
                  networkingGuidance.weekly_focus_description
                }
                recommendedAction={recommendedNetworkingAction}
                primaryDraft={primaryNetworkingDraft}
                canUseTracking={canUseTimeLogs}
              />
            </div>
          </section>

          {totalSteps > 0 ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-muted-foreground">Roadmap</span>
              <span className="font-medium tabular-nums text-foreground">
                {completedSteps}/{totalSteps}
              </span>
              <div
                className="h-1.5 w-28 sm:w-40 rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={roadmapPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Roadmap progress"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${roadmapPct}%` }}
                />
              </div>
              <Link
                href="/roadmap"
                className="text-primary hover:underline underline-offset-2"
              >
                Continue
              </Link>
            </div>
          ) : null}

          <DashboardInsights
            canSeeCharts={entitlements.canSeeCharts}
            weeklyTrend={weeklyTrend}
            phaseCompletion={phaseCompletion}
          />
        </>
      )}
    </div>
  );
}
