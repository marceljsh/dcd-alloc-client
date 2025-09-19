import { Pencil, Plus, Trash } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../ui/accordion";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../ui/context-menu";
import {
  ActivityAction,
  createAction,
  ProjectActivity,
  ProjectSubActivity,
} from "@/types/projects";
import { Badge } from "@/components/ui/badge";

const ACTIONS = {
  addSub: (activity: ProjectActivity) =>
    createAction({ type: "add-sub", parent: activity }),

  editActivity: (activity: ProjectActivity) =>
    createAction({ type: "edit-activity", activity }),

  deleteActivity: (id: number) => createAction({ type: "delete-activity", id }),

  editSub: (sub: ProjectSubActivity, parent: ProjectActivity) =>
    createAction({ type: "edit-sub", sub, parent }),

  deleteSub: (activityId: number, subId: number) =>
    createAction({ type: "delete-sub", activityId, subId }),
};

const roleColors: Record<"SE" | "DE" | "SA", string> = {
  SE: "bg-blue-100 text-blue-800",
  DE: "bg-green-100 text-green-800",
  SA: "bg-purple-100 text-purple-800",
};

export function ActivitiesPanel({
  activities,
  onAction,
  expandedItems,
  onAccordionChange,
}: {
  activities: ProjectActivity[];
  onAction: (action: ActivityAction) => void;
  expandedItems: string[];
  onAccordionChange: (value: string[]) => void;
}) {
  return (
    <ScrollArea className="h-full w-full">
      <div>
        {/* Headers */}
        <div className="grid divide-x grid-cols-4 h-[72px] text-sm font-semibold bg-gray-50 border-b">
          <div className="flex items-center col-span-2 justify-center px-2 h-full">
            Activity
          </div>
          <div className="flex items-center justify-center text-center px-2 h-full">
            Start Date
          </div>
          <div className="flex items-center justify-center px-2 h-full">
            Workload
          </div>
        </div>

        {/* Activities with Accordion */}
        <Accordion
          type="multiple"
          className="w-full"
          value={expandedItems}
          onValueChange={onAccordionChange}
        >
          {activities.map((activity) => (
            <AccordionItem
              key={activity.id}
              value={`activity-${activity.id}`}
              className="border-0"
            >
              {/* Main Activity Row */}
              <ContextMenu>
                <ContextMenuTrigger>
                  <div className="h-12 grid divide-x grid-cols-4 text-sm hover:bg-muted/50 border-b">
                    <div className="px-2 col-span-2 font-medium truncate flex items-center">
                      {activity.subActivities &&
                      activity.subActivities.length > 0 ? (
                        <AccordionTrigger className="hover:no-underline p-0 mr-2 [&[data-state=open]>svg]:rotate-360   [&[data-state=closed]>svg]:rotate-270"></AccordionTrigger>
                      ) : (
                        <div className="w-4 mr-2" />
                      )}
                      {activity.activity}{" "}
                      {activity.role && (
                        <Badge
                          variant="outline"
                          className={`ml-2 text-xs ${
                            roleColors[activity.role as "SE" | "DE" | "SA"]
                          }`}
                        >
                          {activity.role}
                        </Badge>
                      )}
                    </div>
                    <div className="px-2 text-center truncate flex items-center justify-center">
                      {activity.startDate}
                    </div>
                    <div className="px-2 text-center truncate flex items-center justify-center">
                      {activity.duration} jam
                    </div>
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => onAction(ACTIONS.addSub(activity))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add SubActivity
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => onAction(ACTIONS.editActivity(activity))}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Activity
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() =>
                      onAction(ACTIONS.deleteActivity(activity.id))
                    }
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Activity
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

              {/* Sub Activities */}
              <AccordionContent className="pb-0">
                {activity.subActivities &&
                  activity.subActivities.length > 0 && (
                    <div className="divide-y">
                      {activity.subActivities.map(
                        (subActivity: ProjectSubActivity) => (
                          <ContextMenu key={subActivity.id}>
                            <ContextMenuTrigger>
                              <div className="grid h-12 divide-x grid-cols-4 text-sm hover:bg-muted/30 border-b bg-gray-25">
                                <div className="px-2 col-span-2 text-muted-foreground pl-8 truncate flex items-center">
                                  ↳ {subActivity.activity}
                                </div>
                                <div className="px-2 text-center text-muted-foreground truncate flex items-center justify-center">
                                  {subActivity.startDate}
                                </div>
                                <div className="px-2 text-center text-muted-foreground truncate flex items-center justify-center">
                                  {subActivity.duration} jam
                                </div>
                              </div>
                            </ContextMenuTrigger>

                            <ContextMenuContent>
                              <ContextMenuItem
                                onClick={() =>
                                  onAction(
                                    ACTIONS.editSub(subActivity, activity)
                                  )
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Sub-Activity
                              </ContextMenuItem>
                              <ContextMenuItem
                                onClick={() =>
                                  onAction(
                                    ACTIONS.deleteSub(
                                      activity.id,
                                      subActivity.id
                                    )
                                  )
                                }
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Sub-Activity
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        )
                      )}
                    </div>
                  )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );
}
