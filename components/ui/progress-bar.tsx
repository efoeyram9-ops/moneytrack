import { cn } from "@/lib/utils/cn";

export function ProgressBar({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: "brand" | "gold" | "red";
  className?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const toneClasses = {
    brand: "bg-brand-600",
    gold: "bg-gold-500",
    red: "bg-red-500",
  };
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all", toneClasses[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
