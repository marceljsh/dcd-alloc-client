import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatWorkloadHours } from "@/lib/utils";

type TeamCompositionSummary = {
  total_team_size: number;
  role_counts: Record<string, number>;
  total_budget: number;
  total_workload: number;
  project_duration_days: number;
};

export default function BudgetTimelineCard({
  summary,
}: {
  summary: TeamCompositionSummary;
}) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          Budget & Timeline
        </p>
        <Badge variant="default">Within Budget</Badge>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Total Budget:</span>
          <span className="font-medium">{formatCurrency(30000000)}</span>
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
