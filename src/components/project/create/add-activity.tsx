"use client";

import React, { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { PlusIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Sheet } from "../../ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ProjectActivity,
  ProjectSubActivity,
  EntityType,
  ModeType,
  ActivityAction,
} from "@/types/projects";

import { ActivityForm } from "./form";
import { GanttPanel } from "./gantt";
import { ActivitiesPanel } from "./left-panel";

import { initialProjectData } from "@/data/projects";
import { useActivities } from "@/hooks/projects/use-activities";
import { useProjectDates } from "@/hooks/projects/use-project-dates";
import { useProjectForm } from "@/hooks/projects/use-project-form";
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
import { projectCategories, projectPriorities, teams } from "@/types/common";

export function ProjectPlanner() {
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const {
    activities,
    addActivity,
    addSubActivity,
    updateActivity,
    updateSubActivity,
    deleteActivity,
    deleteSubActivity,
  } = useActivities(initialProjectData);

  const { dates, groupedDates, updateDateRange } = useProjectDates(activities);

  const {
    isOpen,
    sheetType,
    setIsOpen,
    mode,
    parentActivity,
    formDetails,
    openSheet,
    closeSheet,
    setFormDetails,
  } = useProjectForm();

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleSubmit = (
    entity: ProjectActivity | ProjectSubActivity,
    action: (entity: any) => void
  ) => {
    action(entity);
    updateDateRange(entity);
    closeSheet();
  };

  const handleOpen = (
    type: EntityType,
    mode: ModeType,
    parent?: ProjectActivity | null,
    details?: ProjectActivity | ProjectSubActivity | null
  ) => {
    setFormDetails(details ?? null);
    openSheet(type, parent ?? null, mode);
  };

  const handleAction = (action: ActivityAction) => {
    switch (action.type) {
      case "add-sub":
        return handleOpen("subactivity", "Add", action.parent);
      case "edit-activity":
        return handleOpen("activity", "Edit", null, action.activity);
      case "delete-activity":
        return deleteActivity(action.id);
      case "edit-sub":
        return handleOpen("subactivity", "Edit", action.parent, action.sub);
      case "delete-sub":
        return deleteSubActivity(action.activityId, action.subId);
    }
  };

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
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="team">Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
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
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
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
                value={selectedCategory}
                onValueChange={setSelectedCategory}
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
      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <ActivityForm
          parentActivity={parentActivity}
          sheetType={sheetType}
          formDetails={formDetails}
          mode={mode}
          onAddActivity={(a) => handleSubmit(a, addActivity)}
          onAddSubActivity={(s) => handleSubmit(s, addSubActivity)}
          onEditActivity={(a) => handleSubmit(a, updateActivity)}
          onEditSubActivity={(s) => handleSubmit(s, updateSubActivity)}
        />

        <div className="mb-4 flex">
          <Button
            variant="default"
            onClick={() => handleOpen("activity", "Add")}
          >
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
      </Sheet>
    </div>
  );
}
