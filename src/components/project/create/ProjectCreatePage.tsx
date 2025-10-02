"use client";

import React, { useEffect, useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "../../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ActivityForm } from "./ActivityForm";
import { GanttPanel } from "./Gantt";
import { ActivitiesPanel } from "./LeftPanel";
import { GanttToolbar, FteViewMode } from "./GanttToolbar";

import { useProject, useProjectDetails } from "@/hooks/projects/use-project";
import { projectCategoryOpt, projectPriorityOpt } from "@/types/common";
import { NewItemButton } from "./NewItemButton";
import { SubActivityForm } from "./SubActivityForm";
import { ProjectActivity, ProjectSubActivity } from "@/types/projects";
import { TeamInfo } from "@/types/employee";
import { ApiResponse } from "@/types/api";
import { toast } from "sonner";
import axios from "axios";
import { JAVA_SERVER_URL } from "@/lib/api/constant";
import {
  loadTeamsFromCache,
  saveTeamsToCache,
  isTeamsCacheValid,
} from "@/lib/cache/teams";

type ProjectPlannerProps = {
  onNext: () => void;
};

type Team = {
  id: string;
  name: string;
};

type ProjectCreateResponse = {
  id: string;
  name: string;
  team: Team;
  category: string;
  priority: string;
  budget: number;
  activities: [
    {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
      subActivities: [
        {
          id: string;
          name: string;
          startDate: string;
          endDate: string;
          workload: number;
          fte: number;
          minimumLevel: string;
          role: string;
        }
      ];
    }
  ];
};

export function ProjectCreatePage({ onNext }: ProjectPlannerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<FteViewMode>("normal");
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Function to refresh teams data - exposed for manual refresh if needed
  // Usage: window.refreshTeams() in browser console (for debugging)
  const refreshTeamsData = React.useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        JAVA_SERVER_URL + "/api/my/teams/as-dropdown",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const teamsData = res.data.data;
      setTeamOptions(teamsData);
      saveTeamsToCache(teamsData);
    } catch (err) {
      console.error("Failed to refresh teams data:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (
        window as unknown as { refreshTeams?: () => Promise<void> }
      ).refreshTeams = refreshTeamsData;
    }
  }, [refreshTeamsData]);
  const {
    activities,
    form,
    dates,
    groupedDates,
    expandedItems,
    teamOptions,
    setTeamOptions,
    handleAction,
    handleFormSubmit,
    openAddActivity,
    setExpandedItems,
    closeForm,
    resetProject,
    initializeProject,
  } = useProject();
  const [teams, setTeams] = useState<TeamInfo[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You are not authenticated')

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my/teams/as-dropdown`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok)
          throw new Error('Failed to fetch teams');

        const fetched: ApiResponse<TeamInfo[]> = await res.json();
        if (!fetched.success || !fetched.data)
          throw new Error(fetched.message || 'Failed to fetch teams');

        setTeams(fetched.data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error('Error fetching teams:', err)
        toast.error(err instanceof Error ? err.message : 'An error occurred while fetching teams')
      }
    }
    fetchTeams()
  }, [])

  const formatBudgetValue = (value: string) => {
    const rawValue = value.replace(/\D/g, "");
    return rawValue ? Number(rawValue).toLocaleString("id-ID") : "";
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatBudgetValue(e.target.value);
    updateBudget(formattedValue);
  };

  const handleBudgetFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    updateBudget(rawValue);
  };

  const handleBudgetBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedValue = formatBudgetValue(e.target.value);
    updateBudget(formattedValue);
  };

  const {
    projectDetails,
    updateProjectName,
    updateBudget,
    updateTeam,
    updatePriority,
    updateCategory,
  } = useProjectDetails();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");

      setIsLoading(true);

      const promises = [];

      // Try to load teams from cache first
      const cachedTeams = loadTeamsFromCache();

      if (cachedTeams) {
        setTeamOptions(cachedTeams);
      }

      // Initialize with default data if no activities

      // Fetch from API if no cached data or cache is expired
      if (!isTeamsCacheValid()) {
        promises.push(
          axios
            .get(JAVA_SERVER_URL + "/api/my/teams/as-dropdown", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((res) => {
              const teamsData = res.data.data;
              setTeamOptions(teamsData);
              saveTeamsToCache(teamsData);
            })
            .catch((err) => {
              // fallback to default teams if API fails
              const defaultTeams = [
                { id: "team-a", name: "Team A" },
                { id: "team-b", name: "Team B" },
                { id: "team-c", name: "Team C" },
              ];
              setTeamOptions(defaultTeams);
              saveTeamsToCache(defaultTeams);
              console.error("Failed to fetch teams, using defaults:", err);
            })
        );
      }

      await Promise.all(promises);

      setIsLoading(false);
    };

    init();
  }, [activities.length, setTeamOptions]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchProjectData = async () => {
      const { data } = (await axios.get(
        JAVA_SERVER_URL + "/api/my/draft", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )) as { data: ProjectCreateResponse };
    };

    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Card className="mb-6 py-6">
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Project Name, Team, Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                value={projectDetails.name}
                onChange={(e) => updateProjectName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="team">Team</Label>
              <Select value={projectDetails.team} onValueChange={updateTeam}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teamOptions.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Budget & Category */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2 md:col-span-4">
              <Label htmlFor="budget">Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <Input
                  id="budget"
                  placeholder="1,000,000"
                  className="pl-9"
                  value={projectDetails.budget}
                  onChange={handleBudgetChange}
                  onFocus={handleBudgetFocus}
                  onBlur={handleBudgetBlur}
                />
              </div>
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={projectDetails.priority}
                onValueChange={updatePriority}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {projectPriorityOpt.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="category">Category</Label>
              <Select
                value={projectDetails.category}
                onValueChange={updateCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {projectCategoryOpt.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <NewItemButton
            onSelect={(type) => {
              if (type === "subactivity") {
                // If user is adding subactivity, open form without parent
                openAddActivity("subactivity");
              } else {
                openAddActivity("activity");
              }
            }}
          />
          <GanttToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        <ScrollArea className="border rounded-lg">
          <div className="max-h-[80vh]">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
                <ActivitiesPanel
                  activities={activities}
                  onAction={handleAction}
                  expandedItems={expandedItems}
                  onAccordionChange={setExpandedItems}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel className="flex" defaultSize={65} minSize={50}>
                <GanttPanel
                  dates={dates}
                  groupedDates={groupedDates}
                  data={activities}
                  expandedItems={expandedItems}
                  viewMode={viewMode}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ScrollArea>

        <Sheet open={form.isOpen} onOpenChange={closeForm}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {form.mode}{" "}
                {form.type === "activity" ? "Activity" : "Sub-Activity"}
              </SheetTitle>
            </SheetHeader>
            {form.type === "activity" && (
              <ActivityForm
                activityDetails={form.activityDetails}
                mode={form.mode}
                activities={activities}
                onSubmit={(entity) =>
                  handleFormSubmit(entity, form.type, form.mode)
                }
                onEditSubActivity={(
                  subActivity: ProjectSubActivity,
                  parentActivity: ProjectActivity
                ) =>
                  handleAction({
                    type: "edit-sub",
                    parent: parentActivity,
                    sub: subActivity,
                  })
                }
                onDeleteSubActivity={(
                  parentActivityId: string,
                  subActivityId: string
                ) =>
                  handleAction({
                    type: "delete-sub",
                    activityId: parentActivityId,
                    subId: subActivityId,
                  })
                }
              />
            )}
            {form.type === "subactivity" && (
              <SubActivityForm
                parentActivity={form.parentActivity}
                subActivityDetails={form.subActivityDetails}
                mode={form.mode}
                onSubmit={(entity) =>
                  handleFormSubmit(entity, form.type, form.mode)
                }
                activities={activities}
              />
            )}
          </SheetContent>
        </Sheet>

        <div className="flex items-center justify-between mt-8 pt-4 border-t">
          <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Reset Form
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all project data and
                  activities. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetProject();
                    setShowResetDialog(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Reset Form
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement save draft functionality
                console.log("Save draft");
              }}
            >
              Save as Draft
            </Button>
            {/* Uncomment this if you need manual refresh teams button */}
            {/* <Button
              variant="outline"
              onClick={refreshTeamsData}
              size="sm"
            >
              Refresh Teams
            </Button> */}
            <Button
              onClick={onNext}
              className="px-8 bg-black hover:bg-gray-800"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
