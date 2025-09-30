import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, Droplets } from "lucide-react";

export type FteViewMode = "normal" | "fte-visualization";

interface GanttToolbarProps {
  viewMode: FteViewMode;
  onViewModeChange: (mode: FteViewMode) => void;
}

export function GanttToolbar({
  viewMode,
  onViewModeChange,
}: GanttToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 border-b">
      <div className="flex items-center gap-1">
        <Eye className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">View Mode:</span>
      </div>

      <div className="flex gap-1">
        <Button
          variant={viewMode === "normal" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("normal")}
          className="flex items-center gap-1"
        >
          <BarChart3 className="h-3 w-3" />
          Normal
        </Button>

        <Button
          variant={viewMode === "fte-visualization" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("fte-visualization")}
          className="flex items-center gap-1"
        >
          <Droplets className="h-3 w-3" />
          FTE View
        </Button>
      </div>
    </div>
  );
}
