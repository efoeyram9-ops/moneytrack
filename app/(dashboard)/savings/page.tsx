import { redirect } from "next/navigation";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { getSavingsGoalsWithProgress } from "@/lib/data/finance";
import { SavingsClient } from "@/components/savings/savings-client";

export default async function SavingsPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const [goals, profile] = await Promise.all([
    getSavingsGoalsWithProgress(supabase, user.id),
    supabase.from("profiles").select("currency_symbol").eq("id", user.id).single(),
  ]);

  return <SavingsClient goals={goals} currencySymbol={profile.data?.currency_symbol ?? "GH₵"} />;
}
