import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import * as React from "react";
import { ProjectActivity } from "@/types/projects";
import { Accordion } from "@/components/ui/accordion";
import { GanttHeader } from "./GanttHeader";
import { GanttActivityRow } from "./GanttActivityRow";
import GanttNoActivities from "./GanttNoActivity";
import { FteViewMode } from "./GanttToolbar";

type GanttPanelProps = {
  dates: Date[];
  groupedDates: Record<string, Date[]>;
  data: ProjectActivity[];
  expandedItems: string[];
  viewMode?: FteViewMode;
};

export function GanttPanel({
  dates,
  groupedDates,
  data,
  expandedItems,
  viewMode = "normal",
}: GanttPanelProps) {
  const windowStart = dates[0];

  const getGridPosition = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

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

  function renderActivityRow(activity: ProjectActivity) {
    return (
      <GanttActivityRow
        key={activity.id}
        activity={activity}
        getGridPosition={getGridPosition}
        datesLength={dates.length}
        viewMode={viewMode}
      />
    );
  }

  if (!data || data.length === 0) {
    return <GanttNoActivities />;
  }

  return (
    <ScrollArea className="h-full w-1 flex-1">
      <div>
        <GanttHeader dates={dates} groupedDates={groupedDates} />
        <Accordion type="multiple" className="w-full" value={expandedItems}>
          <div className="divide-y">
            {data.map((activity: ProjectActivity) =>
              renderActivityRow(activity)
            )}
          </div>
        </Accordion>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
