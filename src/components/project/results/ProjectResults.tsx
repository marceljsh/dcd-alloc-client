"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { Activity, TeamCompositionSummary, TeamMember } from "@/types/projects";
import BudgetTimelineCard from "./BudgetTimelineCard";
import TeamMemberCard from "./TeamMemberCard";
import TeamSizeCard from "./TeamSizeCard";

const calculateSummary = (
  teamMembers: TeamMember[],
): TeamCompositionSummary => {
  const roleCounts = teamMembers.reduce(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    total_team_size: teamMembers.length,
    role_counts: roleCounts,
    total_budget: teamMembers.reduce(
      (sum, member) => sum + member.total_working_days,
      0,
    ),
    total_workload: teamMembers.reduce(
      (sum, member) => sum + member.workload_hours,
      0,
    ),
    project_duration_days: 30,
  };
};

const groupMembersByRole = (teamMembers: TeamMember[]) => {
  return teamMembers.reduce(
    (acc, member) => {
      if (!acc[member.role]) {
        acc[member.role] = [];
      }
      acc[member.role].push(member);
      return acc;
    },
    {} as Record<string, TeamMember[]>,
  );
};

const sampleActivities: Activity[] = [
  { id: 1, name: "Wireframing", date_range: "Nov 1-3, 2024" },
  { id: 2, name: "Prototyping", date_range: "Nov 4-8, 2024" },
  { id: 3, name: "Design System", date_range: "Nov 3-6, 2024" },
  { id: 4, name: "Development", date_range: "Nov 9-15, 2024" },
  { id: 5, name: "Testing", date_range: "Nov 16-20, 2024" },
  { id: 6, name: "Deployment Support", date_range: "Nov 21-22, 2024" },
];

const sampleTeamComposition: TeamMember[] = [
  {
    name: "Designer 1",
    role: "Designer",
    level: "Mid",
    workload_hours: 48,
    total_working_days: 8,
    utilization_rate: "80%",
    assigned_activities: [
      { activity_id: 1, workload_hours: 16 },
      { activity_id: 2, workload_hours: 32 },
    ],
  },
  {
    name: "Designer 2",
    role: "Designer",
    level: "Senior",
    workload_hours: 48,
    total_working_days: 4,
    utilization_rate: "60%",
    assigned_activities: [{ activity_id: 3, workload_hours: 16 }],
  },
  {
    name: "Software Engineer 1",
    role: "Software Engineer",
    level: "Mid",
    workload_hours: 32,
    total_working_days: 7,
    utilization_rate: "85%",
    assigned_activities: [{ activity_id: 4, workload_hours: 32 }],
  },
];

export type ProjectResultsProps = {
  teamComposition: TeamMember[];
  activities?: Activity[];
  summary?: TeamCompositionSummary;
  isLoading?: boolean;
  onNext: () => void;
  onPrevious: () => void;
};

export function ProjectResults({
  teamComposition = sampleTeamComposition,
  activities = sampleActivities,
  summary,
  isLoading: externalLoading = false,
  onNext,
  onPrevious,
}: ProjectResultsProps) {
  const [internalLoading, setInternalLoading] = useState(true);

  const isLoading = externalLoading || internalLoading;
  const computedSummary = summary || calculateSummary(teamComposition);
  const groupedMembers = groupMembersByRole(teamComposition);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInternalLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0">
            <div className="w-full h-full rounded-full border-4 border-gray-200"></div>

            <div
              className="w-full h-full rounded-full absolute top-0 left-0 
                          border-4 border-transparent border-t-blue-500
                          animate-spin"
            ></div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce text-4xl">🐿️</div>
          </div>
        </div>
        <h3 className="mt-8 text-lg font-medium text-gray-900">
          Processing Results
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Our busy squirrel is crunching the numbers...
        </p>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-8 py-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Recommended Team Composition</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Clear role assignments with specific quantities needed and activity
            allocations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(groupedMembers).map(([role, members]) => (
              <div key={role} className="space-y-4">
                {/* Role Header */}
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {role}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({members.length})
                  </span>
                </div>

                {/* Members in this role */}
                <div className="space-y-4 ml-4">
                  {members.map((member, index) => (
                    <TeamMemberCard
                      key={`${member.name}-${index}`}
                      member={member}
                      activities={activities}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <TeamSizeCard summary={computedSummary} />
            <BudgetTimelineCard summary={computedSummary} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-8 pt-4 border-t">
        <Button variant="outline" onClick={onPrevious} className="px-8">
          Previous
        </Button>
        <Button onClick={onNext} className="px-8 bg-black hover:bg-gray-800">
          Continue
        </Button>
      </div>
    </div>
  );
}
