"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { addDays, format } from "date-fns";

import { SubActivity } from "@/types/timeline-planner";
import { useProjectPlanner } from "@/hooks/use-project-planner";
import { getDaysArray } from "@/lib/utils";
import { TimelineHeader } from "@/components/project/TimelineHeader";
import { ActivityRow } from "@/components/project/ActivityRow";
import { AddActivityDialog } from "@/components/project/AddActivityDialog";
import { AddSubActivityDialog } from "@/components/project/AddSubActivityDialog";
import { SubActivityDetailDialog } from "@/components/project/SubAcitivityDetailDialog";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcut";

export function ProjectPlanner() {
  const {
    selectedView,
    activities,
    windowStart,
    daysInWindow,
    containerRef,
    setSelectedView,
    moveWindowPrev,
    moveWindowNext,
    addActivity,
    addSubActivity,
  } = useProjectPlanner();

  // Dialog states
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSub, setDetailSub] = useState<SubActivity | null>(null);

  useKeyboardShortcuts({
    onAddActivity: () => setIsAddActivityOpen(true),
    onPreviousWeek: moveWindowPrev,
    onNextWeek: moveWindowNext,
    onToggleView: () =>
      setSelectedView(selectedView === "Week" ? "Month" : "Week"),
  });

  const handleAddSubActivity = (activityId: number) => {
    setSelectedActivityId(activityId);
    setIsAddSubOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TimelineHeader
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        windowStart={windowStart}
        daysInWindow={daysInWindow}
        onPrevious={moveWindowPrev}
        onNext={moveWindowNext}
      />

      <div className="flex-1 p-4 overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold mb-1">Project Breakdown</h2>
          <div className="text-sm text-muted-foreground">
            Add activity and sub activity
          </div>
        </div>

        <div className="space-y-6">
          {/* Timeline header */}
          <div
            ref={containerRef}
            className="grid gap-0 pb-2 border-b"
            style={{
              gridTemplateColumns: `200px repeat(${daysInWindow}, 1fr)`,
            }}
          >
            {/* Placeholder for the label column */}
            <div />
            {getDaysArray(windowStart, daysInWindow).map((d, idx) => (
              <div key={idx} className="font-medium text-xs text-center">
                {
                  selectedView === "Month"
                    ? format(d, "d")
                    : format(d, "EEE d")
                }
              </div>
            ))}
          </div>

          {/* Activities */}
          {activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              windowStart={windowStart}
              daysInWindow={daysInWindow}
              onAddSubActivity={handleAddSubActivity}
            />
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="mt-2 flex items-center gap-1 text-primary hover:bg-muted"
            onClick={() => setIsAddActivityOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <AddActivityDialog
        isOpen={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        onAddActivity={addActivity}
      />

      <AddSubActivityDialog
        isOpen={isAddSubOpen}
        onOpenChange={setIsAddSubOpen}
        onAddSubActivity={(sub) => {
          if (selectedActivityId) {
            addSubActivity(selectedActivityId, sub);
          }
        }}
        windowStart={windowStart}
      />

      <SubActivityDetailDialog
        isOpen={detailOpen}
        onOpenChange={setDetailOpen}
        subActivity={detailSub}
      />
    </div>
  );
}
