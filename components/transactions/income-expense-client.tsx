"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Category, TransactionType, TransactionWithCategory } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionForm } from "./transaction-form";
import { TransactionTable } from "./transaction-table";
import { CategoryQuickAddModal } from "@/components/categories/category-quick-add-modal";

export function IncomeExpenseClient({
  type,
  transactions,
  categories,
  currencySymbol,
}: {
  type: TransactionType;
  transactions: TransactionWithCategory[];
  categories: Category[];
  currencySymbol: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<TransactionWithCategory | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const isIncome = type === "income";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{isIncome ? "Add income" : "Add expense"}</CardTitle>
          {isIncome ? (
            <TrendingUp className="h-5 w-5 text-brand-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
        </CardHeader>
        <TransactionForm
          type={type}
          categories={categories}
          onSuccess={() => router.refresh()}
          onCreateCategory={() => setQuickAddOpen(true)}
        />
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent {isIncome ? "income" : "expenses"}</CardTitle>
        </CardHeader>
        {transactions.length === 0 ? (
          <EmptyState
            icon={isIncome ? TrendingUp : TrendingDown}
            title={isIncome ? "No income recorded yet" : "No expenses recorded yet"}
            description={`Use the form to add your first ${isIncome ? "income" : "expense"} entry.`}
          />
        ) : (
          <TransactionTable
            transactions={transactions.slice(0, 10)}
            currencySymbol={currencySymbol}
            onEdit={setEditing}
          />
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit transaction">
        {editing && (
          <TransactionForm
            type={editing.type}
            categories={categories}
            transaction={editing}
            onSuccess={() => {
              setEditing(null);
              router.refresh();
            }}
            onCreateCategory={() => setQuickAddOpen(true)}
          />
        )}
      </Modal>

      <CategoryQuickAddModal
        open={quickAddOpen}
        type={type}
        onClose={() => setQuickAddOpen(false)}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
