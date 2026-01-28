"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { WeeklyMinutesPoint } from "@/lib/server/db/analytics";

type WeeklyTrendChartProps = {
  data: WeeklyMinutesPoint[];
};

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    hours: Math.round((d.minutes / 60) * 10) / 10,
    label: formatWeekLabel(d.weekStart),
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="hours"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={28}
            tickFormatter={(v) => `${v}h`}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
            }}
            formatter={(value: number | undefined) => [`${value ?? 0}h`, "Logged"]}
            labelFormatter={(_, payload) =>
              payload[0] ? formatWeekLabel(payload[0].payload.weekStart) : ""
            }
          />
          <Bar
            dataKey="hours"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
