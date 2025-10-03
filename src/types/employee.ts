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
  status: "OR";
}

export interface ContractEmployee extends EmployeeBase {
  status: "CR";
  contractFilePath?: string;
  contractStartDate: string;
  contractEndDate: string | null;
}

export interface Contract {
  startDate: string
  endDate: string
  fileUrl: string
}

export interface EmployeeDetail {
  phoneNumber : string
  address     : string
  joinDate    : string
  contract    : Contract | null
}

export interface RawEmployee {
  id     : number
  nip    : string
  name   : string
  email  : string
  role   : string
  level  : string
  team   : Team
  status : string
}

export interface Employee {
  id     : number
  nip    : string
  name   : string
  email  : string
  role   : EmployeeRole
  level  : EmployeeLevel
  team   : Team
  status : EmploymentStatus
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
