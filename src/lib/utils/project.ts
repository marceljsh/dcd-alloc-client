import { TeamMember } from "@/types/projects";

export const groupMembersByRole = (teamMembers: TeamMember[]) => {
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];

  return safeTeamMembers.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = [];
    }
    acc[member.role].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);
};
