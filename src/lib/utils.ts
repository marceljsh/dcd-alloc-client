import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

import {
  addDays,
  format,
  differenceInCalendarDays,
  parseISO,
  startOfMonth,
  getDaysInMonth,
} from "date-fns";
import { ViewType } from "@/types/timeline-planner";

export const getDaysArray = (start: Date, daysInWindow: number) =>
  Array.from({ length: daysInWindow }).map((_, i) => addDays(start, i));

export const getWindowRangeLabel = (
  start: Date,
  daysInWindow: number,
  viewType: ViewType = "Week"
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
  viewType: ViewType
): Date => {
  if (viewType === "Month") {
    return startOfMonth(currentDate);
  }
  return currentDate;
};

export const getDaysInWindowForView = (
  windowStart: Date,
  viewType: ViewType
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
  daysInWindow: number
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
