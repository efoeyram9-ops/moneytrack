"use client";

import { Sidebar } from "./sidebar";
import { X } from "lucide-react";
import { useEffect } from "react";

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-card">
        <button
          onClick={onClose}
          aria-label="Close navigation menu"
          className="absolute right-3 top-3 z-10 rounded-lg bg-white/80 p-1.5 text-ink-600 dark:bg-ink-900/80 dark:text-ink-300"
        >
          <X className="h-5 w-5" />
        </button>
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
