import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { TransactionWithCategory } from "@/types";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { formatSignedCurrency } from "@/lib/utils/currency";
import { formatDisplayDate } from "@/lib/utils/date";

export function RecentTransactions({
  transactions,
  currencySymbol,
}: {
  transactions: TransactionWithCategory[];
  currencySymbol: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent transactions</CardTitle>
        <Link href="/transactions" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">
          View all
        </Link>
      </CardHeader>
      {transactions.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="No transactions yet" description="Add your first transaction to see it here." />
      ) : (
        <div className="flex flex-col gap-1">
          {transactions.slice(0, 6).map((t) => {
            const Icon = getCategoryIcon(t.categories?.icon);
            return (
              <div key={t.id} className="flex items-center gap-3 rounded-xl px-1 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800">
                  <Icon className="h-4 w-4 text-ink-600 dark:text-ink-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">
                    {t.description || t.categories?.name || "—"}
                  </p>
                  <p className="text-xs text-ink-400">
                    {formatDisplayDate(t.transaction_date)} · {t.payment_method}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    t.type === "income" ? "text-brand-700 dark:text-brand-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatSignedCurrency(t.type === "income" ? t.amount : -t.amount, currencySymbol)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
