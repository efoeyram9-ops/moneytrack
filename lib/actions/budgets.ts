"use server";

import { revalidatePath } from "next/cache";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { validateBudget, type BudgetFormValues } from "@/lib/validations/budget";
import type { ActionResult } from "./transactions";

export async function createBudget(values: BudgetFormValues): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const { valid, errors } = validateBudget(values);
  if (!valid) return { success: false, error: Object.values(errors)[0] };

  const supabase = createClient();

  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("category_id", values.category_id)
    .eq("month", values.month)
    .eq("year", values.year)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "A budget for this category and month already exists." };
  }

  const { error } = await supabase.from("budgets").insert({
    user_id: user.id,
    category_id: values.category_id,
    amount: Number(values.amount),
    month: values.month,
    year: values.year,
  });

  if (error) {
    console.error("createBudget error", error.message);
    if (error.code === "23505") {
      return { success: false, error: "A budget for this category and month already exists." };
    }
    return { success: false, error: "Could not create the budget. Please try again." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBudget(id: string, values: Pick<BudgetFormValues, "amount">): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const amountNum = Number(values.amount);
  if (!values.amount || Number.isNaN(amountNum) || amountNum <= 0) {
    return { success: false, error: "Enter an amount greater than 0." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("budgets")
    .update({ amount: amountNum })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateBudget error", error.message);
    return { success: false, error: "Could not update the budget. Please try again." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const supabase = createClient();
  const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    console.error("deleteBudget error", error.message);
    return { success: false, error: "Could not delete the budget. Please try again." };
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}
