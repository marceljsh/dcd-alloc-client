"use client";

import type React from "react";
import { Activity } from "lucide-react"; // Declare the Activity variable
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HelpCircle,
  Calendar,
  Clock,
  Settings,
  DollarSign,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SubActivityType = {
  id: string;
  name: string;
  description: string;
  effortByRole: {
    softwareEngineer: number;
    dataEngineer: number;
    qa: number;
  };
};

type ActivityType = {
  id: string;
  name: string;
  description: string;
  subActivities: SubActivityType[];
  effortByRole: {
    softwareEngineer: number;
    dataEngineer: number;
    qa: number;
  };
};

export type ProjectData = {
  projectName: string;
  startDate: string;
  endDate: string;
  activities: ActivityType[];
  complexity: "Low" | "Medium" | "High";
  buffer: number;
  maxBudget: number;
  hourlyRates: {
    softwareEngineer: { junior: number; middle: number; senior: number };
    dataEngineer: { junior: number; middle: number; senior: number };
    qa: { junior: number; middle: number; senior: number };
  };
  totalEffort: number;
  effortDistribution: {
    softwareEngineer: number;
    dataEngineer: number;
    qa: number;
  };
};

interface ProjectInputFormProps {
  onSubmit: (data: ProjectData) => void;
  initialData?: ProjectData;
}

export function ProjectInputForm({
  onSubmit,
  initialData,
}: ProjectInputFormProps) {
  const [formData, setFormData] = useState<ProjectData>(
    initialData || {
      projectName: "",
      startDate: "",
      endDate: "",
      activities: [
        {
          id: "1",
          name: "User Authentication",
          description: "Complete authentication system",
          subActivities: [
            {
              id: "1-1",
              name: "JWT Implementation",
              description: "Token generation and validation",
              effortByRole: { softwareEngineer: 20, dataEngineer: 0, qa: 5 },
            },
            {
              id: "1-2",
              name: "Login/Logout UI",
              description: "User interface for authentication",
              effortByRole: { softwareEngineer: 5, dataEngineer: 15, qa: 3 },
            },
            {
              id: "1-3",
              name: "Password Reset",
              description: "Forgot password functionality",
              effortByRole: { softwareEngineer: 15, dataEngineer: 5, qa: 2 },
            },
          ],
          effortByRole: { softwareEngineer: 0, dataEngineer: 0, qa: 0 }, // Will be calculated from sub-activities
        },
        {
          id: "2",
          name: "Database Setup",
          description: "Database configuration and setup",
          subActivities: [
            {
              id: "2-1",
              name: "Schema Design",
              description: "Database structure and relationships",
              effortByRole: { softwareEngineer: 20, dataEngineer: 0, qa: 2 },
            },
            {
              id: "2-2",
              name: "Migrations",
              description: "Database migration scripts",
              effortByRole: { softwareEngineer: 10, dataEngineer: 0, qa: 3 },
            },
          ],
          effortByRole: { softwareEngineer: 0, dataEngineer: 0, qa: 0 }, // Will be calculated from sub-activities
        },
      ],
      complexity: "Medium",
      buffer: 15,
      maxBudget: 50000,
      hourlyRates: {
        softwareEngineer: { junior: 25, middle: 40, senior: 60 },
        dataEngineer: { junior: 25, middle: 40, senior: 60 },
        qa: { junior: 20, middle: 35, senior: 50 },
      },
      totalEffort: 0,
      effortDistribution: { softwareEngineer: 0, dataEngineer: 0, qa: 0 },
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(
    new Set(["1", "2"])
  );

  const calculateActivityTotals = (activity: ActivityType): ActivityType => {
    const totals = { softwareEngineer: 0, dataEngineer: 0, qa: 0 };

    activity.subActivities.forEach((subActivity) => {
      totals.softwareEngineer += subActivity.effortByRole.softwareEngineer;
      totals.dataEngineer += subActivity.effortByRole.dataEngineer;
      totals.qa += subActivity.effortByRole.qa;
    });

    return {
      ...activity,
      effortByRole: totals,
    };
  };

  const calculateTotalsFromActivities = (activities: ActivityType[]) => {
    const totals = { softwareEngineer: 0, dataEngineer: 0, qa: 0 };
    let totalEffort = 0;

    activities.forEach((activity) => {
      const activityWithTotals = calculateActivityTotals(activity);
      totals.softwareEngineer += activityWithTotals.effortByRole.softwareEngineer;
      totals.dataEngineer += activityWithTotals.effortByRole.dataEngineer;
      totals.qa += activityWithTotals.effortByRole.qa;
      totalEffort +=
        activityWithTotals.effortByRole.softwareEngineer +
        activityWithTotals.effortByRole.dataEngineer +
        activityWithTotals.effortByRole.qa;
    });

    const effortDistribution = {
      softwareEngineer:
        totalEffort > 0 ? Math.round((totals.softwareEngineer / totalEffort) * 100) : 0,
      dataEngineer:
        totalEffort > 0 ? Math.round((totals.dataEngineer / totalEffort) * 100) : 0,
      qa: totalEffort > 0 ? Math.round((totals.qa / totalEffort) * 100) : 0,
    };

    return { totalEffort, effortDistribution };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
    }
    if (formData.activities.length === 0) {
      newErrors.activities = "At least one activity is required";
    }
    if (formData.maxBudget <= 0) {
      newErrors.maxBudget = "Max budget must be greater than 0";
    }

    formData.activities.forEach((activity, activityIndex) => {
      if (!activity.name.trim()) {
        newErrors[`activity-${activityIndex}-name`] =
          "Activity name is required";
      }
      if (activity.subActivities.length === 0) {
        newErrors[`activity-${activityIndex}-subactivities`] =
          "Activity must have at least one sub-activity";
      }

      activity.subActivities.forEach((subActivity, subIndex) => {
        if (!subActivity.name.trim()) {
          newErrors[`subactivity-${activityIndex}-${subIndex}-name`] =
            "Sub-activity name is required";
        }
        const totalEffort =
          subActivity.effortByRole.softwareEngineer +
          subActivity.effortByRole.dataEngineer +
          subActivity.effortByRole.qa;
        if (totalEffort === 0) {
          newErrors[`subactivity-${activityIndex}-${subIndex}-effort`] =
            "Sub-activity must have at least some effort";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const activitiesWithTotals = formData.activities.map(
        calculateActivityTotals
      );
      const { totalEffort, effortDistribution } =
        calculateTotalsFromActivities(activitiesWithTotals);
      const dataToSubmit = {
        ...formData,
        activities: activitiesWithTotals,
        totalEffort,
        effortDistribution,
      };
      console.log(
        "[v0] Submitting project data with activities and sub-activities:",
        dataToSubmit
      );
      onSubmit(dataToSubmit);
    }
  };

  const addActivity = () => {
    const newActivity: ActivityType = {
      id: Date.now().toString(),
      name: "",
      description: "",
      subActivities: [],
      effortByRole: { softwareEngineer: 0, dataEngineer: 0, qa: 0 },
    };
    setFormData((prev) => ({
      ...prev,
      activities: [...prev.activities, newActivity],
    }));
  };

  const removeActivity = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((activity) => activity.id !== id),
    }));
    setExpandedActivities((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const updateActivity = (id: string, updates: Partial<ActivityType>) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === id ? { ...activity, ...updates } : activity
      ),
    }));
  };

  const addSubActivity = (activityId: string) => {
    const newSubActivity: SubActivityType = {
      id: `${activityId}-${Date.now()}`,
      name: "",
      description: "",
      effortByRole: { softwareEngineer: 0, dataEngineer: 0, qa: 0 },
    };
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              subActivities: [...activity.subActivities, newSubActivity],
            }
          : activity
      ),
    }));
  };

  const removeSubActivity = (activityId: string, subActivityId: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              subActivities: activity.subActivities.filter(
                (sub) => sub.id !== subActivityId
              ),
            }
          : activity
      ),
    }));
  };

  const updateSubActivity = (
    activityId: string,
    subActivityId: string,
    updates: Partial<SubActivityType>
  ) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              subActivities: activity.subActivities.map((sub) =>
                sub.id === subActivityId ? { ...sub, ...updates } : sub
              ),
            }
          : activity
      ),
    }));
  };

  const updateSubActivityEffort = (
    activityId: string,
    subActivityId: string,
    role: keyof SubActivityType["effortByRole"],
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.map((activity) =>
        activity.id === activityId
          ? {
              ...activity,
              subActivities: activity.subActivities.map((sub) =>
                sub.id === subActivityId
                  ? {
                      ...sub,
                      effortByRole: { ...sub.effortByRole, [role]: value },
                    }
                  : sub
              ),
            }
          : activity
      ),
    }));
  };

  const toggleActivityExpanded = (activityId: string) => {
    setExpandedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const updateHourlyRate = (
    role: keyof typeof formData.hourlyRates,
    level: "junior" | "middle" | "senior",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      hourlyRates: {
        ...prev.hourlyRates,
        [role]: {
          ...prev.hourlyRates[role],
          [level]: value,
        },
      },
    }));
  };

  const { totalEffort, effortDistribution } = calculateTotalsFromActivities(
    formData.activities
  );

  return (
    <TooltipProvider>
      <Card className="py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Project Input
          </CardTitle>
          <CardDescription className="mb-4">
            Enter project information and break down activities with detailed
            sub-tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="E-commerce Website"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectName: e.target.value,
                  }))
                }
                className={errors.projectName ? "border-destructive" : ""}
              />
              {errors.projectName && (
                <p className="text-sm text-destructive">{errors.projectName}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className={errors.startDate ? "border-destructive" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className={errors.endDate ? "border-destructive" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Max Budget */}
            <div className="space-y-2">
              <Label htmlFor="maxBudget" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Max Budget (Million IDR)
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum budget available for this project</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="maxBudget"
                type="number"
                min="1"
                value={formData.maxBudget}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxBudget: Number.parseInt(e.target.value) || 0,
                  }))
                }
                className={errors.maxBudget ? "border-destructive" : ""}
              />
              {errors.maxBudget && (
                <p className="text-sm text-destructive">{errors.maxBudget}</p>
              )}
            </div>

            {/* Activity Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Breakdown
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Break down your project into activities and detailed
                        sub-tasks with effort estimates per role
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Button
                  type="button"
                  onClick={addActivity}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>
              </div>

              {errors.activities && (
                <p className="text-sm text-destructive">{errors.activities}</p>
              )}

              <div className="space-y-3">
                {formData.activities.map((activity, activityIndex) => {
                  const activityTotals = calculateActivityTotals(activity);
                  const isExpanded = expandedActivities.has(activity.id);

                  return (
                    <Card key={activity.id} className="overflow-hidden">
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={() => toggleActivityExpanded(activity.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label
                                  htmlFor={`activity-${activity.id}-name`}
                                  className="text-sm"
                                >
                                  Activity Name
                                </Label>
                                <Input
                                  id={`activity-${activity.id}-name`}
                                  placeholder="e.g., User Authentication System"
                                  value={activity.name}
                                  onChange={(e) =>
                                    updateActivity(activity.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  className={
                                    errors[`activity-${activityIndex}-name`]
                                      ? "border-destructive"
                                      : ""
                                  }
                                />
                                {errors[`activity-${activityIndex}-name`] && (
                                  <p className="text-sm text-destructive">
                                    {errors[`activity-${activityIndex}-name`]}
                                  </p>
                                )}
                              </div>
                              <div>
                                <Label
                                  htmlFor={`activity-${activity.id}-description`}
                                  className="text-sm"
                                >
                                  Description
                                </Label>
                                <Input
                                  id={`activity-${activity.id}-description`}
                                  placeholder="e.g., Complete authentication system with JWT"
                                  value={activity.description}
                                  onChange={(e) =>
                                    updateActivity(activity.id, {
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-muted-foreground text-right">
                                <div>
                                  Total:{" "}
                                  {activityTotals.effortByRole.softwareEngineer +
                                    activityTotals.effortByRole.dataEngineer +
                                    activityTotals.effortByRole.qa}
                                  h
                                </div>
                                <div className="text-xs">
                                  SE:{activityTotals.effortByRole.softwareEngineer} DE:
                                  {activityTotals.effortByRole.dataEngineer} SA:
                                  {activityTotals.effortByRole.qa}
                                </div>
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                              <Button
                                type="button"
                                onClick={() => removeActivity(activity.id)}
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {errors[
                            `activity-${activityIndex}-subactivities`
                          ] && (
                            <p className="text-sm text-destructive mt-2">
                              {
                                errors[
                                  `activity-${activityIndex}-subactivities`
                                ]
                              }
                            </p>
                          )}
                        </div>

                        <CollapsibleContent>
                          <div className="px-4 pb-4 border-t bg-muted/20">
                            <div className="flex items-center justify-between py-3">
                              <Label className="text-sm font-medium">
                                Sub-Activities
                              </Label>
                              <Button
                                type="button"
                                onClick={() => addSubActivity(activity.id)}
                                size="sm"
                                variant="outline"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Sub-Activity
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {activity.subActivities.map(
                                (subActivity, subIndex) => (
                                  <Card
                                    key={subActivity.id}
                                    className="p-3 bg-background"
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <Label className="text-xs">
                                              Sub-Activity Name
                                            </Label>
                                            <Input
                                              placeholder="e.g., JWT Implementation"
                                              value={subActivity.name}
                                              onChange={(e) =>
                                                updateSubActivity(
                                                  activity.id,
                                                  subActivity.id,
                                                  { name: e.target.value }
                                                )
                                              }
                                              className={
                                                errors[
                                                  `subactivity-${activityIndex}-${subIndex}-name`
                                                ]
                                                  ? "border-destructive text-sm"
                                                  : "text-sm"
                                              }
                                            />
                                            {errors[
                                              `subactivity-${activityIndex}-${subIndex}-name`
                                            ] && (
                                              <p className="text-xs text-destructive">
                                                {
                                                  errors[
                                                    `subactivity-${activityIndex}-${subIndex}-name`
                                                  ]
                                                }
                                              </p>
                                            )}
                                          </div>
                                          <div>
                                            <Label className="text-xs">
                                              Description
                                            </Label>
                                            <Input
                                              placeholder="e.g., Token generation and validation"
                                              value={subActivity.description}
                                              onChange={(e) =>
                                                updateSubActivity(
                                                  activity.id,
                                                  subActivity.id,
                                                  {
                                                    description: e.target.value,
                                                  }
                                                )
                                              }
                                              className="text-sm"
                                            />
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          onClick={() =>
                                            removeSubActivity(
                                              activity.id,
                                              subActivity.id
                                            )
                                          }
                                          size="sm"
                                          variant="ghost"
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>

                                      <div className="grid grid-cols-3 gap-3">
                                        <div>
                                          <Label className="text-xs">
                                            Software Engineer (h)
                                          </Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={
                                              subActivity.effortByRole.softwareEngineer
                                            }
                                            onChange={(e) =>
                                              updateSubActivityEffort(
                                                activity.id,
                                                subActivity.id,
                                                "softwareEngineer",
                                                Number.parseInt(
                                                  e.target.value
                                                ) || 0
                                              )
                                            }
                                            className="text-center text-sm"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">
                                            Data Engineer (h)
                                          </Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={
                                              subActivity.effortByRole.dataEngineer
                                            }
                                            onChange={(e) =>
                                              updateSubActivityEffort(
                                                activity.id,
                                                subActivity.id,
                                                "dataEngineer",
                                                Number.parseInt(
                                                  e.target.value
                                                ) || 0
                                              )
                                            }
                                            className="text-center text-sm"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">
                                            Solution Analyst (h)
                                          </Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={subActivity.effortByRole.qa}
                                            onChange={(e) =>
                                              updateSubActivityEffort(
                                                activity.id,
                                                subActivity.id,
                                                "qa",
                                                Number.parseInt(
                                                  e.target.value
                                                ) || 0
                                              )
                                            }
                                            className="text-center text-sm"
                                          />
                                        </div>
                                      </div>

                                      {errors[
                                        `subactivity-${activityIndex}-${subIndex}-effort`
                                      ] && (
                                        <p className="text-xs text-destructive">
                                          {
                                            errors[
                                              `subactivity-${activityIndex}-${subIndex}-effort`
                                            ]
                                          }
                                        </p>
                                      )}

                                      <div className="text-xs text-muted-foreground">
                                        Subtotal:{" "}
                                        {subActivity.effortByRole.softwareEngineer +
                                          subActivity.effortByRole.dataEngineer +
                                          subActivity.effortByRole.qa}{" "}
                                        hours
                                      </div>
                                    </div>
                                  </Card>
                                )
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-muted/50 p-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Project Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Total Effort:
                      </span>
                      <div className="font-medium">{totalEffort} hours</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Software Engineer:</span>
                      <div className="font-medium">
                        {effortDistribution.softwareEngineer}%
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Engineer:</span>
                      <div className="font-medium">
                        {effortDistribution.dataEngineer}%
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Solution Analyst:</span>
                      <div className="font-medium">
                        {effortDistribution.qa}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Button type="submit" className="w-full">
              Continue to Role & Level Selection
            </Button>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
