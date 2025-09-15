import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  FormDescription,
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
  EntityType,
  ModeType,
} from "@/types/projects";
import { calculateDuration, calculateWorkingDays } from "@/lib/dates";
import {
  ActivityFormData,
  activityFormSchema,
  createSubActivitySchema,
} from "@/lib/schemas/project";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ActivityFormProps {
  sheetType: EntityType;
  onAddActivity: (activity: ProjectActivity) => void;
  onAddSubActivity: (subActivity: ProjectSubActivity) => void;
  onEditActivity: (activity: ProjectActivity) => void;
  onEditSubActivity: (subActivity: ProjectSubActivity) => void;
  parentActivity: ProjectActivity | null;
  formDetails: ProjectActivity | null;
  mode: ModeType;
}

const createActivity = (data: ActivityFormData): ProjectActivity => ({
  id: data.id ?? Date.now(),
  activity: data.activityName.trim(),
  startDate: data.startDate,
  endDate: data.endDate,
  duration: data.duration,
  fte: data.fte,
  role: data.role,
});

const createSubActivity = (
  data: ActivityFormData,
  parent: ProjectActivity
): ProjectSubActivity => ({
  id: data.id ?? Date.now(),
  activity: data.activityName.trim(),
  startDate: data.startDate,
  endDate: data.endDate,
  duration: data.duration,
  fte: data.fte,
  parentId: parent.id,
  role: "",
});

const getDefaultFormValues = (): ActivityFormData => ({
  activityName: "",
  startDate: "",
  endDate: "",
  fte: 1.0,
  duration: 0,
  calculationMode: "auto",
  role: "",
});

export function ActivityForm({
  sheetType,
  mode,
  onAddActivity,
  onAddSubActivity,
  onEditActivity,
  onEditSubActivity,
  parentActivity,
  formDetails,
}: ActivityFormProps) {
  const schema =
    sheetType === "subactivity" && parentActivity
      ? createSubActivitySchema(
          parentActivity.startDate,
          parentActivity.endDate
        )
      : activityFormSchema;

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultFormValues(),
  });

  const watchedFields = form.watch([
    "startDate",
    "endDate",
    "fte",
    "calculationMode",
  ]);

  const onSubmit = (data: ActivityFormData) => {
    if (sheetType === "activity") {
      const newActivity = createActivity(data);

      if (mode === "Edit") {
        onEditActivity(newActivity);
      } else {
        newActivity.duration = 0;
        onAddActivity(newActivity);
      }
    } else {
      const newSubActivity = createSubActivity(data, parentActivity!);

      if (mode === "Edit") {
        onEditSubActivity(newSubActivity);
      } else {
        onAddSubActivity(newSubActivity);
      }
    }

    form.reset(getDefaultFormValues());
  };

  const handleCancel = () => {
    form.reset(getDefaultFormValues());
  };

  const calculationMode = form.watch("calculationMode");
  const currentDates = form.watch(["startDate", "endDate"]);
  const workingDays =
    currentDates[0] && currentDates[1]
      ? calculateWorkingDays(currentDates[0], currentDates[1])
      : 0;

  const isFteFieldVisible =
    sheetType === "subactivity" && calculationMode === "auto";

  const isCalculationModeVisible =
    sheetType === "subactivity" && mode != "Edit";

  const isDurationVisible = sheetType === "subactivity";

  const isRoleVisible = sheetType === "activity";

  const getSubmitButtonText = () => {
    if (mode === "Add") {
      return sheetType === "activity" ? "Add Activity" : "Add Sub-Activity";
    } else {
      return sheetType === "activity"
        ? "Update Activity"
        : "Update Sub-Activity";
    }
  };

  const submitButtonText = getSubmitButtonText();

  useEffect(() => {
    const [startDate, endDate, fte, calculationMode] = watchedFields;

    if (
      (calculationMode === "auto" || formDetails) &&
      startDate &&
      endDate &&
      fte
    ) {
      const calculatedDuration = calculateDuration(startDate, endDate, fte);

      if (calculatedDuration > 0) {
        form.setValue("duration", calculatedDuration, { shouldValidate: true });
      }
    }
  }, [watchedFields, form, formDetails]);

  useEffect(() => {
    if (formDetails && mode === "Edit") {
      form.reset({
        id: formDetails.id,
        activityName: formDetails.activity,
        startDate: formDetails.startDate,
        endDate: formDetails.endDate,
        fte: formDetails.fte,
        duration: formDetails.duration,
        calculationMode: "auto",
        role: formDetails.role,
      });
    } else if (mode === "Add") {
      form.reset(getDefaultFormValues());
    }
  }, [formDetails, mode, sheetType, form]);

  return (
    <SheetContent className="sm:max-w-[600px] flex flex-col overflow-y-scroll">
      <SheetHeader>
        <SheetTitle>
          {mode} {sheetType === "activity" ? "Activity" : "Sub-Activity"}
        </SheetTitle>
      </SheetHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            {/* Activity Name Field */}
            <FormField
              control={form.control}
              name="activityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {sheetType === "activity" ? "Activity " : "Sub-Activity "}
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Enter ${
                        sheetType === "activity" ? "activity" : "sub-activity"
                      } name`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Calculation Mode */}
            {isCalculationModeVisible && (
              <FormField
                control={form.control}
                name="calculationMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration Calculation</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select calculation mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto Calculate</SelectItem>
                          <SelectItem value="manual">Manual Entry</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Auto: Calculate from dates + FTE | Manual: Enter duration
                      directly
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Start & End Date Field */}
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* Start Date Field */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date Field */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End Date {calculationMode === "manual" && "(optional)"}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role Field */}
            {isRoleVisible && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                  </FormItem>
                )}
              />
            )}

            {/* FTE Field - cleaner conditional rendering */}
            {isFteFieldVisible && (
              <FormField
                control={form.control}
                name="fte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FTE (Full Time Equivalent)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="2.0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      1.0 = 8 hours/day | 0.5 = 4 hours/day | 0.25 = 2 hours/day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Duration Field */}
            {isDurationVisible && (
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="2000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={calculationMode === "auto" || !!formDetails}
                      />
                    </FormControl>
                    {calculationMode === "auto" ? (
                      <FormDescription>
                        Auto-calculated: {workingDays} days × 8 hours ×{" "}
                        {form.getValues("fte")} FTE = {field.value} hours
                      </FormDescription>
                    ) : (
                      <FormDescription>
                        Enter duration manually in hours
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <SheetFooter className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Processing..." : submitButtonText}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  );
}
