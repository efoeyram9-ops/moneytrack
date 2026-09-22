import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-14 text-center dark:border-red-900 dark:bg-red-900/10">
      <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      <p className="max-w-sm text-sm text-red-700 dark:text-red-300">
        {message ?? "Something went wrong loading this data."}
      </p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
