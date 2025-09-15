import { ProjectRow, StageRow, TaskRow } from "@/types/projects";
import { EmployeeRow } from "@/types/employee";

export const employeeRoles = [
  "Software Engineer",
  "Data Engineer",
  "System Analyst",
] as const;
export const employeeLevels = ["Junior", "Middle", "Senior"] as const;
export const employmentStatuses = ["Contract", "Permanent"] as const;
export const projectCategories = ["Small", "Medium", "Big"] as const;
export const projectPriorities = ["Low", "Medium", "High", "Critical"] as const;
export const teams = ["DMA", "NCM", "CRM", "CM", "FRM", "RRM"] as const;

export type EmployeeRole = (typeof employeeRoles)[number];
export type EmployeeLevel = (typeof employeeLevels)[number];
export type EmploymentStatus = (typeof employmentStatuses)[number];
export type ProjectCategory = (typeof projectCategories)[number];
export type ProjectPriority = (typeof projectPriorities)[number];
export type Team = (typeof teams)[number];

export interface DateRange {
  label: string;
  start: Date;
  end: Date;
}

export interface TaskAssignmentRow {
  taskId: string;
  employeeId: string;
}

export interface TaskWithAssignee extends TaskRow {
  assignees: EmployeeRow[];
  stage: StageRow;
  project: ProjectRow;
}

export interface StageWithTasks extends StageRow {
  tasks: TaskWithAssignee[];
}

export interface ProjectWithStages extends ProjectRow {
  stages: StageWithTasks[];
}
