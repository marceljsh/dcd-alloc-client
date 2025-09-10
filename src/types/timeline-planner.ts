export type SubActivity = {
  id: number;
  name: string;
  role: string;
  hours: number;
  description?: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
};

export type Activity = {
  id: number;
  name: string;
  color: string;
  subActivities: SubActivity[];
};

export type ViewType = "Week" | "Month";

export interface DragState {
  activityId: number;
  subId: number;
  startX: number;
  origLeftPercent: number;
  containerWidth: number;
  daysInWindow: number;
  origStartDate: string;
  origEndDate: string;
  dragType: "move" | "resizeStart" | "resizeEnd";
  containerStart: string;
  hasMoved: boolean;
  rafId?: number; // Add this
}
