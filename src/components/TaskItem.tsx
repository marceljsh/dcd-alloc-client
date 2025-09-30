import { Task } from "@/types/projects";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { EmployeeCard } from "@/components/employee/EmployeeCard";
import { toast } from "sonner";
import { DatePicker } from "@/components/DatePicker";

interface TaskItemProps {
  task: Task;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskSelection: (taskId: string | null) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskRename: (taskId: string, newName: string) => void;
  isSelected: boolean;
}

export function TaskItem({
  task,
  onTaskUpdate,
  onTaskSelection,
  onTaskDelete,
  onTaskRename,
  isSelected,
}: TaskItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    onTaskUpdate(task.id, { [field]: value });
  };

  const handleStoryPointsChange = (value: string) => {
    const storyPoints = Math.max(0, parseInt(value) || 0);
    onTaskUpdate(task.id, { storyPoints });
  };

  const handleRemoveEmployee = (employeeId: number) => {
    const employee = task.assignedEmployees.find(
      (emp) => emp.id === employeeId
    );
    if (!employee) return;

    const updatedEmployees = task.assignedEmployees.filter(
      (emp) => emp.id !== employeeId
    );
    onTaskUpdate(task.id, { assignedEmployees: updatedEmployees });
    toast(`${employee.name} dihapus dari "${task.name}"`);
  };

  const handleDeleteTask = () => {
    onTaskDelete(task.id);
    setShowDeleteDialog(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(task.name);
  };

  const handleFinishEdit = () => {
    if (editValue.trim() && editValue.trim() !== task.name) {
      onTaskRename(task.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(task.name);
  };

  const cardClasses = `mb-3 transition-all ${
    isSelected ? "ring-2 ring-primary ring-opacity-50 bg-accent/30" : ""
  }`;

  return (
    <>
      <Collapsible
        open={isSelected}
        onOpenChange={() => onTaskSelection(isSelected ? null : task.id)}
      >
        <Card className={cardClasses}>
          <div className="relative">
            <CollapsibleTrigger className="hover:bg-accent w-full p-4 text-left transition-colors hover:rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {isSelected ? (
                    <ChevronDown
                      className={`h-4 w-4 flex-shrink-0 transform transition-transform duration-300 ${
                        isSelected ? "rotate-90" : ""
                      }`}
                    />
                  ) : (
                    <ChevronRight
                      className={`h-4 w-4 flex-shrink-0 transform transition-transform duration-300 ${
                        isSelected ? "rotate-90" : ""
                      }`}
                    />
                  )}

                  {isEditing ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      onBlur={handleFinishEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleFinishEdit();
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      className="h-6 max-w-xs flex-1 px-1 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="group flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate">{task.name}</span>
                      <div
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit();
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </div>
                    </div>
                  )}

                  {isSelected && !isEditing && (
                    <span className="bg-primary text-primary-foreground py-05 flex-shrink-0 rounded px-2 text-xs">
                      Selected
                    </span>
                  )}
                </div>

                <div className="text-muted-foreground ml-4 flex flex-shrink-0 items-center gap-2 text-sm">
                  <span>{task.assignedEmployees.length} assigned</span>
                  <span>•</span>
                  <span>{task.storyPoints} SP</span>

                  {/* Delete Task button */}
                  <span>
                    <div
                      className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </div>
                  </span>
                </div>
              </div>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="transition-all duration-500 ease-in-out overflow-hidden">
            <div className="space-y-4 p-4 pt-0">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`start-date-${task.id}`}>Start Date</Label>
                  <DatePicker
                    disableWeekends
                    value={task.startDate}
                    onDateChange={(value) =>
                      handleDateChange("startDate", value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`end-date-${task.id}`}>End Date</Label>
                  <DatePicker
                    disableWeekends
                    value={task.endDate}
                    onDateChange={(value) => handleDateChange("endDate", value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`story-points-${task.id}`}>
                    Story Points
                  </Label>
                  <Input
                    id={`story-points-${task.id}`}
                    type="number"
                    min="0"
                    value={task.storyPoints || ""}
                    onChange={(e) => handleStoryPointsChange(e.target.value)}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Assigned Resources</Label>
                <div className="border-border mt-2 flex min-h-[60px] gap-2 overflow-x-auto rounded border-2 border-dashed p-2 pb-2">
                  {task.assignedEmployees.length > 0 ? (
                    task.assignedEmployees.map((employee) => (
                      <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        onRemove={handleRemoveEmployee}
                      />
                    ))
                  ) : (
                    <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                      No employees assigned.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Delete Task Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{task.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the task and all its data.
              <br />
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batalkan</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
