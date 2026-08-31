import { describe, expect, it } from "vitest";
import {
  calculatePhaseEstimates,
  calculateRoadmapTotal,
  getPhaseProgress,
} from "@/lib/server/roadmap/estimates";
import type { RoadmapWithSteps } from "@/lib/server/db/roadmaps";

const sample: RoadmapWithSteps = {
  id: "r1",
  target_role: "Frontend Engineer",
  model: "test",
  created_at: "2026-01-01",
  steps: [
    {
      id: "s1",
      phase: "Foundations",
      title: "HTML",
      description: "Learn HTML",
      est_hours: 10,
      step_order: 1,
      phase_project: {
        title: "Landing page",
        estimated_time_hours: 8,
      },
      practices: null,
      resources: [],
    },
    {
      id: "s2",
      phase: "Foundations",
      title: "CSS",
      description: "Learn CSS",
      est_hours: 10,
      step_order: 2,
      phase_project: null,
      practices: null,
      resources: [],
    },
  ],
};

describe("roadmap estimates include phase projects", () => {
  it("sums step + project hours per phase", () => {
    const phases = calculatePhaseEstimates(sample, 10);
    expect(phases).toHaveLength(1);
    expect(phases[0]!.hours).toBe(28);
    expect(phases[0]!.weeks).toBe(2.8);
  });

  it("totals include project hours once", () => {
    const total = calculateRoadmapTotal(sample, 10);
    expect(total.totalHours).toBe(28);
    expect(total.totalWeeks).toBe(2.8);
  });

  it("counts project hours when all steps done", () => {
    const progress = getPhaseProgress(sample, "Foundations", {
      s1: { is_done: true },
      s2: { is_done: true },
    });
    expect(progress.phaseHours).toBe(28);
    expect(progress.phaseCompletedHours).toBe(28);
  });
});
