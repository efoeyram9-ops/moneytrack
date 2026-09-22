import { redirect } from "next/navigation";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { getAllTransactions, getCategories } from "@/lib/data/finance";
import { IncomeExpenseClient } from "@/components/transactions/income-expense-client";

export default async function ExpensesPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const [allTransactions, categories, profile] = await Promise.all([
    getAllTransactions(supabase, user.id),
    getCategories(supabase, user.id, "expense"),
    supabase.from("profiles").select("currency_symbol").eq("id", user.id).single(),
  ]);

  const expenseTransactions = allTransactions.filter((t) => t.type === "expense");

  return (
    <IncomeExpenseClient
      type="expense"
      transactions={expenseTransactions}
      categories={categories}
      currencySymbol={profile.data?.currency_symbol ?? "GH₵"}
    />
  );
}
