import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWorkloadHours } from "@/lib/utils";
import { Activity, TeamMember } from "@/types/projects";
import { Calendar, Clock, User } from "lucide-react";

const getLevelBadgeVariant = (level: string) => {
  switch (level) {
    case "Junior":
      return "secondary" as const;
    case "Mid":
      return "default" as const;
    case "Senior":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

const getActivityById = (
  activities: Activity[],
  activityId: number,
): Activity | undefined => {
  return activities.find((activity) => activity.id === activityId);
};

export default function TeamMemberCard({
  member,
  activities,
}: {
  member: TeamMember;
  activities: Activity[];
}) {
  return (
    <Card className="border-2 py-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{member.name}</span>
            </CardTitle>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-sm text-muted-foreground">
                Allowed Level:
              </span>
              <Badge
                variant={getLevelBadgeVariant(member.level)}
                className="text-xs"
              >
                {member.level}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workload and Budget */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Workload
            </p>
            <p className="text-lg font-semibold">
              {formatWorkloadHours(member.workload_hours)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total working days
            </p>
            <p className="text-lg font-semibold">{member.total_working_days}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Utilization Rate
            </p>
            <p className="text-sm">{member.utilization_rate}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Assigned Activities & Timeline
          </p>
          <div className="space-y-3">
            {member.assigned_activities.map((assignedActivity, actIndex) => {
              const activity = getActivityById(
                activities,
                assignedActivity.activity_id,
              );
              if (!activity) return null;

              return (
                <div
                  key={actIndex}
                  className="border rounded-lg p-3 bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{activity.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {formatWorkloadHours(assignedActivity.workload_hours)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{activity.date_range}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatWorkloadHours(assignedActivity.workload_hours)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
