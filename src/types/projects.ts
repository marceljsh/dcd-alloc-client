import { Employee } from "@/types/employee";
import { ProjectPriority, ProjectCategory, Team } from "@/types/common";
import { EnumValues } from "zod/v3";

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

export type ProjectDraft = {
  name: string;
  team: Team;
  category: ProjectCategory;
  priority: ProjectPriority;
  budget: number;
  startDate: string;
  endDate: string;
  stages: string[];
};

export interface ProjectStage {
  id: string;
  label: string;
}

export type ProjectData = Record<string, Task[]>;

export interface ProjectActivity {
  id: number;
  activity: string;
  startDate: string;
  endDate: string;
  duration: number;
  fte: number;
  role: "SA" | "SE" | "DE" | "" | undefined;
  subActivities?: ProjectSubActivity[];
}

export interface ProjectSubActivity {
  id: number;
  parentId: number;
  activity: string;
  startDate: string;
  endDate: string;
  duration: number;
  fte: number;
  role: "SA" | "SE" | "DE" | "";
}

export type EntityType = "activity" | "subactivity";
export type ModeType = "Add" | "Edit";

export type ActivityAction =
  | { type: "add-sub"; parent: ProjectActivity }
  | { type: "edit-activity"; activity: ProjectActivity }
  | { type: "delete-activity"; id: number }
  | { type: "edit-sub"; sub: ProjectSubActivity; parent: ProjectActivity }
  | { type: "delete-sub"; activityId: number; subId: number };

export function createAction<T extends ActivityAction>(action: T): T {
  return action;
}
