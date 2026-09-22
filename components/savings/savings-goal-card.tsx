"use client";

import { useState, useTransition } from "react";
import { Target, Pencil, Trash2, PlusCircle, History, Plus, Minus } from "lucide-react";
import { formatCurrency, formatSignedCurrency } from "@/lib/utils/currency";
import { formatDisplayDate } from "@/lib/utils/date";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { SavingsGoalForm } from "./savings-goal-form";
import { ContributionForm } from "./contribution-form";
import { deleteSavingsGoal, removeContribution } from "@/lib/actions/savings";
import { useToast } from "@/components/providers/toast-provider";
import { useRouter } from "next/navigation";
import type { SavingsGoal, SavingsContribution } from "@/types";

export function SavingsGoalCard({
  goal,
  currencySymbol,
}: {
  goal: SavingsGoal & { saved: number; remaining: number; percent: number; contributions: SavingsContribution[] };
  currencySymbol: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteSavingsGoal(goal.id);
      if (!result.success) {
        showToast(result.error ?? "Could not delete goal.", "error");
      } else {
        showToast("Savings goal deleted.", "success");
      }
      setDeleteOpen(false);
      router.refresh();
    });
  }

  function handleRemoveContribution(id: string) {
    startTransition(async () => {
      const result = await removeContribution(id);
      if (!result.success) {
        showToast(result.error ?? "Could not remove contribution.", "error");
      } else {
        showToast("Contribution removed.", "success");
      }
      router.refresh();
    });
  }

  const isComplete = goal.percent >= 100;
  const sortedContributions = [...goal.contributions].sort((a, b) => b.contribution_date.localeCompare(a.contribution_date));

  return (
    <div className="rounded-xl border border-ink-200 p-4 dark:border-ink-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 dark:bg-gold-900/30">
            <Target className="h-5 w-5 text-gold-700 dark:text-gold-400" />
          </div>
          <div>
            <p className="font-medium text-ink-800 dark:text-ink-100">{goal.name}</p>
            {goal.deadline && <p className="text-xs text-ink-400">Due {formatDisplayDate(goal.deadline)}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Edit goal"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete goal"
            className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {goal.description && <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{goal.description}</p>}

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium text-ink-800 dark:text-ink-100">
            {formatCurrency(goal.saved, currencySymbol)}{" "}
            <span className="text-ink-400">/ {formatCurrency(goal.target_amount, currencySymbol)}</span>
          </span>
          <span className="text-xs text-ink-400">{Math.min(goal.percent, 100)}%</span>
        </div>
        <ProgressBar value={goal.percent} tone={isComplete ? "brand" : "gold"} className="mt-2" />
        <p className="mt-2 text-xs text-ink-400">
          {isComplete ? "Goal reached!" : `${formatCurrency(goal.remaining, currencySymbol)} to go`}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => setContributeOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Add funds
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setHistoryOpen(true)}>
          <History className="h-4 w-4" /> History
        </Button>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit savings goal">
        <SavingsGoalForm
          goal={goal}
          onSuccess={() => {
            setEditOpen(false);
            router.refresh();
          }}
        />
      </Modal>

      <Modal open={contributeOpen} onClose={() => setContributeOpen(false)} title={`Update "${goal.name}"`}>
        <ContributionForm
          goalId={goal.id}
          onSuccess={() => {
            setContributeOpen(false);
            router.refresh();
          }}
        />
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Contribution history">
        {sortedContributions.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-400">No contributions yet.</p>
        ) : (
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {sortedContributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-800"
              >
                <div className="flex items-center gap-2">
                  {Number(c.amount) >= 0 ? (
                    <Plus className="h-4 w-4 text-brand-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">
                      {formatSignedCurrency(Number(c.amount), currencySymbol)}
                    </p>
                    <p className="text-xs text-ink-400">
                      {formatDisplayDate(c.contribution_date)}
                      {c.note ? ` · ${c.note}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveContribution(c.id)}
                  disabled={isPending}
                  aria-label="Delete contribution"
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete savings goal?"
        description="This will permanently remove this goal and all of its contribution history."
        loading={isPending}
      />
    </div>
  );
}
