"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, DollarSign, AlertTriangle, Target, LayoutGrid, Filter, Calendar, TrendingUp, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getEmployees, getProjects, type Employee as EmployeeType, type Project as ProjectType } from "@/lib/data"

const COLORS = ["#8884d8", "#82ca9d", "#ffbb55", "#6366f1", "#f43f5e", "#14b8a6"]

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface SummaryItem {
  title: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
  desc: { label: string; value: string | number; color?: string }[]
}

const ProjectTable: React.FC<{ filteredProjects: any[] }> = ({ filteredProjects }) => {
  return (
    <div className="space-y-2">
      {filteredProjects.slice(0, 5).map((project, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{project.name}</p>
            <p className="text-xs text-gray-500">{project.team}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{project.crew} crew</p>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                project.priority === "Critical"
                  ? "bg-red-100 text-red-800"
                  : project.priority === "High"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              {project.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const transformDataForCharts = (employees: EmployeeType[], projects: ProjectType[]) => {
  const fteWorkloadData = employees.reduce((acc, emp) => {
    const workloadMultipliers: Record<string, number> = {
      junior: 0.8,
      middle: 1.0,
      senior: 1.2,
    }

    const level = emp.role.toLowerCase().includes("senior")
      ? "senior"
      : emp.role.toLowerCase().includes("junior")
        ? "junior"
        : "middle"

    const baseWorkload = 8 // 1 FTE = 8 hours
    const adjustedWorkload = baseWorkload * workloadMultipliers[level]

    const empProjects = projects.filter((p) => p.team === emp.team)
    const projectHours =
      empProjects.length > 0
        ? Math.min(
            adjustedWorkload * 1.5,
            empProjects.reduce((sum, p) => sum + p.crew * 2, 0),
          )
        : adjustedWorkload * 0.6

    const existing = acc.find((item) => item.role === emp.role)
    if (existing) {
      existing.totalFTE += adjustedWorkload / 8
      existing.allocatedHours += projectHours
      existing.availableHours += adjustedWorkload
      existing.count += 1
    } else {
      acc.push({
        role: emp.role,
        totalFTE: adjustedWorkload / 8,
        allocatedHours: projectHours,
        availableHours: adjustedWorkload,
        count: 1,
        level: level,
      })
    }
    return acc
  }, [] as any[])

  const fteUtilizationByTeam = employees.reduce((acc, emp) => {
    const level = emp.role.toLowerCase().includes("senior")
      ? "senior"
      : emp.role.toLowerCase().includes("junior")
        ? "junior"
        : "middle"
    const workloadMultipliers: Record<string, number> = {
      junior: 0.8,
      middle: 1.0,
      senior: 1.2,
    }

    const baseWorkload = 8
    const adjustedWorkload = baseWorkload * workloadMultipliers[level]
    const empProjects = projects.filter((p) => p.team === emp.team)
    const utilization =
      empProjects.length > 0
        ? Math.min(120, (empProjects.reduce((sum, p) => sum + p.crew, 0) / empProjects.length) * 100)
        : 50

    const existing = acc.find((item) => item.team === emp.team)
    if (existing) {
      existing.totalCapacity += adjustedWorkload
      existing.utilizedCapacity += (adjustedWorkload * utilization) / 100
      existing.employeeCount += 1
    } else {
      acc.push({
        team: emp.team,
        totalCapacity: adjustedWorkload,
        utilizedCapacity: (adjustedWorkload * utilization) / 100,
        employeeCount: 1,
        utilizationRate: utilization,
      })
    }
    return acc
  }, [] as any[])

  const roleUtilization = employees.reduce((acc, emp) => {
    const empProjects = projects.filter((p) => p.team === emp.team)
    const totalBudget = empProjects.reduce((sum, p) => sum + p.budget, 0)
    const avgBudgetPerEmployee =
      totalBudget /
      Math.max(
        empProjects.reduce((sum, p) => sum + p.crew, 0),
        1,
      )

    const existing = acc.find((item) => item.role === emp.role)
    if (existing) {
      existing.count += 1
      existing.Allocated += avgBudgetPerEmployee > 200000 ? 85 : avgBudgetPerEmployee > 100000 ? 70 : 60
      existing.Idle += avgBudgetPerEmployee < 50000 ? 30 : 10
      existing.Overload += avgBudgetPerEmployee > 300000 ? 15 : 5
    } else {
      acc.push({
        role: emp.role,
        count: 1,
        Allocated: avgBudgetPerEmployee > 200000 ? 85 : avgBudgetPerEmployee > 100000 ? 70 : 60,
        Idle: avgBudgetPerEmployee < 50000 ? 30 : 10,
        Overload: avgBudgetPerEmployee > 300000 ? 15 : 5,
      })
    }
    return acc
  }, [] as any[])

  const projectDistribution = projects.reduce((acc, proj) => {
    const existing = acc.find((item) => item.category === proj.category)
    if (existing) {
      existing.count += 1
      existing.budget += proj.budget
    } else {
      acc.push({ category: proj.category, count: 1, budget: proj.budget })
    }
    return acc
  }, [] as any[])

  const teamDistribution = projects.reduce((acc, proj) => {
    const existing = acc.find((item) => item.team === proj.team)
    if (existing) {
      existing.projects += 1
      existing.budget += proj.budget
      existing.crew += proj.crew
    } else {
      acc.push({ team: proj.team, projects: 1, budget: proj.budget, crew: proj.crew })
    }
    return acc
  }, [] as any[])

  const productivityTrend = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i).toLocaleString("default", { month: "short" })
    const monthProjects = projects.filter((p) => {
      const startMonth = new Date(p.startDate).getMonth()
      const endMonth = new Date(p.endDate).getMonth()
      return i >= startMonth && i <= endMonth
    })

    const roleProductivity = employees.reduce(
      (acc, emp) => {
        const empTeamProjects = monthProjects.filter((p) => p.team === emp.team)
        const productivity =
          empTeamProjects.length > 0
            ? Math.min(100, empTeamProjects.reduce((sum, p) => sum + p.budget, 0) / empTeamProjects.length / 1000)
            : Math.max(30, 60 - i * 2)

        if (!acc[emp.role]) acc[emp.role] = []
        acc[emp.role].push(productivity)
        return acc
      },
      {} as Record<string, number[]>,
    )

    const result: any = { month }
    Object.keys(roleProductivity).forEach((role) => {
      const avgProductivity = roleProductivity[role].reduce((sum, val) => sum + val, 0) / roleProductivity[role].length
      result[role] = Math.round(avgProductivity)
    })

    return result
  })

  const projectTimeline = projects.map((proj) => {
    const start = new Date(proj.startDate)
    const end = new Date(proj.endDate)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const progress =
      new Date() > end
        ? 100
        : Math.max(
            0,
            Math.min(100, ((new Date().getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100),
          )

    return {
      name: proj.name,
      duration,
      progress: Math.round(progress),
      status: new Date() > end ? "Completed" : new Date() < start ? "Upcoming" : "In Progress",
      budget: proj.budget,
      crew: proj.crew,
    }
  })

  const resourceAllocation = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i).toLocaleString("default", { month: "short" })
    const monthProjects = projects.filter((p) => {
      const startMonth = new Date(p.startDate).getMonth()
      const endMonth = new Date(p.endDate).getMonth()
      return i >= startMonth && i <= endMonth
    })

    const totalCrew = monthProjects.reduce((sum, p) => sum + p.crew, 0)
    const availableEmployees = employees.filter((emp) => monthProjects.some((p) => p.team === emp.team)).length

    return {
      month,
      allocated: totalCrew,
      available: availableEmployees,
      utilization: availableEmployees > 0 ? Math.round((totalCrew / availableEmployees) * 100) : 0,
    }
  })

  const teamWorkload = employees.reduce((acc, emp) => {
    const empProjects = projects.filter((p) => p.team === emp.team)
    const totalBudget = empProjects.reduce((sum, p) => sum + p.budget, 0)
    const totalCrew = empProjects.reduce((sum, p) => sum + p.crew, 0)
    const avgProjectSize = empProjects.length > 0 ? totalBudget / empProjects.length : 0

    const existing = acc.find((item) => item.team === emp.team)
    if (existing) {
      existing.employees += 1
    } else {
      acc.push({
        team: emp.team,
        employees: 1,
        projects: empProjects.length,
        totalBudget,
        totalCrew,
        avgProjectSize,
        workloadScore: Math.round((totalCrew / Math.max(1, employees.filter((e) => e.team === emp.team).length)) * 100),
      })
    }
    return acc
  }, [] as any[])

  const priorityBudgetAnalysis = projects.reduce((acc, proj) => {
    const existing = acc.find((item) => item.priority === proj.priority)
    if (existing) {
      existing.count += 1
      existing.totalBudget += proj.budget
      existing.avgBudget = existing.totalBudget / existing.count
      existing.totalCrew += proj.crew
    } else {
      acc.push({
        priority: proj.priority,
        count: 1,
        totalBudget: proj.budget,
        avgBudget: proj.budget,
        totalCrew: proj.crew,
      })
    }
    return acc
  }, [] as any[])

  const skillsDistribution = employees.reduce((acc, emp) => {
  let skillCategory = "Other"
  if (emp.role.toLowerCase().includes("data engineer")) skillCategory = "Data Engineer"
  else if (emp.role.toLowerCase().includes("software engineer")) skillCategory = "Software Engineer"
  else if (emp.role.toLowerCase().includes("system analyst")) skillCategory = "System Analyst"

  const level = emp.level || (
  emp.role.toLowerCase().includes("senior")
    ? "Senior"
    : emp.role.toLowerCase().includes("junior")
      ? "Junior"
      : "Middle"
    )

  const existing = acc.find((item) => item.skill === skillCategory)
  if (existing) {
    existing.total++
    existing[level.toLowerCase()]++
  } else {
    acc.push({
      skill: skillCategory,
      total: 1,
      senior: level === "Senior" ? 1 : 0,
      middle: level === "Middle" ? 1 : 0,
      junior: level === "Junior" ? 1 : 0,
    })
  }
  return acc
}, [] as any[]).sort((a, b) => b.total - a.total)


  return {
    roleUtilization,
    projectDistribution,
    teamDistribution,
    productivityTrend,
    fteWorkloadData,
    fteUtilizationByTeam,
    projectTimeline,
    resourceAllocation,
    teamWorkload,
    priorityBudgetAnalysis,
    skillsDistribution,
  }
}

export default function Page() {
  const employees = getEmployees()
  const projects = getProjects()

  const [viewMode, setViewMode] = useState<"projects" | "resources">("projects")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const filteredProjects = useMemo(() => {
    let data = projects

    if (dateRange.from && dateRange.to) {
      data = data.filter((p) => {
        const projectStart = new Date(p.startDate)
        const projectEnd = new Date(p.endDate)
        return (
          (projectStart >= dateRange.from! && projectStart <= dateRange.to!) ||
          (projectEnd >= dateRange.from! && projectEnd <= dateRange.to!) ||
          (projectStart <= dateRange.from! && projectEnd >= dateRange.to!)
        )
      })
    }

    if (selectedProjects.length > 0) {
      data = data.filter((p) => selectedProjects.includes(p.name))
    }

    return data
  }, [projects, selectedProjects, dateRange])

  const filteredEmployees = useMemo(() => {
    let data = employees

    if (selectedRoles.length > 0) {
      data = data.filter((emp) => selectedRoles.includes(emp.role))
    }

    if (filteredProjects.length < projects.length) {
      const projectTeams = new Set(filteredProjects.map((p) => p.team))
      data = data.filter((emp) => projectTeams.has(emp.team))
    }

    return data
  }, [employees, selectedRoles, filteredProjects, projects.length])

  const {
    roleUtilization,
    projectDistribution,
    teamDistribution,
    productivityTrend,
    fteWorkloadData,
    fteUtilizationByTeam,
    projectTimeline,
    resourceAllocation,
    teamWorkload,
    priorityBudgetAnalysis,
    skillsDistribution,
  } = useMemo(() => transformDataForCharts(filteredEmployees, filteredProjects), [filteredEmployees, filteredProjects])

  const uniqueRoles = ["All", ...Array.from(new Set(employees.map((emp) => emp.role)))]
  const uniqueProjects = ["All", ...Array.from(new Set(projects.map((proj) => proj.name)))]

  const projectSummary = useMemo(() => {
    const activeProjects = filteredProjects.filter((p) => new Date(p.endDate) >= new Date())
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0)
    const avgBudgetPerProject = filteredProjects.length > 0 ? totalBudget / filteredProjects.length : 0
    const highPriorityProjects = filteredProjects.filter((p) => p.priority === "Critical" || p.priority === "High")
    const completedProjects = filteredProjects.filter((p) => new Date(p.endDate) < new Date())

    return [
      {
        title: "Active Projects",
        value: activeProjects.length.toString(),
        icon: Target,
        color: "text-blue-600",
        desc: activeProjects
          .reduce((acc, proj) => {
            const existing = acc.find((item) => item.label === proj.category)
            if (existing) {
              existing.value = (Number.parseInt(existing.value) + 1).toString()
            } else {
              acc.push({ label: proj.category, value: "1" })
            }
            return acc
          }, [] as any[])
          .sort((a, b) => Number.parseInt(b.value) - Number.parseInt(a.value))
          .slice(0, 3),
      },
      {
        title: "Total Budget",
        value: formatRupiah(totalBudget),
        icon: DollarSign,
        color: "text-green-600",
        desc: filteredProjects
          .reduce((acc, proj) => {
            const existing = acc.find((item) => item.label === proj.team)
            if (existing) {
              existing.raw += proj.budget
            } else {
              acc.push({ label: proj.team, raw: proj.budget })
            }
            return acc
          }, [] as any[])
          .map((item) => ({
            label: item.label,
            value: formatRupiah(item.raw),
          }))
          .sort(
            (a, b) =>
              Number.parseFloat(b.value.replace(/[^\d]/g, "")) -
              Number.parseFloat(a.value.replace(/[^\d]/g, ""))
          )
          .slice(0, 3)
      },
      {
        title: "High Priority",
        value: highPriorityProjects.length.toString(),
        icon: AlertTriangle,
        color: "text-red-600",
        desc: highPriorityProjects
          .reduce((acc, proj) => {
            const existing = acc.find((item) => item.label === proj.priority)
            if (existing) {
              existing.value = (Number.parseInt(existing.value) + 1).toString()
            } else {
              acc.push({ label: proj.priority, value: "1" })
            }
            return acc
          }, [] as any[])
          .sort((a, b) => Number.parseInt(b.value) - Number.parseInt(a.value))
          .slice(0, 3),
      },
      {
        title: "Avg Budget/Project",
        value: formatRupiah(avgBudgetPerProject),
        icon: TrendingUp,
        color: "text-purple-600",
        desc: filteredProjects
          .sort((a, b) => b.budget - a.budget)
          .slice(0, 3)
          .map((proj) => ({ label: proj.name, value: formatRupiah(proj.budget) })),
      },
      {
        title: "Completed Projects",
        value: completedProjects.length.toString(),
        icon: Calendar,
        color: "text-gray-600",
        desc: completedProjects
          .reduce((acc, proj) => {
            const existing = acc.find((item) => item.label === proj.category)
            if (existing) {
              existing.value = (Number.parseInt(existing.value) + 1).toString()
            } else {
              acc.push({ label: proj.category, value: "1" })
            }
            return acc
          }, [] as any[])
          .sort((a, b) => Number.parseInt(b.value) - Number.parseInt(a.value))
          .slice(0, 3),
      },
    ]
  }, [filteredProjects])

  const resourceSummary = useMemo(() => {
    const totalEmployees = filteredEmployees.length
    const activeEmployees = filteredEmployees.filter((emp) => emp.status === "Active")
    const totalCrewNeeded = filteredProjects.reduce((sum, p) => sum + p.crew, 0)
    const utilizationRate = totalEmployees > 0 ? (totalCrewNeeded / totalEmployees) * 100 : 0

    const totalFTE = filteredEmployees.reduce((sum, emp) => {
      const level = emp.role.toLowerCase().includes("senior")
        ? "senior"
        : emp.role.toLowerCase().includes("junior")
          ? "junior"
          : "middle"
      const workloadMultipliers: Record<string, number> = {
        junior: 0.8,
        middle: 1.0,
        senior: 1.2,
      }
      return sum + workloadMultipliers[level]
    }, 0)

    const availableEmployees = activeEmployees.filter((emp) => {
    const empProjects = filteredProjects.filter((p) => p.team === emp.team)
    return empProjects.length === 0 
  })

    return [
      {
        title: "Total Employees",
        value: totalEmployees.toString(),
        icon: Users,
        color: "text-blue-600",
        desc: filteredEmployees
          .reduce((acc, emp) => {
            const existing = acc.find((item) => item.label === emp.role)
            if (existing) {
              existing.value = (Number.parseInt(existing.value) + 1).toString()
            } else {
              acc.push({ label: emp.role, value: "1" })
            }
            return acc
          }, [] as any[])
          .sort((a, b) => Number.parseInt(b.value) - Number.parseInt(a.value))
          .slice(0, 3),
      },
      {
        title: "Available Resources",
        value: availableEmployees.length.toString(),
        icon: Target,
        color: availableEmployees.length > 0 ? "text-green-600" : "text-red-600",
        desc: availableEmployees
          .reduce((acc, emp) => {
            const team = emp.team
            const existing = acc.find((item) => item.label === team)
            if (existing) {
              existing.value = (parseInt(existing.value) + 1).toString()
            } else {
              acc.push({ label: team, value: "1" })
            }
            return acc
          }, [] as any[])
          .sort((a, b) => parseInt(b.value) - parseInt(a.value))
          .slice(0, 3),
      },
      {
        title: "Utilization Rate",
        value: `${utilizationRate.toFixed(0)}%`,
        icon: TrendingUp,
        color: utilizationRate > 100 ? "text-red-600" : utilizationRate < 70 ? "text-yellow-600" : "text-green-600",
        desc: filteredEmployees
          .reduce((acc, emp) => {
            const empProjects = filteredProjects.filter((p) => p.team === emp.team)
            const empUtilization =
              empProjects.length > 0
                ? Math.min(120, (empProjects.reduce((sum, p) => sum + p.crew, 0) / empProjects.length) * 100)
                : 50

            const existing = acc.find((item) => item.label === emp.team)
            if (existing) {
              const currentUtil = Number.parseFloat(existing.value.replace("%", ""))
              existing.value = `${Math.round((currentUtil + empUtilization) / 2)}%`
            } else {
              acc.push({
                label: emp.team,
                value: `${Math.round(empUtilization)}%`,
                color:
                  empUtilization > 100 ? "text-red-600" : empUtilization < 70 ? "text-yellow-600" : "text-green-600",
              })
            }
            return acc
          }, [] as any[])
          .sort((a, b) => Number.parseFloat(b.value.replace("%", "")) - Number.parseFloat(a.value.replace("%", "")))
          .slice(0, 3),
      },
      {
        title: "Total FTE Capacity",
        value: `${totalFTE.toFixed(1)} FTE`,
        icon: Clock,
        color: "text-purple-600",
        desc: filteredEmployees
        .reduce((acc, emp) => {
          const rawLevel = emp.level
            ? emp.level.toLowerCase()
            : emp.role.toLowerCase().includes("senior")
              ? "senior"
              : emp.role.toLowerCase().includes("junior")
                ? "junior"
                : "middle"

          const workloadMultipliers: Record<string, number> = {
            junior: 0.8,
            middle: 1.0,
            senior: 1.2,
          }

          const label = rawLevel.charAt(0).toUpperCase() + rawLevel.slice(1)
          const existing = acc.find((item) => item.label === label)

          if (existing) {
            existing.value = (parseFloat(existing.value) + workloadMultipliers[rawLevel]).toFixed(1)
          } else {
            acc.push({
              label,
              value: workloadMultipliers[rawLevel].toFixed(1),
            })
          }
          return acc
        }, [] as any[])
        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        .slice(0, 3)
      },
      {
        title: "Team Distribution",
        value: `${new Set(filteredEmployees.map((emp) => emp.team)).size} Teams`,
        icon: LayoutGrid,
        color: "text-gray-600",
        desc: filteredEmployees
          .reduce((acc, emp) => {
            const existing = acc.find((item) => item.label === emp.team)
            if (existing) {
              existing.value = (Number.parseInt(existing.value) + 1).toString()
            } else {
              acc.push({ label: emp.team, value: "1" })
            }
            return acc
          }, [] as any[])
          .sort((a, b) => Number.parseInt(b.value) - Number.parseInt(a.value))
          .slice(0, 3),
      },
    ]
  }, [filteredEmployees, filteredProjects])

  return (
    <div className="space-y-3 mx-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor project resources, utilization, and budget performance</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex items-center border border-gray-200 rounded-md bg-white">
            <Button
              variant={viewMode === "projects" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("projects")}
              className={`h-8 rounded-r-none border-r ${
                viewMode === "projects"
                  ? "bg-black text-white hover:bg-black"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="mr-1 h-3 w-3" />
              Projects
            </Button>
            <Button
              variant={viewMode === "resources" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("resources")}
              className={`h-8 rounded-l-none ${
                viewMode === "resources"
                  ? "bg-black text-white hover:bg-black"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Users className="mr-1 h-3 w-3" />
              Resources
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          placeholder={<span className="font-semibold">Period</span>}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1 h-10 bg-white">
              <Filter className="h-4 w-4" />
              Role ({selectedRoles.length || "All"})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={selectedRoles.length === 0} onCheckedChange={() => setSelectedRoles([])}>
              All Roles
            </DropdownMenuCheckboxItem>
            {uniqueRoles.slice(1).map((r) => (
              <DropdownMenuCheckboxItem
                key={r}
                checked={selectedRoles.includes(r)}
                onCheckedChange={(checked) =>
                  setSelectedRoles(checked ? [...selectedRoles, r] : selectedRoles.filter((item) => item !== r))
                }
              >
                {r}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1 h-10 bg-white">
              <Filter className="h-4 w-4" />
              Project ({selectedProjects.length || "All"})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedProjects.length === 0}
              onCheckedChange={() => setSelectedProjects([])}
            >
              All Projects
            </DropdownMenuCheckboxItem>
            {uniqueProjects.slice(1).map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={selectedProjects.includes(p)}
                onCheckedChange={(checked) =>
                  setSelectedProjects(
                    checked ? [...selectedProjects, p] : selectedProjects.filter((item) => item !== p),
                  )
                }
              >
                {p}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {(viewMode === "projects" ? projectSummary : resourceSummary).map((item, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="p-2 sm:p-3 lg:p-4 flex flex-col h-full">
              <CardHeader className="flex items-center justify-between p-0 mb-1 sm:mb-2">
                <CardTitle className="text-xs font-medium text-gray-600 leading-tight">{item.title}</CardTitle>
                <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0`} />
              </CardHeader>
              <CardContent className="p-0 flex-grow">
                <p className={`text-base sm:text-lg lg:text-xl font-bold mb-1 ${item.color} leading-tight`}>
                  {item.value}
                </p>
                <ul className="text-xs space-y-0.5">
                  {item.desc.map((d, idx) => (
                    <li key={idx} className="flex justify-between items-center gap-1">
                      <span className="text-gray-600 truncate flex-1 text-xs">{d.label}</span>
                      <span className={`font-semibold ${d.color || "text-gray-900"} text-xs flex-shrink-0`}>
                        {d.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {viewMode === "projects" ? (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">Project Distribution by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart className="mx-px">
                    <Pie
                      data={projectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="budget"
                      nameKey="category"
                    >
                      {projectDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">Project Budget Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={filteredProjects.slice(0, 5)} margin={{ top: 5, right: 10, left: -40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      textAnchor="end"
                      height={30}
                      tickFormatter={(value: string) => (value.length > 15 ? value.substring(0, 12) + "..." : value)}
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: number) => [`${formatRupiah(value)}`, "Budget"]} />
                    <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">Project Crew Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={filteredProjects.slice(0, 6)} margin={{ top: 5, right: 5, left: -40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      textAnchor="end"
                      height={30}
                      tickFormatter={(value: string) => (value.length > 12 ? value.substring(0, 9) + "..." : value)}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: number) => [`${value} people`, "Crew Required"]} />
                    <Bar dataKey="crew" fill="#82ca9d" name="Crew Required" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">Project Timeline & Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={projectTimeline.slice(0, 8)} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      textAnchor="end"
                      height={30}
                      tickFormatter={(value: string) => (value.length > 12 ? value.substring(0, 9) + "..." : value)}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number, name: string, props) => [
    props.dataKey === "duration" ? `${value} days` : `${value}%`,
    props.dataKey === "duration" ? "Duration (days)" : "Progress %",
  ]}
                    />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "8px" }} />
                    <Bar dataKey="duration" fill="#8884d8" name="Duration (days)" />
                    <Bar dataKey="progress" fill="#82ca9d" name="Progress %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">Priority vs Budget Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={priorityBudgetAnalysis} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" tick={{ fontSize: 10 }} />
                    <YAxis
                      yAxisId="budget"
                      orientation="left"
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis yAxisId="count" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number, name: string, props) => [
    props.dataKey === "avgBudget" ? formatRupiah(value) : `${value} projects`,
    props.dataKey === "avgBudget" ? "Avg Budget" : "Project Count",
  ]}
                    />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "8px" }} />
                    <Bar yAxisId="budget" dataKey="avgBudget" fill="#8884d8" name="Avg Budget" />
                    <Bar yAxisId="count" dataKey="count" fill="#82ca9d" name="Project Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">Resource Allocation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceAllocation} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="people" orientation="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="percent" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip
                        formatter={(value: number, name: string) => {
                          switch (name) {
                            case "allocated":
                              return [`${value} people`, "Allocated"]
                            case "available":
                              return [`${value} people`, "Available"]
                            case "utilization":
                              return [`${value}%`, "Utilization"]
                            default:
                              return [value, name]
                          }
                        }}
                      />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "8px" }} />
                    <Bar yAxisId="people" dataKey="allocated" fill="#8884d8" name="Allocated" />
                    <Bar yAxisId="people" dataKey="available" fill="#82ca9d" name="Available" />
                    <Bar yAxisId="percent" dataKey="utilization" fill="#ffbb55" name="Utilization" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <Card className="shadow-sm mb">
              <CardHeader className="mt-2">
                  <CardTitle className="text-lg font-semibold text-center">FTE Workload by Role</CardTitle>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={fteWorkloadData} margin={{ top: 5, right: 5, left: -20, bottom: 2 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                              dataKey="role"
                              tick={{ fontSize: 10 }}
                              textAnchor="end"
                              height={30}
                              tickFormatter={(value: string) => (value.length > 15 ? value.substring(0, 12) + "..." : value)}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip
                              formatter={(value: number, name: string) => [
                                  name === "Total FTE" ? `${value.toFixed(1)} FTE` : `${value.toFixed(0)} hours`,
                                  name,
                              ]}
                          />
                          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "8px" }} />
                          <Bar dataKey="totalFTE" fill="#8884d8" name="Total FTE" stackId="a" />
                          <Bar dataKey="allocatedHours" fill="#82ca9d" name="Allocated Hours" stackId="a" />
                      </BarChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>

            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">FTE Utilization by Team</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={fteUtilizationByTeam} margin={{ top: 1, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                    formatter={(value: number, name: string) => [`${value.toFixed(1)} hours`, name]}
                  />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "8px" }}/>
                    <Bar dataKey="totalCapacity" fill="#3b82f6" name="Total Capacity" />
                    <Bar dataKey="utilizedCapacity" fill="#10b981" name="Utilized Capacity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">Team Workload Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={teamWorkload} margin={{ top: 5, right: -10, left: -30, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="score" orientation="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="people" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "workloadScore" ? `${value}%` : `${value}`,
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                    />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "8px" }} />
                    <Bar yAxisId="score" dataKey="workloadScore" fill="#8884d8" name="Workload Score %" />
                    <Bar yAxisId="people" dataKey="employees" fill="#82ca9d" name="Employees" />
                    <Bar yAxisId="people" dataKey="projects" fill="#ffbb55" name="Projects" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">Skills Distribution by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={skillsDistribution} margin={{ top: 5, right: 10, left: -0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} people`,
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                    />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: "12px", marginTop: "8px" }}/>
                    <Bar dataKey="junior" stackId="a" fill="#f59e0b" name="Junior" />
                    <Bar dataKey="middle" stackId="a" fill="#10b981" name="Middle" />
                    <Bar dataKey="senior" stackId="a" fill="#3b82f6" name="Senior" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
