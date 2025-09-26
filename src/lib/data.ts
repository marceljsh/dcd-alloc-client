import employeesData from "../data/employees.json"
import projectsData from "../data/projects.json"

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

export interface Project {
  id: number
  code: string
  name: string
  team: string
  category: string
  priority: string
  crew: number
  budgetCode: string
  budget: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export const getEmployees = (): Employee[] => {
  return employeesData as Employee[]
}

export const getProjects = (): Project[] => {
  return projectsData as Project[]
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
