import { redirect } from "next/navigation";
import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, currency, currency_symbol, theme")
    .eq("id", user.id)
    .single();

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}
