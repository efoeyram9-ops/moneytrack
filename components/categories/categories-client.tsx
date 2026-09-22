"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryForm } from "./category-form";
import { getCategoryIcon } from "@/lib/utils/category-icons";
import { deleteCategorySafe } from "@/lib/actions/categories";
import { useToast } from "@/components/providers/toast-provider";
import type { Category } from "@/types";

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [isPending, startTransition] = useTransition();

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteCategorySafe(deleteTarget.id, reassignTo || null);
      if (!result.success) {
        showToast(result.error ?? "Could not delete category.", "error");
      } else {
        showToast("Category deleted.", "success");
      }
      setDeleteTarget(null);
      setReassignTo("");
      router.refresh();
    });
  }

  function renderGroup(title: string, items: Category[]) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        {items.length === 0 ? (
          <EmptyState icon={Tags} title={`No ${title.toLowerCase()}`} />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((c) => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-ink-100 p-3 dark:border-ink-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800">
                      <Icon className="h-4 w-4 text-ink-600 dark:text-ink-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{c.name}</p>
                      {c.is_default && (
                        <Badge tone="ink" className="mt-0.5">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(c);
                        setFormOpen(true);
                      }}
                      aria-label="Edit category"
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      aria-label="Delete category"
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    );
  }

  const reassignOptions = deleteTarget
    ? categories.filter((c) => c.type === deleteTarget.type && c.id !== deleteTarget.id)
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add category
        </Button>
      </div>

      {renderGroup("Expense categories", expenseCategories)}
      {renderGroup("Income sources", incomeCategories)}

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit category" : "Add category"}
      >
        <CategoryForm
          category={editing ?? undefined}
          onSuccess={() => {
            setFormOpen(false);
            setEditing(null);
            router.refresh();
          }}
        />
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setReassignTo("");
        }}
        title="Delete category?"
      >
        <p className="text-sm text-ink-600 dark:text-ink-300">
          If any transactions use &quot;{deleteTarget?.name}&quot;, you can move them to another category, or leave
          them uncategorized.
        </p>
        <div className="mt-4">
          <Select label="Move existing transactions to" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
            <option value="">Leave uncategorized</option>
            {reassignOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={isPending}>
            Delete category
          </Button>
        </div>
      </Modal>
    </div>
  );
}
