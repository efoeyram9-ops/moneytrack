import type { createClient } from "@/lib/supabase/server";
import type { TransactionWithCategory, BudgetWithCategory, SavingsGoal } from "@/types";
import { sumMoney, roundMoney, percentage } from "@/lib/utils/currency";
import type { BudgetStatus } from "@/types";

// Typed as whatever our own server createClient() returns, rather than a
// hand-rolled SupabaseClient<Database> generic — that keeps this in sync
// with @supabase/ssr's actual inferred type instead of fighting it.
type TypedClient = ReturnType<typeof createClient>;

// ----------------------------------------------------------------------------
// All financial totals are derived here from raw transaction/contribution
// rows fetched from the database — never from client-only state, and never
// hard-coded. Money math goes through roundMoney/sumMoney to avoid floating
// point drift before it's displayed or compared against a budget.
// ----------------------------------------------------------------------------

export async function getAllTransactions(
  supabase: TypedClient,
  userId: string
): Promise<TransactionWithCategory[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, categories(id, name, icon, type)")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as TransactionWithCategory[];
}

export function computeTotals(transactions: { type: string; amount: number }[]) {
  const income = sumMoney(transactions.filter((t) => t.type === "income").map((t) => Number(t.amount)));
  const expense = sumMoney(transactions.filter((t) => t.type === "expense").map((t) => Number(t.amount)));
  return { income, expense, balance: roundMoney(income - expense) };
}

export function filterByMonth<T extends { transaction_date: string }>(
  transactions: T[],
  month: number,
  year: number
): T[] {
  return transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d.getUTCMonth() + 1 === month && d.getUTCFullYear() === year;
  });
}

export function filterByDateRange<T extends { transaction_date: string }>(
  transactions: T[],
  from: Date,
  to: Date
): T[] {
  return transactions.filter((t) => {
    const d = new Date(t.transaction_date + "T00:00:00");
    return d >= from && d <= to;
  });
}

export async function getCategories(supabase: TypedClient, userId: string, type?: "income" | "expense") {
  let query = supabase.from("categories").select("*").eq("user_id", userId).order("name");
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getBudgetsWithProgress(
  supabase: TypedClient,
  userId: string,
  month: number,
  year: number,
  transactions?: TransactionWithCategory[]
): Promise<Array<BudgetWithCategory & { spent: number; remaining: number; percent: number; status: BudgetStatus }>> {
  const { data: budgets, error } = await supabase
    .from("budgets")
    .select("*, categories(id, name, icon)")
    .eq("user_id", userId)
    .eq("month", month)
    .eq("year", year);
  if (error) throw error;

  const txns = transactions ?? (await getAllTransactions(supabase, userId));
  const monthTxns = filterByMonth(txns, month, year).filter((t) => t.type === "expense");

  return (budgets ?? []).map((b) => {
    const spent = sumMoney(monthTxns.filter((t) => t.category_id === b.category_id).map((t) => Number(t.amount)));
    const remaining = roundMoney(Number(b.amount) - spent);
    const percent = percentage(spent, Number(b.amount));
    let status: BudgetStatus = "normal";
    if (spent >= Number(b.amount)) status = "exceeded";
    else if (percent >= 80) status = "near_limit";
    return { ...(b as unknown as BudgetWithCategory), spent, remaining, percent, status };
  });
}

export async function getSavingsGoalsWithProgress(supabase: TypedClient, userId: string) {
  const { data: goals, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: contributions, error: contribError } = await supabase
    .from("savings_contributions")
    .select("*")
    .eq("user_id", userId);
  if (contribError) throw contribError;

  return (goals ?? []).map((goal: SavingsGoal) => {
    const goalContributions = (contributions ?? []).filter((c) => c.goal_id === goal.id);
    const saved = sumMoney(goalContributions.map((c) => Number(c.amount)));
    const clampedSaved = Math.max(saved, 0);
    const remaining = roundMoney(Math.max(Number(goal.target_amount) - clampedSaved, 0));
    const percent = percentage(clampedSaved, Number(goal.target_amount));
    return { ...goal, saved: clampedSaved, remaining, percent, contributions: goalContributions };
  });
}

export function groupSpendingByCategory(transactions: TransactionWithCategory[]) {
  const map = new Map<string, number>();
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const name = t.categories?.name ?? "Uncategorized";
      map.set(name, roundMoney((map.get(name) ?? 0) + Number(t.amount)));
    });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function groupByPaymentMethod(transactions: TransactionWithCategory[]) {
  const map = new Map<string, number>();
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      map.set(t.payment_method, roundMoney((map.get(t.payment_method) ?? 0) + Number(t.amount)));
    });
  return Array.from(map.entries())
    .map(([method, total]) => ({ method, total }))
    .sort((a, b) => b.total - a.total);
}

export function monthlyIncomeExpenseSeries(transactions: TransactionWithCategory[], monthsBack = 6) {
  const now = new Date();
  const series: { period: string; income: number; expense: number; monthIndex: number; year: number }[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const monthTxns = filterByMonth(transactions, month, year);
    const { income, expense } = computeTotals(monthTxns);
    series.push({
      period: d.toLocaleDateString("en-US", { month: "short" }),
      income,
      expense,
      monthIndex: month,
      year,
    });
  }
  return series;
}

export function dailySpendingSeries(transactions: TransactionWithCategory[], from: Date, to: Date) {
  const expenseTxns = filterByDateRange(transactions, from, to).filter((t) => t.type === "expense");
  const map = new Map<string, number>();
  expenseTxns.forEach((t) => {
    map.set(t.transaction_date, roundMoney((map.get(t.transaction_date) ?? 0) + Number(t.amount)));
  });
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, amount]) => ({
      period: new Date(date + "T00:00:00").toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
      amount,
    }));
}
