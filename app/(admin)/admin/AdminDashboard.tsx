import {
  getUserStats,
  getRoadmapStats,
  getEngagementStats,
  getRevenueStats,
  getNewUsersPerWeek,
} from "@/lib/server/admin/analytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function MetricCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <Card className="border-muted">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {sub != null && sub !== "" && (
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export async function AdminDashboard() {
  let userStats: Awaited<ReturnType<typeof getUserStats>> | null = null;
  let roadmapStats: Awaited<ReturnType<typeof getRoadmapStats>> | null = null;
  let engagementStats: Awaited<ReturnType<typeof getEngagementStats>> | null =
    null;
  let revenueStats: Awaited<ReturnType<typeof getRevenueStats>> | null = null;
  let newUsersPerWeek: Awaited<ReturnType<typeof getNewUsersPerWeek>> = [];

  try {
    [userStats, roadmapStats, engagementStats, revenueStats, newUsersPerWeek] =
      await Promise.all([
        getUserStats(),
        getRoadmapStats(),
        getEngagementStats(),
        getRevenueStats(),
        getNewUsersPerWeek(),
      ]);
  } catch {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
        Unable to load metrics. Try again later.
      </div>
    );
  }

  const maxNewUsers = Math.max(
    1,
    ...newUsersPerWeek.map((w) => w.count)
  );

  return (
    <div className="space-y-10">
      <Section title="Users">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard title="Total users" value={userStats?.totalUsers ?? 0} />
          <MetricCard
            title="New users (last 7 days)"
            value={userStats?.newUsersLast7 ?? 0}
          />
          <MetricCard
            title="Active users (last 7 days)"
            value={userStats?.activeUsersLast7 ?? 0}
            sub="Logged time in last 7 days"
          />
        </div>
        {newUsersPerWeek.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              New users per week (last 4 weeks)
            </p>
            <div
              className="flex items-end gap-2 h-24"
              role="img"
              aria-label={`Bar chart: new users by week. ${newUsersPerWeek.map((w) => `${w.weekStart}: ${w.count}`).join("; ")}`}
            >
              {newUsersPerWeek.map((w) => (
                <div
                  key={w.weekStart}
                  className="flex-1 flex flex-col justify-end min-w-0 h-24"
                >
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all"
                    style={{
                      height: `${(w.count / maxNewUsers) * 100}%`,
                      minHeight: w.count > 0 ? 4 : 0,
                    }}
                  />
                  <span className="text-xs text-muted-foreground truncate block mt-1 text-center">
                    {w.weekStart.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Roadmap usage">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Roadmaps generated"
            value={roadmapStats?.totalRoadmaps ?? 0}
          />
          <MetricCard
            title="Avg roadmaps per user"
            value={
              roadmapStats
                ? roadmapStats.avgRoadmapsPerUser.toFixed(1)
                : "—"
            }
          />
          <MetricCard
            title="% unlocked full roadmap"
            value={
              roadmapStats
                ? `${roadmapStats.pctUnlockedFull.toFixed(1)}%`
                : "—"
            }
          />
          <MetricCard
            title="% Pro"
            value={
              roadmapStats ? `${roadmapStats.pctPro.toFixed(1)}%` : "—"
            }
          />
        </div>
      </Section>

      <Section title="Engagement">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Avg hours per active user (last 7d)"
            value={engagementStats?.avgHoursPerActiveUserLast7 ?? "—"}
          />
          <MetricCard
            title="Avg steps completed per user"
            value={engagementStats?.avgStepsCompletedPerUser ?? "—"}
          />
        </div>
        {engagementStats?.phaseCompletion &&
          engagementStats.phaseCompletion.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Phase completion (aggregate)
              </p>
              <ul className="space-y-1 text-sm">
                {engagementStats.phaseCompletion.map((p) => (
                  <li
                    key={p.phase}
                    className="flex justify-between gap-2 tabular-nums"
                  >
                    <span className="truncate">{p.phase}</span>
                    <span className="text-muted-foreground shrink-0">
                      {p.completed} / {p.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
      </Section>

      <Section title="Revenue">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="One-time purchases"
            value={revenueStats?.oneTimePurchasesCount ?? 0}
          />
          <MetricCard
            title="Active subscriptions"
            value={revenueStats?.activeSubscriptions ?? 0}
          />
          <MetricCard
            title="MRR"
            value={
              revenueStats?.mrrCents != null
                ? `$${(revenueStats.mrrCents / 100).toFixed(2)}`
                : "—"
            }
            sub={
              revenueStats?.mrrCents == null
                ? "Set ADMIN_PRO_MONTHLY_CENTS for MRR"
                : undefined
            }
          />
          <MetricCard
            title="Churn (last 30d)"
            value={revenueStats?.churnCanceledLast30 ?? 0}
            sub="Subscriptions canceled"
          />
        </div>
      </Section>
    </div>
  );
}
