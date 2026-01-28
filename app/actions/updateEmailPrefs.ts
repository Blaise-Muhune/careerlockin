"use server";

import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { updateEmailPrefs as updateEmailPrefsDb } from "@/lib/server/db/profiles";

export type UpdateEmailPrefsState = { ok: true } | { ok: false; error: string };

/**
 * Updates email preferences. Pro only. Expects FormData with keys
 * email_weekly_recap, email_inactivity_nudge, email_milestones.
 * Value "on" (e.g. from checkbox) = true; "off" or missing = false.
 */
export async function updateEmailPrefs(
  formData: FormData
): Promise<UpdateEmailPrefsState> {
  const getBool = (key: string) => formData.getAll(key).includes("on");
  try {
    const { userId } = await requireUserAndProfile();
    const entitlements = await getEntitlements(userId);
    if (!entitlements.isPro) {
      return {
        ok: false,
        error: "Email preferences are available with Pro.",
      };
    }
    await updateEmailPrefsDb(userId, {
      email_weekly_recap: getBool("email_weekly_recap"),
      email_inactivity_nudge: getBool("email_inactivity_nudge"),
      email_milestones: getBool("email_milestones"),
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to update preferences",
    };
  }
}
