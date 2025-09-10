export interface ProjectActivity {
  id: number;
  activity: string;
  startDate: string;
  endDate: string;
  duration: number;
  fte: number;
  subActivities?: ProjectSubActivity[];
}

export interface ProjectSubActivity {
  id: number;
  parentId: number;
  activity: string;
  startDate: string;
  endDate: string;
  duration: number;
  fte: number;
}

export type SheetType = "activity" | "subactivity";
