import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700 dark:text-ink-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "h-10 w-full rounded-xl border border-ink-300 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-500 disabled:cursor-not-allowed disabled:bg-ink-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50 dark:disabled:bg-ink-800",
            error && "border-red-400 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-sm text-ink-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
