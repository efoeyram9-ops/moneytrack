import type { Database } from "./database";

export type { TransactionType, Theme } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type SavingsGoal = Database["public"]["Tables"]["savings_goals"]["Row"];
export type SavingsContribution = Database["public"]["Tables"]["savings_contributions"]["Row"];

export type TransactionWithCategory = Transaction & {
  categories: Pick<Category, "id" | "name" | "icon" | "type"> | null;
};

export type BudgetWithCategory = Budget & {
  categories: Pick<Category, "id" | "name" | "icon"> | null;
};

export const PAYMENT_METHODS = [
  "Cash",
  "MTN MoMo",
  "Telecel Cash",
  "AT Money",
  "Bank",
  "Debit Card",
  "Credit Card",
  "Other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type BudgetStatus = "normal" | "near_limit" | "exceeded";
