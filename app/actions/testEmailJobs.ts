"use server";

import { requireAdmin } from "@/lib/server/admin/requireAdmin";
import { runWeeklyRecapJob } from "@/lib/server/jobs/weeklyRecap";
import { runInactivityCheckJob } from "@/lib/server/jobs/inactivityCheck";
import { runMilestoneCheckJob } from "@/lib/server/jobs/milestoneCheck";

export type EmailJobResult = {
  ok: true;
  sent: number;
  errors: string[];
} | {
  ok: false;
  error: string;
};

/**
 * Runs the weekly recap job. Admin only. Use for testing email reminders.
 */
export async function testWeeklyRecapAction(): Promise<EmailJobResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
  try {
    const result = await runWeeklyRecapJob();
    return { ok: true, sent: result.sent, errors: result.errors };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Job failed";
    return { ok: false, error: msg };
  }
}

/**
 * Runs the inactivity nudge job. Admin only. Use for testing email reminders.
 */
export async function testInactivityAction(): Promise<EmailJobResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
  try {
    const result = await runInactivityCheckJob();
    return { ok: true, sent: result.sent, errors: result.errors };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Job failed";
    return { ok: false, error: msg };
  }
}

/**
 * Runs the milestone (phase completed) job. Admin only. Use for testing email reminders.
 */
export async function testMilestonesAction(): Promise<EmailJobResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
  try {
    const result = await runMilestoneCheckJob();
    return { ok: true, sent: result.sent, errors: result.errors };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Job failed";
    return { ok: false, error: msg };
  }
}
