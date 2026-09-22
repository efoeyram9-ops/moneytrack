import { redirect } from "next/navigation";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { getAllTransactions } from "@/lib/data/finance";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const [transactions, profile] = await Promise.all([
    getAllTransactions(supabase, user.id),
    supabase.from("profiles").select("currency_symbol").eq("id", user.id).single(),
  ]);

  return <ReportsClient transactions={transactions} currencySymbol={profile.data?.currency_symbol ?? "GH₵"} />;
}
