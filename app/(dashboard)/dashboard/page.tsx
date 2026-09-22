import { redirect } from "next/navigation";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import {
  getAllTransactions,
  computeTotals,
  filterByMonth,
  getBudgetsWithProgress,
  getSavingsGoalsWithProgress,
  groupSpendingByCategory,
  monthlyIncomeExpenseSeries,
} from "@/lib/data/finance";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { SavingsProgress } from "@/components/dashboard/savings-progress";
import { SpendingByCategoryChart } from "@/components/charts/spending-by-category";
import { IncomeVsExpenseChart } from "@/components/charts/income-vs-expense";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { MONTH_NAMES } from "@/lib/utils/date";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [transactions, profile] = await Promise.all([
    getAllTransactions(supabase, user.id),
    supabase.from("profiles").select("currency_symbol").eq("id", user.id).single(),
  ]);

  const currencySymbol = profile.data?.currency_symbol ?? "GH₵";

  const { income, expense, balance } = computeTotals(transactions);
  const monthTransactions = filterByMonth(transactions, month, year);
  const monthTotals = computeTotals(monthTransactions);

  const [budgets, goals] = await Promise.all([
    getBudgetsWithProgress(supabase, user.id, month, year, transactions),
    getSavingsGoalsWithProgress(supabase, user.id),
  ]);

  const totalSavings = goals.reduce((sum, g) => sum + g.saved, 0);
  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const remainingBudget = Math.max(totalBudgeted - monthTotals.expense, 0);

  const categorySpend = groupSpendingByCategory(monthTransactions);
  const monthlySeries = monthlyIncomeExpenseSeries(transactions, 6);

  return (
    <div className="flex flex-col gap-6">
      <SummaryCards balance={balance} income={income} expenses={expense} savings={totalSavings} currencySymbol={currencySymbol} />

      <Card>
        <CardHeader>
          <CardTitle>
            {MONTH_NAMES[month - 1]} {year} overview
          </CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Income", value: monthTotals.income },
            { label: "Expenses", value: monthTotals.expense },
            { label: "Net", value: monthTotals.balance },
            { label: "Budget remaining", value: remainingBudget },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-ink-400">{item.label}</p>
              <p className="mt-1 font-display text-lg font-semibold text-ink-900 dark:text-ink-50">
                {formatCurrency(item.value, currencySymbol)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
          </CardHeader>
          <SpendingByCategoryChart data={categorySpend} currencySymbol={currencySymbol} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income vs expenses</CardTitle>
          </CardHeader>
          <IncomeVsExpenseChart data={monthlySeries} currencySymbol={currencySymbol} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly spending trend</CardTitle>
        </CardHeader>
        <MonthlyTrendChart
          data={monthlySeries.map((m) => ({ period: m.period, amount: m.expense }))}
          currencySymbol={currencySymbol}
        />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RecentTransactions transactions={transactions} currencySymbol={currencySymbol} />
        <div className="flex flex-col gap-5">
          <BudgetProgress budgets={budgets as any} currencySymbol={currencySymbol} />
          <SavingsProgress goals={goals} currencySymbol={currencySymbol} />
        </div>
      </div>
    </div>
  );
}
