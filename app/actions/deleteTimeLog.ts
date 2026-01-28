"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getCurrentWork } from "@/lib/server/db/currentWork";
import { getPhaseIndexForStep } from "@/lib/server/db/roadmaps";
import { deleteTimeLog } from "@/lib/server/db/timeLogs";

const deleteTimeLogSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteTimeLogState = { ok: true } | { ok: false; error: string };

export async function deleteTimeLogAction(
  _prev: DeleteTimeLogState | null,
  formData: FormData
): Promise<DeleteTimeLogState> {
  const parsed = deleteTimeLogSchema.safeParse({
    id: formData.get("id"),
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
    const canLogTime =
      phaseIndex === null || phaseIndex === 0 || entitlements.canUseTracking;
    if (!canLogTime) {
      return {
        ok: false,
        error: "Upgrade to Pro to manage time logs in phases beyond Phase 1.",
      };
    }
    await deleteTimeLog(userId, parsed.data.id);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete time log",
    };
  }
}
