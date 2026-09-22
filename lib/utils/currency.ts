// Money is stored and computed in whole cents-safe decimal form via
// PostgreSQL numeric(12,2). On the client we round every derived value to 2
// decimal places using this helper to avoid binary floating point drift
// (e.g. 0.1 + 0.2) before it ever reaches the database or the screen.
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function sumMoney(values: number[]): number {
  return roundMoney(values.reduce((acc, v) => acc + v, 0));
}

export function formatCurrency(value: number, symbol: string = "GH₵"): string {
  const rounded = roundMoney(value);
  const formatted = Math.abs(rounded).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (rounded < 0) return `-${symbol} ${formatted}`;
  return `${symbol} ${formatted}`;
}

export function formatSignedCurrency(value: number, symbol: string = "GH₵"): string {
  const rounded = roundMoney(value);
  const formatted = Math.abs(rounded).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = rounded < 0 ? "-" : "+";
  return `${sign}${symbol} ${formatted}`;
}

export function percentage(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  const pct = (part / whole) * 100;
  return Math.min(Math.max(roundMoney(pct), 0), 999);
}
