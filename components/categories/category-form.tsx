"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { useToast } from "@/components/providers/toast-provider";
import type { Category, TransactionType } from "@/types";

const ICON_OPTIONS = [
  "food", "transport", "rent", "utilities", "airtime-data", "shopping",
  "health", "education", "entertainment", "family", "business", "bills",
  "salary", "freelance", "allowance", "investment", "gift", "tag",
];

export function CategoryForm({ category, onSuccess }: { category?: Category; onSuccess: () => void }) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<TransactionType>(category?.type ?? "expense");
  const [icon, setIcon] = useState(category?.icon ?? "tag");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setError(null);

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, name, icon)
        : await createCategory(name, type, icon);

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      showToast(category ? "Category updated." : "Category created.", "success");
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
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pet Care" />
      {!category && (
        <div className="flex rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? "bg-white text-ink-900 shadow-soft dark:bg-ink-900 dark:text-ink-50"
                  : "text-ink-500 dark:text-ink-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <Select label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)}>
        {ICON_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace("-", " ")}
          </option>
        ))}
      </Select>
      <Button type="submit" loading={isPending} className="mt-2 w-full">
        {category ? "Save changes" : "Add category"}
      </Button>
    </form>
  );
}
