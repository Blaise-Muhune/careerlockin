import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapJson } from "@/lib/server/ai/roadmapSchema";

export type RoadmapWithSteps = {
  id: string;
  target_role: string;
  model: string | null;
  created_at: string;
  steps: Array<{
    id: string;
    phase: string;
    title: string;
    description: string;
    est_hours: number | null;
    step_order: number;
    resources: Array<{
      id: string;
      title: string;
      url: string;
      resource_type: string | null;
      is_free: boolean;
    }>;
  }>;
};

/**
 * Returns the latest roadmap for the user (by updated_at), or null.
 * Steps are ordered by step_order; resources are included per step.
 */
export async function getLatestRoadmapForUser(
  userId: string
): Promise<RoadmapWithSteps | null> {
  const supabase = await createClient();

  const { data: roadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .select("id, target_role, model, created_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (roadmapError || !roadmap) return null;

  const { data: steps, error: stepsError } = await supabase
    .from("roadmap_steps")
    .select("id, phase, title, description, est_hours, step_order")
    .eq("roadmap_id", roadmap.id)
    .order("step_order", { ascending: true });

  if (stepsError || !steps?.length) {
    return {
      ...roadmap,
      steps: [],
    };
  }

  const { data: resources } = await supabase
    .from("resources")
    .select("id, step_id, title, url, resource_type, is_free")
    .in(
      "step_id",
      steps.map((s) => s.id)
    );

  const stepsWithResources = steps.map((step) => ({
    ...step,
    est_hours: step.est_hours != null ? Number(step.est_hours) : null,
    resources: (resources ?? [])
      .filter((r) => r.step_id === step.id)
      .map((r) => ({
        id: r.id,
        title: r.title,
        url: r.url,
        resource_type: r.resource_type,
        is_free: r.is_free ?? true,
      })),
  }));

  return {
    ...roadmap,
    steps: stepsWithResources,
  };
}

/**
 * Inserts roadmap, steps, and resources from validated JSON.
 * Returns the created roadmap id.
 */
export async function createRoadmapFromJson(
  userId: string,
  parsed: RoadmapJson,
  modelName: string
): Promise<string> {
  const supabase = await createClient();

  const { data: roadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .insert({
      user_id: userId,
      target_role: parsed.target_role,
      model: modelName,
    })
    .select("id")
    .single();

  if (roadmapError || !roadmap) {
    const msg = roadmapError?.message ?? "Failed to create roadmap";
    if (/schema cache|could not find the table/i.test(msg)) {
      throw new Error(
        `${msg} Run supabase/migrations/00001_initial_schema.sql and 00002_rls_policies.sql in your Supabase project (Dashboard → SQL Editor).`
      );
    }
    throw new Error(msg);
  }

  const roadmapId = roadmap.id;

  for (const phase of parsed.phases) {
    for (const step of phase.steps) {
      const { data: stepRow, error: stepError } = await supabase
        .from("roadmap_steps")
        .insert({
          roadmap_id: roadmapId,
          phase: phase.phase_title,
          title: step.title,
          description: step.description,
          est_hours: step.est_hours,
          step_order: step.step_order,
        })
        .select("id")
        .single();

      if (stepError || !stepRow) {
        throw new Error(stepError?.message ?? "Failed to create step");
      }

      if (step.resources.length > 0) {
        const rows = step.resources.map((r) => ({
          step_id: stepRow.id,
          title: r.title,
          url: r.url,
          resource_type: r.resource_type,
          is_free: r.is_free,
          source_id: r.source_id || null,
          verification_status: r.verification_status ?? null,
        }));
        const { error: resError } = await supabase.from("resources").insert(rows);
        if (resError) {
          throw new Error(resError.message);
        }
      }
    }
  }

  return roadmapId;
}

/**
 * Returns the 0-based phase index for a step (Phase 1 = 0).
 * Used to enforce "tracking allowed only for Phase 1" for non-Pro users.
 */
export async function getPhaseIndexForStep(
  stepId: string
): Promise<number | null> {
  const supabase = await createClient();

  const { data: step, error: stepError } = await supabase
    .from("roadmap_steps")
    .select("roadmap_id, phase, step_order")
    .eq("id", stepId)
    .single();

  if (stepError || !step) return null;

  const { data: steps, error: stepsError } = await supabase
    .from("roadmap_steps")
    .select("phase, step_order")
    .eq("roadmap_id", step.roadmap_id);

  if (stepsError || !steps?.length) return null;

  const phaseMinOrder = new Map<string, number>();
  for (const row of steps) {
    const min = phaseMinOrder.get(row.phase);
    if (min === undefined || row.step_order < min) {
      phaseMinOrder.set(row.phase, row.step_order);
    }
  }
  const orderedPhases = [...phaseMinOrder.entries()]
    .sort(([, a], [, b]) => a - b)
    .map(([phase]) => phase);

  const idx = orderedPhases.indexOf(step.phase);
  return idx >= 0 ? idx : null;
}
