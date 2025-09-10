"use client";

import React, { useState, useMemo } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { PlusIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { generateDates } from "@/lib/dates";

import { Sheet, SheetTrigger } from "../../ui/sheet";
import { ProjectActivity, ProjectSubActivity, SheetType } from "./type";
import { ActivityForm } from "./form";
import { GanttPanel } from "./gantt";
import { ActivitiesPanel } from "./left-panel";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const initialProjectData: ProjectActivity[] = [
  {
    id: 1,
    activity: "Design",
    startDate: "2025-09-01",
    endDate: "2025-09-10",
    duration: 48,
    fte: 1,
    subActivities: [
      {
        id: 11,
        activity: "Wireframing",
        startDate: "2025-09-01",
        endDate: "2025-09-02",
        duration: 16,
        parentId: 1,
        fte: 1,
      },
      {
        id: 12,
        activity: "Prototyping",
        startDate: "2025-09-03",
        endDate: "2025-09-05",
        duration: 32,
        parentId: 1,
        fte: 1,
      },
    ],
  },
  {
    id: 2,
    activity: "Development",
    startDate: "2025-09-06",
    endDate: "2025-09-10",
    duration: 36,
    fte: 1,
  },
  {
    id: 3,
    activity: "Testing",
    startDate: "2025-09-21",
    endDate: "2025-09-24",
    duration: 24,
    fte: 1,
  },
  {
    id: 4,
    activity: "Deployment",
    startDate: "2025-09-28",
    endDate: "2025-09-30",
    duration: 30,
    fte: 1,
  },
];

export function ProjectPlanner() {
  const [activities, setActivities] =
    useState<ProjectActivity[]>(initialProjectData);
  const [sheetType, setSheetType] = useState<SheetType>("activity");
  const [mode, setMode] = useState<"View" | "Edit" | "Add">("Edit");
  const [parentActivityId, setParentActivityId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formDetails, setFormDetails] = useState<ProjectActivity | null>(null);

  // New state for shared accordion
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const startDate = activities.reduce((prev, current) => {
    return current.startDate < prev.startDate ? current : prev;
  }).startDate;
  const endDate = activities.reduce((prev, current) => {
    return current.endDate > prev.endDate ? current : prev;
  }).endDate;

  const dates = useMemo(
    () => generateDates(new Date(startDate), new Date(endDate)),
    []
  );

  const groupedDates = useMemo(() => {
    const grouped: Record<string, Date[]> = {};
    dates.forEach((date) => {
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(date);
    });
    return grouped;
  }, [dates]);

  const handleAccordionChange = (value: string[]) => {
    setExpandedItems(value);
  };

  const handleAddActivity = (activity: ProjectActivity) => {
    setActivities((prev) => [...prev, activity]);
    setIsOpen(false);
    setParentActivityId(null);
    setMode("Add");
    setFormDetails(null);
  };

  const handleAddSubActivity = (subActivity: ProjectSubActivity) => {
    setMode("Add");
    setSheetType("activity");

    const parentActivity = activities.find(
      (act) => act.id === subActivity.parentId
    );

    const leftMostStartDate = parentActivity?.subActivities?.reduce(
      (prev, curr) =>
        new Date(curr.startDate) < new Date(prev.startDate) ? curr : prev,
      parentActivity.subActivities[0]
    )?.startDate;

    const rightMostEndDate = parentActivity?.subActivities?.reduce(
      (prev, curr) => {
        if (!curr.endDate) return prev;
        if (!prev.endDate) return curr;
        return new Date(curr.endDate) > new Date(prev.endDate) ? curr : prev;
      },
      parentActivity.subActivities[0]
    )?.endDate;

    if (
      leftMostStartDate &&
      new Date(subActivity.startDate) < new Date(leftMostStartDate)
    ) {
      parentActivity!.startDate = subActivity.startDate;
    }

    if (
      rightMostEndDate &&
      new Date(subActivity.endDate) > new Date(rightMostEndDate)
    ) {
      parentActivity!.endDate = subActivity.endDate;
    }

    setActivities((prev) =>
      prev.map((activity) => {
        if (
          activity.id === subActivity.parentId &&
          activity.subActivities &&
          activity.subActivities.length !== 0
        ) {
          return {
            ...activity,
            duration: subActivity.duration + activity.duration,
            subActivities: activity.subActivities
              ? [...activity.subActivities, subActivity]
              : [subActivity],
          };
        } else if (
          activity.id === subActivity.parentId &&
          !activity.subActivities
        ) {
          return {
            ...activity,
            duration: subActivity.duration,
            subActivities: [subActivity],
          };
        }

        return activity;
      })
    );

    setIsOpen(false);
    setFormDetails(null);
    setParentActivityId(null);
  };

  const handleDeleteActivity = (id: number) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const handleDeleteSubActivity = (activityId: number, subActivityId: number) =>
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === activityId && activity.subActivities) {
          return {
            ...activity,
            subActivities: activity.subActivities.filter(
              (sub) => sub.id !== subActivityId
            ),
          };
        }
        return activity;
      })
    );

  const handleEditActivity = (activity: ProjectActivity) => {
    setFormDetails(activity);
    openSheet("activity", null, "Edit");
  };

  const handleOpenAddSubActivity = (parentId: number | null) => {
    setParentActivityId(parentId);
    openSheet("subactivity", parentId, "Add");
  };

  const openSheet = (
    type: SheetType,
    parentId: number | null,
    mode: "View" | "Edit" | "Add"
  ) => {
    setSheetType(type);
    setParentActivityId(parentId);
    setMode(mode);
  };

  return (
    <div>
      <Sheet onOpenChange={setIsOpen} open={isOpen}>
        <ActivityForm
          parentActivityId={parentActivityId}
          sheetType={sheetType}
          onAddActivity={handleAddActivity}
          onAddSubActivity={handleAddSubActivity}
          formDetails={formDetails}
          mode={mode}
        />

        <div className="mb-4 flex">
          <Button
            variant="default"
            onClick={() => {
              openSheet("activity", null, "Add");
              setIsOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>

        <ScrollArea className="max-h-[80vh] border rounded-lg">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
              <ActivitiesPanel
                activities={activities}
                onAddSubActivity={handleOpenAddSubActivity}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
                onDeleteSubActivity={handleDeleteSubActivity}
                expandedItems={expandedItems}
                onAccordionChange={handleAccordionChange}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel className="flex" defaultSize={70} minSize={50}>
              <GanttPanel
                dates={dates}
                groupedDates={groupedDates}
                data={activities}
                expandedItems={expandedItems}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </Sheet>
    </div>
  );
}
