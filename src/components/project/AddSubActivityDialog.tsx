import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatISO, addDays } from "date-fns";
import { SubActivity } from "@/types/timeline-planner";

interface AddSubActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSubActivity: (subActivity: Omit<SubActivity, "id">) => void;
  windowStart: Date;
}

const ROLES = [
  { value: "SE", label: "Software Engineer" },
  { value: "SA", label: "Solution Analyst" },
  { value: "DE", label: "Data Engineer" },
  { value: "PM", label: "Project Manager" },
  { value: "QA", label: "Quality Assurance" },
];

export const AddSubActivityDialog = ({
  isOpen,
  onOpenChange,
  onAddSubActivity,
  windowStart,
}: AddSubActivityDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "SE",
    hours: 0,
    description: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const startDate =
      formData.startDate || formatISO(windowStart, { representation: "date" });
    const endDate =
      formData.endDate ||
      formatISO(addDays(windowStart, 1), { representation: "date" });

    onAddSubActivity({
      name: formData.name,
      role: formData.role,
      hours: Math.max(0, formData.hours),
      description: formData.description,
      startDate,
      endDate,
    });

    // Reset form
    setFormData({
      name: "",
      role: "SE",
      hours: 0,
      description: "",
      startDate: "",
      endDate: "",
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      role: "SE",
      hours: 0,
      description: "",
      startDate: "",
      endDate: "",
    });
    onOpenChange(false);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Sub-Activity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sub-name">Sub-Activity Name *</Label>
            <Input
              id="sub-name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Enter sub-activity name"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => updateFormData("role", value)}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hours">Estimated Hours</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              step="0.5"
              value={formData.hours}
              onChange={(e) => updateFormData("hours", Number(e.target.value))}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData("endDate", e.target.value)}
                min={formData.startDate}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              Add Sub-Activity
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
