"use client";

import React, { useEffect, useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { PlusIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { ActivityForm } from "./form";
import { GanttPanel } from "./gantt";
import { ActivitiesPanel } from "./left-panel";

import { initialProjectData } from "@/data/projects";
import { useProject, useProjectDetails } from "@/hooks/projects/use-project";
import { projectCategories, projectPriorities, teams } from "@/types/common";
import { ProjectPlannerSkeleton } from "./project-planner-skeleton";

export function ProjectPlanner() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    activities,
    form,
    dates,
    groupedDates,
    expandedItems,
    handleAction,
    handleFormSubmit,
    openAddActivity,
    setExpandedItems,
    closeForm,
    initializeProject,
  } = useProject();

  const {
    projectDetails,
    updateProjectName,
    updateBudget,
    updateTeam,
    updatePriority,
    updateCategory,
  } = useProjectDetails();

  useEffect(() => {
    const loadData = async () => {
      await initializeProject(initialProjectData);
      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    loadData();
  }, [initializeProject]);

  if (isLoading) {
    return <ProjectPlannerSkeleton />;
  }

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
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
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
              <Input
                id="budget"
                placeholder="Enter budget amount"
                value={projectDetails.budget}
                onChange={(e) => updateBudget(e.target.value)}
              />
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
                  {projectPriorities.map((priority) => (
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
                  {projectCategories.map((c) => (
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
        <div className="mb-4 flex">
          <Button variant="default" onClick={openAddActivity}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
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
            <ActivityForm
              parentActivity={form.parentActivity}
              sheetType={form.type}
              formDetails={form.formDetails}
              mode={form.mode}
              onSubmit={(entity) =>
                handleFormSubmit(entity, form.type, form.mode)
              }
            />
          </SheetContent>
        </Sheet>

        <div className="flex justify-end mt-8">
          <Button className="w-32">Next</Button> 
        </div>
      </div>
    </div>
  );
}
