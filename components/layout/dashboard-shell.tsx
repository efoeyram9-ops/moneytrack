"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import type { Profile } from "@/types";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/income": "Add Income",
  "/expenses": "Add Expense",
  "/budgets": "Budgets",
  "/savings": "Savings Goals",
  "/reports": "Reports",
  "/categories": "Categories",
  "/settings": "Settings",
};

export function DashboardShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: Pick<Profile, "full_name" | "email"> | null;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const title = PAGE_TITLES[pathname] ?? "MoneyTrack";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-ink-200 dark:border-ink-800 lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </aside>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} profile={profile} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
