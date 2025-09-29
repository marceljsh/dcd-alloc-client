import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProjectActivity } from "@/types/projects";
import { GanttActivityBar } from "./GanttActivityBar";

interface GanttActivityRowProps {
  activity: ProjectActivity;
  getGridPosition: (activity: ProjectActivity) => {
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
  const position = getGridPosition(activity);

  return (
    <AccordionItem
      key={activity.id}
      value={`activity-${activity.id}`}
      className="border-0"
    >
      <AccordionTrigger className="hidden" />

      <GanttActivityBar
        activity={activity.activity}
        startPosition={position.start}
        endPosition={position.end}
        datesLength={datesLength}
        fte={activity.fte}
        viewMode={viewMode}
      />

      <AccordionContent className="pb-0">
        {activity.subActivities && activity.subActivities.length > 0 && (
          <div>
            {activity.subActivities.map((subActivity) => {
              const subPosition = getGridPosition({
                ...subActivity,
                startDate: subActivity.startDate,
                endDate: subActivity.endDate || subActivity.startDate,
              });

              return (
                <div key={subActivity.id} className="bg-gray-25">
                  <GanttActivityBar
                    activity={subActivity.activity}
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
