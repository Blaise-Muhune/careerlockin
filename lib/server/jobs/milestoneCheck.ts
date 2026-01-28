import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/server/email/sendEmail";
import { buildMilestoneBody } from "@/lib/server/email/templates/milestone";
import { getBaseUrl } from "@/lib/server/env";

const SUBJECT = "Phase completed";

type CompletedPhase = { userId: string; roadmapId: string; phase: string };

/**
 * Finds phases that are 100% complete and for which we haven't sent a milestone email yet.
 * Uses service role to read progress, roadmap_steps, profiles, and email_milestone_sent.
 */
async function findCompletedPhasesNotYetSent(
  supabase: ReturnType<typeof createServiceRoleClient>
): Promise<CompletedPhase[]> {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email_milestones", true);
  if (!profiles?.length) return [];

  const out: CompletedPhase[] = [];

  for (const row of profiles) {
    const userId = row.user_id as string;
    const { data: roadmaps } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("user_id", userId);
    if (!roadmaps?.length) continue;

    for (const r of roadmaps) {
      const roadmapId = r.id;
      const { data: steps } = await supabase
        .from("roadmap_steps")
        .select("id, phase")
        .eq("roadmap_id", roadmapId);
      if (!steps?.length) continue;

      const { data: progressRows } = await supabase
        .from("progress")
        .select("step_id, is_done")
        .eq("user_id", userId)
        .in("step_id", steps.map((s) => s.id));

      const done = new Set(
        (progressRows ?? []).filter((p) => p.is_done).map((p) => p.step_id)
      );

      const byPhase = new Map<string, { total: number; completed: number }>();
      for (const s of steps) {
        const cur = byPhase.get(s.phase) ?? { total: 0, completed: 0 };
        cur.total += 1;
        if (done.has(s.id)) cur.completed += 1;
        byPhase.set(s.phase, cur);
      }

      const { data: sent } = await supabase
        .from("email_milestone_sent")
        .select("phase")
        .eq("user_id", userId)
        .eq("roadmap_id", roadmapId);
      const sentPhases = new Set((sent ?? []).map((r) => r.phase));

      for (const [phase, { total, completed }] of byPhase.entries()) {
        if (total > 0 && completed === total && !sentPhases.has(phase)) {
          out.push({ userId, roadmapId, phase });
        }
      }
    }
  }

  return out;
}

/**
 * Runs the milestone job: finds (user, roadmap, phase) where the phase is complete
 * and we haven't sent yet, sends "Phase completed" email, then inserts into email_milestone_sent.
 */
export async function runMilestoneCheckJob(): Promise<{
  sent: number;
  errors: string[];
}> {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard`;

  const supabase = createServiceRoleClient();
  const items = await findCompletedPhasesNotYetSent(supabase);

  const errors: string[] = [];
  let sent = 0;

  for (const { userId, roadmapId, phase } of items) {
    let email: string;
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.admin.getUserById(userId);
      if (userError || !user?.email) {
        errors.push(`user ${userId}: no email`);
        continue;
      }
      email = user.email;
    } catch (e) {
      errors.push(`user ${userId}: ${e instanceof Error ? e.message : "fetch failed"}`);
      continue;
    }

    try {
      const body = buildMilestoneBody(phase, dashboardUrl);
      const result = await sendEmail(email, SUBJECT, body);
      if (result.ok) {
        sent += 1;
        await supabase.from("email_milestone_sent").insert({
          user_id: userId,
          roadmap_id: roadmapId,
          phase,
        });
      } else {
        errors.push(`user ${userId} phase ${phase}: ${result.error}`);
      }
    } catch (e) {
      errors.push(`user ${userId}: ${e instanceof Error ? e.message : "send failed"}`);
    }
  }

  return { sent, errors };
}
