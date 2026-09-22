import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/server";

export default async function RootPage() {
  const user = await getAuthenticatedUser();
  redirect(user ? "/dashboard" : "/login");
}
