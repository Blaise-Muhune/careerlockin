"use server";

import { requireUser } from "@/lib/server/auth";
import { getProgressSnapshot as fetchProgressSnapshot } from "@/lib/server/share/snapshot";

export type ProgressSnapshotData = NonNullable<
  Awaited<ReturnType<typeof fetchProgressSnapshot>>
>;

export type ProgressSnapshotResult =
  | { ok: true; data: ProgressSnapshotData }
  | { ok: false; error: string };

/**
 * Returns the current user's progress snapshot for the share modal.
 * Server-only; used when opening "Share progress".
 */
export async function getProgressSnapshotAction(): Promise<ProgressSnapshotResult> {
  try {
    const user = await requireUser();
    const data = await fetchProgressSnapshot(user.id);
    if (!data) {
      return { ok: false, error: "No roadmap yet. Create one to share progress." };
    }
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not load snapshot.",
    };
  }
}
