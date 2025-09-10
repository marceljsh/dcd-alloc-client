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
import { SheetTrigger } from "../../ui/sheet";
import { ProjectActivity } from "./type";

export function ActivitiesPanel({
  activities,
  onAddSubActivity,
  onEditActivity,
  onDeleteActivity,
  onDeleteSubActivity,
  expandedItems,
  onAccordionChange,
}: {
  activities: ProjectActivity[];
  onAddSubActivity: (parentId: number | null) => void;
  onDeleteActivity: (id: number) => void;
  onEditActivity: (activity: ProjectActivity) => void;
  onDeleteSubActivity: (activityId: number, subActivityId: number) => void;
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
            Duration
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
                      {activity.activity}
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
                  <SheetTrigger
                    onClick={() => onAddSubActivity(activity.id)}
                    asChild
                  >
                    <ContextMenuItem>
                      <Plus className="mr-2 h-4 w-4" />
                      Add SubActivity
                    </ContextMenuItem>
                  </SheetTrigger>
                  <SheetTrigger
                    onClick={() => onEditActivity(activity)}
                    asChild
                  >
                    <ContextMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Activity
                    </ContextMenuItem>
                  </SheetTrigger>
                  <ContextMenuItem
                    onClick={() => onDeleteActivity(activity.id)}
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
                      {activity.subActivities.map((subActivity) => (
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
                            <ContextMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Sub-Activity
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() =>
                                onDeleteSubActivity(activity.id, subActivity.id)
                              }
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Sub-Activity
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
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
