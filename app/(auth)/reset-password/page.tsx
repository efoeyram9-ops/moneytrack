"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase sets a recovery session from the URL fragment when the user
    // arrives via the emailed reset link.
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setFormError(null);

    const next: typeof errors = {};
    if (!password || password.length < 8) next.password = "Password must be at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setFormError("We couldn't update your password. Please request a new reset link.");
      return;
    }

    showToast("Password updated. Please sign in.", "success");
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">Set a new password</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Choose a strong password for your account.</p>

      {!ready && (
        <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
          Open this page from the password reset link in your email.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
            {formError}
          </div>
        )}
        <Input
          label="New password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} disabled={!ready} className="mt-2 w-full">
          Update password
        </Button>
      </form>
    </div>
  );
}
