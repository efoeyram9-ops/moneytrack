"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, PiggyBank } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { BudgetForm } from "./budget-form";
import { BudgetCard } from "./budget-card";
import { MONTH_NAMES } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";
import type { Category, BudgetStatus } from "@/types";

interface BudgetItem {
  id: string;
  amount: number;
  spent: number;
  remaining: number;
  percent: number;
  status: BudgetStatus;
  categories: { name: string; icon: string } | null;
}

export function BudgetsClient({
  budgets,
  categories,
  month,
  year,
  currencySymbol,
}: {
  budgets: BudgetItem[];
  categories: Category[];
  month: number;
  year: number;
  currencySymbol: string;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);

  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const availableCategories = categories.filter((c) => c.type === "expense");

  function changePeriod(newMonth: number, newYear: number) {
    const params = new URLSearchParams({ month: String(newMonth), year: String(newYear) });
    router.push(`/budgets?${params.toString()}`);
  }

  const years = [year - 1, year, year + 1];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Select value={month} onChange={(e) => changePeriod(Number(e.target.value), year)} className="w-40">
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </Select>
          <Select value={year} onChange={(e) => changePeriod(month, Number(e.target.value))} className="w-28">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Create budget
        </Button>
      </div>

      {budgets.length > 0 && (
        <Card className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-ink-500 dark:text-ink-400">Total budgeted</p>
            <p className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
              {formatCurrency(totalBudgeted, currencySymbol)}
            </p>
          </div>
          <div>
            <p className="text-sm text-ink-500 dark:text-ink-400">Total spent</p>
            <p className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
              {formatCurrency(totalSpent, currencySymbol)}
            </p>
          </div>
          <div>
            <p className="text-sm text-ink-500 dark:text-ink-400">Remaining</p>
            <p
              className={`font-display text-xl font-semibold ${
                totalBudgeted - totalSpent < 0 ? "text-red-600 dark:text-red-400" : "text-brand-700 dark:text-brand-400"
              }`}
            >
              {formatCurrency(totalBudgeted - totalSpent, currencySymbol)}
            </p>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Budgets for {MONTH_NAMES[month - 1]} {year}
          </CardTitle>
        </CardHeader>
        {budgets.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No budgets created yet"
            description="Create a monthly budget for a category to track your spending against it."
            actionLabel="Create budget"
            onAction={() => setFormOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => (
              <BudgetCard key={b.id} budget={b} currencySymbol={currencySymbol} />
            ))}
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Create budget">
        <BudgetForm
          categories={availableCategories}
          defaultMonth={month}
          defaultYear={year}
          onSuccess={() => {
            setFormOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </div>
  );
}
