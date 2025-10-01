import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import React from "react";
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
  ModeType,
} from "@/types/projects";
import { calculateWorkingDays } from "@/lib/dates";
import {
  SubActivityFormData,
  subActivityFormSchema,
} from "@/lib/schemas/project";
import { v4 } from "uuid";

interface SubActivityFormProps {
  parentActivity: ProjectActivity | null;
  subActivityDetails: ProjectSubActivity | null;
  mode: ModeType;
  activities?: ProjectActivity[];
  onSubmit: (entity: ProjectSubActivity, parent?: ProjectActivity) => void;
}

const createSubActivity = (
  data: SubActivityFormData,
  parentID: string
): ProjectSubActivity => ({
  id: data.id || v4(),
  name: data.name.trim(),
  startDate: data.startDate,
  endDate: data.endDate,
  workload: data.workload,
  fte: data.fte,
  minimumLevel: data.minimumLevel,
  parentId: parentID,
  role: data.role,
});

const getDefaultFormValues = (): SubActivityFormData => ({
  id: "",
  name: "",
  startDate: "",
  endDate: "",
  fte: 1.0,
  workload: 0,
  minimumLevel: "junior",
  parentID: "",
  role: "SE",
});

const mapEntityToFormData = (
  entity: ProjectSubActivity
): SubActivityFormData => ({
  id: entity.id,
  name: entity.name,
  startDate: entity.startDate,
  endDate: entity.endDate,
  fte: entity.fte,
  workload: entity.workload,
  minimumLevel: entity.minimumLevel || "junior",
  parentID: "",
  role: entity.role,
});

export function SubActivityForm({
  mode,
  parentActivity,
  subActivityDetails: formDetails,
  activities = [],
  onSubmit,
}: SubActivityFormProps) {
  const form = useForm<SubActivityFormData>({
    resolver: zodResolver(subActivityFormSchema),
    defaultValues: getDefaultFormValues(),
  });

  const watchedFields = form.watch(["startDate", "endDate", "fte", "workload"]);

  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(
    parentActivity ? parentActivity.id : null
  );

  useEffect(() => {
    if (parentActivity) {
      form.setValue("parentID", parentActivity.id);
    }
  }, [parentActivity, form]);

  const [lastUpdatedField, setLastUpdatedField] = React.useState<
    "fte" | "workload" | null
  >(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  const handleFormSubmit = (data: SubActivityFormData) => {
    const parent = activities.find((a) => a.id === data.parentID) || null;

    if (!parent) {
      console.error("Cannot create sub-activity without parent activity");
      return;
    }
    const entity = createSubActivity(data, parent.id);
    onSubmit(entity, parent);
  };

  const handleCancel = () => {
    form.reset(getDefaultFormValues());
  };

  const currentDates = form.watch(["startDate", "endDate"]);
  const workingDays =
    currentDates[0] && currentDates[1]
      ? calculateWorkingDays(currentDates[0], currentDates[1])
      : 0;

  useEffect(() => {
    const [startDate, endDate, fte, workload] = watchedFields;

    if (isCalculating || !startDate || !endDate) return;

    const workingDays = calculateWorkingDays(startDate, endDate);
    const totalWorkHours = workingDays * 8;

    if (totalWorkHours <= 0) return;

    if (lastUpdatedField === "fte" && fte > 0) {
      const calculatedWorkload = Math.round(totalWorkHours * fte * 10) / 10;
      if (Math.abs(workload - calculatedWorkload) > 0.05) {
        setIsCalculating(true);
        form.setValue("workload", calculatedWorkload, {
          shouldValidate: false,
        });
        setTimeout(() => {
          setIsCalculating(false);
          setLastUpdatedField(null);
        }, 0);
      }
    } else if (lastUpdatedField === "workload" && workload > 0) {
      const calculatedFte = Math.round((workload / totalWorkHours) * 10) / 10;
      if (calculatedFte <= 2.0 && Math.abs(fte - calculatedFte) > 0.05) {
        setIsCalculating(true);
        form.setValue("fte", calculatedFte, { shouldValidate: false });
        setTimeout(() => {
          setIsCalculating(false);
          setLastUpdatedField(null);
        }, 0);
      }
    } else if (
      mode === "Edit" &&
      formDetails &&
      fte > 0 &&
      !lastUpdatedField &&
      workload === 0
    ) {
      const calculatedWorkload = Math.round(totalWorkHours * fte * 10) / 10;
      setIsCalculating(true);
      form.setValue("workload", calculatedWorkload, { shouldValidate: false });
      setTimeout(() => {
        setIsCalculating(false);
      }, 0);
    }
  }, [watchedFields, form, formDetails, mode, lastUpdatedField, isCalculating]);

  useEffect(() => {
    if (formDetails && mode === "Edit") {
      const formData = mapEntityToFormData(formDetails);
      form.reset(formData);
    } else if (mode === "Add" && !formDetails && !form.formState.isDirty) {
      form.reset(getDefaultFormValues());
    }
  }, [formDetails, mode, form]);

  useEffect(() => {
    if (selectedParentId) {
      form.setValue("parentID", selectedParentId);
    }
  }, [selectedParentId, form]);

  return (
    <SheetContent className="sm:max-w-[600px] flex flex-col overflow-y-scroll">
      <SheetHeader>
        <SheetTitle>{mode} Sub-Activity</SheetTitle>
      </SheetHeader>

      {activities.length > 0 && mode === "Add" && (
        <div className="px-4 pb-2">
          <label className="block mb-2 text-sm font-medium">
            Select Parent Activity
          </label>
          <Select
            value={selectedParentId ? String(selectedParentId) : ""}
            onValueChange={(val) => {
              setSelectedParentId(val);
              form.setValue("parentID", val);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select activity..." />
            </SelectTrigger>
            <SelectContent>
              {activities.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Form {...form}>
        <div className="space-y-6">
          {/* Hidden field for parentID to keep it controlled */}
          <FormField
            control={form.control}
            name="parentID"
            render={({ field }) => <input type="hidden" {...field} />}
          />
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            {/* Activity Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub-Activity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter sub-activity" {...field} />
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
                  let minDate = undefined;
                  let maxDate = undefined;

                  const parent =
                    parentActivity ||
                    (selectedParentId
                      ? activities.find((a) => a.id === selectedParentId)
                      : undefined);
                  if (parent) {
                    minDate = parent.startDate;
                    maxDate = parent.endDate;
                  }

                  return (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={minDate}
                          max={maxDate}
                        />
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
                  let minDate = undefined;
                  let maxDate = undefined;

                  const parent =
                    parentActivity ||
                    (selectedParentId
                      ? activities.find((a) => a.id === selectedParentId)
                      : undefined);
                  if (parent) {
                    minDate = parent.startDate;
                    maxDate = parent.endDate;
                  }

                  return (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={minDate}
                          max={maxDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

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
                      max="10.0"
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!isCalculating) {
                          setLastUpdatedField("fte");
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    1.0 = 8 hours/day | 0.5 = 4 hours/day | 0.25 = 2 hours/day
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workload"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workload (hours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="2000"
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!isCalculating) {
                          setLastUpdatedField("workload");
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>

                  <FormDescription>
                    {workingDays > 0
                      ? `${workingDays} working days × 8 hours × ${form.getValues(
                          "fte"
                        )} FTE = ${
                          Math.round(
                            workingDays * 8 * form.getValues("fte") * 10
                          ) / 10
                        } hours (calculated)`
                      : "Enter dates first to see calculation"}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="minimumLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Level</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "junior"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select level to exclude" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="middle">Middle</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <SheetFooter className="flex gap-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              onClick={form.handleSubmit(handleFormSubmit)}
            >
              {form.formState.isSubmitting
                ? "Processing..."
                : `${mode} sub-activity`}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </Form>
    </SheetContent>
  );
}
