"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface SexDistributionChartProps {
  data: Array<{ name: string; value: number }>;
}

const COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(48, 85%, 55%)",
  "hsl(200, 75%, 50%)",
];

export function SexDistributionChart({ data }: SexDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend
          wrapperStyle={{ color: "rgba(255, 255, 255, 0.7)" }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

