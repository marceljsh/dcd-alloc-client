import { Employee } from "@/types/employee";
import { ProjectPriority, ProjectCategory, Team } from "@/types/common";

export interface RawProject {
  id: number
  code: string
  name: string
  team: Team
  category: string
  priority: string
  crew: number
  budgetCode: string
  budget: number
  startDate: string
  endDate: string
}

export interface Project extends RawProject {
  category: ProjectCategory
  priority: ProjectPriority
  activities: ProjectActivity[]
}

export interface ProjectRow {
  id: number;
  code: string;
  name: string;
  team: Team;
  category: ProjectCategory;
  priority: ProjectPriority;
  crew: number;
  budgetCode: string;
  budget: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // optional for soft delete
}

export interface StageRow {
  id: number;
  projectId: number;
  name: string;
  ordinal: number; // ordering within project
  createdAt: string;
  updatedAt: string;
}

export interface TaskRow {
  id: number;
  stageId: number;
  name: string;
  startDate: string;
  endDate: string;
  storyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  storyPoints: number;
  assignedEmployees: Employee[];
}

export interface ProjectStage {
  id: string;
  label: string;
}

export type ProjectData = Record<string, Task[]>;

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
  role: Role;
}

export type Role = "SA" | "SE" | "DE";

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

type Level = "Junior" | "Middle" | "Senior";

export type TeamMember = {
  name: string;
  role: Role;
  level: Level[];
  selectedLevel?: Level;
  workload_hours: number;
  total_working_days: number;
  utilization_rate: string;
  assignee_id: string;
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
  projectDurationDays?: number;
  onNext: () => void;
  onPrevious: () => void;
  onUpdateTeamComposition: (updatedComposition: TeamMember[]) => void;
};

export type ProjectDraftResponse = {
  message: string;
  status: boolean;
  data: ProjectDraft;
};

export type ProjectDraft = {
  id: number;
  name: string;
  team: Team;
  category: ProjectCategory;
  priority: ProjectPriority;
  budget: number;
  startDate: string;
  endDate: string;
  activities: ProjectActivity[];
};
