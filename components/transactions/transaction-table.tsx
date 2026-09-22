"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { TransactionWithCategory } from "@/types";
import { formatSignedCurrency } from "@/lib/utils/currency";
import { formatDisplayDate } from "@/lib/utils/date";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { ConfirmDialog } from "@/components/ui/modal";
import { deleteTransaction } from "@/lib/actions/transactions";
import { useToast } from "@/components/providers/toast-provider";

export function TransactionTable({
  transactions,
  currencySymbol,
  onEdit,
  compact,
}: {
  transactions: TransactionWithCategory[];
  currencySymbol: string;
  onEdit: (t: TransactionWithCategory) => void;
  compact?: boolean;
}) {
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<TransactionWithCategory | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteTransaction(deleteTarget.id);
      if (!result.success) {
        showToast(result.error ?? "Could not delete transaction.", "error");
      } else {
        showToast("Transaction deleted.", "success");
      }
      setDeleteTarget(null);
    });
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto scrollbar-thin md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400 dark:border-ink-800">
              <th className="py-2.5 pr-3 font-medium">Description</th>
              <th className="py-2.5 pr-3 font-medium">Category</th>
              <th className="py-2.5 pr-3 font-medium">Date</th>
              <th className="py-2.5 pr-3 font-medium">Payment</th>
              <th className="py-2.5 pr-3 text-right font-medium">Amount</th>
              {!compact && <th className="py-2.5 pl-3 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
            {transactions.map((t) => {
              const Icon = getCategoryIcon(t.categories?.icon);
              return (
                <tr key={t.id} className="group">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800">
                        <Icon className="h-4 w-4 text-ink-600 dark:text-ink-300" />
                      </div>
                      <span className="font-medium text-ink-800 dark:text-ink-100">
                        {t.description || t.categories?.name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-ink-500 dark:text-ink-400">{t.categories?.name ?? "Uncategorized"}</td>
                  <td className="py-3 pr-3 text-ink-500 dark:text-ink-400">{formatDisplayDate(t.transaction_date)}</td>
                  <td className="py-3 pr-3 text-ink-500 dark:text-ink-400">{t.payment_method}</td>
                  <td className="py-3 pr-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        t.type === "income" ? "text-brand-700 dark:text-brand-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {t.type === "income" ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {formatSignedCurrency(t.type === "income" ? t.amount : -t.amount, currencySymbol)}
                    </span>
                  </td>
                  {!compact && (
                    <td className="py-3 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => onEdit(t)}
                          aria-label="Edit transaction"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          aria-label="Delete transaction"
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {transactions.map((t) => {
          const Icon = getCategoryIcon(t.categories?.icon);
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-ink-200 p-3 dark:border-ink-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800">
                <Icon className="h-4 w-4 text-ink-600 dark:text-ink-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">
                  {t.description || t.categories?.name || "—"}
                </p>
                <p className="text-xs text-ink-400">
                  {t.categories?.name ?? "Uncategorized"} · {formatDisplayDate(t.transaction_date)} · {t.payment_method}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`text-sm font-semibold ${
                    t.type === "income" ? "text-brand-700 dark:text-brand-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatSignedCurrency(t.type === "income" ? t.amount : -t.amount, currencySymbol)}
                </span>
                {!compact && (
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(t)} aria-label="Edit transaction" className="rounded-lg p-1 text-ink-400">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(t)} aria-label="Delete transaction" className="rounded-lg p-1 text-ink-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete transaction?"
        description="This will permanently remove this transaction. This action cannot be undone."
        loading={isPending}
      />
    </>
  );
}
