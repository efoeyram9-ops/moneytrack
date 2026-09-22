"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (resetError) {
      setError("We couldn't send the reset email. Please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
          <MailCheck className="h-6 w-6 text-brand-700 dark:text-brand-400" />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900 dark:text-ink-50">Check your email</h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          If an account exists for <span className="font-medium">{email}</span>, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        Enter the email linked to your account and we&apos;ll send a reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Send reset link
        </Button>
      </form>

      <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
