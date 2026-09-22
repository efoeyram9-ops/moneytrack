"use client";

import { useMemo, useState } from "react";
import { Plus, ArrowLeftRight } from "lucide-react";
import type { Category, TransactionType, TransactionWithCategory } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionTable } from "./transaction-table";
import { TransactionFilters, type TransactionFilterState } from "./transaction-filters";
import { TransactionForm } from "./transaction-form";
import { CategoryQuickAddModal } from "@/components/categories/category-quick-add-modal";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 15;

export function TransactionsClient({
  transactions,
  categories,
  currencySymbol,
}: {
  transactions: TransactionWithCategory[];
  categories: Category[];
  currencySymbol: string;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<TransactionFilterState>({
    search: "",
    type: "all",
    categoryId: "",
    paymentMethod: "",
    sort: "date_desc",
  });
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionWithCategory | null>(null);
  const [quickAddType, setQuickAddType] = useState<TransactionType | null>(null);
  const [addType, setAddType] = useState<TransactionType>("expense");

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.categories?.name ?? "").toLowerCase().includes(q) ||
          t.payment_method.toLowerCase().includes(q)
      );
    }
    if (filters.type !== "all") list = list.filter((t) => t.type === filters.type);
    if (filters.categoryId) list = list.filter((t) => t.category_id === filters.categoryId);
    if (filters.paymentMethod) list = list.filter((t) => t.payment_method === filters.paymentMethod);

    list.sort((a, b) => {
      switch (filters.sort) {
        case "date_asc":
          return a.transaction_date.localeCompare(b.transaction_date);
        case "amount_desc":
          return Number(b.amount) - Number(a.amount);
        case "amount_asc":
          return Number(a.amount) - Number(b.amount);
        default:
          return b.transaction_date.localeCompare(a.transaction_date);
      }
    });

    return list;
  }, [transactions, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFiltersChange(next: TransactionFilterState) {
    setFilters(next);
    setPage(1);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
        </p>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus className="h-4 w-4" /> Add transaction
        </Button>
      </div>

      <Card>
        <TransactionFilters filters={filters} onChange={handleFiltersChange} categories={categories} />
      </Card>

      <Card className="p-4 sm:p-5">
        {paged.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions yet"
            description="Add your first income or expense to start tracking your money."
            actionLabel="Add transaction"
            onAction={() => setFormOpen(true)}
          />
        ) : (
          <>
            <TransactionTable
              transactions={paged}
              currencySymbol={currencySymbol}
              onEdit={(t) => {
                setEditing(t);
                setFormOpen(true);
              }}
            />
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4 dark:border-ink-800">
                <p className="text-xs text-ink-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit transaction" : "Add transaction"}>
        {!editing && (
          <div className="mb-4 flex rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAddType(t)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition-colors ${
                  addType === t
                    ? "bg-white text-ink-900 shadow-soft dark:bg-ink-900 dark:text-ink-50"
                    : "text-ink-500 dark:text-ink-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <TransactionForm
          key={editing?.id ?? addType}
          type={editing?.type ?? addType}
          categories={categories.filter((c) => c.type === (editing?.type ?? addType))}
          transaction={editing ?? undefined}
          onSuccess={() => {
            closeForm();
            router.refresh();
          }}
          onCreateCategory={() => setQuickAddType(editing?.type ?? addType)}
        />
      </Modal>

      {quickAddType && (
        <CategoryQuickAddModal
          open={!!quickAddType}
          type={quickAddType}
          onClose={() => setQuickAddType(null)}
          onCreated={() => router.refresh()}
        />
      )}
    </div>
  );
}
