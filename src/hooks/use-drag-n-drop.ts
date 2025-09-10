import { useEffect } from "react";
import {
  addDays,
  parseISO,
  formatISO,
  differenceInCalendarDays,
} from "date-fns";
import { DragState, Activity } from "@/types/timeline-planner";

export const useDragAndDrop = (
  draggingRef: React.MutableRefObject<DragState | null>,
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>
) => {
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const d = draggingRef.current;
      if (!d) return;

      const clientX = e.clientX;
      const deltaX = clientX - d.startX;
      const cellWidth = d.containerWidth / d.daysInWindow; // Lebar satu hari dalam piksel
      const dayShift = Math.round(deltaX / cellWidth); // Pergeseran dalam jumlah hari

      const bar = document.querySelector(
        `[data-dragging="${d.activityId}-${d.subId}"]`
      ) as HTMLElement | null;

      if (!bar) return;

      if (d.dragType === "move") {
        const newLeftPercent =
          (d.origLeftPercent / 100) * d.containerWidth + dayShift * cellWidth;
        bar.style.left = `${(newLeftPercent / d.containerWidth) * 100}%`;
      } else if (d.dragType === "resizeEnd") {
        const origDurationDays =
          differenceInCalendarDays(
            parseISO(d.origEndDate),
            parseISO(d.origStartDate)
          ) + 1;
        const newDurationDays = Math.max(1, origDurationDays + dayShift);
        bar.style.width = `${(newDurationDays / d.daysInWindow) * 100}%`;
      } else if (d.dragType === "resizeStart") {
        const origDurationDays =
          differenceInCalendarDays(
            parseISO(d.origEndDate),
            parseISO(d.origStartDate)
          ) + 1;
        const newDurationDays = Math.max(1, origDurationDays - dayShift);

        const origStartDays = differenceInCalendarDays(
          parseISO(d.origStartDate),
          parseISO(d.containerStart)
        );
        const newStartDays = Math.max(0, origStartDays + dayShift);

        bar.style.left = `${(newStartDays / d.daysInWindow) * 100}%`;
        bar.style.width = `${(newDurationDays / d.daysInWindow) * 100}%`;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const d = draggingRef.current;
      if (!d) {
        return;
      }

      const clientX = e.clientX;
      const deltaX = clientX - d.startX;
      const cellWidth = d.containerWidth / d.daysInWindow;
      const dayShift = Math.round(deltaX / cellWidth);

      setActivities((prev) =>
        prev.map((act) => {
          if (act.id !== d.activityId) return act;
          return {
            ...act,
            subActivities: act.subActivities.map((s) => {
              if (s.id !== d.subId) return s;

              const origStart = parseISO(d.origStartDate);
              const origEnd = parseISO(d.origEndDate);

              let newStart = origStart;
              let newEnd = origEnd;

              if (d.dragType === "move") {
                if (dayShift !== 0) {
                  newStart = addDays(origStart, dayShift);
                  newEnd = addDays(origEnd, dayShift);
                }
              } else if (d.dragType === "resizeEnd") {
                newEnd = addDays(origEnd, dayShift);
                if (differenceInCalendarDays(newEnd, origStart) < 0) {
                  newEnd = origStart;
                }
              } else if (d.dragType === "resizeStart") {
                newStart = addDays(origStart, dayShift);
                if (differenceInCalendarDays(origEnd, newStart) < 0) {
                  newStart = origEnd;
                }
              }

              return {
                ...s,
                startDate: formatISO(newStart, { representation: "date" }),
                endDate: formatISO(newEnd, { representation: "date" }),
              };
            }),
          };
        })
      );

      const bar = document.querySelector(
        `[data-dragging="${d.activityId}-${d.subId}"]`
      ) as HTMLElement | null;
      if (bar) {
        bar.style.left = "";
        bar.style.width = "";
        bar.removeAttribute("data-dragging");
      }
      draggingRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [draggingRef, setActivities]);
};
