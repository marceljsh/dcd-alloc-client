import {
  EmployeeLevel,
  EmployeeRole,
  Team,
  EmploymentStatus,
} from "@/types/common";

interface EmployeeBase {
  id: number;
  code: string;
  name: string;
  role: EmployeeRole;
  level: EmployeeLevel;
  team: Team;
  status: EmploymentStatus;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermanentEmployee extends EmployeeBase {
  status: "Permanent";
}

export interface ContractEmployee extends EmployeeBase {
  status: "Contract";
  contractFilePath?: string;
  contractStartDate: string;
  contractEndDate: string | null;
}

export type EmployeeRow = PermanentEmployee | ContractEmployee;

export type EmployeeUtilization = EmployeeRow & {
  utilization: number;
  currentProjects: string[];
  hoursThisWeek: number;
};

export function normalizeEmployeeUtilization(raw: any): EmployeeUtilization {
  return {
    ...raw,
    status: raw.status as EmploymentStatus, // fix string
    contractEndDate: raw.contractEndDate ?? null,
    currentProjects: (raw.currentProjects ?? []) as string[],
    utilization: raw.utilization ?? 0,
    hoursThisWeek: raw.hoursThisWeek ?? 0,
  };
}

export type NewEmployee =
  | (Omit<PermanentEmployee, "createdAt" | "updatedAt"> & { status: "Permanent" })
  | (Omit<ContractEmployee, "createdAt" | "updatedAt"> & { status: "Contract" });

export function createEmployeeRow({
  status,
  ...data
}: NewEmployee): EmployeeRow {
  switch (status) {
    case "Permanent":
      return { ...data, status: "Permanent" } as PermanentEmployee;
    case "Contract":
      return {
        ...data,
        status: "Contract",
        contractFilePath: (data as any).contractFilePath ?? "",
        contractStartDate: (data as any).contractStartDate ?? "",
        contractEndDate: (data as any).contractEndDate ?? "",
      } as ContractEmployee;

    default:
      throw new Error("Invalid employee status");
  }
}

export interface Employee {
  id: number;
  name: string;
  role: 'Solution Analyst' | 'Software Engineer' | 'Data Engineer';
}
