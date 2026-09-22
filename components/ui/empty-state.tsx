import type { LucideIcon } from "lucide-react";
import { Button } from "./button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-ink-50/50 px-6 py-14 text-center dark:border-ink-700 dark:bg-ink-900/40">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
        <Icon className="h-6 w-6 text-brand-700 dark:text-brand-400" />
      </div>
      <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
