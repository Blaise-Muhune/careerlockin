"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { updateProfileNetworkingSettings } from "@/lib/server/db/networking";

const updateNetworkingGoalSchema = z.object({
  networking_weekly_goal: z.number().int().min(0).max(14),
});

export type UpdateNetworkingGoalState =
  | { ok: true }
  | { ok: false; error: string };

export async function updateNetworkingGoalAction(
  _prev: UpdateNetworkingGoalState | null,
  formData: FormData
): Promise<UpdateNetworkingGoalState> {
  const raw = formData.get("networking_weekly_goal");
  const parsed = updateNetworkingGoalSchema.safeParse({
    networking_weekly_goal:
      raw !== null && raw !== "" ? Number(raw) : undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0];
    return { ok: false, error: first ?? "Invalid input" };
  }

  try {
    const { userId } = await requireUserAndProfile();
    await updateProfileNetworkingSettings(userId, {
      networking_weekly_goal: parsed.data.networking_weekly_goal,
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to update networking goal",
    };
  }
}

