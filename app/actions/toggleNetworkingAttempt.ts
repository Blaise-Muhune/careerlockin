"use server";

import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import {
  deleteLatestNetworkingActionForDayAndType,
  insertNetworkingAction,
  NETWORKING_ACTION_TYPES,
} from "@/lib/server/db/networking";

const schema = z.object({
  action_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  action_type: z.enum(NETWORKING_ACTION_TYPES),
  checked: z.enum(["true", "false"]),
});

export type ToggleNetworkingAttemptState =
  | { ok: true }
  | { ok: false; error: string };

export async function toggleNetworkingAttemptAction(
  _prev: ToggleNetworkingAttemptState | null,
  formData: FormData
): Promise<ToggleNetworkingAttemptState> {
  const parsed = schema.safeParse({
    action_date: formData.get("action_date"),
    action_type: formData.get("action_type"),
    checked: formData.get("checked"),
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0];
    return { ok: false, error: first ?? "Invalid input" };
  }

  const { userId } = await requireUserAndProfile();
  const { action_date, action_type, checked } = parsed.data;

  try {
    if (checked === "true") {
      await insertNetworkingAction(userId, {
        action_date,
        action_type,
        notes: null,
        context_phase_id: null,
      });
    } else {
      await deleteLatestNetworkingActionForDayAndType(
        userId,
        action_date,
        action_type
      );
    }
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
      error: e instanceof Error ? e.message : "Failed to update networking",
    };
  }
}
