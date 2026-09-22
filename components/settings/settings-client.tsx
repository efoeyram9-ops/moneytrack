"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateProfile, updatePreferences } from "@/lib/actions/settings";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/toast-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { CURRENCIES, DATE_FORMATS } from "@/lib/utils/currencies";
import type { Profile } from "@/types";
import type { Theme } from "@/types/database";

export function SettingsClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(profile.full_name);
  const [currency, setCurrency] = useState(profile.currency);
  const [dateFormat, setDateFormat] = useState(profile.date_format);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfile(fullName);
      if (!result.success) {
        showToast(result.error ?? "Could not update profile.", "error");
      } else {
        showToast("Profile updated.", "success");
        router.refresh();
      }
    });
  }

  function handlePreferencesSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selected = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
    startTransition(async () => {
      const result = await updatePreferences(selected.code, selected.symbol, dateFormat, theme as Theme);
      if (!result.success) {
        showToast(result.error ?? "Could not update preferences.", "error");
      } else {
        showToast("Settings updated.", "success");
        router.refresh();
      }
    });
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError("Fill in both your current and new password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.email) {
      setPasswordLoading(false);
      setPasswordError("Could not verify your account. Please sign in again.");
      return;
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });
    if (verifyError) {
      setPasswordLoading(false);
      setPasswordError("Your current password is incorrect.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordError("Could not update your password. Please try again.");
      return;
    }

    showToast("Password updated.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 sm:max-w-md">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" value={profile.email} disabled hint="Your email cannot be changed here." />
          <Button type="submit" loading={isPending} className="w-fit">
            Save changes
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <form onSubmit={handlePreferencesSubmit} className="flex flex-col gap-4 sm:max-w-md">
          <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
          <Select label="Date format" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
            {DATE_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">Theme</label>
            <div className="flex rounded-xl bg-ink-100 p-1 dark:bg-ink-800">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition-colors ${
                    theme === t
                      ? "bg-white text-ink-900 shadow-soft dark:bg-ink-900 dark:text-ink-50"
                      : "text-ink-500 dark:text-ink-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" loading={isPending} className="w-fit">
            Save preferences
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 sm:max-w-md">
          {passwordError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
              {passwordError}
            </div>
          )}
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button type="submit" loading={passwordLoading} className="w-fit">
            Update password
          </Button>
        </form>
        <div className="mt-6 border-t border-ink-100 pt-4 dark:border-ink-800">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
