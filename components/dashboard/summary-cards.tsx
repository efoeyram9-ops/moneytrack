import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export function SummaryCards({
  balance,
  income,
  expenses,
  savings,
  currencySymbol,
}: {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  currencySymbol: string;
}) {
  const items = [
    { label: "Total Balance", value: balance, icon: Wallet, tone: "brand" as const },
    { label: "Total Income", value: income, icon: TrendingUp, tone: "brand" as const },
    { label: "Total Expenses", value: expenses, icon: TrendingDown, tone: "red" as const },
    { label: "Total Savings", value: savings, icon: PiggyBank, tone: "gold" as const },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="flex items-start justify-between">
          <div>
            <p className="text-sm text-ink-500 dark:text-ink-400">{item.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">
              {formatCurrency(item.value, currencySymbol)}
            </p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              item.tone === "brand" && "bg-brand-100 dark:bg-brand-900/30",
              item.tone === "red" && "bg-red-100 dark:bg-red-900/30",
              item.tone === "gold" && "bg-gold-100 dark:bg-gold-900/30"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5",
                item.tone === "brand" && "text-brand-700 dark:text-brand-400",
                item.tone === "red" && "text-red-600 dark:text-red-400",
                item.tone === "gold" && "text-gold-700 dark:text-gold-400"
              )}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
