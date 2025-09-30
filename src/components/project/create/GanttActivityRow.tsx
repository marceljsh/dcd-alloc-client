import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProjectActivity } from "@/types/projects";
import { GanttActivityBar } from "./GanttActivityBar";

interface GanttActivityRowProps {
  activity: ProjectActivity;
  getGridPosition: (
    startDate: string,
    endDate: string
  ) => {
    start: number;
    end: number;
  };
  datesLength: number;
  viewMode?: "normal" | "fte-visualization";
}

export function GanttActivityRow({
  activity,
  getGridPosition,
  datesLength,
  viewMode = "normal",
}: GanttActivityRowProps) {
  const position = getGridPosition(activity.startDate, activity.endDate);

  return (
    <AccordionItem
      key={activity.id}
      value={`activity-${activity.id}`}
      className="border-0"
    >
      <AccordionTrigger className="hidden" />

      <GanttActivityBar
        activity={activity.name}
        startPosition={position.start}
        endPosition={position.end}
        datesLength={datesLength}
        viewMode={viewMode}
      />

      <AccordionContent className="pb-0">
        {activity.subActivities && activity.subActivities.length > 0 && (
          <div>
            {activity.subActivities.map((subActivity) => {
              const subPosition = getGridPosition(
                subActivity.startDate,
                subActivity.endDate
              );

              return (
                <div key={subActivity.id} className="bg-gray-25">
                  <GanttActivityBar
                    activity={subActivity.name}
                    startPosition={subPosition.start}
                    endPosition={subPosition.end}
                    datesLength={datesLength}
                    isSubActivity={true}
                    fte={subActivity.fte}
                    viewMode={viewMode}
                  />
                </div>
              );
            })}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
