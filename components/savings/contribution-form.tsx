"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateContribution } from "@/lib/validations/savings";
import { addContribution } from "@/lib/actions/savings";
import { useToast } from "@/components/providers/toast-provider";

export function ContributionForm({ goalId, onSuccess }: { goalId: string; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setError(null);

    const validationError = validateContribution(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      const result = await addContribution(goalId, amount, note, mode === "remove");
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      showToast(mode === "add" ? "Contribution added." : "Contribution removed.", "success");
      setAmount("");
      setNote("");
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
        {(["add", "remove"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-white text-ink-900 shadow-soft dark:bg-ink-900 dark:text-ink-50"
                : "text-ink-500 dark:text-ink-400"
            }`}
          >
            {m === "add" ? "Add contribution" : "Remove funds"}
          </button>
        ))}
      </div>

      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
      />
      <Input
        label="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Bonus from work"
      />
      <Button type="submit" loading={isPending} className="w-full">
        {mode === "add" ? "Add contribution" : "Remove funds"}
      </Button>
    </form>
  );
}
