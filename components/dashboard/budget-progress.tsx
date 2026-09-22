import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/utils/currency";
import type { BudgetStatus } from "@/types";

interface BudgetItem {
  id: string;
  amount: number;
  spent: number;
  percent: number;
  status: BudgetStatus;
  categories: { name: string } | null;
}

export function BudgetProgress({ budgets, currencySymbol }: { budgets: BudgetItem[]; currencySymbol: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget progress</CardTitle>
        <Link href="/budgets" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">
          Manage
        </Link>
      </CardHeader>
      {budgets.length === 0 ? (
        <EmptyState icon={PiggyBank} title="No budgets created yet" description="Set a monthly budget to track your spending." />
      ) : (
        <div className="flex flex-col gap-4">
          {budgets.slice(0, 5).map((b) => (
            <div key={b.id}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-ink-800 dark:text-ink-100">{b.categories?.name ?? "Category"}</span>
                <span className="text-ink-400">
                  {formatCurrency(b.spent, currencySymbol)} / {formatCurrency(b.amount, currencySymbol)}
                </span>
              </div>
              <ProgressBar
                value={b.percent}
                tone={b.status === "exceeded" ? "red" : b.status === "near_limit" ? "gold" : "brand"}
                className="mt-1.5"
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
