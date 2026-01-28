"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getPhaseIndexForStep } from "@/lib/server/db/roadmaps";
import { setStepDone } from "@/lib/server/db/progress";

const toggleStepSchema = z.object({
  step_id: z.string().uuid(),
  is_done: z.boolean(),
});

export type ToggleStepState = { ok: true } | { ok: false; error: string };

export async function toggleStep(formData: FormData): Promise<ToggleStepState> {
  const parsed = toggleStepSchema.safeParse({
    step_id: formData.get("step_id"),
    is_done: formData.get("is_done") === "true",
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }

  try {
    const { userId } = await requireUserAndProfile();
    const [entitlements, phaseIndex] = await Promise.all([
      getEntitlements(userId),
      getPhaseIndexForStep(parsed.data.step_id),
    ]);
    const canTrackThisPhase =
      phaseIndex === 0 || entitlements.isPro;
    if (!canTrackThisPhase) {
      return {
        ok: false,
        error: "Upgrade to Pro to track phases beyond Phase 1.",
      };
    }
    await setStepDone(userId, parsed.data.step_id, parsed.data.is_done);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to update step",
    };
  }
}
