"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

export function IncomeVsExpenseChart({
  data,
  currencySymbol,
}: {
  data: { period: string; income: number; expense: number }[];
  currencySymbol: string;
}) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-400">No data to show yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-ink-100 dark:text-ink-800" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={(value: number) => formatCurrency(value, currencySymbol)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Income" fill="#187657" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#d4931f" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
