"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
  LabelList,
} from "recharts";
import {
  Users,
  DollarSign,
  AlertTriangle,
  Target,
  LayoutGrid,
  Filter,
  UserCheck,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  getEmployees,
  getProjects,
  type Employee as EmployeeType,
  type Project as ProjectType,
} from "@/lib/data";
import EmployeeHeatmap from "@/components/employee/EmployeeHeatmap";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffbb55",
  "#6366f1",
  "#f43f5e",
  "#14b8a6",
];

const getProgressColor = (progress: number) => {
  if (progress >= 70) return "#4ade80"; // hijau
  if (progress >= 40) return "#facc15"; // kuning
  return "#f87171"; // merah
};

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface SummaryItem {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  desc: { label: string; value: string | number; color?: string }[];
}

const initials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const ProjectTable: React.FC<{ filteredProjects: any[] }> = ({
  filteredProjects,
}) => {
  return <div className="space-y-2" data-testid="project-table"></div>;
};

const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];
const heatmapData = ["Junior", "Middle", "Senior"].map((role) => {
  const roleMembers = getEmployees().filter((emp) => emp.role === role);
  return {
    role,
    weeklyUtilization: weeks.map(() => {
      const avg =
        roleMembers.length > 0
          ? roleMembers.reduce((acc, emp) => acc + emp.utilization, 0) /
            roleMembers.length
          : 0;
      return avg;
    }),
  };
});

const transformDataForCharts = (
  employees: EmployeeType[],
  projects: ProjectType[]
) => {
  const projectTimeline = projects.map((proj) => {
    const start = new Date(proj.startDate);
    const end = new Date(proj.endDate);
    const duration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const progress =
      new Date() > end
        ? 100
        : Math.max(
            0,
            Math.min(
              100,
              ((new Date().getTime() - start.getTime()) /
                (end.getTime() - start.getTime())) *
                100
            )
          );

    return {
      name: proj.name,
      duration,
      progress: Math.round(progress),
      completed: Math.ceil((duration * progress) / 100), // 🔥 field baru: jumlah hari yg sudah selesai
      status:
        new Date() > end
          ? "Completed"
          : new Date() < start
          ? "Upcoming"
          : "In Progress",
      budget: proj.budget,
      crew: proj.crew,
    };
  });

  const fteWorkloadData = employees.reduce((acc, emp) => {
    const workloadMultipliers: Record<string, number> = {
      junior: 0.8,
      middle: 1.0,
      senior: 1.2,
    };

    const level = emp.level?.toLowerCase() ?? "middle";

    const baseWorkload = 8;
    const adjustedWorkload = baseWorkload * workloadMultipliers[level];

    const empProjects = projects.filter((p) => p.team === emp.team);
    const projectHours =
      empProjects.length > 0
        ? Math.min(
            adjustedWorkload * 1.5,
            empProjects.reduce((sum, p) => sum + p.crew * 2, 0)
          )
        : adjustedWorkload * 0.6;

    const existing = acc.find((item) => item.role === emp.role);
    if (existing) {
      existing[level] = (existing[level] || 0) + projectHours;
    } else {
      acc.push({
        role: emp.role,
        junior: level === "junior" ? projectHours : 0,
        middle: level === "middle" ? projectHours : 0,
        senior: level === "senior" ? projectHours : 0,
      });
    }
    return acc;
  }, [] as any[]);

  const fteUtilizationByTeam = employees.reduce((acc, emp) => {
    const level = emp.role.toLowerCase().includes("senior")
      ? "senior"
      : emp.role.toLowerCase().includes("junior")
      ? "junior"
      : "middle";
    const workloadMultipliers: Record<string, number> = {
      junior: 0.8,
      middle: 1.0,
      senior: 1.2,
    };

    const baseWorkload = 8;
    const adjustedWorkload = baseWorkload * workloadMultipliers[level];
    const empProjects = projects.filter((p) => p.team === emp.team);
    const utilization =
      empProjects.length > 0
        ? Math.min(
            120,
            (empProjects.reduce((sum, p) => sum + p.crew, 0) /
              empProjects.length) *
              100
          )
        : 50;

    const existing = acc.find((item) => item.team === emp.team);
    if (existing) {
      existing.totalCapacity += adjustedWorkload;
      existing.utilizedCapacity += (adjustedWorkload * utilization) / 100;
      existing.employeeCount += 1;
    } else {
      acc.push({
        team: emp.team,
        totalCapacity: adjustedWorkload,
        utilizedCapacity: (adjustedWorkload * utilization) / 100,
        employeeCount: 1,
        utilizationRate: utilization,
      });
    }
    return acc;
  }, [] as any[]);

  const roleUtilization = employees.reduce((acc, emp) => {
    const empProjects = projects.filter((p) => p.team === emp.team);
    const totalBudget = empProjects.reduce((sum, p) => sum + p.budget, 0);
    const avgBudgetPerEmployee =
      totalBudget /
      Math.max(
        empProjects.reduce((sum, p) => sum + p.crew, 0),
        1
      );

    const existing = acc.find((item) => item.role === emp.role);
    if (existing) {
      existing.count += 1;
      existing.Allocated +=
        avgBudgetPerEmployee > 200000
          ? 85
          : avgBudgetPerEmployee > 100000
          ? 70
          : 60;
      existing.Idle += avgBudgetPerEmployee < 50000 ? 30 : 10;
      existing.Overload += avgBudgetPerEmployee > 300000 ? 15 : 5;
    } else {
      acc.push({
        role: emp.role,
        count: 1,
        Allocated:
          avgBudgetPerEmployee > 200000
            ? 85
            : avgBudgetPerEmployee > 100000
            ? 70
            : 60,
        Idle: avgBudgetPerEmployee < 50000 ? 30 : 10,
        Overload: avgBudgetPerEmployee > 300000 ? 15 : 5,
      });
    }
    return acc;
  }, [] as any[]);

  const projectDistribution = projects.reduce((acc, proj) => {
    const existing = acc.find((item) => item.category === proj.category);
    if (existing) {
      existing.count += 1;
      existing.budget += proj.budget;
    } else {
      acc.push({ category: proj.category, count: 1, budget: proj.budget });
    }
    return acc;
  }, [] as any[]);

  const teamDistribution = projects.reduce((acc, proj) => {
    const existing = acc.find((item) => item.team === proj.team);
    if (existing) {
      existing.projects += 1;
      existing.budget += proj.budget;
      existing.crew += proj.crew;
    } else {
      acc.push({
        team: proj.team,
        projects: 1,
        budget: proj.budget,
        crew: proj.crew,
      });
    }
    return acc;
  }, [] as any[]);

  const productivityTrend = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i).toLocaleString("default", {
      month: "short",
    });
    const monthProjects = projects.filter((p) => {
      const startMonth = new Date(p.startDate).getMonth();
      const endMonth = new Date(p.endDate).getMonth();
      return i >= startMonth && i <= endMonth;
    });

    const roleProductivity = employees.reduce((acc, emp) => {
      const empTeamProjects = monthProjects.filter((p) => p.team === emp.team);
      const productivity =
        empTeamProjects.length > 0
          ? Math.min(
              100,
              empTeamProjects.reduce((sum, p) => sum + p.budget, 0) /
                empTeamProjects.length /
                1000
            )
          : Math.max(30, 60 - i * 2);

      if (!acc[emp.role]) acc[emp.role] = [];
      acc[emp.role].push(productivity);
      return acc;
    }, {} as Record<string, number[]>);

    const result: any = { month };
    Object.keys(roleProductivity).forEach((role) => {
      const avgProductivity =
        roleProductivity[role].reduce((sum, val) => sum + val, 0) /
        roleProductivity[role].length;
      result[role] = Math.round(avgProductivity);
    });

    return result;
  });

  const stackedData = projectTimeline.map((p) => ({
    ...p,
    remaining: p.duration - p.completed,
  }));

  const resourceAllocation = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i).toLocaleString("default", {
      month: "short",
    });
    const monthProjects = projects.filter((p) => {
      const startMonth = new Date(p.startDate).getMonth();
      const endMonth = new Date(p.endDate).getMonth();
      return i >= startMonth && i <= endMonth;
    });

    const totalCrew = monthProjects.reduce((sum, p) => sum + p.crew, 0);
    const availableEmployees = employees.filter((emp) =>
      monthProjects.some((p) => p.team === emp.team)
    ).length;

    return {
      month,
      allocated: totalCrew,
      available: availableEmployees,
      utilization:
        availableEmployees > 0
          ? Math.round((totalCrew / availableEmployees) * 100)
          : 0,
    };
  });

  const teamWorkload = employees.reduce((acc, emp) => {
    const empProjects = projects.filter((p) => p.team === emp.team);
    const totalBudget = empProjects.reduce((sum, p) => sum + p.budget, 0);
    const totalCrew = empProjects.reduce((sum, p) => sum + p.crew, 0);
    const avgProjectSize =
      empProjects.length > 0 ? totalBudget / empProjects.length : 0;

    const existing = acc.find((item) => item.team === emp.team);
    if (existing) {
      existing.employees += 1;
    } else {
      acc.push({
        team: emp.team,
        employees: 1,
        projects: empProjects.length,
        totalBudget,
        totalCrew,
        avgProjectSize,
        workloadScore: Math.round(
          (totalCrew /
            Math.max(1, employees.filter((e) => e.team === emp.team).length)) *
            100
        ),
      });
    }
    return acc;
  }, [] as any[]);

  const priorityBudgetAnalysis = projects.reduce((acc, proj) => {
    const existing = acc.find((item) => item.priority === proj.priority);
    if (existing) {
      existing.count += 1;
      existing.totalBudget += proj.budget;
      existing.avgBudget = existing.totalBudget / existing.count;
      existing.totalCrew += proj.crew;
    } else {
      acc.push({
        priority: proj.priority,
        count: 1,
        totalBudget: proj.budget,
        avgBudget: proj.budget,
        totalCrew: proj.crew,
      });
    }
    return acc;
  }, [] as any[]);

  const skillsDistribution = employees
    .reduce((acc, emp) => {
      let skillCategory = "Other";
      if (emp.role.toLowerCase().includes("data engineer"))
        skillCategory = "Data Engineer";
      else if (emp.role.toLowerCase().includes("software engineer"))
        skillCategory = "Software Engineer";
      else if (emp.role.toLowerCase().includes("system analyst"))
        skillCategory = "System Analyst";

      const level =
        emp.level ||
        (emp.role.toLowerCase().includes("senior")
          ? "Senior"
          : emp.role.toLowerCase().includes("junior")
          ? "Junior"
          : "Middle");

      const existing = acc.find((item) => item.skill === skillCategory);
      if (existing) {
        existing.total++;
        existing[level.toLowerCase()]++;
      } else {
        acc.push({
          skill: skillCategory,
          total: 1,
          senior: level === "Senior" ? 1 : 0,
          middle: level === "Middle" ? 1 : 0,
          junior: level === "Junior" ? 1 : 0,
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.total - a.total);

  return {
    roleUtilization,
    projectDistribution,
    teamDistribution,
    productivityTrend,
    fteWorkloadData,
    fteUtilizationByTeam,
    projectTimeline,
    stackedData,
    resourceAllocation,
    teamWorkload,
    priorityBudgetAnalysis,
    skillsDistribution,
  };
};

export default function Page() {
  const employees = getEmployees();
  const projects = getProjects();
  const [searchProject, setSearchProject] = useState("");

  const [viewMode, setViewMode] = useState<"projects" | "resources">(
    "projects"
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const filteredProjects = useMemo(() => {
    let data = projects;

    if (dateRange.from && dateRange.to) {
      data = data.filter((p) => {
        const projectStart = new Date(p.startDate);
        const projectEnd = new Date(p.endDate);
        return (
          (projectStart >= dateRange.from! && projectStart <= dateRange.to!) ||
          (projectEnd >= dateRange.from! && projectEnd <= dateRange.to!) ||
          (projectStart <= dateRange.from! && projectEnd >= dateRange.to!)
        );
      });
    }

    if (selectedProjects.length > 0) {
      data = data.filter((p) => selectedProjects.includes(p.name));
    }

    return data;
  }, [projects, selectedProjects, dateRange]);

  const filteredEmployees = useMemo(() => {
    let data = employees;

    if (selectedRoles.length > 0) {
      data = data.filter((emp) => selectedRoles.includes(emp.role));
    }

    if (filteredProjects.length < projects.length) {
      const projectTeams = new Set(filteredProjects.map((p) => p.team));
      data = data.filter((emp) => projectTeams.has(emp.team));
    }

    return data;
  }, [employees, selectedRoles, filteredProjects, projects.length]);

  const teamDistributionData = useMemo(() => {
    const data = filteredEmployees.reduce((acc, emp) => {
      const existing = acc.find((item) => item.name === emp.team);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: emp.team, value: 1 });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

    data.sort((a, b) => b.value - a.value);
    return data;
  }, [filteredEmployees]);

  const PIE_COLORS = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];

  const {
    projectDistribution,
    fteWorkloadData,
    projectTimeline,
    stackedData,
    teamWorkload,
    skillsDistribution,
  } = useMemo(
    () => transformDataForCharts(filteredEmployees, filteredProjects),
    [filteredEmployees, filteredProjects]
  );

  const dateRanges = useMemo(() => {
    const ranges = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 35);

    for (let i = 0; i < 6; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startLabel = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const endLabel = weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      ranges.push({
        label: `${startLabel} - ${endLabel}`,
        start: weekStart,
        end: weekEnd,
      });
    }

    return ranges;
  }, []);

  const uniqueRoles = [
    "All",
    ...Array.from(new Set(employees.map((emp) => emp.role))),
  ];
  const uniqueProjects = [
    "All",
    ...Array.from(new Set(projects.map((proj) => proj.name))),
  ];

  const projectSummary = useMemo(() => {
    const activeProjects = filteredProjects.filter(
      (p) => new Date(p.endDate) >= new Date()
    );
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
    const avgBudgetPerProject =
      filteredProjects.length > 0 ? totalBudget / filteredProjects.length : 0;
    const highPriorityProjects = filteredProjects.filter(
      (p) => p.priority === "Critical" || p.priority === "High"
    );

    return [
      {
        title: "Active Projects",
        value: activeProjects.length.toString(),
        icon: Target,
        color: "text-blue-600",
        desc: activeProjects
          .reduce((acc, proj) => {
            const existing = acc.find((item) => item.label === proj.category);
            if (existing) {
              existing.value = (Number.parseInt(existing.value) + 1).toString();
            } else {
              acc.push({ label: proj.category, value: "1" });
            }
            return acc;
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
            const existing = acc.find((item) => item.label === proj.team);
            if (existing) {
              existing.raw += proj.budget;
            } else {
              acc.push({ label: proj.team, raw: proj.budget });
            }
            return acc;
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
          .slice(0, 3),
      },
      {
        title: "High Priority",
        value: highPriorityProjects.length.toString(),
        icon: AlertTriangle,
        color: "text-red-600",
        desc: highPriorityProjects
          .reduce((acc, proj) => {
            const existing = acc.find((item) => item.label === proj.priority);
            if (existing) {
              existing.value = (Number.parseInt(existing.value) + 1).toString();
            } else {
              acc.push({ label: proj.priority, value: "1" });
            }
            return acc;
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
          .map((proj) => ({
            label: proj.name,
            value: formatRupiah(proj.budget),
          })),
      },
    ];
  }, [filteredProjects]);

  const resourceSummary = useMemo(() => {
    const totalEmployees = filteredEmployees.length;
    const activeEmployees = filteredEmployees.filter(
      (emp) => emp.status === "Active"
    );
    const totalCrewNeeded = filteredProjects.reduce(
      (sum, p) => sum + p.crew,
      0
    );
    const utilizationRate =
      totalEmployees > 0 ? (totalCrewNeeded / totalEmployees) * 100 : 0;
    const availableEmployees = activeEmployees.filter((emp) => {
      const empProjects = filteredProjects.filter((p) => p.team === emp.team);
      return empProjects.length === 0;
    });

    return [
      {
        title: "Total Employees",
        value: totalEmployees.toString(),
        icon: Users,
        color: "text-blue-600",
        desc: filteredEmployees
          .reduce((acc, emp) => {
            const existing = acc.find((item) => item.label === emp.role);
            if (existing) {
              existing.value = (Number.parseInt(existing.value) + 1).toString();
            } else {
              acc.push({ label: emp.role, value: "1" });
            }
            return acc;
          }, [] as any[])
          .sort((a, b) => Number.parseInt(b.value) - Number.parseInt(a.value))
          .slice(0, 3),
      },
      {
        title: "Available Resources",
        value: availableEmployees.length.toString(),
        icon: Target,
        color:
          availableEmployees.length > 0 ? "text-green-600" : "text-red-600",
        desc: availableEmployees
          .reduce((acc, emp) => {
            const role = emp.role;
            const existing = acc.find((item) => item.label === role);
            if (existing) {
              existing.value = (parseInt(existing.value) + 1).toString();
            } else {
              acc.push({ label: role, value: "1" });
            }
            return acc;
          }, [] as any[])
          .sort((a, b) => parseInt(b.value) - parseInt(a.value))
          .slice(0, 3),
      },
      {
        title: "Utilization Rate",
        value: `${utilizationRate.toFixed(1)}%`,
        icon: Clock,
        color: "text-purple-600",
        desc: filteredEmployees
          .reduce((acc, emp) => {
            const empProjects = filteredProjects.filter(
              (p) => p.team === emp.team
            );
            const totalCrewNeeded = empProjects.reduce(
              (sum, p) => sum + p.crew,
              0
            );

            const existing = acc.find((item) => item.label === emp.team);

            if (existing) {
              existing.value = (
                parseFloat(existing.value) + totalCrewNeeded
              ).toFixed(1);
            } else {
              acc.push({
                label: emp.team,
                value: totalCrewNeeded.toFixed(1),
              });
            }
            return acc;
          }, [] as any[])
          .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
          .slice(0, 3),
      },
      {
        title: "Top Project Roles",
        value:
          filteredEmployees
            .filter((emp) =>
              new Set(filteredProjects.map((p) => p.team)).has(emp.team)
            )
            .reduce((acc, emp) => {
              const existing = acc.find((item) => item.label === emp.role);
              if (existing) {
                existing.value = (Number(existing.value) + 1).toString();
              } else {
                acc.push({ label: emp.role, value: "1" });
              }
              return acc;
            }, [] as any[])
            .sort((a, b) => Number(b.value) - Number(a.value))[0]?.label ||
          "N/A",
        icon: UserCheck,
        color: "text-blue-600",
        desc: filteredEmployees
          .filter((emp) =>
            new Set(filteredProjects.map((p) => p.team)).has(emp.team)
          )
          .reduce((acc, emp) => {
            const existing = acc.find((item) => item.label === emp.role);
            if (existing) {
              existing.value = (Number(existing.value) + 1).toString();
            } else {
              acc.push({ label: emp.role, value: "1" });
            }
            return acc;
          }, [] as any[])
          .sort((a, b) => Number(b.value) - Number(a.value))
          .slice(0, 3),
      },
    ];
  }, [filteredEmployees, filteredProjects]);

  const overutilizedEmployeesData = useMemo(() => {
    const overutilizedEmployees = filteredEmployees
      .filter((emp) => emp.utilization > 100)
      .sort((a, b) => b.utilization - a.utilization);
    const uniqueRoles = [
      ...new Set(overutilizedEmployees.map((emp) => emp.role)),
    ].sort();

    const allRoles = ["All", ...uniqueRoles];

    return { overutilizedEmployees, allRoles };
  }, [filteredEmployees]);

  return (
    <div className="space-y-3 mx-10">
      <div className="flex items-center justify-between">
        <div>
          <h1
            data-testid="dashboard-title"
            className="text-3xl font-bold text-gray-900"
          >
            Dashboard
          </h1>
          <p data-testid="dashboard-subtitle" className="text-gray-600 mt-1">
            Monitor project resources, utilization, and budget performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex items-center border border-gray-200 rounded-md bg-white">
            <Button
              variant={viewMode === "projects" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("projects")}
              data-testid="view-projects-button"
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
              data-testid="view-resources-button"
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

      <div
        data-testid="filter-controls"
        className="flex items-center gap-4 flex-wrap"
      >
        <DateRangePicker
          className="font-semibold"
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          placeholder="Period"
          data-testid="date-range-picker"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-1 h-10 bg-white"
              data-testid="role-filter-button"
            >
              <Filter className="h-4 w-4" />
              Role ({selectedRoles.length || "All"})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            data-testid="role-filter-dropdown"
          >
            <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedRoles.length === 0}
              onCheckedChange={() => setSelectedRoles([])}
              data-testid="role-filter-all-item"
            >
              All Roles
            </DropdownMenuCheckboxItem>
            {uniqueRoles.slice(1).map((role) => (
              <DropdownMenuCheckboxItem
                key={role}
                checked={selectedRoles.includes(role)}
                onCheckedChange={(checked) => {
                  setSelectedRoles(
                    checked
                      ? [...selectedRoles, role]
                      : selectedRoles.filter((item) => item !== role)
                  );
                }}
                data-testid={`role-filter-item-${role
                  .toLowerCase()
                  .replace(/\s/g, "-")}`}
              >
                {role}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1 h-10 bg-white">
              <Filter className="w-4 h-4" />
              Project ({selectedProjects.length || "All"})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            data-testid="project-filter-dropdown"
          >
            <div className="px-2 py-1">
              <input
                type="text"
                placeholder="Search project..."
                className="w-full px-2 py-1 border rounded text-sm"
                value={searchProject}
                onChange={(e) => setSearchProject(e.target.value)}
              />
            </div>
            <DropdownMenuCheckboxItem
              onCheckedChange={() => setSelectedProjects([])}
              data-testid="project-filter-all-item"
            >
              All Projects
            </DropdownMenuCheckboxItem>
            {uniqueProjects
              .slice(1)
              .filter((p) =>
                p.toLowerCase().includes(searchProject.toLowerCase())
              )
              .map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={selectedProjects.includes(p)}
                  onCheckedChange={(checked) =>
                    setSelectedProjects(
                      checked
                        ? [...selectedProjects, p]
                        : selectedProjects.filter((item) => item !== p)
                    )
                  }
                  data-testid={`project-filter-item-${p
                    .toLowerCase()
                    .replace(/\s/g, "-")}`}
                >
                  {p}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3"
        data-testid="summary-cards-container"
      >
        {(viewMode === "projects" ? projectSummary : resourceSummary).map(
          (item, i) => (
            <Card
              key={i}
              className="shadow-sm hover:shadow-md transition-shadow h-full"
              data-testid={`summary-card-${item.title
                .toLowerCase()
                .replace(/\s|\//g, "-")}`}
            >
              <div className="p-2 sm:p-3 lg:p-4 flex flex-col h-full">
                <CardHeader className="flex items-center justify-between p-0 mb-1 sm:mb-2">
                  <CardTitle
                    className="text-xs font-medium text-gray-600 leading-tight"
                    data-testid={`summary-card-title-${i}`}
                  >
                    {item.title}
                  </CardTitle>
                  <item.icon
                    className={`h-4 w-4 ${item.color} flex-shrink-0`}
                    data-testid={`summary-card-icon-${i}`}
                  />
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                  <p
                    className={`text-base sm:text-lg lg:text-xl font-bold mb-1 ${item.color} leading-tight`}
                  >
                    {item.value}
                  </p>
                  <ul
                    className="text-xs space-y-0.5"
                    data-testid={`summary-card-desc-list-${i}`}
                  >
                    {item.desc.map((d, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center gap-1"
                      >
                        <span className="text-gray-600 truncate flex-1 text-xs">
                          {d.label}
                        </span>
                        <span
                          className={`font-semibold ${
                            d.color || "text-gray-900"
                          } text-xs flex-shrink-0`}
                        >
                          {d.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </Card>
          )
        )}
      </div>

      {viewMode === "projects" ? (
        <div>
          <ProjectTable filteredProjects={filteredProjects} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">
                  Project Budget by Priority
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="chart-project-distribution">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={projectDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="budget"
                      nameKey="category"
                      labelLine={false}
                      label={({ percent }: any) =>
                        `${(percent * 100).toFixed(0)}%`
                      }
                      isAnimationActive
                      animationBegin={300}
                      animationDuration={1200}
                    >
                      {projectDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value: number, name, props) => {
                        const total = projectDistribution.reduce(
                          (sum, p) => sum + p.budget,
                          0
                        );
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [
                          `${new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(value)} (${percentage}%)`,
                          props.payload.category,
                        ];
                      }}
                    />

                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{
                        fontSize: "12px",
                        marginTop: "8px",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">
                  Project Budget Analysis
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="chart-project-budget-analysis">
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(
                    220,
                    filteredProjects.slice(0, 5).length * 60
                  )}
                >
                  <BarChart
                    data={filteredProjects.slice(0, 5)}
                    margin={{ top: 10, right: -10, left: -30, bottom: 10 }}
                    barCategoryGap="15%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={{ fontSize: 10 }}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                      tickFormatter={(value: string) =>
                        value.length > 15
                          ? value.substring(0, 12) + "..."
                          : value
                      }
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `${(value / 1_000_000).toFixed(1)}M`
                      }
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${formatRupiah(value)}`,
                        "Budget",
                      ]}
                      labelFormatter={(label) => `Project: ${label}`}
                    />
                    <Bar
                      dataKey="budget"
                      fill="#6366f1"
                      name="Budget"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive
                      animationBegin={200}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">
                  Project Crew Allocation
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="chart-project-crew-allocation">
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(
                    220,
                    filteredProjects.slice(0, 5).length * 60
                  )}
                >
                  <BarChart
                    data={filteredProjects.slice(0, 5)}
                    margin={{ top: 10, right: -10, left: -30, bottom: 35 }}
                    barCategoryGap="15%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={{ fontSize: 10 }}
                      angle={-30}
                      textAnchor="end"
                      height={35}
                      tickFormatter={(value: string) =>
                        value.length > 15
                          ? value.substring(0, 12) + "..."
                          : value
                      }
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value} people`,
                        "Crew Required",
                      ]}
                      labelFormatter={(label) => `Project: ${label}`}
                    />
                    <Bar
                      dataKey="crew"
                      fill="#22c55e"
                      name="Crew Required"
                      radius={[6, 6, 0, 0]}
                      animationBegin={200}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-1 gap-2">
            <Card className="shadow-md rounded-2xl mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-center">
                  Project Timeline & Progress
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="chart-project-timeline">
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(150, projectTimeline.length * 10)}
                >
                  <BarChart
                    data={projectTimeline}
                    margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                      tickFormatter={(value: string) =>
                        value.length > 15
                          ? value.substring(0, 12) + "..."
                          : value
                      }
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        name === "completed"
                          ? `${props.payload.progress}% (${value} days)`
                          : `${value} days remaining`,
                        name === "completed" ? "Completed" : "Remaining",
                      ]}
                      labelFormatter={(label: string) => `Project: ${label}`}
                    />
                    <Bar
                      dataKey="remaining"
                      stackId="a"
                      fill="#e5e7eb"
                      radius={[8, 8, 8, 8]}
                      barSize={60}
                    />
                    <Bar
                      dataKey="completed"
                      stackId="a"
                      radius={[8, 8, 8, 8]}
                      barSize={40}
                      isAnimationActive
                      animationBegin={150}
                      animationDuration={1000}
                    >
                      {stackedData.map((p, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={getProgressColor(p.progress)}
                        />
                      ))}
                      <LabelList
                        dataKey="progress"
                        position="center"
                        formatter={(value: React.ReactNode) => `${value}%`}
                        style={{
                          fill: "#fff",
                          fontWeight: "bold",
                          fontSize: 10,
                          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 xl:grid-cols-3">
            <Card className="shadow-sm mb col-span-1 xl:col-span-2 mb-3">
              <CardHeader className="mt-2">
                <CardTitle className="text-lg font-semibold text-center">
                  Workload by Role
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="chart-fte-workload">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {fteWorkloadData.map((roleData) => {
                    const pieData = [
                      { name: "Junior", value: roleData.junior },
                      { name: "Middle", value: roleData.middle },
                      { name: "Senior", value: roleData.senior },
                    ].filter((item) => item.value > 0);

                    return (
                      <div key={roleData.role}>
                        <div className="text-center font-medium text-sm mb-1">
                          {roleData.role}
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="45%"
                              outerRadius={70}
                              label={({
                                cx,
                                cy,
                                midAngle,
                                innerRadius,
                                outerRadius,
                                percent,
                              }) => {
                                const radius =
                                  Number(innerRadius) +
                                  (Number(outerRadius) - Number(innerRadius)) /
                                    2;
                                const x =
                                  Number(cx) +
                                  radius *
                                    Math.cos(
                                      (-Number(midAngle) * Math.PI) / 180
                                    );
                                const y =
                                  Number(cy) +
                                  radius *
                                    Math.sin(
                                      (-Number(midAngle) * Math.PI) / 180
                                    );
                                return (
                                  <text
                                    x={x}
                                    y={y}
                                    fill="white"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={12}
                                    fontWeight="bold"
                                  >
                                    {`${(Number(percent) * 100).toFixed(0)}%`}
                                  </text>
                                );
                              }}
                              labelLine={false}
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.name === "Junior"
                                      ? "#a7f3d0"
                                      : entry.name === "Middle"
                                      ? "#34d399"
                                      : "#059669"
                                  }
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend
                              verticalAlign="bottom"
                              height={0}
                              iconType="square"
                              formatter={(value) => (
                                <span className="text-sm">{value}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm mb-3">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">
                  Team Distribution
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="chart-team-distribution">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={teamDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={90}
                      paddingAngle={2}
                      labelLine={false}
                      label={({ percent }) =>
                        `${(Number(percent) * 100).toFixed(0)}%`
                      }
                      style={{
                        fontSize: "14px",
                      }}
                      isAnimationActive
                      animationBegin={300}
                      animationDuration={1200}
                    >
                      {teamDistributionData.map((entry, index) => (
                        <Cell
                          className="text-sm"
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => [`${value} crew`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <Card className="shadow-sm mb-">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">
                  Role Distribution by Level
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="chart-skills-distribution">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={skillsDistribution}
                    margin={{ top: 5, right: 10, left: -0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} people`,
                        String(name).charAt(0).toUpperCase() +
                          String(name).slice(1),
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: "12px", marginTop: "8px" }}
                    />
                    <Bar
                      dataKey="junior"
                      stackId="a"
                      fill="#f59e0b"
                      name="Junior"
                    />
                    <Bar
                      dataKey="middle"
                      stackId="a"
                      fill="#10b981"
                      name="Middle"
                    />
                    <Bar
                      dataKey="senior"
                      stackId="a"
                      fill="#3b82f6"
                      name="Senior"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="mt-3">
                <CardTitle className="text-lg font-semibold text-center">
                  Team Workload Distribution
                </CardTitle>
              </CardHeader>
              <CardContent data-testid="chart-team-workload-distribution">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={teamWorkload}
                    margin={{ top: 5, right: -10, left: -30, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" tick={{ fontSize: 10 }} />
                    <YAxis
                      yAxisId="people"
                      orientation="left"
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value}`,
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: "12px", marginTop: "8px" }}
                    />
                    <Bar
                      yAxisId="people"
                      dataKey="employees"
                      fill="#82ca9d"
                      name="Employees"
                    />
                    <Bar
                      yAxisId="people"
                      dataKey="projects"
                      fill="#ffbb55"
                      name="Projects"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm mt-2">
            <CardHeader className="mt-2">
              <CardTitle className="text-lg font-semibold text-center">
                Top 5 Utilization by Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeeHeatmap
                employees={filteredEmployees
                  .sort((a, b) => a.team.localeCompare(b.team))
                  .slice(0, 5)
                  .map((emp) => ({
                    ...emp,
                    utilization: Math.random() * 100,
                    currentProjects: [],
                    hoursThisWeek: 0,
                  }))}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
