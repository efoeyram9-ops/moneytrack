"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils/currency";

export function PaymentMethodChart({
  data,
  currencySymbol,
}: {
  data: { method: string; total: number }[];
  currencySymbol: string;
}) {
  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-400">No data to show yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-ink-100 dark:text-ink-800" />
        <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="method" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
        <Tooltip formatter={(value: number) => formatCurrency(value, currencySymbol)} />
        <Bar dataKey="total" fill="#d4931f" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
