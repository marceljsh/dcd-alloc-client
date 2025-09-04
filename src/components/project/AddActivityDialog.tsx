import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity } from "@/types/timeline-planner";

interface AddActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Omit<Activity, "id" | "subActivities">) => void;
}

const ACTIVITY_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
];

export const AddActivityDialog = ({
  isOpen,
  onOpenChange,
  onAddActivity,
}: AddActivityDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    color: ACTIVITY_COLORS[0],
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    onAddActivity({
      name: formData.name,
      color: formData.color,
    });

    // Reset form
    setFormData({
      name: "",
      color: ACTIVITY_COLORS[0],
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      color: ACTIVITY_COLORS[0],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="activity-name">Activity Name</Label>
            <Input
              id="activity-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter activity name"
            />
          </div>

          <div>
            <Label>Choose Color</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {ACTIVITY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? "border-primary scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              Add Activity
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
