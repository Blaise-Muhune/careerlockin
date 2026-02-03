import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireUserAndProfile } from "@/lib/server/auth";
import {
  getLatestRoadmapForUser,
  getRoadmapById,
  listRoadmapsForUser,
  type RoadmapWithSteps,
} from "@/lib/server/db/roadmaps";
import { getProfileWeeklyHours, getProfileForRoadmapEdit } from "@/lib/server/db/profiles";
import { getProgressMapForRoadmap } from "@/lib/server/db/progress";
import { getCurrentWork } from "@/lib/server/db/currentWork";
import {
  calculatePhaseEstimates,
  calculateRoadmapTotal,
} from "@/lib/server/roadmap/estimates";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { ShareProgressButton } from "@/components/share/ShareProgressButton";
import { RoadmapContent } from "./roadmap-content";
import { RoadmapSwitcher } from "./roadmap-switcher";
import { RegenerateRoadmapCard } from "./regenerate-roadmap-card";
import { getProfileNetworkingSettings } from "@/lib/server/db/networking";
import { getNetworkingGuidance } from "@/lib/server/networking/guidance";

function formatWeeks(w: number): string {
  if (w < 0.1 && w > 0) return "< 0.1 weeks";
  if (w < 1) return `${Math.round(w * 10) / 10} weeks`;
  return `${Math.round(w * 10) / 10} weeks`;
}

function groupStepsByPhase(
  steps: RoadmapWithSteps["steps"]
): Array<{ phase: string; phaseOrder: number; steps: RoadmapWithSteps["steps"] }> {
  const byPhase = new Map<string, RoadmapWithSteps["steps"]>();
  for (const step of steps) {
    const list = byPhase.get(step.phase) ?? [];
    list.push(step);
    byPhase.set(step.phase, list);
  }
  return Array.from(byPhase.entries())
    .map(([phase, s]) => ({
      phase,
      phaseOrder: Math.min(...s.map((st) => st.step_order)),
      steps: s.sort((a, b) => a.step_order - b.step_order),
    }))
    .sort((a, b) => a.phaseOrder - b.phaseOrder);
}

const PRO_ROADMAP_LIMIT = 5;

type RoadmapPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function RoadmapPage({ searchParams }: RoadmapPageProps) {
  const { userId } = await requireUserAndProfile();
  const params = await searchParams;
  const roadmapIdParam = params.id;

  const [roadmapsList, latestRoadmap] = await Promise.all([
    listRoadmapsForUser(userId),
    getLatestRoadmapForUser(userId),
  ]);

  const roadmap: RoadmapWithSteps | null =
    roadmapIdParam && roadmapsList.some((r) => r.id === roadmapIdParam)
      ? await getRoadmapById(userId, roadmapIdParam)
      : latestRoadmap;

  if (!roadmap) {
    return (
      <div className="flex flex-col gap-10">
        <PageHeader
          title="Roadmap"
          subtitle="You don't have a roadmap yet. Create one from the dashboard."
          action={
            <Button asChild variant="secondary">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const [progressMap, currentWork, profileHours, profileForEdit, entitlements] = await Promise.all([
    getProgressMapForRoadmap(userId, roadmap.id),
    getCurrentWork(userId),
    getProfileWeeklyHours(userId),
    getProfileForRoadmapEdit(userId),
    getEntitlements(userId),
  ]);
  const weeklyHours = profileHours?.weekly_hours ?? 0;
  const phaseEstimates = calculatePhaseEstimates(roadmap, weeklyHours);
  const phaseMap = Object.fromEntries(
    phaseEstimates.map((e) => [e.phase, { hours: e.hours, weeks: e.weeks }])
  ) as Record<string, { hours: number; weeks: number }>;
  const { totalHours, totalWeeks } = calculateRoadmapTotal(roadmap, weeklyHours);
  const phases = groupStepsByPhase(roadmap.steps);
  const totalSteps = roadmap.steps.length;
  const completedSteps = Object.values(progressMap).filter((p) => p.is_done).length;
  const roadmapPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const subtitle =
    weeklyHours > 0 && totalHours > 0
      ? `${roadmap.target_role} · ${formatWeeks(totalWeeks)} total (${weeklyHours}h/week)`
      : roadmap.target_role;

  const networkingSettings = await getProfileNetworkingSettings(userId);
  const networkingByPhaseIndex = phases.map((p, idx) => {
    const g = getNetworkingGuidance({
      profile: networkingSettings,
      targetRole: roadmap.target_role,
      currentPhaseIndex: idx,
      currentPhaseTitle: p.phase,
      currentStepTitle: p.steps[0]?.title ?? null,
    });
    return {
      focus_sentence: g.weekly_focus_description,
      message_outlines: entitlements.isPro ? g.message_outlines : g.message_outlines.slice(0, 1),
    };
  });

  const canCreateMore = entitlements.isPro && roadmapsList.length < PRO_ROADMAP_LIMIT;
  const hasMultipleRoadmaps = roadmapsList.length > 1;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Roadmap"
        subtitle={subtitle}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {hasMultipleRoadmaps && (
              <Suspense fallback={null}>
                <RoadmapSwitcher
                  roadmaps={roadmapsList}
                  currentId={roadmap.id}
                />
              </Suspense>
            )}
            {canCreateMore && (
              <Button asChild variant="outline" size="sm">
                <Link href="/roadmaps/new">Create new</Link>
              </Button>
            )}
            <ShareProgressButton
              variant="outline"
              size="sm"
              milestonePercent={roadmapPercent}
            />
          </div>
        }
      />
      {entitlements.canViewFullRoadmap && (
        <RegenerateRoadmapCard
          roadmapId={roadmap.id}
          targetRole={roadmap.target_role}
          profile={profileForEdit}
          regenerationCount={roadmap.regeneration_count ?? 0}
        />
      )}
      <RoadmapContent
        roadmapId={roadmap.id}
        phases={phases}
        progressMap={progressMap}
        currentWork={currentWork}
        phaseMap={phaseMap}
        weeklyHours={weeklyHours}
        canViewFullRoadmap={entitlements.canViewFullRoadmap}
        canUseTracking={entitlements.canUseTracking}
        hasRoadmapUnlock={entitlements.hasRoadmapUnlock}
        isPro={entitlements.isPro}
        networkingByPhaseIndex={networkingByPhaseIndex}
      />
    </div>
  );
}
