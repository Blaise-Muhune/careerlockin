"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getCurrentWork } from "@/lib/server/db/currentWork";
import { getPhaseIndexForStep } from "@/lib/server/db/roadmaps";
import { addTimeLog } from "@/lib/server/db/timeLogs";

const addTimeLogSchema = z.object({
  log_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  minutes: z.number().int().min(1).max(1440),
  note: z.string().max(500).optional(),
});

export type AddTimeLogState = { ok: true } | { ok: false; error: string };

export async function addTimeLogAction(
  _prev: AddTimeLogState | null,
  formData: FormData
): Promise<AddTimeLogState> {
  const logDate = formData.get("log_date");
  const minutesRaw = formData.get("minutes");
  const note = formData.get("note");

  const parsed = addTimeLogSchema.safeParse({
    log_date: typeof logDate === "string" ? logDate : undefined,
    minutes:
      minutesRaw !== null && minutesRaw !== ""
        ? Number(minutesRaw)
        : undefined,
    note: typeof note === "string" ? note : undefined,
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
        error: "Upgrade to Pro to log time in phases beyond Phase 1.",
      };
    }
    await addTimeLog(
      userId,
      parsed.data.log_date,
      parsed.data.minutes,
      parsed.data.note ?? null
    );
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to add time log",
    };
  }
}
