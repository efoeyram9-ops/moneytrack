"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setFormError(
        error.message.includes("already registered") || error.message.includes("already exists")
          ? "An account with this email already exists."
          : "We couldn't create your account. Please try again."
      );
      return;
    }

    if (data.session) {
      showToast("Account created successfully.", "success");
      router.push("/dashboard");
      router.refresh();
    } else {
      showToast("Check your email to confirm your account.", "success");
      router.push("/login");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Start tracking your money in minutes.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/10 dark:text-red-300">
            {formError}
          </div>
        )}

        <Input
          label="Full name"
          name="fullName"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          error={errors.fullName}
          placeholder="Ama Owusu"
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          hint={!errors.password ? "At least 8 characters." : undefined}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline dark:text-brand-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
