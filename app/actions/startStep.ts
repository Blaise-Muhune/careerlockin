"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getPhaseIndexForStep } from "@/lib/server/db/roadmaps";
import { setCurrentWork } from "@/lib/server/db/currentWork";

const startStepSchema = z.object({
  step_id: z.string().uuid(),
  phase_title: z.string().min(1),
  roadmap_id: z.string().uuid(),
});

export type StartStepState = { ok: true } | { ok: false; error: string };

export async function startStepAction(
  _prev: StartStepState | null,
  formData: FormData
): Promise<StartStepState> {
  const raw = {
    step_id: formData.get("step_id"),
    phase_title: formData.get("phase_title"),
    roadmap_id: formData.get("roadmap_id"),
  };

  const parsed = startStepSchema.safeParse({
    step_id: typeof raw.step_id === "string" ? raw.step_id : undefined,
    phase_title: typeof raw.phase_title === "string" ? raw.phase_title : undefined,
    roadmap_id: typeof raw.roadmap_id === "string" ? raw.roadmap_id : undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0];
    return { ok: false, error: first ?? "Invalid input" };
  }

  try {
    const { userId } = await requireUserAndProfile();
    const [entitlements, phaseIndex] = await Promise.all([
      getEntitlements(userId),
      getPhaseIndexForStep(parsed.data.step_id),
    ]);
    const canTrackThisPhase = phaseIndex === 0 || entitlements.isPro;
    if (!canTrackThisPhase) {
      return {
        ok: false,
        error: "Upgrade to Pro to track phases beyond Phase 1.",
      };
    }

    const supabase = await createClient();
    const { data: step } = await supabase
      .from("roadmap_steps")
      .select("id, roadmap_id")
      .eq("id", parsed.data.step_id)
      .single();

    if (!step) {
      return { ok: false, error: "Step not found" };
    }

    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("id", step.roadmap_id)
      .eq("user_id", userId)
      .single();

    if (!roadmap) {
      return { ok: false, error: "Step does not belong to your roadmap" };
    }

    if (step.roadmap_id !== parsed.data.roadmap_id) {
      return { ok: false, error: "Step does not belong to this roadmap" };
    }

    await setCurrentWork(
      userId,
      step.roadmap_id,
      parsed.data.phase_title,
      parsed.data.step_id
    );
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to set current step",
    };
  }
}
