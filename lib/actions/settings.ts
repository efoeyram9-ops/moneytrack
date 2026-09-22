"use server";

import { revalidatePath } from "next/cache";
import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import type { ActionResult } from "./transactions";
import type { Theme } from "@/types/database";

export async function updateProfile(fullName: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const trimmed = fullName.trim();
  if (!trimmed) return { success: false, error: "Full name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ full_name: trimmed }).eq("id", user.id);

  if (error) {
    console.error("updateProfile error", error.message);
    return { success: false, error: "Could not update your profile. Please try again." };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updatePreferences(
  currency: string,
  currencySymbol: string,
  dateFormat: string,
  theme: Theme
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "You must be signed in." };

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ currency, currency_symbol: currencySymbol, date_format: dateFormat, theme })
    .eq("id", user.id);

  if (error) {
    console.error("updatePreferences error", error.message);
    return { success: false, error: "Could not update your preferences. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
