import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
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
import {
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProjectActivity,
  ProjectSubActivity,
  ModeType,
} from "@/types/projects";
import { ActivityFormData, activityFormSchema } from "@/lib/schemas/project";
import { v4 as uuidv4 } from "uuid";

interface ActivityFormProps {
  activityDetails: ProjectActivity | null;
  mode: ModeType;
  activities?: ProjectActivity[];
  onSubmit: (
    entity: ProjectActivity | ProjectSubActivity,
    parent?: ProjectActivity
  ) => void;
  onEditSubActivity?: (
    subActivity: ProjectSubActivity,
    parentActivity: ProjectActivity
  ) => void;
  onDeleteSubActivity?: (
    parentActivityId: string,
    subActivityId: string
  ) => void;
}

const createActivity = (data: ActivityFormData): ProjectActivity => ({
  id: data.id ? data.id : uuidv4(),
  name: data.name.trim(),
  startDate: data.startDate,
  endDate: data.endDate,
  workload: data.workload,
  role: data.role,
  subActivities: [],
});

const getDefaultFormValues = (): ActivityFormData => ({
  id: "",
  name: "",
  startDate: "",
  endDate: "",
  workload: 0,
  role: "SE",
});

const mapEntityToFormData = (entity: ProjectActivity): ActivityFormData => ({
  id: entity.id,
  name: entity.name,
  startDate: entity.startDate,
  endDate: entity.endDate,
  workload: entity.workload,
  role: entity.role,
});

export function ActivityForm({
  mode,
  activityDetails: formDetails,
  onSubmit,
  onEditSubActivity,
  onDeleteSubActivity,
}: ActivityFormProps) {
  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: getDefaultFormValues(),
  });

  const [deletedSubActivityIds, setDeletedSubActivityIds] = React.useState<
    string[]
  >([]);

  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    isOpen: boolean;
    subActivityId?: string;
    subActivityName?: string;
  }>({ isOpen: false });

  const handleFormSubmit = (data: ActivityFormData) => {
    console.log("Form Data Submitted:", data);
    console.log(uuidv4());
    const entity = createActivity(data);

    if (mode === "Edit" && formDetails && "subActivities" in formDetails) {
      const filteredSubActivities = (formDetails.subActivities || []).filter(
        (sub) => !deletedSubActivityIds.includes(sub.id)
      );
      (entity as ProjectActivity).subActivities = filteredSubActivities;

      deletedSubActivityIds.forEach((subId) => {
        onDeleteSubActivity?.(formDetails.id, subId);
      });
    }

    if (mode === "Add") {
      entity.workload = 0;
    }
    onSubmit(entity);
  };

  const handleCancel = () => {
    form.reset(getDefaultFormValues());

    setDeletedSubActivityIds([]);
  };

  const handleDeleteSubActivityLocally = (
    subActivityId: string,
    subActivityName: string
  ) => {
    setDeleteConfirmation({
      isOpen: true,
      subActivityId,
      subActivityName,
    });
  };

  const confirmDeleteSubActivity = () => {
    if (deleteConfirmation.subActivityId) {
      setDeletedSubActivityIds((prev) => [
        ...prev,
        deleteConfirmation.subActivityId!,
      ]);
    }
    setDeleteConfirmation({ isOpen: false });
  };

  const getSubmitButtonText = () => {
    const action = mode === "Add" ? "Add" : "Update";
    return `${action} Activity`;
  };

  const getSheetTitle = () => {
    return `${mode} Activity`;
  };

  useEffect(() => {
    if (formDetails && mode === "Edit") {
      const formData = mapEntityToFormData(formDetails);
      form.reset(formData);

      setDeletedSubActivityIds([]);
    } else if (mode === "Add" && !formDetails && !form.formState.isDirty) {
      form.reset(getDefaultFormValues());
      setDeletedSubActivityIds([]);
    }
  }, [formDetails, mode, form]);

  return (
    <SheetContent className="sm:max-w-[600px] flex flex-col overflow-y-scroll">
      <SheetHeader>
        <SheetTitle>{getSheetTitle()}</SheetTitle>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            {/* Activity Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Name</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter activity name`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Role Field - Only for activities */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SE">Software Engineer</SelectItem>
                        <SelectItem value="SA">Solution Analyst</SelectItem>
                        <SelectItem value="DE">Data Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sub-Activities List - Only show when editing an activity that has sub-activities */}
          {formDetails &&
            "subActivities" in formDetails &&
            (() => {
              const subActivities = (formDetails.subActivities || []).filter(
                (sub) => !deletedSubActivityIds.includes(sub.id)
              );

              return subActivities.length > 0 ? (
                <div className="px-4">
                  <Card className="py-5">
                    <CardHeader>
                      <CardTitle className="text-sm">Sub-Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {subActivities.map((subActivity) => (
                        <div
                          key={subActivity.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {subActivity.name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                              <span>
                                {subActivity.startDate} - {subActivity.endDate}
                              </span>
                              <span>{subActivity.workload} hours</span>
                              <span>FTE: {subActivity.fte}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onEditSubActivity?.(
                                  subActivity,
                                  formDetails as ProjectActivity
                                )
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteSubActivityLocally(
                                  subActivity.id,
                                  subActivity.name
                                )
                              }
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ) : null;
            })()}

          <SheetFooter className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Processing..."
                : getSubmitButtonText()}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </Form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation({ ...deleteConfirmation, isOpen: open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove the sub-activity{" "}
              <strong>{deleteConfirmation.subActivityName}</strong> from this
              form. The deletion will be applied when you update the activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubActivity}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove Sub-Activity
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SheetContent>
  );
}
