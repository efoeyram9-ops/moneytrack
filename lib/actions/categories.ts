"use server";

import { revalidatePath } from "next/cache";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import type { ActionResult } from "./transactions";

export async function createCategory(
  name: string,
  type: "income" | "expense",
  icon: string
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Category name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: trimmed,
    type,
    icon: icon || "circle",
    is_default: false,
  });

  if (error) {
    console.error("createCategory error", error.message);
    if (error.code === "23505") {
      return { success: false, error: "A category with this name and type already exists." };
    }
    if (error.code === "42501") {
      return { success: false, error: "You do not have permission to create this category." };
    }
    return { success: false, error: "Could not create the category. Please try again." };
  }

  revalidatePath("/categories");
  revalidatePath("/expenses");
  revalidatePath("/income");
  return { success: true };
}

export async function updateCategory(id: string, name: string, icon: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Category name is required." };

  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: trimmed, icon: icon || "circle" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateCategory error", error.message);
    return { success: false, error: "Could not update the category. Please try again." };
  }

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategorySafe(id: string, reassignTo: string | null): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const supabase = createClient();
  const { error } = await supabase.rpc("delete_category_safe", {
    p_category_id: id,
    p_reassign_to: reassignTo,
  });

  if (error) {
    console.error("deleteCategorySafe error", error.message);
    return { success: false, error: "Could not delete the category. Please try again." };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { success: true };
}
