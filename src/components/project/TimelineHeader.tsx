import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ViewType } from "@/types/timeline-planner";
import { getWindowRangeLabel } from "@/lib/utils";

interface TimelineHeaderProps {
  selectedView: ViewType;
  setSelectedView: (view: ViewType) => void;
  windowStart: Date;
  daysInWindow: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const TimelineHeader = ({
  selectedView,
  setSelectedView,
  windowStart,
  daysInWindow,
  onPrevious,
  onNext,
}: TimelineHeaderProps) => {
  return (
    <div className="border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            className="px-3 py-1 border border-border rounded text-sm bg-background"
            value={selectedView}
            onChange={(e) =>
              setSelectedView(e.target.value === "Month" ? "Month" : "Week")
            }
          >
            <option value="Week">Week</option>
            <option value="Month">Month</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium px-4">
            {getWindowRangeLabel(windowStart, daysInWindow)}
          </span>
          <Button variant="outline" size="sm" onClick={onNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
