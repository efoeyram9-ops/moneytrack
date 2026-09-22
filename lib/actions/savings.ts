"use server";

import { revalidatePath } from "next/cache";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { validateSavingsGoal, validateContribution, type SavingsGoalFormValues } from "@/lib/validations/savings";
import type { ActionResult } from "./transactions";

export async function createSavingsGoal(values: SavingsGoalFormValues): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const { valid, errors } = validateSavingsGoal(values);
  if (!valid) return { success: false, error: Object.values(errors)[0] };

  const supabase = createClient();
  const { error } = await supabase.from("savings_goals").insert({
    user_id: user.id,
    name: values.name.trim(),
    target_amount: Number(values.target_amount),
    deadline: values.deadline || null,
    description: values.description.trim(),
  });

  if (error) {
    console.error("createSavingsGoal error", error.message);
    return { success: false, error: "Could not create the savings goal. Please try again." };
  }

  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSavingsGoal(id: string, values: SavingsGoalFormValues): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const { valid, errors } = validateSavingsGoal(values);
  if (!valid) return { success: false, error: Object.values(errors)[0] };

  const supabase = createClient();
  const { error } = await supabase
    .from("savings_goals")
    .update({
      name: values.name.trim(),
      target_amount: Number(values.target_amount),
      deadline: values.deadline || null,
      description: values.description.trim(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateSavingsGoal error", error.message);
    return { success: false, error: "Could not update the savings goal. Please try again." };
  }

  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSavingsGoal(id: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const supabase = createClient();
  const { error } = await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    console.error("deleteSavingsGoal error", error.message);
    return { success: false, error: "Could not delete the savings goal. Please try again." };
  }

  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addContribution(
  goalId: string,
  amount: string,
  note: string,
  isWithdrawal: boolean
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const err = validateContribution(amount);
  if (err) return { success: false, error: err };

  const numericAmount = Math.abs(Number(amount)) * (isWithdrawal ? -1 : 1);

  const supabase = createClient();
  const { error } = await supabase.from("savings_contributions").insert({
    user_id: user.id,
    goal_id: goalId,
    amount: numericAmount,
    note: note.trim(),
    contribution_date: new Date().toISOString().slice(0, 10),
  });

  if (error) {
    console.error("addContribution error", error.message);
    return { success: false, error: "Could not save the contribution. Please try again." };
  }

  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function removeContribution(contributionId: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const supabase = createClient();
  const { error } = await supabase
    .from("savings_contributions")
    .delete()
    .eq("id", contributionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("removeContribution error", error.message);
    return { success: false, error: "Could not remove the contribution. Please try again." };
  }

  revalidatePath("/savings");
  revalidatePath("/dashboard");
  return { success: true };
}
