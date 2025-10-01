import { EmployeeLevel, EmployeeRole, EmploymentStatus } from "@/types/common";
import { Employee, EmployeeDetail, RawEmployee, RawEmployeeDetails } from "@/types/employee";

export function mapRawToEmployee(raw: RawEmployee): Employee {
  return {
    ...raw,
    role   : raw.role as EmployeeRole,
    level  : raw.level as EmployeeLevel,
    status : raw.status as EmploymentStatus,
  }
}

export function mapRawToEmployeeDetails(raw: RawEmployeeDetails): EmployeeDetail {
  return {
    ...raw,
    role : raw.role as EmployeeRole,
  }
}
