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
import {
  Users,
  UserCheck,
  Clock,
  Briefcase,
  User,
  Calendar,
} from "lucide-react";
import { TeamMember, ProjectSubActivity } from "@/types/projects";
import { EmployeeRow } from "@/types/employee";
import { groupMembersByRole } from "@/lib/utils/project";
import TeamMemberCard from "../results/TeamMemberCard";

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

const sampleSubActivities: ProjectSubActivity[] = [
  {
    id: "1",
    parentId: "1",
    name: "Database Design",
    startDate: "2024-11-01",
    endDate: "2024-11-05",
    workload: 40,
    fte: 1,
    role: "SA",
    minimumLevel: "middle",
  },
  {
    id: "2",
    parentId: "1",
    name: "UI Design",
    startDate: "2024-11-06",
    endDate: "2024-11-08",
    workload: 24,
    fte: 2,
    role: "SE",
    minimumLevel: "junior",
  },
  {
    id: "3",
    parentId: "2",
    name: "Frontend Development",
    startDate: "2024-11-07",
    endDate: "2024-11-10",
    workload: 32,
    fte: 2,
    role: "SE",
    minimumLevel: "middle",
  },
  {
    id: "4",
    parentId: "2",
    name: "Backend Development",
    startDate: "2024-11-07",
    endDate: "2024-11-12",
    workload: 48,
    fte: 1,
    role: "SE",
    minimumLevel: "senior",
  },
  {
    id: "5",
    parentId: "3",
    name: "Data Pipeline Setup",
    startDate: "2024-11-13",
    endDate: "2024-11-15",
    workload: 24,
    fte: 1,
    role: "DE",
    minimumLevel: "middle",
  },
];

const sampleTeamComposition: TeamMember[] = [
  {
    name: "Designer",
    role: "Designer",
    level: ["Junior", "Middle"],
    selectedLevel: "Middle",
    workload_hours: 96,
    total_working_days: 30000000,
    utilization_rate: "Week 2-3",
    assigned_activities: [
      {
        id: "1",
        name: "UI Design",
        start_date: "2024-11-01",
        end_date: "2024-11-05",
        workload: 48,
        fte: 1,
        role: "Designer",
        minimum_level: "junior",
      },
      {
        id: "2",
        name: "Prototyping",
        start_date: "2024-11-06",
        end_date: "2024-11-08",
        workload: 48,
        fte: 1,
        role: "Designer",
        minimum_level: "middle",
      },
    ],
  },
  {
    name: "Software Engineer",
    role: "Software Engineer",
    level: ["Middle", "Senior"],
    selectedLevel: "Senior",
    workload_hours: 128,
    total_working_days: 40000000,
    utilization_rate: "Week 3-4",
    assigned_activities: [
      {
        id: "3",
        name: "Frontend Development",
        start_date: "2024-11-07",
        end_date: "2024-11-10",
        workload: 64,
        fte: 2,
        role: "SE",
        minimum_level: "middle",
      },
      {
        id: "4",
        name: "Backend Development",
        start_date: "2024-11-11",
        end_date: "2024-11-15",
        workload: 64,
        fte: 2,
        role: "SE",
        minimum_level: "senior",
      },
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
    []
  );

  // grouped by role for easier rendering
  const groupedMembers = groupMembersByRole(teamComposition);

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
    allocation: number
  ) => {
    setManualAssignments((prev) => {
      const existing = prev.find(
        (a) => a.subActivityId === subActivityId && a.employeeId === employeeId
      );
      if (existing) {
        return prev.map((a) =>
          a.subActivityId === subActivityId && a.employeeId === employeeId
            ? { ...a, allocation }
            : a
        );
      } else {
        return [...prev, { subActivityId, employeeId, allocation }];
      }
    });
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
            <CardContent>
              <div className="space-y-8">
                {Object.keys(groupedMembers).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No team composition data available.</p>
                    <p className="text-sm mt-2">
                      Please check the API response and try again.
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedMembers).map(([role, members]) => (
                    <div key={role} className="space-y-4">
                      {/* Role Header */}
                      <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {role}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({members.length})
                        </span>
                      </div>

                      {/* Members in this role */}
                      <div className="space-y-4 ml-4">
                        {members.map((member, index) => (
                          <TeamMemberCard
                            key={`${member.name}-${index}`}
                            member={member}
                            mode="assignment"
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                      <div>
                        <h3 className="font-semibold">{subActivity.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {subActivity.workload} jam
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
                              parseInt(subActivity.id),
                              parseInt(employeeId),
                              100
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
                            )
                          )}
                        </SelectContent>
                      </Select>

                      <Select
                        onValueChange={(allocation) => {
                          const assignment = manualAssignments.find(
                            (a) => a.subActivityId === parseInt(subActivity.id)
                          );
                          if (assignment) {
                            handleManualAssignment(
                              parseInt(subActivity.id),
                              assignment.employeeId,
                              parseInt(allocation)
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
                      (a) => a.subActivityId === parseInt(subActivity.id)
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
                                (a) =>
                                  a.subActivityId === parseInt(subActivity.id)
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
