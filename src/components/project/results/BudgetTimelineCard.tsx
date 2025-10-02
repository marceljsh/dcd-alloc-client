import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatWorkloadHours } from "@/lib/utils";
import { useEffect, useState } from "react";
import { iso } from "zod";

type TeamCompositionSummary = {
  total_team_size: number;
  role_counts: Record<string, number>;
  total_budget: number;
  total_workload: number;
  project_duration_days: number;
};

export default function BudgetTimelineCard({
  summary,
  maxBudget,
}: {
  summary: TeamCompositionSummary;
  maxBudget?: string;
}) {
  const [isOverBudget, setIsOverBudget] = useState(false);

  useEffect(() => {
    const parsedMaxBudget = maxBudget
      ? typeof maxBudget === "string"
        ? parseFloat(maxBudget.replace(/\./g, "").replace(/,/g, "."))
        : maxBudget
      : 0;
    setIsOverBudget(summary.total_budget > parsedMaxBudget);
  }, [maxBudget, summary.total_budget]);

  const bgStyle = isOverBudget
    ? "bg-red-50 border-red-200"
    : "bg-green-50 border-green-200";
  return (
    <div className={`p-4 ${bgStyle} rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          Project Summary
        </p>
        {isOverBudget && (
          <Badge variant="destructive" className="text-sm">
            Over Budget
          </Badge>
        )}

        {!isOverBudget && (
          <Badge variant="outline" className="text-sm">
            Within Budget
          </Badge>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Total Budget:</span>
          <span className="font-medium">
            {formatCurrency(summary.total_budget)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Workload:</span>
          <span className="font-medium">
            {formatWorkloadHours(summary.total_workload)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Project Duration:</span>
          <span className="font-medium">
            {summary.project_duration_days} days
          </span>
        </div>
      </div>
    </div>
  );
}
