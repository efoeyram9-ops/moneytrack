"use client";

import { useState } from "react";
import { Menu, Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function Header({
  title,
  profile,
  onMenuClick,
}: {
  title: string;
  profile: Pick<Profile, "full_name" | "email"> | null;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = (profile?.full_name || profile?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-200 bg-white/90 px-4 backdrop-blur dark:border-ink-800 dark:bg-ink-900/90 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">{title}</h1>
          <p className="hidden text-xs text-ink-400 sm:block">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
              {initials}
            </div>
            <span className="hidden text-sm font-medium text-ink-700 dark:text-ink-200 sm:block">
              {profile?.full_name || profile?.email}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-ink-200 bg-white py-1.5 shadow-card dark:border-ink-800 dark:bg-ink-900">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
