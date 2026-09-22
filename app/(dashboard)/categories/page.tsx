import { redirect } from "next/navigation";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data/finance";
import { CategoriesClient } from "@/components/categories/categories-client";

export default async function CategoriesPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const categories = await getCategories(supabase, user.id);

  return <CategoriesClient categories={categories} />;
}
