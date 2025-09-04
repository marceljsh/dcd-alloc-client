export interface SavedProject {
  id: string
  name: string
  data: ProjectData
  roleLevels: RoleLevel[]
  createdAt: string
  updatedAt: string
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  effortDistribution: {
    backend: number
    frontend: number
    qa: number
  }
  complexity: "Low" | "Medium" | "High"
  buffer: number
  roleLevels: RoleLevel[]
  createdAt: string
}

export interface HistoricalData {
  roleLeverageFactors: Record<string, Record<string, number[]>>
  projectComplexityMultipliers: Record<string, number>
  lastUpdated: string
}

type ProjectData = {
  projectName: string
  startDate: string
  endDate: string
  totalEffort: number
  effortDistribution: {
    backend: number
    frontend: number
    qa: number
  }
  complexity: "Low" | "Medium" | "High"
  buffer: number
}

type RoleLevel = {
  role: string
  level: string
  available: boolean
  leverageFactor: number
}

const STORAGE_KEYS = {
  PROJECTS: "resource-estimator-projects",
  TEMPLATES: "resource-estimator-templates",
  HISTORICAL: "resource-estimator-historical",
}

// Project Management
export const saveProject = (projectData: ProjectData, roleLevels: RoleLevel[]): SavedProject => {
  const projects = getSavedProjects()
  const project: SavedProject = {
    id: crypto.randomUUID(),
    name: projectData.projectName,
    data: projectData,
    roleLevels,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  projects.push(project)
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
  return project
}

export const getSavedProjects = (): SavedProject[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS)
  return stored ? JSON.parse(stored) : []
}

export const deleteProject = (id: string): void => {
  const projects = getSavedProjects().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
}

export const updateProject = (id: string, projectData: ProjectData, roleLevels: RoleLevel[]): void => {
  const projects = getSavedProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index !== -1) {
    projects[index] = {
      ...projects[index],
      data: projectData,
      roleLevels,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
  }
}

// Template Management
export const saveAsTemplate = (
  name: string,
  description: string,
  projectData: ProjectData,
  roleLevels: RoleLevel[],
): ProjectTemplate => {
  const templates = getTemplates()
  const template: ProjectTemplate = {
    id: crypto.randomUUID(),
    name,
    description,
    effortDistribution: projectData.effortDistribution,
    complexity: projectData.complexity,
    buffer: projectData.buffer,
    roleLevels,
    createdAt: new Date().toISOString(),
  }

  templates.push(template)
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
  return template
}

export const getTemplates = (): ProjectTemplate[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
  return stored ? JSON.parse(stored) : getDefaultTemplates()
}

export const deleteTemplate = (id: string): void => {
  const templates = getTemplates().filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
}

// Default Templates
const getDefaultTemplates = (): ProjectTemplate[] => [
  {
    id: "web-app",
    name: "Web Application",
    description: "Standard web application with backend API and frontend",
    effortDistribution: { backend: 60, frontend: 40, qa: 20 },
    complexity: "Medium",
    buffer: 15,
    roleLevels: [
      { role: "Backend", level: "Senior", available: true, leverageFactor: 1.2 },
      { role: "Frontend", level: "Middle", available: true, leverageFactor: 1.0 },
      { role: "QA", level: "Junior", available: true, leverageFactor: 0.8 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "mobile-app",
    name: "Mobile Application",
    description: "Mobile app with API backend",
    effortDistribution: { backend: 40, frontend: 70, qa: 25 },
    complexity: "High",
    buffer: 20,
    roleLevels: [
      { role: "Backend", level: "Middle", available: true, leverageFactor: 1.0 },
      { role: "Frontend", level: "Senior", available: true, leverageFactor: 1.2 },
      { role: "QA", level: "Middle", available: true, leverageFactor: 1.0 },
    ],
    createdAt: new Date().toISOString(),
  },
]

// Historical Data Management
export const updateHistoricalData = (
  role: string,
  level: string,
  leverageFactor: number,
  complexity: string,
  multiplier: number,
): void => {
  const historical = getHistoricalData()

  // Update leverage factors
  if (!historical.roleLeverageFactors[role]) {
    historical.roleLeverageFactors[role] = {}
  }
  if (!historical.roleLeverageFactors[role][level]) {
    historical.roleLeverageFactors[role][level] = []
  }
  historical.roleLeverageFactors[role][level].push(leverageFactor)

  // Keep only last 10 entries per role/level
  if (historical.roleLeverageFactors[role][level].length > 10) {
    historical.roleLeverageFactors[role][level] = historical.roleLeverageFactors[role][level].slice(-10)
  }

  // Update complexity multipliers
  historical.projectComplexityMultipliers[complexity] = multiplier
  historical.lastUpdated = new Date().toISOString()

  localStorage.setItem(STORAGE_KEYS.HISTORICAL, JSON.stringify(historical))
}

export const getHistoricalData = (): HistoricalData => {
  if (typeof window === "undefined") return getDefaultHistoricalData()
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORICAL)
  return stored ? JSON.parse(stored) : getDefaultHistoricalData()
}

const getDefaultHistoricalData = (): HistoricalData => ({
  roleLeverageFactors: {
    Backend: {
      Junior: [0.7, 0.8, 0.8],
      Middle: [0.9, 1.0, 1.1],
      Senior: [1.1, 1.2, 1.3],
    },
    Frontend: {
      Junior: [0.7, 0.8, 0.8],
      Middle: [0.9, 1.0, 1.1],
      Senior: [1.1, 1.2, 1.3],
    },
    QA: {
      Junior: [0.7, 0.8, 0.8],
      Middle: [0.9, 1.0, 1.1],
      Senior: [1.1, 1.2, 1.3],
    },
  },
  projectComplexityMultipliers: {
    Low: 0.8,
    Medium: 1.0,
    High: 1.3,
  },
  lastUpdated: new Date().toISOString(),
})

// Smart Suggestions
export const getSuggestedLeverageFactor = (role: string, level: string): number => {
  const historical = getHistoricalData()
  const factors = historical.roleLeverageFactors[role]?.[level] || []

  if (factors.length === 0) {
    // Default values
    const defaults: Record<string, number> = { Junior: 0.8, Middle: 1.0, Senior: 1.2 }
    return defaults[level] || 1.0
  }

  // Return average of historical data
  return factors.reduce((sum, factor) => sum + factor, 0) / factors.length
}

export interface ResultCSV {
  role: string
  level: string
  headcount?: number
  requiredHeadcount?: number
  effectiveHours?: number
  effortRequired?: number
  availableHours?: number
  utilization?: number
  status?: string
}

export const exportToCSV = (results: ResultCSV[], projectData: ProjectData): string => {
  const headers = ["Role", "Level", "Headcount", "Required Hours", "Available Hours", "Utilization %", "Status"]

  const rows = results.map((result) => [
    result.role,
    result.level,
    result.headcount || result.requiredHeadcount || 0,
    result.effectiveHours || result.effortRequired || 0,
    result.availableHours ?? "N/A",
    result.utilization ?? "N/A",
    result.status ?? "N/A",
  ])

  const csvContent = [
    `Project: ${projectData.projectName}`,
    `Duration: ${projectData.startDate} to ${projectData.endDate}`,
    `Total Effort: ${projectData.totalEffort} hours`,
    `Complexity: ${projectData.complexity}`,
    `Buffer: ${projectData.buffer}%`,
    "",
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  return csvContent
}


export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
