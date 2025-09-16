import { generateDates } from "@/lib/dates";
import { ProjectActivity, ProjectSubActivity } from "@/types/projects";
import { useMemo, useState } from "react";

export const useProjectDates = (activities: ProjectActivity[]) => {
  const getProjectBounds = () => {
    if (activities.length === 0) return { start: new Date(), end: new Date() };

    const startDate = activities.reduce((prev, current) =>
      current.startDate < prev.startDate ? current : prev
    ).startDate;

    const endDate = activities.reduce((prev, current) =>
      current.endDate > prev.endDate ? current : prev
    ).endDate;

    return { start: new Date(startDate), end: new Date(endDate) };
  };

  const [dateRange, setDateRange] = useState(() => getProjectBounds());

  const updateDateRange = (
    newActivity: ProjectActivity | ProjectSubActivity
  ) => {
    const newStart = new Date(newActivity.startDate);
    const newEnd = new Date(newActivity.endDate);

    setDateRange((prev) => ({
      start: newStart < prev.start ? newStart : prev.start,
      end: newEnd > prev.end ? newEnd : prev.end,
    }));
  };

  const dates = useMemo(
    () => generateDates(dateRange.start, dateRange.end),
    [dateRange.start, dateRange.end]
  );

  const groupedDates = useMemo(() => {
    const grouped: Record<string, Date[]> = {};
    dates.forEach((date: Date) => {
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(date);
    });
    return grouped;
  }, [dates]);

  return { dates, groupedDates, updateDateRange };
};
