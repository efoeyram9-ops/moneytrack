"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateSavingsGoal, type SavingsGoalFormValues } from "@/lib/validations/savings";
import { createSavingsGoal, updateSavingsGoal } from "@/lib/actions/savings";
import { useToast } from "@/components/providers/toast-provider";
import type { SavingsGoal } from "@/types";

export function SavingsGoalForm({
  goal,
  onSuccess,
}: {
  goal?: SavingsGoal;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<SavingsGoalFormValues>({
    name: goal?.name ?? "",
    target_amount: goal ? String(goal.target_amount) : "",
    deadline: goal?.deadline ?? "",
    description: goal?.description ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SavingsGoalFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof SavingsGoalFormValues>(key: K, value: SavingsGoalFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setFormError(null);

    const { valid, errors: validationErrors } = validateSavingsGoal(values);
    setErrors(validationErrors);
    if (!valid) return;

    startTransition(async () => {
      const result = goal ? await updateSavingsGoal(goal.id, values) : await createSavingsGoal(values);
      if (!result.success) {
        setFormError(result.error ?? "Something went wrong.");
        return;
      }
      showToast(goal ? "Savings goal updated." : "Savings goal created.", "success");
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {formError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
          {formError}
        </div>
      )}
      <Input
        label="Goal name"
        value={values.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
        placeholder="e.g. New Laptop"
      />
      <Input
        label="Target amount"
        type="number"
        step="0.01"
        min="0.01"
        value={values.target_amount}
        onChange={(e) => update("target_amount", e.target.value)}
        error={errors.target_amount}
        placeholder="0.00"
      />
      <Input
        label="Deadline (optional)"
        type="date"
        value={values.deadline}
        onChange={(e) => update("deadline", e.target.value)}
        error={errors.deadline}
      />
      <Input
        label="Description (optional)"
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="What is this goal for?"
      />
      <Button type="submit" loading={isPending} className="mt-2 w-full">
        {goal ? "Save changes" : "Create goal"}
      </Button>
    </form>
  );
}
