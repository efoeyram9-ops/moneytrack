"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PAYMENT_METHODS } from "@/types";
import type { Category } from "@/types";

export interface TransactionFilterState {
  search: string;
  type: "all" | "income" | "expense";
  categoryId: string;
  paymentMethod: string;
  sort: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
}

export function TransactionFilters({
  filters,
  onChange,
  categories,
}: {
  filters: TransactionFilterState;
  onChange: (next: TransactionFilterState) => void;
  categories: Category[];
}) {
  function update<K extends keyof TransactionFilterState>(key: K, value: TransactionFilterState[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search transactions..."
          className="pl-9"
        />
      </div>

      <Select value={filters.type} onChange={(e) => update("type", e.target.value as TransactionFilterState["type"])}>
        <option value="all">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </Select>

      <Select value={filters.categoryId} onChange={(e) => update("categoryId", e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select value={filters.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)}>
        <option value="">All payment methods</option>
        {PAYMENT_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>

      <Select value={filters.sort} onChange={(e) => update("sort", e.target.value as TransactionFilterState["sort"])}>
        <option value="date_desc">Newest first</option>
        <option value="date_asc">Oldest first</option>
        <option value="amount_desc">Amount: high to low</option>
        <option value="amount_asc">Amount: low to high</option>
      </Select>
    </div>
  );
}
