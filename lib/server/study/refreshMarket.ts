import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { optionalStepIds, type MarketStep } from "@/lib/study/marketMatch";
import { applyMarketFlags } from "@/lib/server/db/study";
import { fetchOccupationSignals } from "@/lib/server/study/market";

type StepRow = {
  id: string;
  phase: string;
  title: string;
  description: string;
  step_order: number;
};

function groupPhases(steps: StepRow[], doneIds: Set<string>) {
  const byPhase = new Map<string, { firstSeenIndex: number; steps: MarketStep[] }>();
  steps.forEach((step, index) => {
    const existing = byPhase.get(step.phase);
    const marketStep: MarketStep = {
      id: step.id,
      title: step.title,
      description: step.description,
      done: doneIds.has(step.id),
    };
    if (existing) {
      existing.steps.push(marketStep);
      return;
    }
    byPhase.set(step.phase, { firstSeenIndex: index, steps: [marketStep] });
  });
  return Array.from(byPhase.values())
    .sort((a, b) => a.firstSeenIndex - b.firstSeenIndex)
    .map((group, phaseOrder) => ({ phaseOrder, steps: group.steps }));
}

export async function refreshRoadmapMarket(input: {
  userId: string;
  roadmapId: string;
  targetRole: string;
  useServiceRole?: boolean;
}): Promise<{ ok: true; updated: number; occupationTitle: string | null } | { ok: false; error: string }> {
  const market = await fetchOccupationSignals(input.targetRole);
  if (!market.configured) {
    return {
      ok: false,
      error: "Job data is not configured. Add O*NET or Adzuna keys to refresh role match.",
    };
  }
  if (market.signals.length === 0) {
    return { ok: false, error: "No skills came back for that role." };
  }

  const supabase = input.useServiceRole ? createServiceRoleClient() : await createClient();
  const { data: steps } = await supabase
    .from("roadmap_steps")
    .select("id, phase, title, description, step_order")
    .eq("roadmap_id", input.roadmapId);
  const stepRows = (steps ?? []) as StepRow[];
  const stepIds = stepRows.map((step) => step.id);
  const { data: progress } = stepIds.length
    ? await supabase
        .from("progress")
        .select("step_id, is_done")
        .eq("user_id", input.userId)
        .in("step_id", stepIds)
    : { data: [] };
  const doneIds = new Set(
    (progress ?? [])
      .filter((row) => row.is_done)
      .map((row) => row.step_id as string)
  );
  const flags = optionalStepIds({
    phases: groupPhases(stepRows, doneIds),
    signals: market.signals,
  });
  await applyMarketFlags({
    roadmapId: input.roadmapId,
    userId: input.userId,
    occupationTitle: market.occupationTitle,
    signals: market.signals,
    optionalIds: flags.optionalIds,
    keepIds: flags.keepIds,
    useServiceRole: input.useServiceRole,
  });
  return { ok: true, updated: flags.optionalIds.length, occupationTitle: market.occupationTitle };
}

export async function refreshStaleMarkets(limit = 25): Promise<{
  checked: number;
  updated: number;
  skipped: string | null;
}> {
  const supabase = createServiceRoleClient();
  const { data: roadmaps } = await supabase
    .from("roadmaps")
    .select("id, user_id, target_role")
    .order("updated_at", { ascending: false })
    .limit(100);
  const rows = roadmaps ?? [];
  if (rows.length === 0) return { checked: 0, updated: 0, skipped: null };

  const ids = rows.map((row) => row.id as string);
  const { data: snapshots } = await supabase
    .from("roadmap_market_snapshots")
    .select("roadmap_id, refreshed_at")
    .in("roadmap_id", ids);
  const freshCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const fresh = new Set(
    (snapshots ?? [])
      .filter((row) => new Date(row.refreshed_at as string).getTime() > freshCutoff)
      .map((row) => row.roadmap_id as string)
  );
  const stale = rows.filter((row) => !fresh.has(row.id as string)).slice(0, limit);
  let updated = 0;
  let skipped: string | null = null;
  for (const row of stale) {
    const result = await refreshRoadmapMarket({
      userId: row.user_id as string,
      roadmapId: row.id as string,
      targetRole: row.target_role as string,
      useServiceRole: true,
    });
    if (!result.ok) {
      skipped = result.error;
      break;
    }
    updated += 1;
  }
  return { checked: stale.length, updated, skipped };
}
