"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import {
  insertNetworkingAction,
  NETWORKING_ACTION_TYPES,
} from "@/lib/server/db/networking";

const logNetworkingActionSchema = z.object({
  action_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  action_type: z.enum(NETWORKING_ACTION_TYPES),
  notes: z.string().max(140).optional(),
});

export type LogNetworkingActionState =
  | { ok: true }
  | { ok: false; error: string };

export async function logNetworkingAction(
  _prev: LogNetworkingActionState | null,
  formData: FormData
): Promise<LogNetworkingActionState> {
  const parsed = logNetworkingActionSchema.safeParse({
    action_date: formData.get("action_date"),
    action_type: formData.get("action_type"),
    notes: formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0];
    return { ok: false, error: first ?? "Invalid input" };
  }

  try {
    const { userId } = await requireUserAndProfile();
    await insertNetworkingAction(userId, {
      action_date: parsed.data.action_date,
      action_type: parsed.data.action_type,
      notes: parsed.data.notes ?? null,
      context_phase_id: null,
    });
    return { ok: true };
  } catch (e) {
    const msg =
      e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
        ? (e as { message: string }).message
        : e instanceof Error
          ? e.message
          : String(e);
    if (
      /schema cache|networking_actions|relation .* does not exist|table .* does not exist/i.test(
        msg
      )
    ) {
      return {
        ok: false,
        error:
          "Networking isn't set up yet. Run the database migration 00012_networking_support.sql in your Supabase project (Dashboard → SQL Editor).",
      };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to log networking action",
    };
  }
}

