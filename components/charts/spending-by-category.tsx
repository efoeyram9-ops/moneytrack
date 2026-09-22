"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

const COLORS = ["#187657", "#d4931f", "#48b287", "#b37317", "#7ccfab", "#f4db93", "#124a39", "#8f5717"];

export function SpendingByCategoryChart({
  data,
  currencySymbol,
}: {
  data: { name: string; value: number }[];
  currencySymbol: string;
}) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-400">No expenses to show yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value, currencySymbol)} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
