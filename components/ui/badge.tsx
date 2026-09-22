import { cn } from "@/lib/utils/cn";

type Tone = "brand" | "gold" | "red" | "ink";

export function Badge({
  tone = "ink",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const toneClasses: Record<Tone, string> = {
    brand: "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300",
    gold: "bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    ink: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
