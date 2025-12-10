"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/presentation/components/ui/button";
import type { ConsultationsPeriod } from "@/presentation/dashboard/hooks/useDashboardStats";

interface ConsultationsChartProps {
  data: Array<{ label: string; count: number }>;
  period: ConsultationsPeriod;
  onPeriodChange: (period: ConsultationsPeriod) => void;
}

export function ConsultationsChart({
  data,
  period,
  onPeriodChange,
}: ConsultationsChartProps) {
  const periods: Array<{ value: ConsultationsPeriod; label: string }> = [
    { value: "7days", label: "7 dias" },
    { value: "30days", label: "30 dias" },
    { value: "3months", label: "3 meses" },
    { value: "6months", label: "6 meses" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {periods.map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange(p.value)}
            className={
              period === p.value
                ? "bg-primary text-white"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }
          >
            {p.label}
          </Button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="label"
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
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(142, 71%, 45%)"
            strokeWidth={2}
            dot={{ fill: "hsl(142, 71%, 45%)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

