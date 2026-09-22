export interface BudgetFormValues {
  category_id: string;
  amount: string;
  month: number;
  year: number;
}

export function validateBudget(values: BudgetFormValues) {
  const errors: Partial<Record<keyof BudgetFormValues, string>> = {};
  const amountNum = Number(values.amount);

  if (!values.category_id) errors.category_id = "Select a category.";
  if (!values.amount || Number.isNaN(amountNum) || amountNum <= 0) {
    errors.amount = "Enter an amount greater than 0.";
  }
  if (!values.month || values.month < 1 || values.month > 12) {
    errors.month = "Select a valid month.";
  }
  if (!values.year || values.year < 2000 || values.year > 2100) {
    errors.year = "Select a valid year.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
