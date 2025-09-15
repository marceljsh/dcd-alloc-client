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

export function ProjectPlanner() {
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
