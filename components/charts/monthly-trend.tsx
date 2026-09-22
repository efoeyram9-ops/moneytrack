"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

export function MonthlyTrendChart({
  data,
  currencySymbol,
}: {
  data: { period: string; amount: number }[];
  currencySymbol: string;
}) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-400">No spending recorded yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#187657" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#187657" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-ink-100 dark:text-ink-800" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={(value: number) => formatCurrency(value, currencySymbol)} />
        <Area type="monotone" dataKey="amount" stroke="#187657" strokeWidth={2} fill="url(#spendGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
