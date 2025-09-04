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

import { addDays, format, differenceInCalendarDays, parseISO } from "date-fns";

export const getDaysArray = (start: Date, daysInWindow: number) =>
  Array.from({ length: daysInWindow }).map((_, i) => addDays(start, i));

export const getWindowRangeLabel = (start: Date, daysInWindow: number) => {
  const days = getDaysArray(start, daysInWindow);
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  return `${format(firstDay, "MMMM d")} — ${format(lastDay, "MMMM d yyyy")}`;
};

export const getTimelinePosition = (
  startDate: string,
  endDate: string,
  windowStart: Date,
  daysInWindow: number
) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const startOffset = differenceInCalendarDays(start, windowStart);
  const duration = differenceInCalendarDays(end, start) + 1;

  const clampedStart = Math.max(startOffset, 0);
  const leftPercent = (clampedStart / daysInWindow) * 100;
  const widthPercent = (Math.max(0, duration) / daysInWindow) * 100;

  return {
    left: `${Math.min(100, Math.max(0, leftPercent))}%`,
    width: `${Math.max(2, Math.min(100 - leftPercent, widthPercent))}%`,
  };
};

export const toDisplayDate = (iso: string) => {
  try {
    return format(parseISO(iso), "PPP");
  } catch {
    return iso;
  }
};
