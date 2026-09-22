"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-card dark:bg-ink-900",
              toast.variant === "success" && "border-brand-200 dark:border-brand-800",
              toast.variant === "error" && "border-red-200 dark:border-red-900",
              toast.variant === "info" && "border-ink-200 dark:border-ink-700"
            )}
          >
            {toast.variant === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />}
            {toast.variant === "error" && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
            {toast.variant === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" />}
            <p className="flex-1 text-sm text-ink-800 dark:text-ink-100">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
