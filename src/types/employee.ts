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

    case "Contract": {
      const contractData = data as Extract<NewEmployee, { status: "Contract" }>;
      return {
        ...contractData,
        status: "Contract",
        contractFilePath: contractData.contractFilePath ?? "",
        contractStartDate: contractData.contractStartDate ?? "",
        contractEndDate: contractData.contractEndDate ?? "",
      } as ContractEmployee;
    }

    default:
      throw new Error("Invalid employee status");
  }
}

export interface Employee {
  id: number;
  name: string;
  role: 'Solution Analyst' | 'Software Engineer' | 'Data Engineer';
}
