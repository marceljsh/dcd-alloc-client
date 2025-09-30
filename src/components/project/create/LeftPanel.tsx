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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
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

  deleteActivity: (id: string) => createAction({ type: "delete-activity", id }),

  editSub: (sub: ProjectSubActivity, parent: ProjectActivity) =>
    createAction({ type: "edit-sub", sub, parent }),

  deleteSub: (activityId: string, subId: string) =>
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
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: "activity" | "subactivity";
    activityId?: string;
    activityName?: string;
    subActivityId?: string;
    subActivityName?: string;
  }>({ isOpen: false, type: "activity" });

  const handleDeleteClick = (
    type: "activity" | "subactivity",
    activityId: string,
    activityName: string,
    subActivityId?: string,
    subActivityName?: string
  ) => {
    setDeleteDialog({
      isOpen: true,
      type,
      activityId,
      activityName,
      subActivityId,
      subActivityName,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.type === "activity" && deleteDialog.activityId) {
      onAction(ACTIONS.deleteActivity(deleteDialog.activityId));
    } else if (
      deleteDialog.type === "subactivity" &&
      deleteDialog.activityId &&
      deleteDialog.subActivityId
    ) {
      onAction(
        ACTIONS.deleteSub(deleteDialog.activityId, deleteDialog.subActivityId)
      );
    }
    setDeleteDialog({ isOpen: false, type: "activity" });
  };
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
                  <div
                    className="h-12 grid divide-x grid-cols-4 text-sm hover:bg-muted/50 border-b cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(ACTIONS.editActivity(activity));
                    }}
                  >
                    <div className="px-2 col-span-2 font-medium truncate flex items-center">
                      {activity.subActivities &&
                      activity.subActivities.length > 0 ? (
                        <AccordionTrigger
                          className="hover:no-underline p-1 mr-2 h-6 w-6 [&[data-state=open]>svg]:rotate-360 [&[data-state=closed]>svg]:rotate-270 [&>svg]:h-4 [&>svg]:w-4"
                          onClick={(e) => e.stopPropagation()}
                        ></AccordionTrigger>
                      ) : (
                        <div className="w-6 mr-2" />
                      )}
                      {activity.name}{" "}
                    </div>
                    <div className="px-2 text-center truncate flex items-center justify-center">
                      {activity.startDate}
                    </div>
                    <div className="px-2 text-center truncate flex items-center justify-center">
                      {activity.workload} jam
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
                      handleDeleteClick("activity", activity.id, activity.name)
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
                              <div
                                className="grid h-12 divide-x grid-cols-4 text-sm hover:bg-muted/30 border-b bg-gray-25 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAction(
                                    ACTIONS.editSub(subActivity, activity)
                                  );
                                }}
                              >
                                <div className="px-2 col-span-2 text-muted-foreground pl-8 truncate flex items-center">
                                  ↳ {subActivity.name}{" "}
                                  {subActivity.role && (
                                    <Badge
                                      variant="outline"
                                      className={`ml-2 text-xs ${
                                        roleColors[
                                          subActivity.role as "SE" | "DE" | "SA"
                                        ]
                                      }`}
                                    >
                                      {subActivity.role}
                                    </Badge>
                                  )}
                                </div>
                                <div className="px-2 text-center text-muted-foreground truncate flex items-center justify-center">
                                  {subActivity.startDate}
                                </div>
                                <div className="px-2 text-center text-muted-foreground truncate flex items-center justify-center">
                                  {subActivity.workload} jam
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
                                  handleDeleteClick(
                                    "subactivity",
                                    activity.id,
                                    activity.name,
                                    subActivity.id,
                                    subActivity.name
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          setDeleteDialog({ ...deleteDialog, isOpen: open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === "activity" ? (
                <>
                  This action will permanently delete the activity{" "}
                  <strong>{deleteDialog.activityName} </strong>
                  and all its sub-activities. This action cannot be undone.
                </>
              ) : (
                <>
                  This action will permanently delete the sub-activity{" "}
                  <strong>{deleteDialog.subActivityName}</strong>. This action
                  cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete{" "}
              {deleteDialog.type === "activity" ? "Activity" : "Sub-Activity"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  );
}
