"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import {
  TeamCompositionSummary,
  TeamMember,
  ProjectResultsProps,
} from "@/types/projects";
import BudgetTimelineCard from "./BudgetTimelineCard";
import TeamMemberCard from "./TeamMemberCard";
import TeamSizeCard from "./TeamSizeCard";
import { groupMembersByRole } from "@/lib/utils/project";
import { getSalary } from "@/data/salary";
import { useProject } from "@/hooks/projects/use-project";

const calculateSummary = (
  teamMembers: TeamMember[],
  projectDurationDays: number
): TeamCompositionSummary => {
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];
  console.log("Calculating summary for team members:", safeTeamMembers);

  const roleCounts = safeTeamMembers.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // montlhy cost calculation
  let totalBudget = safeTeamMembers.reduce((sum, member) => {
    // Assuming each member has a 'selectedLevel' property
    const level = member.selectedLevel || member.level[0];
    const salary = getSalary(member.role, level);
    return sum + salary;
  }, 0);

  totalBudget = Math.round(totalBudget * Math.ceil(projectDurationDays / 30));

  return {
    total_team_size: safeTeamMembers.length,
    role_counts: roleCounts,
    total_budget: totalBudget,
    total_workload: safeTeamMembers.reduce(
      (sum, member) => sum + member.workload_hours,
      0
    ),
    project_duration_days: projectDurationDays,
  };
};

export function ProjectResults({
  teamComposition,
  summary,
  isLoading: externalLoading = false,
  projectDurationDays = 30,
  onNext,
  onPrevious,
  onUpdateTeamComposition,
}: ProjectResultsProps) {
  const [internalLoading, setInternalLoading] = useState(true);
  const [membersWithLevels, setMembersWithLevels] =
    useState<TeamMember[]>(teamComposition);

  const { projectDetails } = useProject();

  const isLoading = externalLoading || internalLoading;

  const computedSummary =
    summary || calculateSummary(membersWithLevels, projectDurationDays);
  const groupedMembers = groupMembersByRole(membersWithLevels);

  const handleLevelSelect = (memberName: string, selectedLevel: string) => {
    setMembersWithLevels((prev) =>
      prev.map((member) =>
        member.name === memberName ? { ...member, selectedLevel } : member
      )
    );
    onUpdateTeamComposition(
      membersWithLevels.map((member) =>
        member.name === memberName ? { ...member, selectedLevel } : member
      )
    );
  };

  useEffect(() => {
    setMembersWithLevels(teamComposition);
  }, [teamComposition]);

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
            <span className="text-xl">Recommended Team Composition</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.keys(groupedMembers).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No team composition data available.</p>
                <p className="text-sm mt-2">
                  Please check the API response and try again.
                </p>
              </div>
            ) : (
              Object.entries(groupedMembers).map(([role, members]) => (
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
                        onLevelSelect={handleLevelSelect}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <TeamSizeCard summary={computedSummary} />
            <BudgetTimelineCard
              summary={computedSummary}
              maxBudget={projectDetails.budget}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mt-8 pt-4 border-t">
        <Button variant="outline" onClick={onPrevious} className="px-8">
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button onClick={onNext} className="px-8 bg-black hover:bg-gray-800">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
