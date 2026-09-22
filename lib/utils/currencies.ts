export const CURRENCIES = [
  { code: "GHS", symbol: "GH₵", label: "Ghanaian Cedi (GH₵)" },
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira (₦)" },
] as const;

export const DATE_FORMATS = [
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD" },
] as const;
