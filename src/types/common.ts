import { ProjectRow, StageRow, TaskRow } from "@/types/project";
import { EmployeeRow } from "@/types/employee";

export const ROLE_OPTIONS = ['Software Engineer', 'Data Engineer', 'System Analyst'] as const;
export const ROLE_LEVEL_OPTIONS = ['Junior', 'Middle', 'Senior'] as const;
export const EMPLOYMENT_STATUS_OPTIONS = ['Contract', 'Permanent'] as const;
export const PROJECT_CATEGORY_OPTIONS = ['Small', 'Medium', 'Big'] as const;
export const PROJECT_PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const;
export const TEAM_OPTIONS = ['DMA', 'NCM', 'CRM', 'CM', 'FRM', 'RRM'] as const;

export type Role = typeof ROLE_OPTIONS[number];
export type RoleLevel = typeof ROLE_LEVEL_OPTIONS[number];
export type EmploymentStatus = typeof EMPLOYMENT_STATUS_OPTIONS[number];
export type ProjectCategory = typeof PROJECT_CATEGORY_OPTIONS[number];
export type ProjectPriority = typeof PROJECT_PRIORITY_OPTIONS[number];
export type Team = typeof TEAM_OPTIONS[number];

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
