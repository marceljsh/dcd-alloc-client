import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

type TeamCompositionSummary = {
  total_team_size: number;
  role_counts: Record<string, number>;
};

export default function TeamCompositionCard({
  summary,
}: {
  summary: TeamCompositionSummary;
}) {
  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          Total Team Size
        </p>
        <Badge variant="outline" className="flex items-center gap-1">
          <span className="font-semibold text-sm">
            {summary.total_team_size}
          </span>
          <User className="w-4 h-4" />
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        {Object.entries(summary.role_counts).map(([role, count]) => (
          <div key={role} className="flex justify-between">
            <span className="capitalize">{role}s</span>
            <div className="flex items-center gap-1 font-medium">
              <span>{count}</span>
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
