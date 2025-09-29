"use client";

import { useState, useMemo, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  Filter,
  AlertTriangle,
  DollarSign,
  Users,
  Target,
  Layers,
} from "lucide-react";

// --- DATASET ---
const allProjects = [
  {
    project: "Project Alpha",
    req: 12,
    alloc: 10.5,
    util: 87.5,
    priority: "Medium",
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
    priority: "High",
    category: "Small",
    role: "Software Engineer",
    budget: 200000,
    actual: 210000,
  },
  {
    project: "Project Gamma",
    req: 15,
    alloc: 14,
    util: 93.3,
    priority: "Medium",
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
    priority: "Low",
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
    priority: "Low",
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
    priority: "Critical",
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
    priority: "Low",
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
    priority: "High",
    category: "Medium",
    role: "Software Engineer",
    budget: 220000,
    actual: 210000,
  },
  {
    project: "Project Iota",
    req: 11.5,
    alloc: 11.5,
    util: 100.0,
    priority: "Medium",
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
    priority: "Low",
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
    priority: "Medium",
    category: "Small",
    role: "Software Engineer",
    budget: 110000,
    actual: 115000,
  },
  {
    project: "Project Mu",
    req: 30,
    alloc: 28,
    util: 93.3,
    priority: "Critical",
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
    priority: "Low",
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
    priority: "High",
    category: "Medium",
    role: "Software Engineer",
    budget: 210000,
    actual: 215000,
  },
  {
    project: "Project Omicron",
    req: 20,
    alloc: 18,
    util: 90.0,
    priority: "Critical",
    category: "Medium",
    role: "Data Engineer",
    budget: 250000,
    actual: 240000,
  },
  {
    project: "Project Pi",
    req: 8,
    alloc: 6,
    util: 75.0,
    priority: "Low",
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
    priority: "Medium",
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
    priority: "High",
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
    priority: "Low",
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
    priority: "Medium",
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
    priority: "High",
    category: "Medium",
    role: "Software Engineer",
    budget: 240000,
    actual: 245000,
  },
  {
    project: "Project Chi",
    req: 16,
    alloc: 15,
    util: 93.8,
    priority: "Medium",
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
    priority: "Medium",
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
    priority: "Critical",
    category: "Big",
    role: "Software Engineer",
    budget: 320000,
    actual: 310000,
  },
];

const roleUtilizationAll = [
  { role: "System Analyst", Allocated: 92, Idle: 8, Overload: 0 },
  { role: "Data Engineer", Allocated: 78, Idle: 22, Overload: 0 },
  { role: "Software Engineer", Allocated: 105, Idle: 0, Overload: 5 },
];

const productivityTrendAll = [
  {
    month: "Jan",
    "Software Engineer": 90,
    "Data Engineer": 60,
    "System Analyst": 70,
  },
  {
    month: "Feb",
    "Software Engineer": 20,
    "Data Engineer": 40,
    "System Analyst": 60,
  },
  {
    month: "Mar",
    "Software Engineer": 70,
    "Data Engineer": 25,
    "System Analyst": 80,
  },
  {
    month: "Apr",
    "Software Engineer": 80,
    "Data Engineer": 30,
    "System Analyst": 85,
  },
  {
    month: "May",
    "Software Engineer": 60,
    "Data Engineer": 40,
    "System Analyst": 90,
  },
  {
    month: "Jun",
    "Software Engineer": 85,
    "Data Engineer": 45,
    "System Analyst": 95,
  },
  {
    month: "Jul",
    "Software Engineer": 95,
    "Data Engineer": 55,
    "System Analyst": 100,
  },
  {
    month: "Aug",
    "Software Engineer": 70,
    "Data Engineer": 40,
    "System Analyst": 85,
  },
  {
    month: "Sep",
    "Software Engineer": 75,
    "Data Engineer": 50,
    "System Analyst": 88,
  },
  {
    month: "Oct",
    "Software Engineer": 90,
    "Data Engineer": 55,
    "System Analyst": 95,
  },
  {
    month: "Nov",
    "Software Engineer": 92,
    "Data Engineer": 60,
    "System Analyst": 96,
  },
  {
    month: "Dec",
    "Software Engineer": 85,
    "Data Engineer": 65,
    "System Analyst": 90,
  },
];

const generateDaysInMonth = (monthName, year) => {
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayLabel: `${day}`,
      "Software Engineer": Math.floor(Math.random() * 100),
      "Data Engineer": Math.floor(Math.random() * 100),
      "System Analyst": Math.floor(Math.random() * 100),
    };
  });
};

function ProjectTable({ filteredProjects }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "project",
    direction: "asc",
  });

  const itemsPerPage = 7;

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedProjects = useMemo(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });
    return sorted;
  }, [filteredProjects, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredAndSortedProjects.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowDown className="w-3 h-3 ml-1 inline-block" />
    ) : (
      <ArrowUp className="w-3 h-3 ml-1 inline-block" />
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left">
            <tr>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("project")}
              >
                Project {getSortIcon("project")}
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("req")}
              >
                Required FTE {getSortIcon("req")}
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("alloc")}
              >
                Allocated FTE {getSortIcon("alloc")}
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("util")}
              >
                Utilization % {getSortIcon("util")}
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("priority")}
              >
                Priority {getSortIcon("priority")}
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("budget")}
              >
                Budget {getSortIcon("budget")}
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("actual")}
              >
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
                <td
                  className={`p-2 font-semibold ${row.util > 100 ? "text-red-600" : "text-green-600"}`}
                >
                  {row.util.toFixed(1)}%
                </td>
                <td className="p-2">{row.priority}</td>
                <td className="p-2">${row.budget.toLocaleString()}</td>
                <td
                  className={`p-2 font-semibold ${row.actual > row.budget ? "text-red-600" : "text-green-600"}`}
                >
                  ${row.actual.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          className="mb-2 bg-transparent"
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </>
  );
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DashboardPage() {
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const projectsFilteredByRoleAndProject = useMemo(() => {
    let data = allProjects;
    if (selectedRoles.length > 0) {
      const roles = selectedRoles.map((r) => r.value);
      data = data.filter((p) => roles.includes(p.role));
    }
    if (selectedProjects.length > 0) {
      const projects = selectedProjects.map((p) => p.value);
      data = data.filter((p) => projects.includes(p.project));
    }
    return data;
  }, [selectedRoles, selectedProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedPeriods.length !== 1) {
      return projectsFilteredByRoleAndProject;
    }
    const selectedMonth = selectedPeriods[0];
    const monthData = productivityTrendAll.find(
      (d) => d.month === selectedMonth,
    );
    if (!monthData) {
      return projectsFilteredByRoleAndProject;
    }
    const productivityFactors = {
      "Software Engineer": (monthData["Software Engineer"] || 100) / 100,
      "Data Engineer": (monthData["Data Engineer"] || 100) / 100,
      "System Analyst": (monthData["System Analyst"] || 100) / 100,
    };
    return projectsFilteredByRoleAndProject.map((p) => {
      const factor = productivityFactors[p.role] ?? 1;
      const newAlloc = p.alloc * factor;
      const newUtil = p.req > 0 ? (newAlloc / p.req) * 100 : 0;
      const newActual = p.actual * factor;
      return {
        ...p,
        alloc: Number.parseFloat(newAlloc.toFixed(1)),
        util: Number.parseFloat(newUtil.toFixed(1)),
        actual: Number.parseFloat(newActual.toFixed(0)),
      };
    });
  }, [projectsFilteredByRoleAndProject, selectedPeriods]);

  const utilizationChartData = useMemo(() => {
    if (filteredProjects.length === 0) return [];
    const rolesInView = [...new Set(filteredProjects.map((p) => p.role))];
    return rolesInView.map((role) => {
      const roleProjects = filteredProjects.filter((p) => p.role === role);
      const totalReq = roleProjects.reduce((s, p) => s + p.req, 0);
      const totalAlloc = roleProjects.reduce((s, p) => s + p.alloc, 0);
      const utilization = totalReq > 0 ? (totalAlloc / totalReq) * 100 : 0;
      return {
        role,
        Allocated: Math.min(100, utilization),
        Overload: Math.max(0, utilization - 100),
      };
    });
  }, [filteredProjects]);

  const processedTrend = useMemo(() => {
    let data;
    if (selectedPeriods.length === 0) {
      data = productivityTrendAll;
    } else if (selectedPeriods.length === 1) {
      data = generateDaysInMonth(selectedPeriods[0], 2025);
    } else {
      data = productivityTrendAll.filter((d) =>
        selectedPeriods.includes(d.month),
      );
    }
    const rolesToDisplay =
      selectedRoles.length > 0
        ? selectedRoles.map((r) => r.value)
        : ["Software Engineer", "Data Engineer", "System Analyst"];
    const rolesFromProjects =
      selectedProjects.length > 0
        ? Array.from(
            new Set(
              allProjects
                .filter((p) =>
                  selectedProjects.map((sp) => sp.value).includes(p.project),
                )
                .map((p) => p.role),
            ),
          )
        : [];
    const finalRoles =
      rolesFromProjects.length > 0 ? rolesFromProjects : rolesToDisplay;
    return data.map((entry) => {
      const newEntry = { ...entry };
      Object.keys(newEntry).forEach((key) => {
        if (
          key !== "month" &&
          key !== "dayLabel" &&
          key !== "date" &&
          !finalRoles.includes(key)
        ) {
          delete newEntry[key];
        }
      });
      return newEntry;
    });
  }, [selectedPeriods, selectedRoles, selectedProjects]);

  const getAreaKeys = useMemo(() => {
    if (selectedProjects.length > 0) {
      return Array.from(new Set(filteredProjects.map((p) => p.role)));
    }
    if (selectedRoles.length > 0) {
      return selectedRoles.map((r) => r.value);
    }
    return ["Software Engineer", "Data Engineer", "System Analyst"];
  }, [selectedRoles, selectedProjects, filteredProjects]);

  const summary = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalResources = filteredProjects.reduce(
      (sum, p) => sum + p.alloc,
      0,
    );
    const avgUtil =
      filteredProjects.reduce((sum, p) => sum + p.util, 0) /
      (totalProjects || 1);

    const overBudgetProjects = filteredProjects
      .filter((p) => p.actual > p.budget)
      .sort((a, b) => b.actual - b.budget - (a.actual - a.budget));

    const projectCategories = filteredProjects.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        title: "Total Resources (FTE)",
        value: totalResources.toFixed(1),
        icon: Users,
        color: "text-blue-500",
        desc: [...new Set(filteredProjects.map((p) => p.role))].map((role) => ({
          label: role,
          value: filteredProjects
            .filter((p) => p.role === role)
            .reduce((s, p) => s + p.alloc, 0)
            .toFixed(1),
        })),
      },
      {
        title: "Avg. Utilization %",
        value: `${(avgUtil || 0).toFixed(0)}%`,
        icon: Target,
        color: avgUtil > 100 ? "text-red-500" : "text-green-500",
        desc: [...new Set(filteredProjects.map((p) => p.role))].map((role) => {
          const roleProjects = filteredProjects.filter((p) => p.role === role);
          const rAvgUtil =
            roleProjects.reduce((s, p) => s + p.util, 0) /
            (roleProjects.length || 1);
          return {
            label: role,
            value: `${rAvgUtil.toFixed(0)}%`,
            color:
              rAvgUtil > 100
                ? "text-red-500"
                : rAvgUtil < 80
                  ? "text-yellow-500"
                  : "text-green-500",
          };
        }),
      },
      {
        title: "Critical Projects",
        value: filteredProjects.filter((p) => p.util > 100).length,
        icon: AlertTriangle,
        color: "text-red-500",
        desc: filteredProjects
          .filter((p) => p.util > 100)
          .sort((a, b) => b.util - a.util)
          .slice(0, 3)
          .map((p) => ({
            label: p.project,
            value: `${p.util.toFixed(1)}%`,
            color: "text-red-500",
          })),
      },
      {
        title: "Over-budget Projects",
        value: overBudgetProjects.length,
        icon: DollarSign,
        color: "text-orange-500",
        desc: overBudgetProjects.slice(0, 3).map((p) => ({
          label: p.project,
          value: `+ $${(p.actual - p.budget).toLocaleString()}`,
          color: "text-red-500",
        })),
      },
      {
        title: "Project Category",
        value: `${totalProjects} Projects`,
        icon: Layers, // pakai icon biar lebih relevan
        color: "text-purple-500",
        desc: [
          { label: "Small", value: projectCategories["Small"] || 0 },
          { label: "Medium", value: projectCategories["Medium"] || 0 },
          { label: "Big", value: projectCategories["Big"] || 0 },
        ],
      },
    ];
  }, [filteredProjects]);

  const enhancedMetrics = useMemo(() => {
    const priorityDistribution = filteredProjects.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1;
      return acc;
    }, {});
    const roleDistribution = filteredProjects.reduce((acc, p) => {
      acc[p.role] = (acc[p.role] || 0) + p.alloc;
      return acc;
    }, {});

    return {
      priorityDistribution: Object.entries(priorityDistribution).map(
        ([name, value]) => ({ name, value }),
      ),
      roleDistribution: Object.entries(roleDistribution).map(
        ([name, value]) => ({
          name,
          value: Number(value.toFixed(1)),
        }),
      ),
    };
  }, [filteredProjects]);

  return (
    <div className="space-y-4 min-h-screen mx-10 mb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Resource Allocation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor project resources, utilization, and budget performance
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 bg-transparent">
                <Filter className="h-4 w-4" />
                Period (
                {selectedPeriods.length > 0
                  ? selectedPeriods.join(", ")
                  : "All"}
                )
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedPeriods.length === 0}
                onCheckedChange={() => setSelectedPeriods([])}
              >
                All Periods
              </DropdownMenuCheckboxItem>
              {productivityTrendAll.map((d) => (
                <DropdownMenuCheckboxItem
                  key={d.month}
                  checked={selectedPeriods.includes(d.month)}
                  onCheckedChange={(checked) =>
                    setSelectedPeriods(
                      checked
                        ? [...selectedPeriods, d.month]
                        : selectedPeriods.filter((m) => m !== d.month),
                    )
                  }
                >
                  {d.month}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 bg-transparent">
                <Filter className="h-4 w-4" />
                Role ({selectedRoles.length || "All"})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedRoles.length === 0}
                onCheckedChange={() => setSelectedRoles([])}
              >
                All Roles
              </DropdownMenuCheckboxItem>
              {roleUtilizationAll.map((r) => (
                <DropdownMenuCheckboxItem
                  key={r.role}
                  checked={selectedRoles.some((role) => role.value === r.role)}
                  onCheckedChange={(checked) =>
                    setSelectedRoles(
                      checked
                        ? [...selectedRoles, { value: r.role, label: r.role }]
                        : selectedRoles.filter((role) => role.value !== r.role),
                    )
                  }
                >
                  {r.role}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 bg-transparent">
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
              {allProjects.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p.project}
                  checked={selectedProjects.some(
                    (proj) => proj.value === p.project,
                  )}
                  onCheckedChange={(checked) =>
                    setSelectedProjects(
                      checked
                        ? [
                            ...selectedProjects,
                            { value: p.project, label: p.project },
                          ]
                        : selectedProjects.filter(
                            (proj) => proj.value !== p.project,
                          ),
                    )
                  }
                >
                  {p.project}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {summary.map((item, i) => (
          <Card
            key={i}
            className="shadow-sm hover:shadow-md transition-shadow py-4"
          >
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {item.title}
              </CardTitle>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold mb-2 ${item.color}`}>
                {item.value}
              </p>
              <ul className="text-xs space-y-1 mb-2">
                {item.desc.map((d, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="text-gray-600">{d.label}</span>
                    <span
                      className={`font-semibold ${d.color || "text-gray-900"}`}
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="shadow-sm xl:col-span-1">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">
              Project Distribution by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={enhancedMetrics.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {enhancedMetrics.priorityDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm xl:col-span-2">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">
              Resource Allocation (FTE)
            </CardTitle>
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
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} FTE`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 xl:col-span-2">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg">
              Resource Utilization by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={utilizationChartData}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 2" />
                <XAxis type="number" unit="%" />
                <YAxis
                  dataKey="role"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(1)}%`}
                />
                <Legend />
                <Bar dataKey="Allocated" stackId="a" fill="#34d399" />
                <Bar dataKey="Overload" stackId="a" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">
              Project Allocation Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectTable filteredProjects={filteredProjects} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="mt-3">
            <CardTitle className="text-lg font-semibold">
              Productivity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={processedTrend}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey={selectedPeriods.length === 1 ? "dayLabel" : "month"}
                  tick={{ fontSize: 12, fill: "#374151" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#374151" }} unit="%" />
                <Tooltip formatter={(value) => `${value}%`} />
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
                  <Area
                    type="monotone"
                    dataKey="Data Engineer"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.25}
                  />
                )}
                {getAreaKeys.includes("System Analyst") && (
                  <Area
                    type="monotone"
                    dataKey="System Analyst"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.25}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="mt-3">
          <CardTitle className="text-lg font-semibold">
            Budget vs Actual Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={filteredProjects}
              margin={{ top: 5, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="project"
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 10 }}
                height={30}
                tickFormatter={(value: string) => value.replace("Project ", "")}
              />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(value)
                }
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" name="Budget" />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual Cost" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
