"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getCurrentWork, setCurrentWorkStatus } from "@/lib/server/db/currentWork";
import type { CurrentWorkStatus } from "@/lib/server/db/currentWork";
import { getPhaseIndexForStep } from "@/lib/server/db/roadmaps";

const setWorkStatusSchema = z.object({
  status: z.enum(["in_progress", "paused", "completed"]),
});

export type SetWorkStatusState = { ok: true } | { ok: false; error: string };

export async function setWorkStatusAction(
  _prev: SetWorkStatusState | null,
  formData: FormData
): Promise<SetWorkStatusState> {
  const raw = formData.get("status");
  const parsed = setWorkStatusSchema.safeParse({
    status: typeof raw === "string" ? raw : undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0];
    return { ok: false, error: first ?? "Invalid input" };
  }

  try {
    const { userId } = await requireUserAndProfile();
    const [entitlements, currentWork] = await Promise.all([
      getEntitlements(userId),
      getCurrentWork(userId),
    ]);
    const stepId = currentWork?.step_id ?? null;
    const phaseIndex =
      stepId != null ? await getPhaseIndexForStep(stepId) : null;
    const canTrackThisPhase =
      phaseIndex === 0 || entitlements.isPro;
    if (stepId != null && phaseIndex != null && !canTrackThisPhase) {
      return {
        ok: false,
        error: "Upgrade to Pro to track phases beyond Phase 1.",
      };
    }
    await setCurrentWorkStatus(userId, parsed.data.status as CurrentWorkStatus);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to update status",
    };
  }
}
