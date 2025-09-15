import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getMonthAbbr } from "@/lib/dates";
import * as React from "react";
import { ProjectActivity } from "@/types/projects";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  return (
    <ScrollArea className="h-full w-1 flex-1">
      <div>
        <div className="h-[72px] divide-y bg-gray-50 border-b">
          <div className="grid grid-flow-col auto-cols-[50px] h-9">
            {Object.entries(groupedDates).map(([monthYear, monthDates], i) => (
              <div
                key={monthYear}
                className="text-xs font-bold text-center bg-gray-50 whitespace-nowrap overflow-visible flex items-center justify-center"
                style={{
                  gridColumn: `span ${monthDates.length}`,
                  zIndex:
                    i == 0 || i == Object.keys(groupedDates).length - 1
                      ? 10
                      : 1,
                  paddingLeft: i == 0 ? "12px" : "0px",
                  paddingRight:
                    i == Object.keys(groupedDates).length - 1 ? "12px" : "0px",
                }}
              >
                {getMonthAbbr(monthDates[0])} {monthDates[0].getFullYear()}
              </div>
            ))}
          </div>

          <div className="grid divide-x grid-flow-col auto-cols-[50px] place-items-center h-9">
            {dates.map((date) => (
              <div
                key={date.toISOString()}
                className="text-xs w-full text-center font-medium flex items-center justify-center h-full"
              >
                {date.getDate()}
              </div>
            ))}
          </div>
        </div>

        <Accordion type="multiple" className="w-full" value={expandedItems}>
          <div className="divide-y">
            {data.map((activity: ProjectActivity, index: number) => {
              const position = getGridPosition(activity);

              return (
                <AccordionItem
                  key={activity.id}
                  value={`activity-${activity.id}`}
                  className="border-0"
                >
                  <AccordionTrigger className="hidden" />

                  {/* Main Activity Row */}
                  <div className="relative border-b h-12">
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${dates.length}, 50px)`,
                        height: "100%",
                      }}
                    >
                      <div
                        className="relative bg-blue-500 opacity-75 rounded mx-1 my-2"
                        style={{
                          gridColumnStart: position.start,
                          gridColumnEnd: position.end,
                        }}
                      >
                        <div className="h-full w-full bg-blue-500 rounded-md opacity-70" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white truncate px-1">
                            {activity.activity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub Activities with AccordionContent for smooth transitions */}
                  <AccordionContent className="pb-0">
                    {activity.subActivities &&
                      activity.subActivities.length > 0 && (
                        <div>
                          {activity.subActivities.map((subActivity) => {
                            const subPosition = getGridPosition({
                              ...subActivity,
                              startDate: subActivity.startDate,
                              endDate:
                                subActivity.endDate || subActivity.startDate,
                            });

                            return (
                              <div
                                key={subActivity.id}
                                className="relative border-b bg-gray-25 h-12"
                              >
                                <div
                                  className="grid"
                                  style={{
                                    gridTemplateColumns: `repeat(${dates.length}, 50px)`,
                                    height: "100%",
                                  }}
                                >
                                  <div
                                    className="relative bg-blue-400 opacity-75 rounded mx-1 my-2"
                                    style={{
                                      gridColumnStart: subPosition.start,
                                      gridColumnEnd: subPosition.end,
                                    }}
                                  >
                                    <div className="h-full w-full bg-blue-400 rounded-md opacity-70" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-xs font-medium text-white truncate px-1">
                                        {subActivity.activity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </div>
        </Accordion>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
