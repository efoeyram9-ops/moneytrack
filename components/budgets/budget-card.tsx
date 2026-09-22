"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { formatCurrency } from "@/lib/utils/currency";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { updateBudget, deleteBudget } from "@/lib/actions/budgets";
import { useToast } from "@/components/providers/toast-provider";
import type { BudgetStatus } from "@/types";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<BudgetStatus, { label: string; tone: "brand" | "gold" | "red"; progressTone: "brand" | "gold" | "red" }> = {
  normal: { label: "On track", tone: "brand", progressTone: "brand" },
  near_limit: { label: "Near limit", tone: "gold", progressTone: "gold" },
  exceeded: { label: "Exceeded", tone: "red", progressTone: "red" },
};

export function BudgetCard({
  budget,
  currencySymbol,
}: {
  budget: {
    id: string;
    amount: number;
    spent: number;
    remaining: number;
    percent: number;
    status: BudgetStatus;
    categories: { name: string; icon: string } | null;
  };
  currencySymbol: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(budget.amount));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const Icon = getCategoryIcon(budget.categories?.icon);
  const status = STATUS_CONFIG[budget.status];

  function saveAmount() {
    startTransition(async () => {
      const result = await updateBudget(budget.id, { amount });
      if (!result.success) {
        showToast(result.error ?? "Could not update budget.", "error");
        return;
      }
      showToast("Budget updated.", "success");
      setEditing(false);
      router.refresh();
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteBudget(budget.id);
      if (!result.success) {
        showToast(result.error ?? "Could not delete budget.", "error");
      } else {
        showToast("Budget deleted.", "success");
      }
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-ink-200 p-4 dark:border-ink-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800">
            <Icon className="h-4 w-4 text-ink-600 dark:text-ink-300" />
          </div>
          <div>
            <p className="font-medium text-ink-800 dark:text-ink-100">{budget.categories?.name ?? "Category"}</p>
            <Badge tone={status.tone} className="mt-1">
              {status.label}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing((e) => !e)}
            aria-label="Edit budget amount"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete budget"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9"
            />
            <button
              onClick={saveAmount}
              disabled={isPending}
              aria-label="Save budget amount"
              className="rounded-lg bg-brand-700 p-2 text-white hover:bg-brand-800 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setAmount(String(budget.amount));
              }}
              aria-label="Cancel editing"
              className="rounded-lg border border-ink-300 p-2 text-ink-600 dark:border-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-ink-800 dark:text-ink-100">
                {formatCurrency(budget.spent, currencySymbol)}{" "}
                <span className="text-ink-400">/ {formatCurrency(budget.amount, currencySymbol)}</span>
              </span>
              <span className="text-xs text-ink-400">{budget.percent}%</span>
            </div>
            <ProgressBar value={budget.percent} tone={status.progressTone} className="mt-2" />
            <p className="mt-2 text-xs text-ink-400">
              {budget.remaining >= 0
                ? `${formatCurrency(budget.remaining, currencySymbol)} remaining`
                : `${formatCurrency(Math.abs(budget.remaining), currencySymbol)} over budget`}
            </p>
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete budget?"
        description="This will permanently remove this budget for the selected month."
        loading={isPending}
      />
    </div>
  );
}
