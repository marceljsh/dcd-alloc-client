"use client";

import { useState, useMemo } from "react";
import Select from "react-select";
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
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Filter } from "lucide-react";

const allProjects = [
  { project: "Project Alpha", req: 12, alloc: 10.5, util: 87.5, category: "Medium", role: "System Analyst" },
  { project: "Project Beta", req: 8.5, alloc: 9, util: 105.9, category: "Big", role: "Software Engineer" },
  { project: "Project Gamma", req: 15, alloc: 14, util: 63.3, category: "Medium", role: "Data Engineer" },
  { project: "Project Delta", req: 6, alloc: 5, util: 83.3, category: "Small", role: "System Analyst" },
  { project: "Project Epsilon", req: 10, alloc: 10, util: 100, category: "Small", role: "Software Engineer" },
  { project: "Project Zeta", req: 25, alloc: 22.5, util: 90.0, category: "Big", role: "Software Engineer" },
  { project: "Project Eta", req: 7, alloc: 7.5, util: 107.1, category: "Small", role: "System Analyst" },
  { project: "Project Theta", req: 18, alloc: 16.2, util: 90.0, category: "Big", role: "Software Engineer" },
  { project: "Project Iota", req: 11.5, alloc: 11.5, util: 100.0, category: "Medium", role: "Data Engineer" },
  { project: "Project Kappa", req: 4.5, alloc: 3.5, util: 77.8, category: "Small", role: "System Analyst" },
  { project: "Project Lambda", req: 9, alloc: 9.5, util: 105.6, category: "Medium", role: "Software Engineer" },
  { project: "Project Mu", req: 30, alloc: 28, util: 93.3, category: "Big", role: "System Analyst" },
  { project: "Project Nu", req: 5.5, alloc: 5, util: 90.9, category: "Small", role: "Data Engineer" },
  { project: "Project Xi", req: 17, alloc: 17.5, util: 102.9, category: "Big", role: "Software Engineer" },
  { project: "Project Omicron", req: 20, alloc: 18, util: 90.0, category: "Big", role: "Data Engineer" },
  { project: "Project Pi", req: 8, alloc: 6, util: 75.0, category: "Small", role: "System Analyst" },
  { project: "Project Rho", req: 13, alloc: 12.5, util: 96.2, category: "Medium", role: "Software Engineer" },
  { project: "Project Sigma", req: 22, alloc: 20, util: 90.9, category: "Big", role: "Data Engineer" },
  { project: "Project Tau", req: 6.5, alloc: 7, util: 107.7, category: "Small", role: "System Analyst" },
  { project: "Project Upsilon", req: 14, alloc: 13, util: 92.9, category: "Medium", role: "Data Engineer" },
  { project: "Project Phi", req: 19, alloc: 19.5, util: 102.6, category: "Big", role: "Software Engineer" },
  { project: "Project Chi", req: 16, alloc: 15, util: 93.8, category: "Medium", role: "System Analyst" },
  { project: "Project Psi", req: 10.5, alloc: 10, util: 95.2, category: "Medium", role: "Data Engineer" },
  { project: "Project Omega", req: 28, alloc: 25, util: 89.3, category: "Big", role: "Software Engineer" },
];

const roleUtilizationAll = [
  { role: "System Analyst", Allocated: 92, Idle: 8, Overload: 0 },
  { role: "Data Engineer", Allocated: 78, Idle: 22, Overload: 0 },
  { role: "Software Engineer", Allocated: 105, Idle: 0, Overload: 5 },
];

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
];

interface CategoryColorMap {
  [key: string]: string;
}

type Category = 'Small' | 'Medium' | 'Big';

const getCategoryColor = (category: Category | string): string => {
  const colorMap: CategoryColorMap = {
    Small: 'bg-blue-100 text-blue-800',
    Medium: 'bg-green-100 text-green-800',
    Big: 'bg-yellow-100 text-yellow-800',
  };
  return colorMap[category] || 'bg-gray-100 text-gray-800';
};


const generateDaysInMonth = (monthName: string, year: number) => {
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayLabel: `${day}`, 
      "Software Engineer": Math.floor(Math.random() * 100), // contoh dummy
      "Data Engineer": Math.floor(Math.random() * 100),
      "System Analyst": Math.floor(Math.random() * 100),
    };
  });
};

function ProjectTable({ filteredProjects }: { filteredProjects: typeof allProjects }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof typeof allProjects[0]; direction: 'asc' | 'desc' }>({
    key: 'project',
    direction: 'asc',
  });

  const itemsPerPage = 5;
  const handleSort = (key: keyof typeof allProjects[0]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedProjects = useMemo(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      return 0;
    });
    return sorted;
  }, [filteredProjects, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredAndSortedProjects.slice(startIndex, startIndex + itemsPerPage);

  const getSortIcon = (key: keyof typeof allProjects[0]) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'asc') {
      return <ArrowDown className="w-3 h-3 ml-1 inline-block" />;
    }
    return <ArrowUp className="w-3 h-3 ml-1 inline-block" />;
  };

  return (
    <>
      <table className="w-full text-sm">
        <thead className="border-b text-left">
          <tr>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('project')}>
              Project {getSortIcon('project')}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('req')}>
              Required FTE {getSortIcon('req')}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('alloc')}>
              Allocated FTE {getSortIcon('alloc')}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('util')}>
              Utilization % {getSortIcon('util')}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => handleSort('category')}>
              Category {getSortIcon('category')}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{row.project}</td>
              <td className="p-2">{row.req}</td>
              <td className="p-2">{row.alloc}</td>
              <td className={`p-2 ${row.util > 100 ? "text-red-600" : "text-green-600"}`}>
                {row.util.toFixed(1)}%
              </td>
              <td className="p-2">{row.category}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
              className={`px-2 py-1 border rounded text-xs ${
                currentPage === i + 1 ? "bg-primary text-white" : ""
              }`}
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
  );
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("All");
  const [selectedRoles, setSelectedRoles] = useState<{ value: string; label: string }[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<{ value: string; label: string }[]>([]);


  const filteredProjects = useMemo(() => {
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

  const filteredRoleUtilization = useMemo(() => {
    // If no role or project is selected, show all role utilization data
    if (selectedRoles.length === 0 && selectedProjects.length === 0) {
      return roleUtilizationAll;
    }
  
    // Filter projects based on selected roles and projects
    const filteredProjectsForRoles = allProjects.filter(project =>
      (selectedRoles.length === 0 || selectedRoles.some(role => role.value === project.role)) &&
      (selectedProjects.length === 0 || selectedProjects.some(proj => proj.value === project.project))
    );
  
    // Aggregate data by role
    const aggregatedData = filteredProjectsForRoles.reduce((acc, project) => {
      const role = project.role;
      if (!acc[role]) {
        acc[role] = { role, allocated: 0, idle: 0, overload: 0, totalProjects: 0, totalReq: 0, totalAlloc: 0 };
      }
      acc[role].totalProjects += 1;
      acc[role].totalReq += project.req;
      acc[role].totalAlloc += project.alloc;
      return acc;
    }, {} as Record<string, any>);
  
    // Calculate final metrics (Allocated, Idle, Overload)
    return Object.values(aggregatedData).map(data => {
      const totalUtilization = data.totalProjects > 0 ? (data.totalAlloc / data.totalReq) * 100 : 0;
      return {
        role: data.role,
        Allocated: Math.min(100, totalUtilization),
        Idle: Math.max(0, 100 - totalUtilization),
        Overload: Math.max(0, totalUtilization - 100),
      };
    });
  }, [selectedRoles, selectedProjects]);
  

  const processedTrend = useMemo(() => {
    let data = selectedPeriod === "All" ? productivityTrendAll : generateDaysInMonth(selectedPeriod, 2025);
  
    // Get the roles that are currently selected
    const rolesToFilter = selectedRoles.length > 0 ? selectedRoles.map(r => r.value) : Object.keys(data[0] || {}).filter(key => key !== 'month' && key !== 'dayLabel' && key !== 'date');
    const rolesToDisplay = selectedRoles.length > 0 ? selectedRoles.map(r => r.value) : ["Software Engineer", "Data Engineer", "System Analyst"];
  
    // If no projects are selected, but roles are, we use the roles to filter the trend.
    // If projects are selected, we need to find the roles associated with those projects.
    let rolesFromProjects = selectedProjects.length > 0 
      ? Array.from(new Set(allProjects.filter(p => selectedProjects.map(sp => sp.value).includes(p.project)).map(p => p.role)))
      : [];
  
    const finalRoles = rolesFromProjects.length > 0 
      ? rolesFromProjects
      : rolesToDisplay;
  
    // Filter out the roles that are not in the final list
    const filteredData = data.map(entry => {
      const newEntry: any = { ...entry };
      Object.keys(newEntry).forEach(key => {
        if (key !== 'month' && key !== 'dayLabel' && key !== 'date' && !finalRoles.includes(key)) {
          delete newEntry[key];
        }
      });
      return newEntry;
    });
  
    return filteredData;
  }, [selectedPeriod, selectedRoles, selectedProjects]);
  

  const getAreaKeys = useMemo(() => {
    const roles = selectedRoles.length > 0 ? selectedRoles.map(r => r.value) : ["Software Engineer", "Data Engineer", "System Analyst"];
    const projectRoles = selectedProjects.length > 0 
      ? Array.from(new Set(filteredProjects.map(p => p.role)))
      : roles;
    return projectRoles;
  }, [selectedRoles, selectedProjects, filteredProjects]);
  
  // Summary Cards (dinamis)
  const summary = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalResources = filteredProjects
      .reduce((sum, p) => sum + p.alloc, 0)
      .toFixed(1);

    const roles = Array.from(new Set(filteredProjects.map((p) => p.role)));
    const utilizationByRole = roles.map((role) => {
      const roleProjects = filteredProjects.filter((p) => p.role === role);
      const avgUtil =
        roleProjects.reduce((sum, p) => sum + p.util, 0) /
        (roleProjects.length || 1);
      return { role, util: avgUtil };
    });

    const avgUtil =
      filteredProjects.reduce((sum, p) => sum + p.util, 0) /
      (filteredProjects.length || 1);

    const idle = 100 - avgUtil;
    const critical = filteredProjects.filter((p) => p.util > 100).length;

    return [
      {
        title: "Total Projects Active",
        value: totalProjects,
        desc: roles.map((role) => ({
          label: role,
          value: filteredProjects.filter((p) => p.role === role).length,
        })),
      },
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
        value: `${avgUtil.toFixed(0)}%`,
        color: avgUtil > 100 ? "text-red-600" : "text-green-600",
        desc: utilizationByRole.map((r) => ({
          label: r.role,
          value: `${r.util.toFixed(0)}%`,
          color:
            r.util > 100
              ? "text-red-600"
              : r.util < 80
              ? "text-yellow-600"
              : "text-green-600",
        })),
      },
      {
        title: "Idle %",
        value: `${idle.toFixed(0)}%`,
        color: "text-yellow-500",
        desc: utilizationByRole.map((r) => ({
          label: r.role,
          value: `${(100 - r.util).toFixed(0)}%`,
          color:
            100 - r.util > 20
              ? "text-yellow-600"
              : "text-green-600",
        })),
      },
      {
        title: "Critical Projects",
        value: critical,
        color: "text-red-600",
        desc: roles.map((role) => ({
          label: role,
          value: filteredProjects.filter(
            (p) => p.role === role && p.util > 100
          ).length,
        })),
      },
    ];
  }, [filteredProjects]);

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Resource Allocation Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          {/* Period */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 bg-foreground text-background">
                <Filter className="h-4 w-4" />
                Period ({selectedPeriod})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedPeriod}
                onValueChange={(val) => setSelectedPeriod(val)}
              >
                <DropdownMenuRadioItem value="All">All Periods</DropdownMenuRadioItem>
                {productivityTrendAll.map((d) => (
                  <DropdownMenuRadioItem key={d.month} value={d.month}>
                    {d.month}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Multi-select Role */}
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
                const roleObj = { value: r.role, label: r.role };
                const isChecked = selectedRoles.some((role) => role.value === r.role);
                return (
                  <DropdownMenuCheckboxItem
                    key={r.role}
                    checked={isChecked}
                    onSelect={(e) => e.preventDefault()} // biar nggak langsung close
                    onCheckedChange={(checked) =>
                      setSelectedRoles(
                        checked
                          ? [...selectedRoles, roleObj]
                          : selectedRoles.filter((role) => role.value !== r.role)
                      )
                    }
                  >
                    {r.role}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Multi-select Project */}
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
                const projectObj = { value: p.project, label: p.project };
                const isChecked = selectedProjects.some((proj) => proj.value === p.project);
                return (
                  <DropdownMenuCheckboxItem
                    key={p.project}
                    checked={isChecked}
                    onSelect={(e) => e.preventDefault()} // biar nggak close tiap klik
                    onCheckedChange={(checked) =>
                      setSelectedProjects(
                        checked
                          ? [...selectedProjects, projectObj]
                          : selectedProjects.filter((proj) => proj.value !== p.project)
                      )
                    }
                  >
                    {p.project}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 🔹 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
        {summary.map((item, i) => (
          <Card key={i} className="shadow-md mt-3">
            <CardHeader className="mt-3">
              <CardTitle className="text w-2xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="mb-5">
              <p className={`text-2xl font-bold ${item.color || ""}`}>
                {item.value}
              </p>
              <ul className="mt-3 text-xs space-y-1">
                {item.desc.map((d, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between"
                  >
                    <span>{d.label}</span>
                    <span className={typeof (d as any).color === "string" ? (d as any).color : "text-gray-500"}>
                      {d.value}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table */}
        <Card className="shadow-md">
          <CardHeader className="mt-4">
            <CardTitle className="text w-2xl">Project Allocation Overview</CardTitle>
          </CardHeader>
        <CardContent>
          <ProjectTable filteredProjects={filteredProjects} />
        </CardContent>
        </Card>

        {/* Chart */}
        <Card className="shadow-md">
          <CardHeader className="mt-4">
            <CardTitle>Resource Utilization by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={filteredRoleUtilization}>
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Allocated" stackId="a" fill="#22c55e" />
                <Bar dataKey="Idle" stackId="a" fill="#eab308" />
                <Bar dataKey="Overload" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Trend */}
      <Card className="shadow-md">
        <CardHeader className="mt-4 flex justify-center">
          <CardTitle className="text-w-2xl">Productivity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={processedTrend}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={selectedPeriod === "All" ? "month" : "dayLabel"}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />

              {getAreaKeys.includes("Software Engineer") && (
                <Area
                  type="monotone"
                  dataKey="Software Engineer"
                  stackId="1"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                />
              )}
              {getAreaKeys.includes("Data Engineer") && (
                <Area
                  type="monotone"
                  dataKey="Data Engineer"
                  stackId="1"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.25}
                />
              )}
              {getAreaKeys.includes("System Analyst") && (
                <Area
                  type="monotone"
                  dataKey="System Analyst"
                  stackId="1"
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
  );
}