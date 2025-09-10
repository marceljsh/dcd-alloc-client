import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
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
import { ProjectActivity, ProjectSubActivity, SheetType } from "./type";
import { on } from "events";

// Helper function to calculate working days between two dates (excluding weekends)
const calculateWorkingDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) return 0;

  let workingDays = 0;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

// Calculate duration based on working days and FTE
const calculateDuration = (
  startDate: string,
  endDate: string,
  fte: number
): number => {
  const workingDays = calculateWorkingDays(startDate, endDate);
  const hoursPerDay = 8; // Standard working hours per day
  return Math.round(workingDays * hoursPerDay * fte);
};

// Zod schema untuk validasi
const activityFormSchema = z
  .object({
    activityName: z
      .string()
      .min(1, "Activity name is required")
      .min(3, "Activity name must be at least 3 characters")
      .max(100, "Activity name must not exceed 100 characters"),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }, "Start date cannot be in the past"),
    endDate: z
      .string()
      .min(1, "End date is required for auto calculation")
      .refine((date) => {
        if (!date) return false;
        const endDate = new Date(date);
        return !isNaN(endDate.getTime());
      }, "Invalid end date format"),
    fte: z
      .number()
      .min(0.1, "FTE must be at least 0.1")
      .max(2, "FTE cannot exceed 2.0")
      .refine(
        (val) => val % 0.1 === 0 || Math.round(val * 10) / 10 === val,
        "FTE must be in increments of 0.1"
      ),
    duration: z
      .number()
      .min(1, "Duration must be at least 1 hour")
      .max(2000, "Duration cannot exceed 2000 hours")
      .int("Duration must be a whole number"),
    calculationMode: z.enum(["auto", "manual"]),
  })
  .refine(
    (data) => {
      // Cross-field validation: end date must be after start date
      if (data.endDate && data.startDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate > startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type ActivityFormData = z.infer<typeof activityFormSchema>;
interface ActivityFormProps {
  sheetType: SheetType;
  onAddActivity: (activity: ProjectActivity) => void;
  onAddSubActivity: (subActivity: ProjectSubActivity) => void;
  parentActivityId: number | null;
  formDetails: ProjectActivity | null;
  mode: "View" | "Edit" | "Add";
}

export function ActivityForm({
  sheetType,
  mode,
  onAddActivity,
  onAddSubActivity,
  parentActivityId,
  formDetails,
}: ActivityFormProps) {
  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      activityName: formDetails ? formDetails.activity : "",
      startDate: formDetails
        ? formDetails.startDate
        : new Date().toISOString().split("T")[0],
      endDate: formDetails ? formDetails.endDate : "",
      fte: formDetails ? formDetails.fte : 1.0,
      duration: formDetails ? formDetails.duration : 8,
      calculationMode: formDetails ? undefined : "auto",
    },
  });

  const watchedFields = form.watch([
    "startDate",
    "endDate",
    "fte",
    "calculationMode",
  ]);

  const onSubmit = (data: ActivityFormData) => {
    if (sheetType === "activity") {
      const newActivity: ProjectActivity = {
        id: Date.now(),
        activity: data.activityName.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        duration: data.duration,
        fte: data.fte,
      };

      onAddActivity(newActivity);
    } else {
      const newSubActivity: ProjectSubActivity = {
        id: Date.now(),
        activity: data.activityName.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        duration: data.duration,
        parentId: parentActivityId!,
        fte: data.fte,
      };

      onAddSubActivity(newSubActivity);
    }

    form.reset();
  };

  const handleCancel = () => {
    form.reset();
  };

  const calculationMode = form.watch("calculationMode");
  const currentDates = form.watch(["startDate", "endDate"]);
  const workingDays =
    currentDates[0] && currentDates[1]
      ? calculateWorkingDays(currentDates[0], currentDates[1])
      : 0;
  let wordingSubmitButton;
  if (mode === "Add") {
    wordingSubmitButton =
      sheetType === "activity" ? "Add Activity" : "Add Sub-Activity";
  } else if (mode === "Edit") {
    wordingSubmitButton =
      sheetType === "activity" ? "Update Activity" : "Update Sub-Activity";
  }

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
  }, [watchedFields, form]);

  useEffect(() => {
    if (formDetails) {
      form.reset({
        activityName: formDetails.activity,
        startDate: formDetails.startDate,
        endDate: formDetails.endDate,
        fte: formDetails.fte,
        duration: formDetails.duration,
        calculationMode: undefined,
      });
    }
  }, [formDetails, form]);

  return (
    <SheetContent className="sm:max-w-[600px]">
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
            <FormField
              control={form.control}
              name="calculationMode"
              render={({ field }) =>
                field.value !== undefined ? (
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
                ) : (
                  <></>
                )
              }
            />
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
                  {workingDays > 0 && (
                    <FormDescription>
                      Working days: {workingDays} days (excluding weekends)
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* FTE Field - only show in auto mode */}
            {calculationMode === "auto" && !formDetails && (
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
                      {formDetails
                        ? "Cannot edit duration if sub-activity exists"
                        : "Enter duration manually in hours"}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <SheetFooter className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : wordingSubmitButton}
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
