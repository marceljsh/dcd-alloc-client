import { EmployeeLevel, EmployeeRole, EmploymentStatus } from "@/types/common"
import { Employee, RawEmployee } from "@/types/employee"

export function mapRawToEmployee(raw: RawEmployee): Employee {
  return {
    ...raw,
    role   : raw.role as EmployeeRole,
    level  : raw.level as EmployeeLevel,
    status : raw.status as EmploymentStatus,
  }
}
