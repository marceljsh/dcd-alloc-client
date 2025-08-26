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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const allProjects = [
  { project: "Project Alpha", req: 12, alloc: 10.5, util: 87.5, category: "Medium", role: "System Analyst" },
  { project: "Project Beta", req: 8.5, alloc: 9, util: 105.9, category: "Big", role: "Software Engineer" },
  { project: "Project Gamma", req: 15, alloc: 14, util: 93.3, category: "Medium", role: "Data Engineer" },
  { project: "Project Delta", req: 6, alloc: 5, util: 83.3, category: "Small", role: "System Analyst" },
  { project: "Project Epsilon", req: 10, alloc: 10, util: 100, category: "Small", role: "Software Engineer" },
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

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("All");
  const [selectedRoles, setSelectedRoles] = useState<{ value: string; label: string }[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<{ value: string; label: string }[]>([]);

  // -------------------------------
  // Filtering logic
  // -------------------------------
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

  const filteredRoleUtilization =
    selectedRoles.length === 0
      ? roleUtilizationAll
      : roleUtilizationAll.filter((r) => selectedRoles.map((x) => x.value).includes(r.role));

  const filteredTrend =
    selectedPeriod === "All"
      ? productivityTrendAll
      : productivityTrendAll.filter((d) => d.month === selectedPeriod);

  // Summary Cards (dinamis)
  const summary = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalResources = filteredProjects.reduce((sum, p) => sum + p.alloc, 0).toFixed(1);
    const avgUtil =
      filteredProjects.reduce((sum, p) => sum + p.util, 0) / (filteredProjects.length || 1);

    const idle = 100 - avgUtil;
    const critical = filteredProjects.filter((p) => p.util > 100).length;

    return [
      {
        title: "Total Projects Active",
        value: totalProjects,
        desc: filteredProjects.map((p) => `${p.role}: ${p.project}`).slice(0, 3),
      },
      {
        title: "Total Resources (FTE)",
        value: totalResources,
        desc: filteredProjects.map((p) => `${p.project}: ${p.alloc}`),
      },
      {
        title: "Utilization %",
        value: `${avgUtil.toFixed(0)}%`,
        color: avgUtil > 100 ? "text-red-600" : "text-green-600",
        desc: filteredProjects.map((p) => `${p.project}: ${p.util.toFixed(1)}%`),
      },
      {
        title: "Idle %",
        value: `${idle.toFixed(0)}%`,
        color: "text-yellow-500",
        desc: [],
      },
      {
        title: "Critical Projects",
        value: critical,
        color: "text-red-600",
        desc: filteredProjects.filter((p) => p.util > 100).map((p) => p.project),
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
                Role ({selectedRoles.length})
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
        {summary.map((item, i) => (
          <Card key={i} className="shadow-md mt-3">
            <CardHeader className="mt-3">
              <CardTitle className="text-sm">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="mb-5">
              <p className={`text-2xl font-bold ${item.color || ""}`}>{item.value}</p>
              <ul className="mt-3 text-xs text-gray-500 space-y-1">
                {item.desc.slice(0, 3).map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Allocation + Role Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table */}
        <Card className="shadow-md">
          <CardHeader className="mt-4">
            <CardTitle className="text w-2xl">Project Allocation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="p-2">Project</th>
                  <th className="p-2">Required FTE</th>
                  <th className="p-2">Allocated FTE</th>
                  <th className="p-2">Utilization %</th>
                  <th className="p-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((row, i) => (
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
  <CardHeader className="mt-4">
    <CardTitle>Productivity Trend</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={320}>
      {/* Ganti LineChart jadi AreaChart untuk efek stacked & smooth */}
      <AreaChart
        data={filteredTrend}
        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* Timeline lebih spesifik → gunakan tanggal/hari */}
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Legend />

        <Area
          type="monotone"
          dataKey="Software Engineer"
          stackId="1"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
        />
        <Area
          type="monotone"
          dataKey="Data Engineer"
          stackId="1"
          stroke="#f43f5e"
          fill="#f43f5e"
          fillOpacity={0.25}
        />
        <Area
          type="monotone"
          dataKey="System Analyst"
          stackId="1"
          stroke="#14b8a6"
          fill="#14b8a6"
          fillOpacity={0.25}
        />

      </AreaChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

    </div>
  );
}
