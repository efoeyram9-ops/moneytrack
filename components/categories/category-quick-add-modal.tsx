"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCategory } from "@/lib/actions/categories";
import { useToast } from "@/components/providers/toast-provider";
import type { TransactionType } from "@/types";

export function CategoryQuickAddModal({
  open,
  onClose,
  type,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  type: TransactionType;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await createCategory(name, type, "tag");
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      showToast("Category created.", "success");
      setName("");
      onCreated();
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={`Add a custom ${type === "income" ? "income source" : "category"}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
            {error}
          </div>
        )}
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === "income" ? "e.g. Rental Income" : "e.g. Pet Care"}
          autoFocus
        />
        <Button type="submit" loading={isPending} className="w-full">
          Add
        </Button>
      </form>
    </Modal>
  );
}
