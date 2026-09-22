"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Target } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { SavingsGoalForm } from "./savings-goal-form";
import { SavingsGoalCard } from "./savings-goal-card";
import type { SavingsGoal, SavingsContribution } from "@/types";

type GoalWithProgress = SavingsGoal & {
  saved: number;
  remaining: number;
  percent: number;
  contributions: SavingsContribution[];
};

export function SavingsClient({
  goals,
  currencySymbol,
}: {
  goals: GoalWithProgress[];
  currencySymbol: string;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> New savings goal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your savings goals</CardTitle>
        </CardHeader>
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            description="Create a goal and start tracking your contributions toward it."
            actionLabel="New savings goal"
            onAction={() => setFormOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <SavingsGoalCard key={goal.id} goal={goal} currencySymbol={currencySymbol} />
            ))}
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Create savings goal">
        <SavingsGoalForm
          onSuccess={() => {
            setFormOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </div>
  );
}
