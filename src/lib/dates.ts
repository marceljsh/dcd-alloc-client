import { ProjectActivity } from "@/components/project/create/type";
import { Project } from "next/dist/build/swc/types";

export function datesOverlap(
  _start1: string,
  _end1: string,
  _start2: string,
  _end2: string
): boolean {
  const start1 = new Date(_start1);
  const end1 = new Date(_end1);
  const start2 = new Date(_start2);
  const end2 = new Date(_end2);

  return start1 <= end2 && start2 <= end1;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

export const generateDates = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];

  const current = new Date(startDate);
  current.setDate(current.getDate() - 1);

  const last = new Date(endDate);
  last.setDate(last.getDate() + 1);

  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const getMonthAbbr = (date: Date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[date.getMonth()];
};

export const getActivityDateIndex = (
  activity: ProjectActivity,
  dates: Date[],
  windowStart: Date,
  daysInWindow: number
) => {
  const startDate = new Date(activity.startDate);
  const endDate = new Date(activity.endDate);
  const startIndex = Math.max(
    0,
    Math.min(
      daysInWindow + 1,
      Math.floor(
        (startDate.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24)
      )
    )
  );
  const endIndex = Math.max(
    0,
    Math.min(
      daysInWindow + 1,
      Math.floor(
        (endDate.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    )
  );

  return `${startIndex} / ${endIndex}`;
};
