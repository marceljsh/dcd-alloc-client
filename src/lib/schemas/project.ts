import z from "zod";

export const activityFormSchema = z
  .object({
    id: z.string().optional(),
    name: z
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
    workload: z
      .number()
      .min(0, "Workload cannot be negative")
      .max(2000, "Duration cannot exceed 2000 hours")
      .int("Duration must be a whole number"),
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
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export const subActivityFormSchema = z
  .object({
    id: z.string().optional(),
    name: z
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
    fte: z.number().min(0.1, "FTE must be at least 0.1"),
    workload: z
      .number()
      .min(0, "Workload cannot be negative")
      .max(2000, "Duration cannot exceed 2000 hours")
      .int("Duration must be a whole number"),
    role: z.enum(["SE", "DE", "SA"], "Role is required"),
    minimumLevel: z.enum(["junior", "middle", "senior"]),
    parentID: z.uuid(),
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
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type ActivityFormData = z.infer<typeof activityFormSchema>;
export type SubActivityFormData = z.infer<typeof subActivityFormSchema>;
