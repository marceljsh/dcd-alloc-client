import { ProjectRow, StageRow, TaskRow } from "@/types/projects";
import { EmployeeRow } from "@/types/employee";

export const employeeRoleOpt = ["SWE", "DTE", "SLA"] as const;
export const employeeLevelOpt = ["JR", "MID", "SR"] as const;
export const employmentStatusOpt = ["CR", "OR"] as const;
export const projectCategoryOpt = ["SM", "MD", "LG"] as const;
export const projectPriorityOpt = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export type EmployeeRole = (typeof employeeRoleOpt)[number];
export type EmployeeLevel = (typeof employeeLevelOpt)[number];
export type EmploymentStatus = (typeof employmentStatusOpt)[number];
export type ProjectCategory = (typeof projectCategoryOpt)[number];
export type ProjectPriority = (typeof projectPriorityOpt)[number];

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
