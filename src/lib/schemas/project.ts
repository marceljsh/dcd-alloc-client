import z from "zod";

export const activityFormSchema = z
  .object({
    id: z.number().optional(),
    activityName: z
      .string()
      .min(1, "Activity name is required")
      .min(3, "Activity name must be at least 3 characters")
      .max(100, "Activity name must not exceed 100 characters"),
    startDate: z.string().min(1, "Start date is required"),
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
    role: z.enum(["SE", "DE", "SA"]).or(z.literal("")).optional(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate > startDate;
      }
      return true;
    },
    {
      message: "End date must be after end date",
      path: ["endDate"],
    }
  );

export type ActivityFormData = z.infer<typeof activityFormSchema>;

export const createSubActivitySchema = (
  parentStart: string,
  parentEnd: string
) =>
  activityFormSchema.superRefine((data, ctx) => {
    const subStart = new Date(data.startDate);
    const subEnd = new Date(data.endDate);
    const parentStartDate = new Date(parentStart);
    const parentEndDate = new Date(parentEnd);

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    if (subStart < parentStartDate) {
      ctx.addIssue({
        code: "custom",
        message: `Start date cannot be earlier than the parent activity's start date (${formatDate(
          parentStartDate
        )})`,
        path: ["startDate"],
      });
    }

    if (subEnd > parentEndDate) {
      ctx.addIssue({
        code: "custom",
        message: `End date cannot be later than the parent activity's end date (${formatDate(
          parentEndDate
        )})`,
        path: ["endDate"],
      });
    }
  });
