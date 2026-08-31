import { describe, expect, it } from "vitest";
import {
  computeEntitlements,
  getRegenLimitForPlan,
} from "@/lib/server/billing/computeEntitlements";

describe("computeEntitlements", () => {
  it("free user: phase-1 only, no tracking/charts/extra roadmaps", () => {
    const e = computeEntitlements({
      hasPaidUnlock: false,
      hasActiveOrTrialingSub: false,
    });
    expect(e).toEqual({
      hasRoadmapUnlock: false,
      isPro: false,
      canViewFullRoadmap: false,
      canTrackAllPhases: false,
      canUseTracking: false,
      canSeeCharts: false,
      canGenerateExtraRoadmaps: false,
    });
  });

  it("unlock only: full roadmap + step tracking, no time logs/charts", () => {
    const e = computeEntitlements({
      hasPaidUnlock: true,
      hasActiveOrTrialingSub: false,
    });
    expect(e.canViewFullRoadmap).toBe(true);
    expect(e.hasRoadmapUnlock).toBe(true);
    expect(e.isPro).toBe(false);
    expect(e.canTrackAllPhases).toBe(true);
    expect(e.canUseTracking).toBe(false);
    expect(e.canSeeCharts).toBe(false);
    expect(e.canGenerateExtraRoadmaps).toBe(false);
  });

  it("pro: full access including tracking and extra roadmaps", () => {
    const e = computeEntitlements({
      hasPaidUnlock: false,
      hasActiveOrTrialingSub: true,
    });
    expect(e.isPro).toBe(true);
    expect(e.canViewFullRoadmap).toBe(true);
    expect(e.canTrackAllPhases).toBe(true);
    expect(e.canUseTracking).toBe(true);
    expect(e.canSeeCharts).toBe(true);
    expect(e.canGenerateExtraRoadmaps).toBe(true);
  });

  it("pro + unlock: all flags true", () => {
    const e = computeEntitlements({
      hasPaidUnlock: true,
      hasActiveOrTrialingSub: true,
    });
    expect(e.hasRoadmapUnlock).toBe(true);
    expect(e.isPro).toBe(true);
    expect(e.canTrackAllPhases).toBe(true);
    expect(e.canUseTracking).toBe(true);
  });
});

describe("getRegenLimitForPlan", () => {
  it("free/unlock get 1, pro gets 3", () => {
    expect(getRegenLimitForPlan(false)).toBe(1);
    expect(getRegenLimitForPlan(true)).toBe(3);
  });
});
