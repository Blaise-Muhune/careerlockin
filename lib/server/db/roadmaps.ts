import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapJson } from "@/lib/server/ai/roadmapSchema";

export type RoadmapWithSteps = {
  id: string;
  target_role: string;
  model: string | null;
  created_at: string;
  regeneration_count?: number;
  steps: Array<{
    id: string;
    phase: string;
    title: string;
    description: string;
    est_hours: number | null;
    step_order: number;
    phase_project: unknown | null;
    practices: unknown | null;
    resources: Array<{
      id: string;
      title: string;
      url: string;
      resource_type: string | null;
      is_free: boolean;
      verification_status: string | null;
    }>;
  }>;
};

const ROADMAP_SELECT = "id, target_role, model, created_at, regeneration_count";

/**
 * Returns all roadmaps for the user, newest first.
 */
export async function listRoadmapsForUser(
  userId: string
): Promise<Array<{ id: string; target_role: string; created_at: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roadmaps")
    .select("id, target_role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((r) => ({
    id: r.id,
    target_role: r.target_role,
    created_at: r.created_at,
  }));
}

/**
 * Returns a roadmap by id if it belongs to the user, or null.
 */
export async function getRoadmapById(
  userId: string,
  roadmapId: string
): Promise<RoadmapWithSteps | null> {
  const supabase = await createClient();

  const { data: roadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .select(ROADMAP_SELECT)
    .eq("user_id", userId)
    .eq("id", roadmapId)
    .maybeSingle();

  if (roadmapError || !roadmap) return null;

  const { data: steps, error: stepsError } = await supabase
    .from("roadmap_steps")
    .select("id, phase, title, description, est_hours, step_order, phase_project, practices, created_at")
    .eq("roadmap_id", roadmap.id)
    .order("created_at", { ascending: true })
    .order("step_order", { ascending: true });

  if (stepsError || !steps?.length) {
    return { ...roadmap, steps: [] };
  }

  const { data: resources } = await supabase
    .from("resources")
    .select("id, step_id, title, url, resource_type, is_free, verification_status")
    .in("step_id", steps.map((s) => s.id));

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
        verification_status: (r.verification_status as string | null) ?? null,
      })),
  }));

  return { ...roadmap, steps: stepsWithResources };
}

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
    .select(ROADMAP_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (roadmapError || !roadmap) return null;

  const { data: steps, error: stepsError } = await supabase
    .from("roadmap_steps")
    .select("id, phase, title, description, est_hours, step_order, phase_project, practices, created_at")
    .eq("roadmap_id", roadmap.id)
    .order("created_at", { ascending: true })
    .order("step_order", { ascending: true });

  if (stepsError || !steps?.length) {
    return {
      ...roadmap,
      steps: [],
    };
  }

  const { data: resources } = await supabase
    .from("resources")
    .select("id, step_id, title, url, resource_type, is_free, verification_status")
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
        verification_status: (r.verification_status as string | null) ?? null,
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
    for (let idx = 0; idx < phase.steps.length; idx++) {
      const step = phase.steps[idx]!;
      const { data: stepRow, error: stepError } = await supabase
        .from("roadmap_steps")
        .insert({
          roadmap_id: roadmapId,
          phase: phase.phase_title,
          title: step.title,
          description: step.description,
          est_hours: step.est_hours,
          step_order: step.step_order,
          // Store the phase project only once (on the first step row of the phase)
          phase_project: idx === 0 ? phase.phase_project : null,
          practices: step.practices ?? [],
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
 * Replaces an existing roadmap's steps and resources with new content from JSON.
 * Deletes existing steps (cascade deletes resources and progress), updates target_role,
 * inserts new steps, and increments regeneration_count.
 */
export async function replaceRoadmapFromJson(
  userId: string,
  roadmapId: string,
  parsed: RoadmapJson,
  modelName: string,
  maxRegenerations: number
): Promise<void> {
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("roadmaps")
    .select("id, user_id, regeneration_count")
    .eq("id", roadmapId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Roadmap not found or access denied.");
  }

  const regCount = (existing.regeneration_count as number) ?? 0;
  if (regCount >= maxRegenerations) {
    throw new Error(
      `You have already used your ${maxRegenerations} regeneration${maxRegenerations === 1 ? "" : "s"} for this roadmap.`
    );
  }

  const { error: deleteError } = await supabase
    .from("roadmap_steps")
    .delete()
    .eq("roadmap_id", roadmapId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: updateError } = await supabase
    .from("roadmaps")
    .update({
      target_role: parsed.target_role,
      model: modelName,
      regeneration_count: regCount + 1,
    })
    .eq("id", roadmapId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  for (const phase of parsed.phases) {
    for (let idx = 0; idx < phase.steps.length; idx++) {
      const step = phase.steps[idx]!;
      const { data: stepRow, error: stepError } = await supabase
        .from("roadmap_steps")
        .insert({
          roadmap_id: roadmapId,
          phase: phase.phase_title,
          title: step.title,
          description: step.description,
          est_hours: step.est_hours,
          step_order: step.step_order,
          phase_project: idx === 0 ? phase.phase_project : null,
          practices: step.practices ?? [],
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
}

/**
 * Returns regeneration_count for a roadmap if it belongs to the user.
 */
export async function getRoadmapRegenerationCount(
  userId: string,
  roadmapId: string
): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roadmaps")
    .select("regeneration_count")
    .eq("id", roadmapId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return (data.regeneration_count as number) ?? 0;
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
    .select("roadmap_id, phase, created_at")
    .eq("id", stepId)
    .single();

  if (stepError || !step) return null;

  const { data: steps, error: stepsError } = await supabase
    .from("roadmap_steps")
    .select("phase, created_at")
    .eq("roadmap_id", step.roadmap_id)
    .order("created_at", { ascending: true });

  if (stepsError || !steps?.length) return null;

  const phaseFirstSeen = new Map<string, string>();
  for (const row of steps) {
    const firstSeen = phaseFirstSeen.get(row.phase);
    if (firstSeen === undefined || row.created_at < firstSeen) {
      phaseFirstSeen.set(row.phase, row.created_at);
    }
  }
  const orderedPhases = [...phaseFirstSeen.entries()]
    .sort(([, a], [, b]) => a.localeCompare(b))
    .map(([phase]) => phase);

  const idx = orderedPhases.indexOf(step.phase);
  return idx >= 0 ? idx : null;
}
