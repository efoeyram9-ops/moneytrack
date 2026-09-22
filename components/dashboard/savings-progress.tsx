import Link from "next/link";
import { Target } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/utils/currency";

interface GoalItem {
  id: string;
  name: string;
  target_amount: number;
  saved: number;
  percent: number;
}

export function SavingsProgress({ goals, currencySymbol }: { goals: GoalItem[]; currencySymbol: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings goals</CardTitle>
        <Link href="/savings" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-400">
          Manage
        </Link>
      </CardHeader>
      {goals.length === 0 ? (
        <EmptyState icon={Target} title="No savings goals yet" description="Create a goal to start tracking progress." />
      ) : (
        <div className="flex flex-col gap-4">
          {goals.slice(0, 5).map((g) => (
            <div key={g.id}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-ink-800 dark:text-ink-100">{g.name}</span>
                <span className="text-ink-400">
                  {formatCurrency(g.saved, currencySymbol)} / {formatCurrency(g.target_amount, currencySymbol)}
                </span>
              </div>
              <ProgressBar value={g.percent} tone="gold" className="mt-1.5" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
