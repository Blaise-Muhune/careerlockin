"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { listTimeLogsForWeek } from "@/lib/server/db/timeLogs";
import { getWeekEndFromStart } from "@/lib/weekStart";
import { upsertWeeklyCheckin } from "@/lib/server/db/checkins";

const saveWeeklyNotesSchema = z.object({
  week_start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Week start must be YYYY-MM-DD"),
  notes: z.string().max(1000).optional(),
});

export type SaveWeeklyNotesState =
  | { ok: true }
  | { ok: false; error: string };

export async function saveWeeklyNotesAction(
  _prev: SaveWeeklyNotesState | null,
  formData: FormData
): Promise<SaveWeeklyNotesState> {
  const parsed = saveWeeklyNotesSchema.safeParse({
    week_start: formData.get("week_start"),
    notes: formData.get("note") ?? formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0];
    return { ok: false, error: first ?? "Invalid input" };
  }

  try {
    const { userId } = await requireUserAndProfile();
    const weekEnd = getWeekEndFromStart(parsed.data.week_start);
    const logs = await listTimeLogsForWeek(
      userId,
      parsed.data.week_start,
      weekEnd
    );
    const completedHours = Math.round(
      logs.reduce((s, l) => s + l.minutes, 0) / 60 * 100
    ) / 100;
    await upsertWeeklyCheckin(
      userId,
      parsed.data.week_start,
      completedHours,
      parsed.data.notes?.trim() || null
    );
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save notes",
    };
  }
}
