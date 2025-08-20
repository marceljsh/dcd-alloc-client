import { Employee } from "@/types/employee";
import { ProjectPriority, ProjectCategory, Team } from "@/types/common";

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
  ordinal: number;  // ordering within project
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
}

export interface ProjectStage {
  id: string;
  label: string;
}

export type ProjectData = Record<string, Task[]>;
