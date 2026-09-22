"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SpendingByCategoryChart } from "@/components/charts/spending-by-category";
import { IncomeVsExpenseChart } from "@/components/charts/income-vs-expense";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend";
import { PaymentMethodChart } from "@/components/charts/payment-method-chart";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import type { TransactionWithCategory } from "@/types";
import {
  computeTotals,
  filterByDateRange,
  groupSpendingByCategory,
  groupByPaymentMethod,
  dailySpendingSeries,
  monthlyIncomeExpenseSeries,
} from "@/lib/data/finance";
import { getDateRange, type DateRangeKey, toISODate } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";

const RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "this_week", label: "This week" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "this_year", label: "This year" },
  { key: "custom", label: "Custom range" },
];

export function ReportsClient({
  transactions,
  currencySymbol,
}: {
  transactions: TransactionWithCategory[];
  currencySymbol: string;
}) {
  const [rangeKey, setRangeKey] = useState<DateRangeKey>("this_month");
  const [customFrom, setCustomFrom] = useState(toISODate(new Date()));
  const [customTo, setCustomTo] = useState(toISODate(new Date()));

  const { from, to } = useMemo(
    () => getDateRange(rangeKey, { from: customFrom, to: customTo }),
    [rangeKey, customFrom, customTo]
  );

  const filtered = useMemo(() => filterByDateRange(transactions, from, to), [transactions, from, to]);
  const totals = computeTotals(filtered);
  const savingsAmount = 0; // savings goals are tracked separately from transactions

  const categorySpend = groupSpendingByCategory(filtered);
  const paymentMethodData = groupByPaymentMethod(filtered);
  const dailySpend = dailySpendingSeries(transactions, from, to);
  const monthlySeries = monthlyIncomeExpenseSeries(transactions, 6);

  function exportCSV() {
    const headers = ["Date", "Type", "Category", "Description", "Payment Method", "Amount"];
    const rows = filtered.map((t) => [
      t.transaction_date,
      t.type,
      t.categories?.name ?? "Uncategorized",
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.payment_method,
      t.amount,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `moneytrack-report-${toISODate(from)}-to-${toISODate(to)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Date range"
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value as DateRangeKey)}
            className="w-44"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </Select>
          {rangeKey === "custom" && (
            <>
              <Input label="From" type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <Input label="To" type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </>
          )}
          <Button variant="outline" onClick={exportCSV} className="ml-auto">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total income", value: totals.income },
          { label: "Total expenses", value: totals.expense },
          { label: "Net balance", value: totals.balance },
          { label: "Total savings", value: savingsAmount, hint: "See Savings Goals" },
        ].map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-ink-500 dark:text-ink-400">{item.label}</p>
            <p className="mt-2 font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
              {formatCurrency(item.value, currencySymbol)}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense by category</CardTitle>
          </CardHeader>
          <SpendingByCategoryChart data={categorySpend} currencySymbol={currencySymbol} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income vs expense (6 months)</CardTitle>
          </CardHeader>
          <IncomeVsExpenseChart data={monthlySeries} currencySymbol={currencySymbol} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Daily spending</CardTitle>
          </CardHeader>
          <MonthlyTrendChart data={dailySpend} currencySymbol={currencySymbol} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment method distribution</CardTitle>
          </CardHeader>
          <PaymentMethodChart data={paymentMethodData} currencySymbol={currencySymbol} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed transactions</CardTitle>
        </CardHeader>
        {filtered.length === 0 ? (
          <EmptyState icon={BarChart3} title="No transactions in this range" description="Try a different date range." />
        ) : (
          <TransactionTable transactions={filtered} currencySymbol={currencySymbol} onEdit={() => {}} compact />
        )}
      </Card>
    </div>
  );
}
