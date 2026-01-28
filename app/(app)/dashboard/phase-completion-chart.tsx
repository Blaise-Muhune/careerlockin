"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import type { PhaseCompletionPoint } from "@/lib/server/db/analytics";

type PhaseCompletionChartProps = {
  data: PhaseCompletionPoint[];
};

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function PhaseCompletionChart({ data }: PhaseCompletionChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    pct: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
    name: d.phase.length > 18 ? d.phase.slice(0, 17) + "…" : d.phase,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
            }}
            formatter={(value, _name, item) => {
              const p = (item as { payload?: PhaseCompletionPoint }).payload;
              return p
                ? [`${p.completed} / ${p.total}`, p.phase]
                : [`${value ?? 0}%`, "Progress"];
            }}
          />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} minPointSize={4}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
