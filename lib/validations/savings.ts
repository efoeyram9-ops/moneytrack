export interface SavingsGoalFormValues {
  name: string;
  target_amount: string;
  deadline: string;
  description: string;
}

export function validateSavingsGoal(values: SavingsGoalFormValues) {
  const errors: Partial<Record<keyof SavingsGoalFormValues, string>> = {};
  const targetNum = Number(values.target_amount);

  if (!values.name || values.name.trim().length === 0) {
    errors.name = "Goal name is required.";
  }
  if (!values.target_amount || Number.isNaN(targetNum) || targetNum <= 0) {
    errors.target_amount = "Enter a target amount greater than 0.";
  }
  if (values.deadline) {
    const date = new Date(values.deadline);
    if (Number.isNaN(date.getTime())) {
      errors.deadline = "Enter a valid date.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateContribution(amount: string) {
  const num = Number(amount);
  if (!amount || Number.isNaN(num)) return "Enter a valid amount.";
  if (num === 0) return "Amount cannot be zero.";
  return null;
}
