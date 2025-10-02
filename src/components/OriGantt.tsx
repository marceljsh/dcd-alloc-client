"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, User, Zap, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dict, isArrayEmpty } from "@/lib/containers";
import { cn } from "@/lib/utils";
import {
  differenceInDays,
  endOfWeek,
  max as maxDate,
  min as minDate,
  startOfWeek,
} from "date-fns";
import { isWeekend } from "@/lib/dates";

const roles = ["System Analyst", "Data Engineer", "Software Engineer"];
type Role = (typeof roles)[number];

interface Employee {
  id: number;
  name: string;
  role: Role;
}

interface Project {
  id: number;
  name: string;
}

interface Stage {
  id: number;
  projectId: number;
  name: string;
}

interface Task {
  id: number;
  stageId: number;
  employeeId: number;
  name: string;
  startDate: string;
  endDate: string;
  storyPoints: number;
}

const employees: Dict<number, Employee> = new Dict([
  [1, { id: 1, name: "Alice Johnson", role: "System Analyst" }],
  [2, { id: 2, name: "Bob Smith", role: "Data Engineer" }],
  [3, { id: 3, name: "Carol Davis", role: "Software Engineer" }],
  [4, { id: 4, name: "David Wilson", role: "Software Engineer" }],
  [5, { id: 5, name: "Eva Brown", role: "Data Engineer" }],
  [6, { id: 6, name: "Frank Miller", role: "System Analyst" }],
]);

const projects: Dict<number, Project> = new Dict([
  [1, { id: 1, name: "Project Alpha" }],
  [2, { id: 2, name: "Project Beta" }],
]);

const stages: Dict<number, Stage> = new Dict([
  [1, { id: 1, projectId: 1, name: "Analysis" }],
  [2, { id: 2, projectId: 1, name: "Development" }],
  [3, { id: 3, projectId: 1, name: "Quality" }],
  [4, { id: 4, projectId: 2, name: "Analysis" }],
  [5, { id: 5, projectId: 2, name: "Development" }],
  [6, { id: 6, projectId: 2, name: "Testing" }],
]);

const tasks: Dict<number, Task> = new Dict([
  [
    1,
    {
      id: 1,
      stageId: 1,
      employeeId: 1,
      name: "Requirements Gathering",
      startDate: "2024-01-03",
      endDate: "2024-01-10",
      storyPoints: 8,
    },
  ],
  [
    2,
    {
      id: 2,
      stageId: 1,
      employeeId: 6,
      name: "System Design",
      startDate: "2024-01-08",
      endDate: "2024-01-20",
      storyPoints: 13,
    },
  ],
  [
    3,
    {
      id: 3,
      stageId: 2,
      employeeId: 2,
      name: "Database Schema",
      startDate: "2024-01-15",
      endDate: "2024-01-25",
      storyPoints: 5,
    },
  ],
  [
    4,
    {
      id: 4,
      stageId: 2,
      employeeId: 3,
      name: "API Development",
      startDate: "2024-01-22",
      endDate: "2024-02-05",
      storyPoints: 21,
    },
  ],
  [
    5,
    {
      id: 5,
      stageId: 2,
      employeeId: 4,
      name: "Frontend Components",
      startDate: "2024-01-28",
      endDate: "2024-02-10",
      storyPoints: 13,
    },
  ],
  [
    6,
    {
      id: 6,
      stageId: 4,
      employeeId: 5,
      name: "Data Analysis",
      startDate: "2024-01-12",
      endDate: "2024-01-22",
      storyPoints: 8,
    },
  ],
  [
    7,
    {
      id: 7,
      stageId: 4,
      employeeId: 1,
      name: "Architecture Review",
      startDate: "2024-01-18",
      endDate: "2024-01-28",
      storyPoints: 5,
    },
  ],
  [
    8,
    {
      id: 8,
      stageId: 5,
      employeeId: 2,
      name: "ETL Pipeline",
      startDate: "2024-01-25",
      endDate: "2024-02-08",
      storyPoints: 21,
    },
  ],
  [
    9,
    {
      id: 9,
      stageId: 5,
      employeeId: 3,
      name: "Dashboard UI",
      startDate: "2024-02-01",
      endDate: "2024-02-12",
      storyPoints: 13,
    },
  ],
  [
    10,
    {
      id: 10,
      stageId: 3,
      employeeId: 3,
      name: "Code Review",
      startDate: "2024-02-03",
      endDate: "2024-02-07",
      storyPoints: 3,
    },
  ],
  [
    11,
    {
      id: 11,
      stageId: 6,
      employeeId: 4,
      name: "Testing Setup",
      startDate: "2024-02-05",
      endDate: "2024-02-26",
      storyPoints: 8,
    },
  ],
]);

const getRoleColor = (role: Role) => {
  switch (role) {
    case "System Analyst":
      return "bg-blue-100 text-blue-800";
    case "Data Engineer":
      return "bg-green-100 text-green-800";
    case "Software Engineer":
      return "bg-purple-100 text-purple-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
};

const taskColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
  "bg-lime-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-sky-500",
  "bg-fuchsia-500",
  "bg-slate-500",
] as const;

const getTaskColor = (index: number) => taskColors[index % taskColors.length];

export default function Component({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(roles);

  /* calculate timeline bounds */
  const { startDate, endDate } = useMemo(() => {
    const filteredTasks = tasks.getValues().filter((task) => {
      const stage = stages.get(task.stageId);
      const employee = employees.get(task.employeeId);
      if (!stage || !employee) return false;
      return (
        (selectedProjects.length === 0 ||
          selectedProjects.includes(stage.projectId)) &&
        (selectedRoles.length === 0 || selectedRoles.includes(employee.role))
      );
    });

    if (filteredTasks.length === 0) {
      const now = new Date();
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }),
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
        totalDays: 7,
      };
    }

    const { earliestDate, latestDate } = filteredTasks.reduce(
      (acc, task) => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);

        acc.earliestDate = minDate([acc.earliestDate, startDate, endDate]);
        acc.latestDate = maxDate([acc.latestDate, startDate, endDate]);

        return acc;
      },
      {
        /* accumulator with initial values */
        earliestDate: new Date(filteredTasks[0].startDate),
        latestDate: new Date(filteredTasks[0].endDate),
      }
    );

    const start = startOfWeek(earliestDate, { weekStartsOn: 1 });
    const end = endOfWeek(latestDate, { weekStartsOn: 1 });
    const total = differenceInDays(end, start) + 1;

    return { startDate: start, endDate: end, totalDays: total };
  }, [selectedProjects, selectedRoles]);

  /* generate daily timeline headers */
  const dailyHeaders = useMemo(() => {
    const headers = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      headers.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return headers;
  }, [startDate, endDate]);

  /* generate weekly timeline headers */
  const weeklyHeaders = useMemo(() => {
    const weeks = [];
    const current = startOfWeek(startDate, { weekStartsOn: 1 });

    while (current <= endDate) {
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);

      /* count days in this week that are within our range */
      const daysInWeek = dailyHeaders.filter(
        (day) => day >= current && day <= weekEnd
      ).length;

      if (daysInWeek > 0) {
        weeks.push({
          start: new Date(current),
          end: weekEnd,
          daysCount: daysInWeek,
        });
      }

      current.setDate(current.getDate() + 7);
    }
    return weeks;
  }, [startDate, endDate, dailyHeaders]);

  /* calculate task position and width */
  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);

    /* find the index of start and end days in our daily headers */
    const startDayIndex = dailyHeaders.findIndex(
      (day) => day.toDateString() === taskStart.toDateString()
    );
    const endDayIndex = dailyHeaders.findIndex(
      (day) => day.toDateString() === taskEnd.toDateString()
    );

    /* if dates are not found in our range, calculate based on position */
    const actualStartIndex =
      startDayIndex >= 0
        ? startDayIndex
        : Math.max(
            0,
            Math.floor(
              (taskStart.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );

    const actualEndIndex =
      endDayIndex >= 0
        ? endDayIndex
        : Math.min(
            dailyHeaders.length - 1,
            Math.floor(
              (taskEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          );

    /* calculate position in pixels based on day width */
    const left = actualStartIndex * dayWidth;
    const width = (actualEndIndex - actualStartIndex + 1) * dayWidth;

    return {
      left: `${left}px`,
      width: `${width}px`,
    };
  };

  /* group and filter tasks by employee */
  const tasksByEmployee = useMemo(() => {
    const filteredTasks = tasks.getValues().filter((task) => {
      const stage = stages.get(task.stageId);
      const employee = employees.get(task.employeeId);
      if (
        !employees.has(task.employeeId) ||
        !stage ||
        !projects.has(stage.projectId)
      ) {
        return false;
      }
      return (
        (selectedProjects.length === 0 || selectedProjects.includes(stage.projectId)) &&
        (selectedRoles.length === 0 || selectedRoles.includes(employee?.role ?? ""))
      );
    });

    const filteredEmployees = employees.getValues().filter(employee => selectedRoles.includes(employee.role))

    return filteredEmployees.map((employee) => ({
      employee,
      tasks: filteredTasks.filter((task) => task.employeeId === employee.id),
    }));
  }, [selectedProjects, selectedRoles]);

  /* calculate task levels for overlapping tasks */
  const getTaskLevels = (employeeTasks: Task[]) => {
    const levels: { [taskId: number]: number } = {};

    const sortedTasks = [...employeeTasks].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    sortedTasks.forEach((task) => {
      let level = 0;
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);

      /* check for overlaps with already placed tasks */
      while (true) {
        const hasOverlap = sortedTasks.some((otherTask) => {
          if (otherTask.id === task.id || levels[otherTask.id] !== level)
            return false;
          const otherStart = new Date(otherTask.startDate);
          const otherEnd = new Date(otherTask.endDate);

          return taskStart <= otherEnd && taskEnd >= otherStart; // use <= and >= to handle same-day boundaries
        });

        if (!hasOverlap) break;
        level++;
      }

      levels[task.id] = level;
    });

    return levels;
  };

  const dayWidth = 32; // fixed width for each day
  const employeeColumnWidth = dailyHeaders.length * dayWidth;
  const employeeColumnFixedW = 256; // fixed width for employee column

  const selectedProjectsLabel = useMemo(() => {
    if (selectedProjects.length === 0) return "None";
    if (selectedProjects.length === projects.size) return "All";

    return selectedProjects.length;
  }, [selectedProjects.length]);

  const selectedRolesLabel = useMemo(() => {
    if (selectedRoles.length === 0) return "None";
    if (selectedRoles.length === roles.length) return "All";

    return selectedRoles.length;
  }, [selectedRoles.length]);

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <div className="flex items-center justify-end gap-2">
        {/* Project Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="project-filter-dropdown" variant="outline" className="gap-1 bg-foreground text-background">
              <Filter className="h-4 w-4" />
              Project ({selectedProjectsLabel})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects.getValues().map((project) => (
              <DropdownMenuCheckboxItem
                key={project.id}
                data-testid={`project-filter-item-${project.id}`}   // ⬅️ Tambahan
                checked={selectedProjects.includes(project.id)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(checked) =>
                  setSelectedProjects(
                    checked
                      ? [...selectedProjects, project.id]
                      : selectedProjects.filter((p) => p !== project.id)
                  )
                }
              >
                {project.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Role Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-1 bg-foreground text-background"
            >
              <Filter className="h-4 w-4" />
              Role ({selectedRolesLabel})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((role) => (
              <DropdownMenuCheckboxItem
              key={role}
              data-testid={`role-filter-item-${role.replace(/\s+/g, '-')}`}   // ⬅️ Tambahan
              checked={selectedRoles.includes(role)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={(checked) =>
                setSelectedRoles(
                  checked
                    ? [...selectedRoles, role]
                    : selectedRoles.filter((r) => r !== role)
                )
              }
            >
              {role}
            </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Check if there are selected projects and roles */}
      {isArrayEmpty(selectedProjects) || isArrayEmpty(selectedRoles) ? (
        <div className="w-full py-20 flex items-center justify-center text-center font-mono">
          Nothing to display.
          <br />
          Please select projects and roles to see tasks.
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="relative overflow-hidden">
              {/* Use overflow-hidden here to contain sticky elements */}
              <div className="flex flex-col max-h-[600px]">
                {/* Rows Section - Scrollable Vertically & Horizontally */}
                <div className="flex-grow overflow-auto">
                  {/* This container handles both scrolls */}
                  <div
                    style={{
                      minWidth: `${employeeColumnFixedW + employeeColumnWidth}px`,
                    }}
                  >
                    {/* Headers Section - Sticky Top */}
                    <div className="sticky top-0 z-20 bg-white">
                      <div className="flex">
                        {/* Employee Header (top-left corner) - Sticky Top & Left */}
                        <div className="w-64 p-4 font-semibold border-r border-b bg-gray-50 sticky left-0 top-0 z-30">
                          Employee
                        </div>

                        {/* Timeline Headers (Week & Daily) */}
                        <div className="flex flex-col flex-grow">
                          {/* Week Headers */}
                          <div className="flex border-b">
                            {weeklyHeaders.map((week, index) => (
                              <div
                                key={index}
                                className="p-2 text-sm font-medium border-r bg-gray-50 flex items-center justify-center"
                                style={{
                                  width: `${week.daysCount * dayWidth}px`,
                                  height: "64px",
                                }}
                              >
                                <div className="text-center">
                                  <div>
                                    {week.start.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {week.end.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Daily Headers */}
                          <div className="flex border-b">
                            {dailyHeaders.map((date, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "p-1 text-center text-xs border-r",
                                  "flex flex-col justify-center sticky top-[64px] z-20",
                                  isWeekend(date) ? "bg-gray-50" : "bg-white"
                                )}
                                style={{
                                  width: `${dayWidth}px`,
                                  height: "56px",
                                }}
                              >
                                <div className="font-medium">
                                  {date.toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })}
                                </div>
                                <div className="text-gray-600">{date.getDate()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Employee Rows and Task Bars */}
                    <TooltipProvider>
                      {tasksByEmployee.map(({ employee, tasks: employeeTasks }) => {
                        if (!selectedRoles.includes(employee.role)) return null;

                        const taskLevels = getTaskLevels(employeeTasks);
                        const maxLevel = Math.max(...Object.values(taskLevels), 0);
                        const rowHeight = Math.max(60, (maxLevel + 1) * 28 + 20);

                        return (
                          <div
                            key={employee.id}
                            data-testid={`employee-row-${employee.id}`}
                            style={{ minHeight: `${rowHeight}px` }}
                            className="flex border-b"
                          >
                            {/* Employee Info (left column) - Sticky Left */}
                            <div className="w-64 p-4 border-r flex flex-col justify-center bg-white sticky left-0 z-10">
                              <div
                                data-testid={`employee-name-${employee.id}`}
                                className="font-medium"
                              >
                                {employee.name}
                              </div>
                              <Badge
                                data-testid={`employee-role-badge-${employee.id}`}
                                variant="outline"
                                className={`w-fit mt-1 ${getRoleColor(employee.role)}`}
                              >
                                {employee.role}
                              </Badge>
                            </div>

                            {/* Task Timeline Area */}
                            <div className="flex-1 relative">
                              {/* Daily background columns */}
                              <div className="absolute inset-0 flex">
                                {dailyHeaders.map((date, index) => (
                                  <div
                                    key={index}
                                    className={`border-r ${
                                      isWeekend(date) ? "bg-gray-50" : "bg-white"
                                    }`}
                                    style={{ width: `${dayWidth}px` }}
                                  />
                                ))}
                              </div>

                              {/* Task bars */}
                              <div className="relative p-2">
                                {employeeTasks.map((task) => {
                                  const position = getTaskPosition(task);
                                  const level = taskLevels[task.id];
                                  const topOffset = level * 28 + 8;

                                  const taskStart = new Date(
                                    task.startDate
                                  ).toLocaleDateString();
                                  const taskEnd = new Date(
                                    task.endDate
                                  ).toLocaleDateString();

                                  const stage = stages.get(task.stageId);
                                  const project = stage
                                    ? projects.get(stage.projectId)
                                    : null;
                                  if (!stage || !project) return null;

                                  return (
                                    <Tooltip key={task.id}>
                                      <TooltipTrigger asChild>
                                        <div
                                          data-testid={`task-bar-${task.id}`}
                                          className={cn(
                                            "absolute h-5 px-1 flex items-center",
                                            "text-white text-xs cursor-pointer transition-all hover:opacity-80",
                                            getTaskColor(
                                              projects.getKeys().indexOf(project.id)
                                            )
                                          )}
                                          style={{
                                            left: position.left,
                                            width: position.width,
                                            top: `${topOffset}px`,
                                            zIndex: hoveredTask === task.id ? 15 : 5,
                                          }}
                                          onMouseEnter={() => setHoveredTask(task.id)}
                                          onMouseLeave={() => setHoveredTask(null)}
                                        >
                                          {task.name}
                                        </div>
                                      </TooltipTrigger>

                                      <TooltipContent>
                                        <div className="space-y-2">
                                          <div className="font-semibold">
                                            {task.name}
                                          </div>
                                          <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                              <Calendar className="h-3 w-3" />
                                              <span>{`${taskStart} - ${taskEnd}`}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Zap className="h-3 w-3" />
                                              <span>
                                                {task.storyPoints} story points
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <User className="h-3 w-3" />
                                              <span>{`${project.name} • ${stage.name}`}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      )}

      <div className="grid gap-4 mx-auto [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {projects
          .getValues()
          .filter((p) => selectedProjects.includes(p.id))
          .map((project) => {
            const stageData = stages
              .getValues()
              .filter((stage) => stage.projectId === project.id)
              .map((stage) => {
                const tasksInStage = tasks
                  .getValues()
                  .filter((task) => task.stageId === stage.id);
                return {
                  ...stage,
                  tasks: tasksInStage,
                };
              });

            const projectColor = getTaskColor(
              projects.getKeys().indexOf(project.id)
            );

            return (
              <Card key={project.id} className="py-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${projectColor}`} />
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {stageData.map((stage) => (
                      <div key={stage.id} className="font-medium">
                        {stage.name}:{" "}
                        <span className="font-normal">
                          {stage.tasks.map((task) => task.name).join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
