"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  ArrowDown,
  ArrowUp,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  Target,
} from "lucide-react"

const allProjects = [
  {
    project: "Project Alpha",
    req: 12,
    alloc: 10.5,
    util: 87.5,
    category: "Medium",
    role: "System Analyst",
    budget: 150000,
    actual: 145000,
  },
  {
    project: "Project Beta",
    req: 8.5,
    alloc: 9,
    util: 105.9,
    category: "Big",
    role: "Software Engineer",
    budget: 200000,
    actual: 210000,
  },
  {
    project: "Project Gamma",
    req: 15,
    alloc: 14,
    util: 63.3,
    category: "Medium",
    role: "Data Engineer",
    budget: 175000,
    actual: 160000,
  },
  {
    project: "Project Delta",
    req: 6,
    alloc: 5,
    util: 83.3,
    category: "Small",
    role: "System Analyst",
    budget: 75000,
    actual: 72000,
  },
  {
    project: "Project Epsilon",
    req: 10,
    alloc: 10,
    util: 100,
    category: "Small",
    role: "Software Engineer",
    budget: 100000,
    actual: 100000,
  },
  {
    project: "Project Zeta",
    req: 25,
    alloc: 22.5,
    util: 90.0,
    category: "Big",
    role: "Software Engineer",
    budget: 300000,
    actual: 290000,
  },
  {
    project: "Project Eta",
    req: 7,
    alloc: 7.5,
    util: 107.1,
    category: "Small",
    role: "System Analyst",
    budget: 80000,
    actual: 85000,
  },
  {
    project: "Project Theta",
    req: 18,
    alloc: 16.2,
    util: 90.0,
    category: "Big",
    role: "Software Engineer",
    budget: 220000,
    actual: 210000,
  },
  {
    project: "Project Iota",
    req: 11.5,
    alloc: 11.5,
    util: 100.0,
    category: "Medium",
    role: "Data Engineer",
    budget: 130000,
    actual: 130000,
  },
  {
    project: "Project Kappa",
    req: 4.5,
    alloc: 3.5,
    util: 77.8,
    category: "Small",
    role: "System Analyst",
    budget: 50000,
    actual: 48000,
  },
  {
    project: "Project Lambda",
    req: 9,
    alloc: 9.5,
    util: 105.6,
    category: "Medium",
    role: "Software Engineer",
    budget: 110000,
    actual: 115000,
  },
  {
    project: "Project Mu",
    req: 30,
    alloc: 28,
    util: 93.3,
    category: "Big",
    role: "System Analyst",
    budget: 350000,
    actual: 340000,
  },
  {
    project: "Project Nu",
    req: 5.5,
    alloc: 5,
    util: 90.9,
    category: "Small",
    role: "Data Engineer",
    budget: 60000,
    actual: 58000,
  },
  {
    project: "Project Xi",
    req: 17,
    alloc: 17.5,
    util: 102.9,
    category: "Big",
    role: "Software Engineer",
    budget: 210000,
    actual: 215000,
  },
  {
    project: "Project Omicron",
    req: 20,
    alloc: 18,
    util: 90.0,
    category: "Big",
    role: "Data Engineer",
    budget: 250000,
    actual: 240000,
  },
  {
    project: "Project Pi",
    req: 8,
    alloc: 6,
    util: 75.0,
    category: "Small",
    role: "System Analyst",
    budget: 90000,
    actual: 85000,
  },
  {
    project: "Project Rho",
    req: 13,
    alloc: 12.5,
    util: 96.2,
    category: "Medium",
    role: "Software Engineer",
    budget: 160000,
    actual: 158000,
  },
  {
    project: "Project Sigma",
    req: 22,
    alloc: 20,
    util: 90.9,
    category: "Big",
    role: "Data Engineer",
    budget: 280000,
    actual: 275000,
  },
  {
    project: "Project Tau",
    req: 6.5,
    alloc: 7,
    util: 107.7,
    category: "Small",
    role: "System Analyst",
    budget: 70000,
    actual: 75000,
  },
  {
    project: "Project Upsilon",
    req: 14,
    alloc: 13,
    util: 92.9,
    category: "Medium",
    role: "Data Engineer",
    budget: 180000,
    actual: 178000,
  },
  {
    project: "Project Phi",
    req: 19,
    alloc: 19.5,
    util: 102.6,
    category: "Big",
    role: "Software Engineer",
    budget: 240000,
    actual: 245000,
  },
  {
    project: "Project Chi",
    req: 16,
    alloc: 15,
    util: 93.8,
    category: "Medium",
    role: "System Analyst",
    budget: 200000,
    actual: 195000,
  },
  {
    project: "Project Psi",
    req: 10.5,
    alloc: 10,
    util: 95.2,
    category: "Medium",
    role: "Data Engineer",
    budget: 120000,
    actual: 118000,
  },
  {
    project: "Project Omega",
    req: 28,
    alloc: 25,
    util: 89.3,
    category: "Big",
    role: "Software Engineer",
    budget: 320000,
    actual: 310000,
  },
]

const roleUtilizationAll = [
  { role: "System Analyst", Allocated: 92, Idle: 8, Overload: 0 },
  { role: "Data Engineer", Allocated: 78, Idle: 22, Overload: 0 },
  { role: "Software Engineer", Allocated: 105, Idle: 0, Overload: 5 },
]

const productivityTrendAll = [
  { month: "Jan", "Software Engineer": 90, "Data Engineer": 60, "System Analyst": 70 },
  { month: "Feb", "Software Engineer": 20, "Data Engineer": 40, "System Analyst": 60 },
  { month: "Mar", "Software Engineer": 70, "Data Engineer": 25, "System Analyst": 80 },
  { month: "Apr", "Software Engineer": 80, "Data Engineer": 30, "System Analyst": 85 },
  { month: "May", "Software Engineer": 60, "Data Engineer": 40, "System Analyst": 90 },
  { month: "Jun", "Software Engineer": 85, "Data Engineer": 45, "System Analyst": 95 },
  { month: "Jul", "Software Engineer": 95, "Data Engineer": 55, "System Analyst": 100 },
  { month: "Aug", "Software Engineer": 70, "Data Engineer": 40, "System Analyst": 85 },
  { month: "Sep", "Software Engineer": 75, "Data Engineer": 50, "System Analyst": 88 },
  { month: "Oct", "Software Engineer": 90, "Data Engineer": 55, "System Analyst": 95 },
  { month: "Nov", "Software Engineer": 92, "Data Engineer": 60, "System Analyst": 96 },
  { month: "Dec", "Software Engineer": 85, "Data Engineer": 65, "System Analyst": 90 },
]

interface CategoryColorMap {
  [key: string]: string
}

type Category = "Small" | "Medium" | "Big"

const getCategoryColor = (category: Category | string): string => {
  const colorMap: CategoryColorMap = {
    Small: "bg-blue-100 text-blue-800",
    Medium: "bg-green-100 text-green-800",
    Big: "bg-yellow-100 text-yellow-800",
  }
  return colorMap[category] || "bg-gray-100 text-gray-800"
}

const generateDaysInMonth = (monthName: string, year: number) => {
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return {
      date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayLabel: `${day}`,
      "Software Engineer": Math.floor(Math.random() * 100), // contoh dummy
      "Data Engineer": Math.floor(Math.random() * 100),
      "System Analyst": Math.floor(Math.random() * 100),
    }
  })
}

function ProjectTable({ filteredProjects }: { filteredProjects: typeof allProjects }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: keyof (typeof allProjects)[0]; direction: "asc" | "desc" }>({
    key: "project",
    direction: "asc",
  })

  const itemsPerPage = 7
  const handleSort = (key: keyof (typeof allProjects)[0]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const filteredAndSortedProjects = useMemo(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }
      return 0
    })
    return sorted
  }, [filteredProjects, sortConfig])

  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentData = filteredAndSortedProjects.slice(startIndex, startIndex + itemsPerPage)

  const getSortIcon = (key: keyof (typeof allProjects)[0]) => {
    if (sortConfig.key !== key) return null
    if (sortConfig.direction === "asc") {
      return <ArrowDown className="w-3 h-3 ml-1 inline-block" />
    }
    return <ArrowUp className="w-3 h-3 ml-1 inline-block" />
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left">
            <tr>
              <th className="p-2 cursor-pointer" onClick={() => handleSort("project")}>
                Project {getSortIcon("project")}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort("req")}>
                Required FTE {getSortIcon("req")}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort("alloc")}>
                Allocated FTE {getSortIcon("alloc")}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort("util")}>
                Utilization % {getSortIcon("util")}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort("category")}>
                Category {getSortIcon("category")}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort("budget")}>
                Budget {getSortIcon("budget")}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort("actual")}>
                Actual Cost {getSortIcon("actual")}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{row.project}</td>
                <td className="p-2">{row.req}</td>
                <td className="p-2">{row.alloc}</td>
                <td className={`p-2 ${row.util > 100 ? "text-red-600" : "text-green-600"}`}>{row.util.toFixed(1)}%</td>
                <td className="p-2">{row.category}</td>
                <td className="p-2">${row.budget.toLocaleString()}</td>
                <td className={`p-2 ${row.actual > row.budget ? "text-red-600" : "text-green-600"}`}>
                  ${row.actual.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-1">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 border rounded disabled:opacity-50 text-xs"
        >
          Previous
        </button>
        <div className="flex gap-2 mb-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-2 py-1 border rounded text-xs ${currentPage === i + 1 ? "bg-primary text-white" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 text-xs"
        >
          Next
        </button>
      </div>
    </>
  )
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function DashboardPage() {
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<{ value: string; label: string }[]>([])
  const [selectedProjects, setSelectedProjects] = useState<{ value: string; label: string }[]>([])

  // Base filtering by role and project
  const projectsFilteredByRoleAndProject = useMemo(() => {
    let data = allProjects
    if (selectedRoles.length > 0) {
      const roles = selectedRoles.map((r) => r.value)
      data = data.filter((p) => roles.includes(p.role))
    }
    if (selectedProjects.length > 0) {
      const projects = selectedProjects.map((p) => p.value)
      data = data.filter((p) => projects.includes(p.project))
    }
    return data
  }, [selectedRoles, selectedProjects])

  // Apply period-based adjustments on top of base filters
  const filteredProjects = useMemo(() => {
    if (selectedPeriods.length !== 1) {
      return projectsFilteredByRoleAndProject
    }

    const selectedMonth = selectedPeriods[0]
    const monthData = productivityTrendAll.find((d) => d.month === selectedMonth)

    if (!monthData) {
      return projectsFilteredByRoleAndProject
    }

    const productivityFactors: { [key: string]: number } = {
      "Software Engineer": (monthData["Software Engineer"] || 100) / 100,
      "Data Engineer": (monthData["Data Engineer"] || 100) / 100,
      "System Analyst": (monthData["System Analyst"] || 100) / 100,
    }

    return projectsFilteredByRoleAndProject.map((p) => {
      const factor = productivityFactors[p.role] ?? 1
      const newAlloc = p.alloc * factor
      const newUtil = p.req > 0 ? (newAlloc / p.req) * 100 : 0
      const newActual = p.actual * factor

      return {
        ...p,
        alloc: Number.parseFloat(newAlloc.toFixed(1)),
        util: Number.parseFloat(newUtil.toFixed(1)),
        actual: Number.parseFloat(newActual.toFixed(0)),
      }
    })
  }, [projectsFilteredByRoleAndProject, selectedPeriods])

  const filteredRoleUtilization = useMemo(() => {
    if (selectedRoles.length === 0 && selectedProjects.length === 0 && selectedPeriods.length === 0) {
      return roleUtilizationAll
    }
    if (filteredProjects.length === 0) {
      return []
    }

    const aggregatedData = filteredProjects.reduce(
      (acc, project) => {
        const role = project.role
        if (!acc[role]) {
          acc[role] = { role, totalReq: 0, totalAlloc: 0 }
        }
        acc[role].totalReq += project.req
        acc[role].totalAlloc += project.alloc
        return acc
      },
      {} as Record<string, { role: string; totalReq: number; totalAlloc: number }>,
    )

    return Object.values(aggregatedData).map((data) => {
      const totalUtilization = data.totalReq > 0 ? (data.totalAlloc / data.totalReq) * 100 : 0
      return {
        role: data.role,
        Allocated: Math.min(100, totalUtilization),
        Idle: Math.max(0, 100 - totalUtilization),
        Overload: Math.max(0, totalUtilization - 100),
      }
    })
  }, [filteredProjects, selectedRoles, selectedProjects, selectedPeriods])

  const processedTrend = useMemo(() => {
    let data
    if (selectedPeriods.length === 0) {
      data = productivityTrendAll
    } else if (selectedPeriods.length === 1) {
      data = generateDaysInMonth(selectedPeriods[0], 2025)
    } else {
      data = productivityTrendAll.filter((d) => selectedPeriods.includes(d.month))
    }

    const rolesToDisplay =
      selectedRoles.length > 0
        ? selectedRoles.map((r) => r.value)
        : ["Software Engineer", "Data Engineer", "System Analyst"]

    const rolesFromProjects =
      selectedProjects.length > 0
        ? Array.from(
            new Set(
              allProjects.filter((p) => selectedProjects.map((sp) => sp.value).includes(p.project)).map((p) => p.role),
            ),
          )
        : []

    const finalRoles = rolesFromProjects.length > 0 ? rolesFromProjects : rolesToDisplay

    const filteredData = data.map((entry) => {
      const newEntry: any = { ...entry }
      Object.keys(newEntry).forEach((key) => {
        if (key !== "month" && key !== "dayLabel" && key !== "date" && !finalRoles.includes(key)) {
          delete newEntry[key]
        }
      })
      return newEntry
    })

    return filteredData
  }, [selectedPeriods, selectedRoles, selectedProjects])

  const getAreaKeys = useMemo(() => {
    const roles =
      selectedRoles.length > 0
        ? selectedRoles.map((r) => r.value)
        : ["Software Engineer", "Data Engineer", "System Analyst"]
    const projectRoles = selectedProjects.length > 0 ? Array.from(new Set(filteredProjects.map((p) => p.role))) : roles
    return projectRoles
  }, [selectedRoles, selectedProjects, filteredProjects])

  const summary = useMemo(() => {
    const totalProjects = filteredProjects.length
    const totalResources = filteredProjects.reduce((sum, p) => sum + p.alloc, 0).toFixed(1)

    const roles = Array.from(new Set(filteredProjects.map((p) => p.role)))
    const utilizationByRole = roles.map((role) => {
      const roleProjects = filteredProjects.filter((p) => p.role === role)
      const avgUtil = roleProjects.reduce((sum, p) => sum + p.util, 0) / (roleProjects.length || 1)
      return { role, util: avgUtil }
    })

    const avgUtil = filteredProjects.reduce((sum, p) => sum + p.util, 0) / (filteredProjects.length || 1)

    const criticalProjects = filteredProjects.filter((p) => p.util > 100).sort((a, b) => b.util - a.util)

    const projectCategories = filteredProjects.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const overBudgetProjects = filteredProjects
      .filter((p) => p.actual > p.budget)
      .sort((a, b) => b.actual - b.budget - (a.actual - a.budget))

    return [
      {
        title: "Total Resources (FTE)",
        value: totalResources,
        desc: roles.map((role) => ({
          label: role,
          value: filteredProjects
            .filter((p) => p.role === role)
            .reduce((sum, p) => sum + p.alloc, 0)
            .toFixed(1),
        })),
      },
      {
        title: "Utilization %",
        value: `${(avgUtil || 0).toFixed(0)}%`,
        color: avgUtil > 100 ? "text-red-600" : "text-green-600",
        desc: utilizationByRole.map((r) => ({
          label: r.role,
          value: `${(r.util || 0).toFixed(0)}%`,
          color: r.util > 100 ? "text-red-600" : r.util < 80 ? "text-yellow-600" : "text-green-600",
        })),
      },
      {
        title: "Critical Projects",
        value: criticalProjects.length,
        color: "text-red-600",
        desc: criticalProjects.slice(0, 3).map((p) => ({
          label: p.project,
          value: `${p.util.toFixed(1)}%`,
          color: "text-red-600",
        })),
      },
      {
        title: "Over-budget Projects",
        value: overBudgetProjects.length,
        color: overBudgetProjects.length > 0 ? "text-red-600" : "",
        desc: overBudgetProjects.slice(0, 3).map((p) => ({
          label: p.project,
          value: `+ $${(p.actual - p.budget).toLocaleString()}`,
          color: "text-red-600",
        })),
      },
      {
        title: "Project Category",
        value: `${totalProjects} Projects`,
        desc: [
          { label: "Big", value: projectCategories["Big"] || 0 },
          { label: "Medium", value: projectCategories["Medium"] || 0 },
          { label: "Small", value: projectCategories["Small"] || 0 },
        ],
      },
    ]
  }, [filteredProjects])

  const enhancedMetrics = useMemo(() => {
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0)
    const totalActual = filteredProjects.reduce((sum, p) => sum + p.actual, 0)
    const budgetVariance = ((totalActual - totalBudget) / totalBudget) * 100

    const categoryDistribution = filteredProjects.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const roleDistribution = filteredProjects.reduce(
      (acc, p) => {
        acc[p.role] = (acc[p.role] || 0) + p.alloc
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalBudget,
      totalActual,
      budgetVariance,
      categoryDistribution: Object.entries(categoryDistribution).map(([name, value]) => ({ name, value })),
      roleDistribution: Object.entries(roleDistribution).map(([name, value]) => ({
        name,
        value: Number.parseFloat(value.toFixed(1)),
      })),
    }
  }, [filteredProjects])

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Allocation Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor project resources, utilization, and budget performance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 bg-foreground text-background">
                <Filter className="h-4 w-4" />
                Period ({selectedPeriods.length > 0 ? selectedPeriods.join(", ") : "All"})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedPeriods.length === 0}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => setSelectedPeriods([])}
              >
                All Periods
              </DropdownMenuCheckboxItem>
              {productivityTrendAll.map((d) => {
                const isChecked = selectedPeriods.includes(d.month)
                return (
                  <DropdownMenuCheckboxItem
                    key={d.month}
                    checked={isChecked}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) =>
                      setSelectedPeriods(
                        checked ? [...selectedPeriods, d.month] : selectedPeriods.filter((m) => m !== d.month),
                      )
                    }
                  >
                    {d.month}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 bg-foreground text-background">
                <Filter className="h-4 w-4" />
                Role ({selectedRoles.length || "All"})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roleUtilizationAll.map((r) => {
                const roleObj = { value: r.role, label: r.role }
                const isChecked = selectedRoles.some((role) => role.value === r.role)
                return (
                  <DropdownMenuCheckboxItem
                    key={r.role}
                    checked={isChecked}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) =>
                      setSelectedRoles(
                        checked ? [...selectedRoles, roleObj] : selectedRoles.filter((role) => role.value !== r.role),
                      )
                    }
                  >
                    {r.role}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 bg-foreground text-background">
                <Filter className="h-4 w-4" />
                Project ({selectedProjects.length || "All"})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allProjects.map((p) => {
                const projectObj = { value: p.project, label: p.project }
                const isChecked = selectedProjects.some((proj) => proj.value === p.project)
                return (
                  <DropdownMenuCheckboxItem
                    key={p.project}
                    checked={isChecked}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) =>
                      setSelectedProjects(
                        checked
                          ? [...selectedProjects, projectObj]
                          : selectedProjects.filter((proj) => proj.value !== p.project),
                      )
                    }
                  >
                    {p.project}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics Cards - Enhanced Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {summary.map((item, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 mt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">{item.title}</CardTitle>
                {i === 0 && <Users className="h-5 w-5 text-blue-500" />}
                {i === 1 && <Target className="h-5 w-5 text-green-500" />}
                {i === 2 && <AlertTriangle className="h-5 w-5 text-red-500" />}
                {i === 3 && <DollarSign className="h-5 w-5 text-orange-500" />}
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold mb-3 ${item.color || "text-gray-900"}`}>{item.value}</p>
              <ul className="text-xs space-y-1 mb-3">
                {item.desc.map((d, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="text-gray-600">{d.label}</span>
                    <span
                      className={`font-semibold ${typeof (d as any).color === "string" ? (d as any).color : "text-gray-900"}`}
                    >
                      {d.value}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid - Enhanced Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Project Category Distribution Chart */}
        <Card className="shadow-sm xl:col-span-1">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">Project Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={enhancedMetrics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {enhancedMetrics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Allocation by Role Chart */}
        <Card className="shadow-sm xl:col-span-2">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={enhancedMetrics.roleDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {enhancedMetrics.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} FTE`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Utilization by Role */}
        <Card className="shadow-sm xl:col-span-2">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">Resource Utilization by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={filteredRoleUtilization}
                layout="horizontal"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 150]} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="role" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                  labelStyle={{ color: "#000" }}
                />
                <Legend />
                <Bar dataKey="Allocated" stackId="a" fill="#22c55e" name="Allocated" />
                <Bar dataKey="Idle" stackId="a" fill="#eab308" name="Idle" />
                <Bar dataKey="Overload" stackId="a" fill="#ef4444" name="Overload" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Project Table */}
        <Card className="shadow-sm">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">Project Allocation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectTable filteredProjects={filteredProjects} />
          </CardContent>
        </Card>

        {/* Productivity Trend */}
        <Card className="shadow-sm">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={processedTrend} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey={selectedPeriods.length === 1 ? "dayLabel" : "month"}
                  tick={{ fontSize: 12, fill: "#374151" }}
                  tickFormatter={(value: string) => value.substring(0, 3)}
                />
                <YAxis tick={{ fontSize: 12, fill: "#374151" }} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: 12 }} />
                <Legend />

                {getAreaKeys.includes("Software Engineer") && (
                  <Area
                    type="monotone"
                    dataKey="Software Engineer"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.25}
                  />
                )}
                {getAreaKeys.includes("Data Engineer") && (
                  <Area type="monotone" dataKey="Data Engineer" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} />
                )}
                {getAreaKeys.includes("System Analyst") && (
                  <Area type="monotone" dataKey="System Analyst" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.25} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Analysis - Full Width */}
      <Card className="shadow-sm">
        <CardHeader className="mt-3">
          <CardTitle className="text-lg font-semibold">Budget vs Actual Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredProjects} margin={{ top: 5, right: 30, left: 20, bottom: 120 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} height={100} />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" name="Budget" />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual Cost" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
