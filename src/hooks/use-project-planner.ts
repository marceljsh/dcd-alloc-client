import { useState, useRef } from "react";
import { addDays, formatISO } from "date-fns";
import { Activity, SubActivity, ViewType, DragState } from "@/types/timeline-planner";

const mockActivities: Activity[] = [
  {
    id: 1,
    name: "Frontend Development",
    color: "#3b82f6",
    subActivities: [
      {
        id: 1,
        name: "UI Components",
        role: "SE",
        hours: 40,
        description: "Create reusable UI components",
        startDate: "2025-10-30",
        endDate: "2025-11-02",
      },
    ],
  },
];

export const useProjectPlanner = () => {
  const [selectedView, setSelectedView] = useState<ViewType>("Week");
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [windowStart, setWindowStart] = useState<Date>(new Date("2025-10-30"));

  const draggingRef = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const daysInWindow = selectedView === "Week" ? 7 : 30;

  const moveWindowPrev = () => {
    setWindowStart((s) =>
      addDays(s, selectedView === "Week" ? -7 : -daysInWindow)
    );
  };

  const moveWindowNext = () => {
    setWindowStart((s) =>
      addDays(s, selectedView === "Week" ? 7 : daysInWindow)
    );
  };

  const addActivity = (newActivity: Omit<Activity, "id" | "subActivities">) => {
    const newId = Math.max(0, ...activities.map((a) => a.id)) + 1;
    setActivities((prev) => [
      ...prev,
      {
        id: newId,
        name: newActivity.name || "Untitled",
        color: newActivity.color,
        subActivities: [],
      },
    ]);
  };

  const addSubActivity = (
    activityId: number,
    newSub: Omit<SubActivity, "id">
  ) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id !== activityId) return act;
        const newId = Math.max(0, ...act.subActivities.map((s) => s.id)) + 1;

        const sDate =
          newSub.startDate ||
          formatISO(windowStart, { representation: "date" });
        const eDate =
          newSub.endDate ||
          formatISO(addDays(windowStart, 1), { representation: "date" });

        const sub: SubActivity = {
          id: newId,
          name: newSub.name || "Untitled sub",
          role: newSub.role,
          hours: newSub.hours || 0,
          description: newSub.description || "",
          startDate: sDate,
          endDate: eDate,
        };
        return { ...act, subActivities: [...act.subActivities, sub] };
      })
    );
  };

  return {
    // State
    selectedView,
    activities,
    windowStart,
    daysInWindow,
    draggingRef,
    containerRef,

    // Actions
    setSelectedView,
    moveWindowPrev,
    moveWindowNext,
    addActivity,
    addSubActivity,
    setActivities,
  };
};
