import { redirect } from "next/navigation";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { getBudgetsWithProgress, getCategories, getAllTransactions } from "@/lib/data/finance";
import { BudgetsClient } from "@/components/budgets/budgets-client";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const now = new Date();
  const month = searchParams.month ? Number(searchParams.month) : now.getMonth() + 1;
  const year = searchParams.year ? Number(searchParams.year) : now.getFullYear();

  const supabase = createClient();
  const [transactions, categories, profile] = await Promise.all([
    getAllTransactions(supabase, user.id),
    getCategories(supabase, user.id),
    supabase.from("profiles").select("currency_symbol").eq("id", user.id).single(),
  ]);

  const budgets = await getBudgetsWithProgress(supabase, user.id, month, year, transactions);

  return (
    <BudgetsClient
      budgets={budgets as any}
      categories={categories}
      month={month}
      year={year}
      currencySymbol={profile.data?.currency_symbol ?? "GH₵"}
    />
  );
}
