"use client";

import { useState, useTransition } from "react";
import type { Category, PaymentMethod, Transaction, TransactionType } from "@/types";
import { PAYMENT_METHODS } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { validateTransaction, type TransactionFormValues } from "@/lib/validations/transaction";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import { useToast } from "@/components/providers/toast-provider";
import { toISODate } from "@/lib/utils/date";

export function TransactionForm({
  type,
  categories,
  transaction,
  onSuccess,
  onCreateCategory,
}: {
  type: TransactionType;
  categories: Category[];
  transaction?: Transaction;
  onSuccess: () => void;
  onCreateCategory: () => void;
}) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<TransactionFormValues>({
    type,
    amount: transaction ? String(transaction.amount) : "",
    category_id: transaction?.category_id ?? "",
    description: transaction?.description ?? "",
    payment_method: transaction?.payment_method ?? "",
    transaction_date: transaction?.transaction_date ?? toISODate(new Date()),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof TransactionFormValues>(key: K, value: TransactionFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setFormError(null);

    const { valid, errors: validationErrors } = validateTransaction(values);
    setErrors(validationErrors);
    if (!valid) return;

    startTransition(async () => {
      const result = transaction
        ? await updateTransaction(transaction.id, values)
        : await createTransaction(values);

      if (!result.success) {
        setFormError(result.error ?? "Something went wrong.");
        return;
      }

      showToast(
        transaction
          ? `${type === "income" ? "Income" : "Expense"} updated.`
          : `${type === "income" ? "Income" : "Expense"} added.`,
        "success"
      );
      onSuccess();
    });
  }

  const label = type === "income" ? "Income Source" : "Category";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {formError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
          {formError}
        </div>
      )}

      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0.01"
        inputMode="decimal"
        value={values.amount}
        onChange={(e) => update("amount", e.target.value)}
        error={errors.amount}
        placeholder="0.00"
      />

      <div>
        <Select
          label={label}
          value={values.category_id}
          onChange={(e) => update("category_id", e.target.value)}
          error={errors.category_id}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={onCreateCategory}
          className="mt-1.5 text-xs font-medium text-brand-700 hover:underline dark:text-brand-400"
        >
          + Add a custom {type === "income" ? "source" : "category"}
        </button>
      </div>

      <Input
        label="Description"
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="e.g. Weekly groceries"
      />

      <Select
        label="Payment Method"
        value={values.payment_method}
        onChange={(e) => update("payment_method", e.target.value)}
        error={errors.payment_method}
      >
        <option value="">Select payment method</option>
        {PAYMENT_METHODS.map((m: PaymentMethod) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>

      <Input
        label="Date"
        type="date"
        value={values.transaction_date}
        onChange={(e) => update("transaction_date", e.target.value)}
        error={errors.transaction_date}
        max={toISODate(new Date())}
      />

      <Button type="submit" loading={isPending} className="mt-2 w-full">
        {isPending ? "Saving..." : transaction ? "Save changes" : `Add ${type === "income" ? "income" : "expense"}`}
      </Button>
    </form>
  );
}
