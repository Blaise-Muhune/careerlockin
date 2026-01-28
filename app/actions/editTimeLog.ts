"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getCurrentWork } from "@/lib/server/db/currentWork";
import { getPhaseIndexForStep } from "@/lib/server/db/roadmaps";
import { updateTimeLog } from "@/lib/server/db/timeLogs";

const editTimeLogSchema = z.object({
  id: z.string().uuid(),
  minutes: z.number().int().min(1).max(1440),
  note: z.string().max(500).optional(),
});

export type EditTimeLogState = { ok: true } | { ok: false; error: string };

export async function editTimeLogAction(
  _prev: EditTimeLogState | null,
  formData: FormData
): Promise<EditTimeLogState> {
  const raw = {
    id: formData.get("id"),
    minutes: formData.get("minutes"),
    note: formData.get("note") ?? undefined,
  };

  const parsed = editTimeLogSchema.safeParse({
    ...raw,
    minutes:
      raw.minutes !== null && raw.minutes !== ""
        ? Number(raw.minutes)
        : undefined,
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
        error: "Upgrade to Pro to edit time logs in phases beyond Phase 1.",
      };
    }
    await updateTimeLog(
      userId,
      parsed.data.id,
      parsed.data.minutes,
      parsed.data.note ?? null
    );
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to update time log",
    };
  }
}
