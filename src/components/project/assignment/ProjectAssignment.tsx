"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Users, UserCheck, Clock, Briefcase } from "lucide-react";
import { TeamMember, ProjectSubActivity } from "@/types/projects";
import { EmployeeRow } from "@/types/employee";

// Sample data - in real app this would come from props or API
const sampleEmployees: EmployeeRow[] = [
  {
    id: 1,
    code: "EMP001",
    name: "John Doe",
    role: "System Analyst",
    level: "Senior",
    team: "DMA",
    status: "Permanent",
    email: "john@example.com",
    phone: "123",
    location: "Jakarta",
    joinDate: "2023-01-01",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "EMP002",
    name: "Jane Smith",
    role: "Software Engineer",
    level: "Middle",
    team: "DMA",
    status: "Permanent",
    email: "jane@example.com",
    phone: "456",
    location: "Jakarta",
    joinDate: "2023-01-01",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 3,
    code: "EMP003",
    name: "Mike Johnson",
    role: "Data Engineer",
    level: "Junior",
    team: "NCM",
    status: "Contract",
    email: "mike@example.com",
    phone: "789",
    location: "Jakarta",
    joinDate: "2023-01-01",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    contractStartDate: "2023-01-01",
    contractEndDate: "2024-01-01",
  },
];

const sampleActivities = [
  { id: 1, name: "Wireframing", date_range: "Nov 1-3, 2024" },
  { id: 2, name: "Prototyping", date_range: "Nov 4-8, 2024" },
  { id: 3, name: "Design System", date_range: "Nov 3-6, 2024" },
  { id: 4, name: "Development", date_range: "Nov 9-15, 2024" },
  { id: 5, name: "Testing", date_range: "Nov 16-20, 2024" },
  { id: 6, name: "Deployment Support", date_range: "Nov 21-22, 2024" },
];

const sampleSubActivities: ProjectSubActivity[] = [
  {
    id: 1,
    parentId: 1,
    activity: "Database Design",
    startDate: "2024-11-01",
    endDate: "2024-11-03",
    duration: 3,
    fte: 1,
    role: "SA",
  },
  {
    id: 2,
    parentId: 1,
    activity: "API Design",
    startDate: "2024-11-04",
    endDate: "2024-11-06",
    duration: 3,
    fte: 1,
    role: "SE",
  },
  {
    id: 3,
    parentId: 2,
    activity: "Frontend Development",
    startDate: "2024-11-07",
    endDate: "2024-11-10",
    duration: 4,
    fte: 2,
    role: "SE",
  },
  {
    id: 4,
    parentId: 2,
    activity: "Backend Development",
    startDate: "2024-11-07",
    endDate: "2024-11-12",
    duration: 6,
    fte: 1,
    role: "SE",
  },
  {
    id: 5,
    parentId: 3,
    activity: "Data Pipeline Setup",
    startDate: "2024-11-13",
    endDate: "2024-11-15",
    duration: 3,
    fte: 1,
    role: "DE",
  },
];

const sampleTeamComposition: TeamMember[] = [
  {
    name: "Designer",
    role: "Designer",
    level: "Mixed",
    workload_hours: 96,
    total_working_days: 30000000,
    utilization_rate: "Week 2-3",
    assigned_activities: [
      { activity_id: 1, workload_hours: 48 },
      { activity_id: 2, workload_hours: 48 },
    ],
  },
  {
    name: "Software Engineer",
    role: "Software Engineer",
    level: "Mixed",
    workload_hours: 128,
    total_working_days: 40000000,
    utilization_rate: "Week 3-4",
    assigned_activities: [
      { activity_id: 3, workload_hours: 64 },
      { activity_id: 4, workload_hours: 64 },
    ],
  },
];

type AssignmentMode = "manual" | "auto";

interface EmployeeAssignment {
  subActivityId: number;
  employeeId: number;
  allocation: number; // percentage 0-100
}

interface GroupAssignment {
  roleGroup: string;
  employeeIds: number[];
}

interface ProjectAssignmentProps {
  teamComposition?: TeamMember[];
  subActivities?: ProjectSubActivity[];
  availableEmployees?: EmployeeRow[];
  onPrevious?: () => void;
  onNext?: (assignments: EmployeeAssignment[] | GroupAssignment[]) => void;
}

export default function ProjectAssignment({
  teamComposition = sampleTeamComposition,
  subActivities = sampleSubActivities,
  availableEmployees = sampleEmployees,
  onPrevious,
  onNext,
}: ProjectAssignmentProps) {
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("auto");
  const [manualAssignments, setManualAssignments] = useState<
    EmployeeAssignment[]
  >([]);
  const [groupAssignments, setGroupAssignments] = useState<GroupAssignment[]>(
    [],
  );

  // Initialize group assignments from team composition
  useEffect(() => {
    const initialGroups: GroupAssignment[] = [];
    teamComposition.forEach((group) => {
      group.assigned_activities.forEach((_, activityIndex) => {
        initialGroups.push({
          roleGroup: `${group.role}_${activityIndex}`,
          employeeIds: [],
        });
      });
    });
    setGroupAssignments(initialGroups);
  }, [teamComposition]);

  const handleManualAssignment = (
    subActivityId: number,
    employeeId: number,
    allocation: number,
  ) => {
    setManualAssignments((prev) => {
      const existing = prev.find(
        (a) => a.subActivityId === subActivityId && a.employeeId === employeeId,
      );
      if (existing) {
        return prev.map((a) =>
          a.subActivityId === subActivityId && a.employeeId === employeeId
            ? { ...a, allocation }
            : a,
        );
      } else {
        return [...prev, { subActivityId, employeeId, allocation }];
      }
    });
  };

  const handleGroupAssignment = (roleGroup: string, employeeIds: number[]) => {
    setGroupAssignments((prev) =>
      prev.map((group) =>
        group.roleGroup === roleGroup ? { ...group, employeeIds } : group,
      ),
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "system analyst":
      case "sa":
        return "📊";
      case "software engineer":
      case "se":
        return "💻";
      case "data engineer":
      case "de":
        return "🔧";
      case "designer":
        return "🎨";
      default:
        return "👤";
    }
  };

  const getAvailableEmployeesByRole = (role: string) => {
    const roleMapping: Record<string, string[]> = {
      SA: ["System Analyst"],
      SE: ["Software Engineer"],
      DE: ["Data Engineer"],
      Designer: ["Designer"],
    };

    const acceptedRoles = roleMapping[role] || [role];
    return availableEmployees.filter((emp) => acceptedRoles.includes(emp.role));
  };

  const handleContinue = () => {
    const assignments =
      assignmentMode === "manual" ? manualAssignments : groupAssignments;
    onNext?.(assignments);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Project Assignment</h2>
        <p className="text-gray-600">
          Assign team members to project activities
        </p>
      </div>

      {/* Assignment Mode Tabs */}
      <Tabs
        value={assignmentMode}
        onValueChange={(value) => setAssignmentMode(value as AssignmentMode)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auto" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Auto Assignment (By Group)
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Manual Assignment (Per SubActivity)
          </TabsTrigger>
        </TabsList>

        {/* Auto Assignment Tab */}
        <TabsContent value="auto" className="space-y-4">
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Group-based Assignment
              </CardTitle>
              <p className="text-sm text-gray-600">
                Assign employees to role groups. The system will automatically
                distribute work based on project requirements.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {teamComposition.map((group, index) => (
                <div key={index} className="space-y-4">
                  {/* Group Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getRoleIcon(group.role)}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{group.role}</h3>
                        <p className="text-sm text-gray-600">
                          ({group.assigned_activities.length})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Individual Team Members */}
                  {group.assigned_activities.map((activity, activityIndex) => (
                    <div
                      key={activityIndex}
                      className="bg-gray-50 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {group.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {group.name} {activityIndex + 1}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">
                              Allowed Level:
                            </span>
                            <Badge
                              variant={
                                group.level === "Senior"
                                  ? "destructive"
                                  : group.level === "Middle"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {group.level === "Mixed" ? "Mid" : group.level}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Total Workload
                          </p>
                          <p className="font-medium">
                            {activity.workload_hours} jam
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Budget</p>
                          <p className="font-medium">
                            Rp {group.total_working_days.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Peak Week</p>
                          <p className="font-medium">
                            {group.utilization_rate}
                          </p>
                        </div>
                      </div>

                      {/* Assigned Activities & Timeline */}
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Assigned Activities & Timeline
                        </p>
                        <div className="space-y-2">
                          {sampleActivities
                            .filter((act) => act.id === activity.activity_id)
                            .map((filteredActivity) => (
                              <div
                                key={filteredActivity.id}
                                className="flex items-center justify-between p-3 bg-white rounded border"
                              >
                                <div>
                                  <p className="font-medium text-sm">
                                    {filteredActivity.name}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {filteredActivity.date_range}
                                    <span className="ml-2">
                                      {activity.workload_hours} jam
                                    </span>
                                  </p>
                                </div>
                                <span className="text-sm font-medium">
                                  {activity.workload_hours} jam
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Assign To Button */}
                      <div className="flex justify-end">
                        <Select
                          value={
                            groupAssignments
                              .find(
                                (g) =>
                                  g.roleGroup ===
                                  `${group.role}_${activityIndex}`,
                              )
                              ?.employeeIds[0]?.toString() || ""
                          }
                          onValueChange={(employeeId) => {
                            if (employeeId) {
                              handleGroupAssignment(
                                `${group.role}_${activityIndex}`,
                                [parseInt(employeeId)],
                              );
                            }
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign to:" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableEmployeesByRole(group.role).map(
                              (employee) => (
                                <SelectItem
                                  key={employee.id}
                                  value={employee.id.toString()}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs">
                                        {employee.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{employee.name}</span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {employee.level}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Show assigned employee */}
                      {groupAssignments.find(
                        (g) => g.roleGroup === `${group.role}_${activityIndex}`,
                      )?.employeeIds[0] && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">
                              Assigned to:{" "}
                              {
                                availableEmployees.find(
                                  (e) =>
                                    e.id ===
                                    groupAssignments.find(
                                      (g) =>
                                        g.roleGroup ===
                                        `${group.role}_${activityIndex}`,
                                    )?.employeeIds[0],
                                )?.name
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {index < teamComposition.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Assignment Tab */}
        <TabsContent value="manual" className="space-y-4">
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                SubActivity-based Assignment
              </CardTitle>
              <p className="text-sm text-gray-600">
                Assign specific employees to individual sub-activities with
                custom allocation percentages.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {subActivities.map((subActivity, index) => (
                <div key={subActivity.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getRoleIcon(subActivity.role)}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {subActivity.activity}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {subActivity.duration} days
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {subActivity.fte} FTE
                          </span>
                          <Badge variant="outline">{subActivity.role}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>
                        {subActivity.startDate} - {subActivity.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Assign Employee:
                    </label>
                    <div className="flex gap-3">
                      <Select
                        onValueChange={(employeeId) => {
                          if (employeeId) {
                            handleManualAssignment(
                              subActivity.id,
                              parseInt(employeeId),
                              100,
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableEmployeesByRole(subActivity.role).map(
                            (employee) => (
                              <SelectItem
                                key={employee.id}
                                value={employee.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs">
                                      {employee.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{employee.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {employee.level}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>

                      <Select
                        onValueChange={(allocation) => {
                          const assignment = manualAssignments.find(
                            (a) => a.subActivityId === subActivity.id,
                          );
                          if (assignment) {
                            handleManualAssignment(
                              subActivity.id,
                              assignment.employeeId,
                              parseInt(allocation),
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Allocation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="75">75%</SelectItem>
                          <SelectItem value="100">100%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Show current assignment */}
                    {manualAssignments.find(
                      (a) => a.subActivityId === subActivity.id,
                    ) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">
                              Assigned
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {
                              manualAssignments.find(
                                (a) => a.subActivityId === subActivity.id,
                              )?.allocation
                            }
                            % allocation
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {index < subActivities.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onPrevious} className="px-8">
          Previous
        </Button>
        <Button
          onClick={handleContinue}
          className="px-8 bg-black hover:bg-gray-800"
        >
          Save Project
        </Button>
      </div>
    </div>
  );
}
