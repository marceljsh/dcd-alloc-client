import { Employee, TeamInfo } from "@/types/employee";
import { ProjectCategory, ProjectPriority } from "./common";

export interface Project {
  id: number
  code: string
  name: string
  team: TeamInfo
  category: ProjectCategory
  priority: ProjectPriority
  totalCrew: number
  budgetCode: string
  budget: number
  startDate: Date
  endDate: Date
}

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  storyPoints: number;
  assignedEmployees: Employee[];
}

export interface ProjectActivity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  workload: number;
  subActivities?: ProjectSubActivity[];
}

export interface ProjectSubActivity {
  id: string;
  parentId: string;
  name: string;
  startDate: string;
  endDate: string;
  workload: number;
  fte: number;
  minimumLevel: "junior" | "middle" | "senior";
  role: "SA" | "SE" | "DE";
}

export type EntityType = "activity" | "subactivity";
export type ModeType = "Add" | "Edit";

export type ActivityAction =
  | { type: "add-sub"; parent: ProjectActivity }
  | { type: "edit-activity"; activity: ProjectActivity }
  | { type: "delete-activity"; id: string }
  | { type: "edit-sub"; sub: ProjectSubActivity; parent: ProjectActivity }
  | { type: "delete-sub"; activityId: string; subId: string };

export function createAction<T extends ActivityAction>(action: T): T {
  return action;
}

export type TeamCompositionSummary = {
  total_team_size: number;
  role_counts: Record<string, number>;
  total_budget: number;
  total_workload: number;
  project_duration_days: number;
};

export type TeamMember = {
  name: string;
  role: string;
  level: string;
  workload_hours: number;
  total_working_days: number;
  utilization_rate: string;
  assigned_activities: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    workload: number;
    fte: number;
    role: string;
    minimum_level: string;
  }[];
};

export type Activity = {
  id: number;
  name: string;
  date_range: string;
};

export type ProjectResultsProps = {
  teamComposition: TeamMember[];
  activities?: Activity[];
  summary?: TeamCompositionSummary;
  isLoading?: boolean;
  onNext: () => void;
  onPrevious: () => void;
};
