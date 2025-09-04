import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { addDays, parseISO } from "date-fns";
import { Activity, SubActivity } from "@/types/timeline-planner";
import { getTimelinePosition } from "@/lib/utils";

interface ActivityRowProps {
  activity: Activity;
  windowStart: Date;
  windowEnd: Date;
  daysInWindow: number;
  onAddSubActivity: (activityId: number) => void;
  onPointerDown: (
    e: React.PointerEvent,
    activityId: number,
    sub: SubActivity,
    type: "move" | "resizeStart" | "resizeEnd" // Tambahkan tipe untuk drag
  ) => void;
  onSubActivityClick: (sub: SubActivity) => void;
}

export const ActivityRow = ({
  activity,
  windowStart,
  windowEnd,
  daysInWindow,
  onAddSubActivity,
  onPointerDown,
  onSubActivityClick,
}: ActivityRowProps) => {
  const filteredSubActivities = activity.subActivities.filter((sub) => {
    const start = parseISO(sub.startDate);
    const end = parseISO(sub.endDate);
    return end >= windowStart && start <= windowEnd;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: activity.color }}
        />
        <h3 className="font-semibold text-sm">{activity.name}</h3>
      </div>
      <div className="ml-6 space-y-2">
        {filteredSubActivities.map((sub) => {
          const pos = getTimelinePosition(
            sub.startDate,
            sub.endDate,
            windowStart,
            daysInWindow
          );

          return (
            <div
              key={sub.id}
              className="grid gap-4 items-center"
              style={{
                gridTemplateColumns: `200px repeat(${daysInWindow}, 1fr)`,
              }}
            >
              <div className="text-sm text-muted-foreground">
                <div className="font-medium">{sub.name}</div>
                <div className="text-xs">
                  {sub.hours}h • {sub.role}
                </div>
              </div>
              <div className="col-span-5 relative h-10 bg-muted/30 rounded overflow-visible">
                <div className="absolute inset-0">
                  <div
                    onPointerDown={(e) =>
                      onPointerDown(e, activity.id, sub, "move")
                    }
                    onClick={() => onSubActivityClick(sub)}
                    className="absolute top-1 bottom-1 rounded flex items-center justify-center text-xs font-medium text-white select-none group" // Tambahkan group
                    style={{
                      backgroundColor: activity.color,
                      left: pos.left,
                      width: pos.width,
                    }}
                  >
                    {/* Handle untuk resize start */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10" // Indikator resize
                      style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                      onPointerDown={(e) => {
                        e.stopPropagation(); // Mencegah event drag parent
                        onPointerDown(e, activity.id, sub, "resizeStart");
                      }}
                    />
                    <div className="px-2 truncate cursor-grab group-hover:cursor-grabbing">
                      {sub.name}
                    </div>
                    {/* Handle untuk resize end */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10" // Indikator resize
                      style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                      onPointerDown={(e) => {
                        e.stopPropagation(); // Mencegah event drag parent
                        onPointerDown(e, activity.id, sub, "resizeEnd");
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 flex items-center gap-1 text-primary hover:bg-muted"
          onClick={() => onAddSubActivity(activity.id)}
        >
          <Plus className="h-4 w-4" />
          Add Sub-Activity
        </Button>
      </div>
    </div>
  );
};
