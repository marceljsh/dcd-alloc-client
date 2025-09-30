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
  contractEndDate: string;
}

export type EmployeeRow = PermanentEmployee | ContractEmployee;

export type EmployeeUtilization = EmployeeRow & {
  utilization: number;
  currentProjects: string[];
  hoursThisWeek: number;
};


export function createEmployeeRow({
  status,
  ...data
}: NewEmployee): EmployeeRow {
  switch (status) {
    case "Permanent":
      return { ...data } as PermanentEmployee;
    case "Contract":
      return {
        ...data,
        contractFilePath: data.contractFilePath ?? "",
        contractStartDate: data.contractStartDate ?? "",
        contractEndDate: data.contractEndDate ?? "",
      } as ContractEmployee;

    default:
      throw new Error("Invalid employee status");
  }
}

export interface Employee {
  id: number;
  name: string;
  role: "System Analyst" | "Software Engineer" | "Data Engineer";
}
