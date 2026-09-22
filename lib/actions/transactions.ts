"use server";

import { revalidatePath } from "next/cache";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { validateTransaction, type TransactionFormValues } from "@/lib/validations/transaction";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createTransaction(values: TransactionFormValues): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const { valid, errors } = validateTransaction(values);
  if (!valid) return { success: false, error: Object.values(errors)[0] };

  const supabase = createClient();
  const { error } = await supabase.from("transactions").insert({
    user_id: user.id, // derived from the verified session, never from the client
    type: values.type,
    amount: Number(values.amount),
    category_id: values.category_id,
    description: values.description.trim(),
    payment_method: values.payment_method,
    transaction_date: values.transaction_date,
  });

  if (error) {
    console.error("createTransaction error", error.message);
    return { success: false, error: "Could not save the transaction. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/income");
  revalidatePath("/expenses");
  revalidatePath("/budgets");
  revalidatePath("/reports");
  return { success: true };
}

export async function updateTransaction(id: string, values: TransactionFormValues): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const { valid, errors } = validateTransaction(values);
  if (!valid) return { success: false, error: Object.values(errors)[0] };

  const supabase = createClient();
  const { error } = await supabase
    .from("transactions")
    .update({
      type: values.type,
      amount: Number(values.amount),
      category_id: values.category_id,
      description: values.description.trim(),
      payment_method: values.payment_method,
      transaction_date: values.transaction_date,
    })
    .eq("id", id)
    .eq("user_id", user.id); // RLS also enforces this; belt and suspenders

  if (error) {
    console.error("updateTransaction error", error.message);
    return { success: false, error: "Could not update the transaction. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  revalidatePath("/reports");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const supabase = createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    console.error("deleteTransaction error", error.message);
    return { success: false, error: "Could not delete the transaction. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budgets");
  revalidatePath("/reports");
  return { success: true };
}
