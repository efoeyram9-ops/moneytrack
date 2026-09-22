"use client";

import { useState, useTransition } from "react";
import type { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { validateBudget, type BudgetFormValues } from "@/lib/validations/budget";
import { createBudget } from "@/lib/actions/budgets";
import { useToast } from "@/components/providers/toast-provider";
import { MONTH_NAMES } from "@/lib/utils/date";

export function BudgetForm({
  categories,
  defaultMonth,
  defaultYear,
  onSuccess,
}: {
  categories: Category[];
  defaultMonth: number;
  defaultYear: number;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<BudgetFormValues>({
    category_id: "",
    amount: "",
    month: defaultMonth,
    year: defaultYear,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof BudgetFormValues>(key: K, value: BudgetFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setFormError(null);

    const { valid, errors: validationErrors } = validateBudget(values);
    setErrors(validationErrors);
    if (!valid) return;

    startTransition(async () => {
      const result = await createBudget(values);
      if (!result.success) {
        setFormError(result.error ?? "Something went wrong.");
        return;
      }
      showToast("Budget created.", "success");
      onSuccess();
    });
  }

  const years = [defaultYear - 1, defaultYear, defaultYear + 1];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {formError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
          {formError}
        </div>
      )}

      <Select
        label="Category"
        value={values.category_id}
        onChange={(e) => update("category_id", e.target.value)}
        error={errors.category_id}
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input
        label="Budget amount"
        type="number"
        step="0.01"
        min="0.01"
        inputMode="decimal"
        value={values.amount}
        onChange={(e) => update("amount", e.target.value)}
        error={errors.amount}
        placeholder="0.00"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Month" value={values.month} onChange={(e) => update("month", Number(e.target.value))}>
          {MONTH_NAMES.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {name}
            </option>
          ))}
        </Select>
        <Select label="Year" value={values.year} onChange={(e) => update("year", Number(e.target.value))}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <Button type="submit" loading={isPending} className="mt-2 w-full">
        Create budget
      </Button>
    </form>
  );
}
