import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getEnv } from "@/lib/server/env";
import {
  getDefaultWeekStartDetroit,
  getWeekEndFromStart,
  getWeekStartOffset,
} from "@/lib/weekStart";

/** Last 7 days (inclusive) for "last 7 days" metrics. Uses UTC date. */
function sevenDaysAgoUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 6);
  return d.toISOString().slice(0, 10);
}

export type UserStats = {
  totalUsers: number;
  newUsersLast7: number;
  activeUsersLast7: number;
};

export async function getUserStats(): Promise<UserStats> {
  const supabase = createServiceRoleClient();
  const since = sevenDaysAgoUtc();

  const [{ count: totalUsers }, { count: newUsersLast7 }, { data: activeLogs }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${since}T00:00:00Z`),
      supabase
        .from("time_logs")
        .select("user_id")
        .gte("log_date", since),
    ]);

  const activeUserIds = new Set(
    (activeLogs ?? []).map((r) => r.user_id as string)
  );

  return {
    totalUsers: totalUsers ?? 0,
    newUsersLast7: newUsersLast7 ?? 0,
    activeUsersLast7: activeUserIds.size,
  };
}

export type RoadmapStats = {
  totalRoadmaps: number;
  avgRoadmapsPerUser: number;
  pctUnlockedFull: number;
  pctPro: number;
};

export async function getRoadmapStats(): Promise<RoadmapStats> {
  const supabase = createServiceRoleClient();

  const [
    { count: totalRoadmaps },
    { count: totalUsers },
    { data: unlocked },
    { data: pro },
  ] = await Promise.all([
    supabase.from("roadmaps").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("purchases")
      .select("user_id")
      .eq("product_key", "roadmap_unlock")
      .eq("status", "paid"),
    supabase
      .from("subscriptions")
      .select("user_id")
      .in("status", ["active", "trialing"]),
  ]);

  const usersWithUnlock = new Set((unlocked ?? []).map((r) => r.user_id));
  const proUserIds = new Set((pro ?? []).map((r) => r.user_id));
  const u = totalUsers ?? 0;

  return {
    totalRoadmaps: totalRoadmaps ?? 0,
    avgRoadmapsPerUser: u > 0 ? (totalRoadmaps ?? 0) / u : 0,
    pctUnlockedFull: u > 0 ? (usersWithUnlock.size / u) * 100 : 0,
    pctPro: u > 0 ? (proUserIds.size / u) * 100 : 0,
  };
}

export type PhaseCompletionCount = {
  phase: string;
  completed: number;
  total: number;
};

export type EngagementStats = {
  avgHoursPerActiveUserLast7: number;
  avgStepsCompletedPerUser: number;
  phaseCompletion: PhaseCompletionCount[];
};

export async function getEngagementStats(): Promise<EngagementStats> {
  const supabase = createServiceRoleClient();
  const since = sevenDaysAgoUtc();

  const [
    { data: timeLogRows },
    { count: totalUsers },
    { data: progressRows },
    { data: stepsRows },
  ] = await Promise.all([
    supabase
      .from("time_logs")
      .select("user_id, minutes")
      .gte("log_date", since),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("progress").select("step_id, is_done"),
    supabase.from("roadmap_steps").select("id, phase"),
  ]);

  const logs = timeLogRows ?? [];
  const byUser = new Map<string, number>();
  for (const r of logs) {
    const uid = r.user_id as string;
    byUser.set(uid, (byUser.get(uid) ?? 0) + (r.minutes ?? 0));
  }
  const activeCount = byUser.size;
  const totalMinutes = Array.from(byUser.values()).reduce((a, b) => a + b, 0);
  const avgHoursPerActive =
    activeCount > 0 ? totalMinutes / 60 / activeCount : 0;

  const steps = stepsRows ?? [];
  const completedPerStep = new Map<string, number>();
  for (const p of progressRows ?? []) {
    if (p.is_done) {
      const sid = p.step_id as string;
      completedPerStep.set(sid, (completedPerStep.get(sid) ?? 0) + 1);
    }
  }
  const byPhase = new Map<string, { completed: number; total: number }>();
  for (const s of steps) {
    const phase = s.phase as string;
    const cur = byPhase.get(phase) ?? { completed: 0, total: 0 };
    cur.total += 1;
    cur.completed += completedPerStep.get(s.id as string) ?? 0;
    byPhase.set(phase, cur);
  }
  const phaseCompletion: PhaseCompletionCount[] = Array.from(
    byPhase.entries()
  ).map(([phase, { completed, total }]) => ({ phase, completed, total }));

  const totalDone = (progressRows ?? []).filter((p) => p.is_done).length;
  const u = totalUsers ?? 0;

  return {
    avgHoursPerActiveUserLast7: Math.round(avgHoursPerActive * 10) / 10,
    avgStepsCompletedPerUser: u > 0 ? Math.round((totalDone / u) * 10) / 10 : 0,
    phaseCompletion,
  };
}

export type RevenueStats = {
  oneTimePurchasesCount: number;
  activeSubscriptions: number;
  mrrCents: number | null;
  churnCanceledLast30: number;
};

export async function getRevenueStats(): Promise<RevenueStats> {
  const supabase = createServiceRoleClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  const [
    { count: purchasesCount },
    { count: activeSubs },
    { count: churnCount },
  ] = await Promise.all([
    supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "trialing"]),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "canceled")
      .gte("updated_at", since),
  ]);

  const rawCents = getEnv().ADMIN_PRO_MONTHLY_CENTS;
  const cents = rawCents ? Number.parseInt(rawCents, 10) : null;
  const mrrCents =
    cents !== null && !Number.isNaN(cents) && activeSubs != null
      ? cents * activeSubs
      : null;

  return {
    oneTimePurchasesCount: purchasesCount ?? 0,
    activeSubscriptions: activeSubs ?? 0,
    mrrCents,
    churnCanceledLast30: churnCount ?? 0,
  };
}

/** New users per week for the last 4 weeks (Monday–Sunday, America/Detroit). */
export type NewUsersPerWeek = { weekStart: string; count: number };

export async function getNewUsersPerWeek(): Promise<NewUsersPerWeek[]> {
  const supabase = createServiceRoleClient();
  const base = getDefaultWeekStartDetroit();
  const out: NewUsersPerWeek[] = [];
  for (let i = 3; i >= 0; i--) {
    const ws = getWeekStartOffset(base, i);
    const we = getWeekEndFromStart(ws);
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", `${ws}T00:00:00Z`)
      .lte("created_at", `${we}T23:59:59Z`);
    out.push({ weekStart: ws, count: count ?? 0 });
  }
  return out;
}
