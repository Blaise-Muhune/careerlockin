/**
 * Pure entitlement computation (no I/O). Used by getEntitlements and unit tests.
 */
export type Entitlements = {
  hasRoadmapUnlock: boolean;
  isPro: boolean;
  canViewFullRoadmap: boolean;
  /** Complete / start steps in all phases (Unlock or Pro). Free = Phase 1 only. */
  canTrackAllPhases: boolean;
  /** Time logs + deep tracking beyond Phase 1 (Pro only). */
  canUseTracking: boolean;
  canSeeCharts: boolean;
  canGenerateExtraRoadmaps: boolean;
};

export function computeEntitlements(input: {
  hasPaidUnlock: boolean;
  hasActiveOrTrialingSub: boolean;
}): Entitlements {
  const hasRoadmapUnlock = input.hasPaidUnlock;
  const isPro = input.hasActiveOrTrialingSub;
  return {
    hasRoadmapUnlock,
    isPro,
    canViewFullRoadmap: hasRoadmapUnlock || isPro,
    canTrackAllPhases: hasRoadmapUnlock || isPro,
    canUseTracking: isPro,
    canSeeCharts: isPro,
    canGenerateExtraRoadmaps: isPro,
  };
}

/** Max roadmap regenerations for Free / Unlock. */
export const FREE_OR_UNLOCK_REGEN_LIMIT = 1;
/** Max roadmap regenerations for Pro. */
export const PRO_REGEN_LIMIT = 3;

export function getRegenLimitForPlan(isPro: boolean): number {
  return isPro ? PRO_REGEN_LIMIT : FREE_OR_UNLOCK_REGEN_LIMIT;
}
