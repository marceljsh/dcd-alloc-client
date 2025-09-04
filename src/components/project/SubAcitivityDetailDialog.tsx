import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User, FileText } from "lucide-react";
import { SubActivity } from "@/types/timeline-planner";
import { toDisplayDate } from "@/lib/utils";

interface SubActivityDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subActivity: SubActivity | null;
}

const ROLE_LABELS: Record<string, string> = {
  SE: "Software Engineer",
  SA: "Solution Analyst",
  DE: "Data Engineer",
  PM: "Project Manager",
  QA: "Quality Assurance",
};

const ROLE_COLORS: Record<string, string> = {
  SE: "bg-blue-100 text-blue-800",
  SA: "bg-red-100 text-red-800",
  DE: "bg-green-100 text-green-800",
  PM: "bg-purple-100 text-purple-800",
  QA: "bg-orange-100 text-orange-800",
};

export const SubActivityDetailDialog = ({
  isOpen,
  onOpenChange,
  subActivity,
}: SubActivityDetailDialogProps) => {
  if (!subActivity) return null;

  const roleLabel = ROLE_LABELS[subActivity.role] || subActivity.role;
  const roleColor =
    ROLE_COLORS[subActivity.role] || "bg-gray-100 text-gray-800";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sub-Activity Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {subActivity.name}
            </h3>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary" className={roleColor}>
              {roleLabel}
            </Badge>
          </div>

          {/* Hours */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">{subActivity.hours}</span>
              {subActivity.hours === 1 ? " hour" : " hours"} estimated
            </span>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Timeline</span>
            </div>
            <div className="ml-6 space-y-1">
              <div className="text-sm">
                <span className="text-muted-foreground">Start: </span>
                <span className="font-medium">
                  {toDisplayDate(subActivity.startDate)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">End: </span>
                <span className="font-medium">
                  {toDisplayDate(subActivity.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {subActivity.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Description</span>
              </div>
              <div className="ml-6 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {subActivity.description}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
