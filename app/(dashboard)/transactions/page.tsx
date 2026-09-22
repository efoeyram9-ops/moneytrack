import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { getAllTransactions, getCategories } from "@/lib/data/finance";
import { TransactionsClient } from "@/components/transactions/transactions-client";
import { redirect } from "next/navigation";

export default async function TransactionsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const [transactions, categories, profile] = await Promise.all([
    getAllTransactions(supabase, user.id),
    getCategories(supabase, user.id),
    supabase.from("profiles").select("currency_symbol").eq("id", user.id).single(),
  ]);

  return (
    <TransactionsClient
      transactions={transactions}
      categories={categories}
      currencySymbol={profile.data?.currency_symbol ?? "GH₵"}
    />
  );
}
