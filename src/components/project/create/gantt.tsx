import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import * as React from "react";
import { ProjectActivity } from "@/types/projects";
import { Accordion } from "@/components/ui/accordion";
import { GanttHeader } from "./gantt-header";
import { GanttActivityRow } from "./gantt-activity-row";

export function GanttPanel({
  dates,
  groupedDates,
  data,
  expandedItems,
}: {
  dates: Date[];
  groupedDates: Record<string, Date[]>;
  data: ProjectActivity[];
  expandedItems: string[];
}) {
  const windowStart = dates[0];

  const getGridPosition = (activity: ProjectActivity) => {
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);

    const startIndex = dates.findIndex(
      (date) => date.toDateString() === startDate.toDateString()
    );

    const endIndex = dates.findIndex(
      (date) => date.toDateString() === endDate.toDateString()
    );

    if (startIndex === -1 || endIndex === -1) {
      const windowStartTime = windowStart.getTime();
      const activityStartTime = startDate.getTime();
      const activityEndTime = endDate.getTime();

      const daysDiff = Math.floor(
        (activityStartTime - windowStartTime) / (1000 * 60 * 60 * 24)
      );
      const duration =
        Math.floor(
          (activityEndTime - activityStartTime) / (1000 * 60 * 60 * 24)
        ) + 1;

      return {
        start: Math.max(1, daysDiff + 1),
        end: Math.min(dates.length + 1, daysDiff + duration + 1),
      };
    }

    return {
      start: startIndex + 1,
      end: endIndex + 2,
    };
  };

  if (!data || data.length === 0) {
    return (
      <GanttNoActivities />
    );
  }

  return (
    <ScrollArea className="h-full w-1 flex-1">
      <div>
        <GanttHeader dates={dates} groupedDates={groupedDates} />

        <Accordion type="multiple" className="w-full" value={expandedItems}>
          <div className="divide-y">
            {data.map((activity: ProjectActivity) => (
              <GanttActivityRow
                key={activity.id}
                activity={activity}
                getGridPosition={getGridPosition}
                datesLength={dates.length}
              />
            ))}
          </div>
        </Accordion>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}


function GanttNoActivities() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-semibold text-gray-900">
            No activities yet
          </h3>
          <p className="text-sm text-gray-500">
            Get started by adding your first project activity using the "Add
            Activity" button above.
          </p>
        </div>
      </div>
  )
}