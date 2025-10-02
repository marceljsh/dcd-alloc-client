import employeesData from "../data/employees.json"

export interface Employee {
  utilization: number
  id: number
  code: string
  name: string
  role: string
  level: string
  team: string
  status: string
  email: string
  phone: string
  location: string
  joinDate: string
  createdAt: string
  updatedAt: string
  contractStartDate: string | null
  contractEndDate: string | null
}

export const getEmployees = (): Employee[] => {
  return employeesData as Employee[]
}

// Future: Replace with actual database calls
// export const getEmployees = async (): Promise<Employee[]> => {
//   const response = await fetch('/api/employees')
//   return response.json()
// }

// export const getProjects = async (): Promise<Project[]> => {
//   const response = await fetch('/api/projects')
//   return response.json()
// }
