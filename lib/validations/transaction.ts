import { PAYMENT_METHODS } from "@/types";

export interface TransactionFormValues {
  type: "income" | "expense";
  amount: string;
  category_id: string;
  description: string;
  payment_method: string;
  transaction_date: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof TransactionFormValues, string>>;
}

export function validateTransaction(values: TransactionFormValues): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  const amountNum = Number(values.amount);
  if (!values.amount || Number.isNaN(amountNum)) {
    errors.amount = "Enter a valid amount.";
  } else if (amountNum <= 0) {
    errors.amount = "Amount must be greater than 0.";
  } else if (amountNum > 999999999) {
    errors.amount = "Amount is too large.";
  }

  if (!values.category_id) {
    errors.category_id = "Select a category.";
  }

  if (!values.payment_method || !PAYMENT_METHODS.includes(values.payment_method as any)) {
    errors.payment_method = "Select a payment method.";
  }

  if (!values.transaction_date) {
    errors.transaction_date = "Select a date.";
  } else {
    const date = new Date(values.transaction_date);
    if (Number.isNaN(date.getTime())) {
      errors.transaction_date = "Enter a valid date.";
    } else if (date > new Date(Date.now() + 24 * 60 * 60 * 1000)) {
      errors.transaction_date = "Date cannot be in the future.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
