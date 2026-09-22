import { Wallet } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-brand-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold">MoneyTrack</span>
        </div>
        <div className="max-w-md">
          <p className="font-display text-3xl font-semibold leading-tight">
            Know exactly where every cedi goes.
          </p>
          <p className="mt-4 text-brand-100">
            Track income, expenses, budgets and savings goals in one clear,
            simple place — built for how you actually spend.
          </p>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} MoneyTrack</p>
      </div>
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">MoneyTrack</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
