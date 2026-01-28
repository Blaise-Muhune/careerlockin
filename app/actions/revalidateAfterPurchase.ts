"use server";

import { revalidatePath } from "next/cache";

/**
 * Call after Stripe checkout success so dashboard/roadmap/settings show updated entitlements.
 * Must not be called during page render — use from a client effect or another server action.
 */
export async function revalidateAfterPurchase(): Promise<void> {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
}
