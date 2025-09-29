import { Activity, TeamMember } from "@/types/projects";

export type RiskItem = {
  activity: string;
  dateRange: string;
  issue: string;
  severity: "high" | "medium" | "low";
  recommendation: string;
  riskType: "availability" | "capacity" | "planning";
};

const mockResourceRisks: RiskItem[] = [
  {
    activity: "Wireframing",
    dateRange: "Nov 1-3, 2024",
    issue: "No resource available on Nov 2",
    severity: "high",
    recommendation: "Adjust the timeline to start after Nov 3",
    riskType: "availability",
  },
  {
    activity: "Development",
    dateRange: "Nov 9-15, 2024",
    issue:
      "High workload: 1 FTE required, but only 0.5 FTE available from Nov 12–14",
    severity: "medium",
    recommendation: "Extend the timeline and adjust the project FTE to 0.5",
    riskType: "capacity",
  },
];

export const analyzeResourceRisks = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _teamMembers: TeamMember[], // Will be used when calling backend API
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _activities: Activity[], // Will be used when calling backend API
): RiskItem[] => {
  // In real implementation, this would call backend API with teamMembers and activities
  // For now, returning mock data
  return mockResourceRisks;
};
