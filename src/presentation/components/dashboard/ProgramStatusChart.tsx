"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgramStatusChartProps {
  data: Array<{ name: string; value: number }>;
}

export function ProgramStatusChart({ data }: ProgramStatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="name"
          stroke="rgba(255, 255, 255, 0.5)"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="rgba(255, 255, 255, 0.5)"
          style={{ fontSize: "12px" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            color: "#fff",
          }}
          formatter={(value: number) => [Math.round(value), ""]}
        />
        <Bar
          dataKey="value"
          fill="hsl(142, 71%, 45%)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

