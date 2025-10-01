import { EmployeeLevel, EmployeeRole, EmploymentStatus } from "./common"

export interface TeamInfo {
  id   : number
  name : string
}

export interface RawEmployee {
  id     : number
  nip    : string
  name   : string
  email  : string
  role   : string
  level  : string
  team   : TeamInfo
  status : string
}

export interface Employee {
  id     : number
  nip    : string
  name   : string
  email  : string
  role   : EmployeeRole
  level  : EmployeeLevel
  team   : TeamInfo
  status : EmploymentStatus
}

export type EmployeeUtilization = Employee & {
  utilization     : number
  currentProjects : string[]
  hoursThisWeek   : number
};
