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

interface ActivityFormProps {
  sheetType: EntityType;
  parentActivity: ProjectActivity | null;
  formDetails: ProjectActivity | ProjectSubActivity | null;
  mode: ModeType;
  onSubmit: (entity: ProjectActivity | ProjectSubActivity) => void;
}

const createActivity = (data: ActivityFormData): ProjectActivity => ({
  id: data.id ?? Date.now(),
  activity: data.activityName.trim(),
  startDate: data.startDate,
  endDate: data.endDate,
  duration: data.duration,
  fte: data.fte,
  role: data.role,
  subActivities: [], // Initialize empty sub-activities array
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
  role: data.role || "", // Fallback to empty string
  excludeLevel: data.excludeLevel,
});

const getDefaultFormValues = (): ActivityFormData => ({
  activityName: "",
  startDate: "",
  endDate: "",
  fte: 1.0,
  duration: 0,
  calculationMode: "auto",
  role: "",
  excludeLevel: "none",
});

const mapEntityToFormData = (
  entity: ProjectActivity | ProjectSubActivity
): ActivityFormData => ({
  id: entity.id,
  activityName: entity.activity,
  startDate: entity.startDate,
  endDate: entity.endDate,
  fte: entity.fte,
  duration: entity.duration,
  calculationMode: "auto",
  role: entity.role || "",
  excludeLevel:
    "excludeLevel" in entity ? entity.excludeLevel || "none" : "none",
});

export function ActivityForm({
  sheetType,
  mode,
  parentActivity,
  formDetails,
  onSubmit,
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

  const handleFormSubmit = (data: ActivityFormData) => {
    let entity: ProjectActivity | ProjectSubActivity;

    if (sheetType === "activity") {
      entity = createActivity(data);

      if (mode === "Edit" && formDetails && "subActivities" in formDetails) {
        (entity as ProjectActivity).subActivities =
          formDetails.subActivities || [];
      }

      if (mode === "Add") {
        entity.duration = 0;
      }
    } else if (parentActivity) {
      entity = createSubActivity(data, parentActivity);
    } else {
      console.error("Cannot create sub-activity without parent activity");
      return;
    }

    onSubmit(entity);
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
    sheetType === "subactivity" && mode !== "Edit";
  const isDurationVisible = sheetType === "subactivity";
  const isRoleVisible = sheetType === "activity";

  const getSubmitButtonText = () => {
    const action = mode === "Add" ? "Add" : "Update";
    const entityType = sheetType === "activity" ? "Activity" : "Sub-Activity";
    return `${action} ${entityType}`;
  };

  const getSheetTitle = () => {
    const entityType = sheetType === "activity" ? "Activity" : "Sub-Activity";
    return `${mode} ${entityType}`;
  };

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
      const formData = mapEntityToFormData(formDetails);
      form.reset(formData);
    } else if (mode === "Add" && !formDetails && !form.formState.isDirty) {
      // Only reset if form is not dirty (hasn't been filled out yet)
      form.reset(getDefaultFormValues());
    }
  }, [formDetails, mode, sheetType, form]);

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
              name="activityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {sheetType === "activity" ? "Activity" : "Sub-Activity"}{" "}
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

            {/* Calculation Mode - Only for new sub-activities */}
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

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4 items-start">
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

            {/* Role Field - Only for activities */}
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
                        value={field.value}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* FTE Field - Only for sub-activities with auto calculation */}
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

            {/* Duration Field - Only for sub-activities */}
            {isDurationVisible && (
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workload (hours)</FormLabel>
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

            {/* Exclude Level Field - Only for sub-activities */}
            {sheetType === "subactivity" && (
              <FormField
                control={form.control}
                name="excludeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exclude Level (Optional)</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "none"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select level to exclude" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No exclusion</SelectItem>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="middle">Middle</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Exclude specific experience level from this task
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

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
    </SheetContent>
  );
}
