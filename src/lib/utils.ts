import { DateRange } from "@/types/common";
import { EmployeeUtilization } from "@/types/employee";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  addDays,
  format,
  differenceInCalendarDays,
  parseISO,
  startOfMonth,
  getDaysInMonth,
} from "date-fns";
import { ViewType } from "@/types/timeline-planner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function backgroundByRole(role: string) {
  switch (role) {
    case "System Analyst":
      return "bg-rose-400";
    case "Software Engineer":
      return "bg-sky-400";
    case "Data Engineer":
      return "bg-lime-400";

    default:
      return "bg-gray-500";
  }
}

export const getDaysArray = (start: Date, daysInWindow: number) =>
  Array.from({ length: daysInWindow }).map((_, i) => addDays(start, i));

export const getWindowRangeLabel = (
  start: Date,
  daysInWindow: number,
  viewType: ViewType = "Week",
) => {
  if (viewType === "Month") {
    return format(start, "MMMM yyyy");
  }

  const days = getDaysArray(start, daysInWindow);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  return `${format(firstDay, "MMMM d")} — ${format(lastDay, "MMMM d yyyy")}`;
};

export const getWindowStartForView = (
  currentDate: Date,
  viewType: ViewType,
): Date => {
  if (viewType === "Month") {
    return startOfMonth(currentDate);
  }
  return currentDate;
};

export const getDaysInWindowForView = (
  windowStart: Date,
  viewType: ViewType,
): number => {
  if (viewType === "Month") {
    return getDaysInMonth(windowStart);
  }
  return 7; // For weekly view, always 7 days
};

export const getTimelinePosition = (
  startDate: string,
  endDate: string,
  windowStart: Date,
  daysInWindow: number,
) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // Calculate window end
  const windowEnd = addDays(windowStart, daysInWindow - 1);

  // Check if the activity is completely outside the visible window
  if (start > windowEnd || end < windowStart) {
    // Return position that places it outside visible area
    return {
      startCol: daysInWindow + 2,
      endCol: daysInWindow + 2,
    };
  }

  // Calculate start position relative to window
  let startOffset: number;
  if (start < windowStart) {
    startOffset = 0; // Activity starts before window, clamp to start
  } else {
    startOffset = differenceInCalendarDays(start, windowStart);
  }

  // Calculate end position relative to window
  let endOffset: number;
  if (end > windowEnd) {
    endOffset = daysInWindow - 1; // Activity ends after window, clamp to end
  } else {
    endOffset = differenceInCalendarDays(end, windowStart);
  }

  // Ensure minimum duration of 1 day
  if (endOffset <= startOffset) {
    endOffset = startOffset;
  }

  // Convert to grid columns (1-indexed, with offset of 2 for the label column)
  const startCol = startOffset + 2; // +2 because grid starts at column 2 (after label column)
  const endCol = endOffset + 3; // +3 because end is exclusive and we need to span to next column

  return {
    startCol,
    endCol,
  };
};

export const toDisplayDate = (iso: string) => {
  try {
    return format(parseISO(iso), "PPP");
  } catch {
    return iso;
  }
};

export function generateWeeklyUtilization(
  employee: EmployeeUtilization,
  dateRanges: DateRange[],
) {
  return dateRanges.map(() => {
    // Generate realistic utilization percentages
    const baseUtilization = employee.utilization;
    const variance = (Math.random() - 0.5) * 50; // ±25% variance
    const weeklyUtilization = Math.max(
      0,
      Math.min(150, baseUtilization + variance),
    );
    return Math.round(weeklyUtilization);
  });
}

export function getUtilizationCellColor(utilization: number) {
  if (utilization >= 125) return "bg-red-400 text-white"; // Over-utilization (red)
  if (utilization >= 100) return "bg-red-300 text-red-900"; // High utilization (light red)
  if (utilization >= 90) return "bg-green-400 text-green-900"; // Good utilization (green)
  if (utilization >= 75) return "bg-green-300 text-green-900"; // Normal utilization (light green)
  if (utilization >= 50) return "bg-yellow-300 text-yellow-900"; // Medium utilization (yellow)
  if (utilization >= 25) return "bg-orange-300 text-orange-900"; // Low utilization (orange)
  return "bg-gray-200 text-gray-700"; // Very low utilization (gray)
}

export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString()}`;
};

export const formatWorkloadHours = (hours: number): string => {
  return `${hours} jam`;
};
