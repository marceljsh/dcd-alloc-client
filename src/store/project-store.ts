import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  ProjectActivity,
  ProjectSubActivity,
  EntityType,
  ModeType,
} from "@/types/projects";
import { generateDates } from "@/lib/dates";

interface FormState {
  isOpen: boolean;
  type: EntityType;
  mode: ModeType;
  parentActivity: ProjectActivity | null;
  subActivityDetails: ProjectSubActivity | null;
  activityDetails: ProjectActivity | null;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface ProjectDetails {
  name: string;
  budget: string;
  team: string;
  priority: string;
  category: string;
}

interface ProjectState {
  projectDetails: ProjectDetails;
  activities: ProjectActivity[];
  form: FormState;

  expandedItems: string[];

  dateRange: DateRange;

  // Actions for project details
  updateProjectDetails: (details: Partial<ProjectDetails>) => void;

  // Actions for activities
  addActivity: (activity: ProjectActivity) => void;
  addSubActivity: (subActivity: ProjectSubActivity) => void;
  updateActivity: (activity: ProjectActivity) => void;
  updateSubActivity: (subActivity: ProjectSubActivity) => void;
  deleteActivity: (id: string) => void;
  deleteSubActivity: (activityId: string, subActivityId: string) => void;

  // Actions for form
  openForm: (
    type: EntityType,
    mode: ModeType,
    parent?: ProjectActivity,
    activity?: ProjectActivity,
    subActivity?: ProjectSubActivity
  ) => void;
  closeForm: () => void;

  setActivityDetails: (details: ProjectActivity | null) => void;
  setSubActivityDetails: (details: ProjectSubActivity | null) => void;

  // Actions for UI
  setExpandedItems: (items: string[]) => void;
  toggleExpanded: (id: string) => void;

  // Computed getters
  getDates: () => Date[];
  getGroupedDates: () => Record<string, Date[]>;

  // Utility actions
  initializeProject: (initialData: ProjectActivity[]) => void;
  resetProject: () => void;
}

const calculateDateRange = (activities: ProjectActivity[]): DateRange => {
  if (activities.length === 0) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 15);
    return { start: now, end };
  }

  const allDates = activities.flatMap((activity) => {
    const dates = [new Date(activity.startDate), new Date(activity.endDate)];
    if (activity.subActivities) {
      dates.push(
        ...activity.subActivities.flatMap((sub) => [
          new Date(sub.startDate),
          new Date(sub.endDate),
        ])
      );
    }
    return dates;
  });

  const start = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const end = new Date(Math.max(...allDates.map((d) => d.getTime())));

  const diffDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 30) {
    const newEnd = new Date(start);
    newEnd.setDate(start.getDate() + 30);
    return { start, end: newEnd };
  }

  return { start, end };
};

const recalculateParentActivity = (
  activity: ProjectActivity
): ProjectActivity => {
  if (!activity.subActivities || activity.subActivities.length === 0) {
    return activity;
  }

  const totalWorkload = activity.subActivities.reduce(
    (total, sub) => total + sub.workload,
    0
  );

  return {
    ...activity,
    workload: totalWorkload,
  };
};

const initialState = {
  projectDetails: {
    name: "",
    budget: "",
    team: "",
    priority: "",
    category: "",
  },
  activities: [],
  form: {
    isOpen: false,
    type: "activity" as EntityType,
    mode: "Add" as ModeType,
    parentActivity: null,
    activityDetails: null,
    subActivityDetails: null,
  },
  expandedItems: [],
  dateRange: {
    start: new Date(),
    end: new Date(),
  },
};

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    ...initialState,

    updateProjectDetails: (details) =>
      set((state) => {
        Object.assign(state.projectDetails, details);
      }),

    addActivity: (activity) =>
      set((state) => {
        state.activities.push(activity);
        state.dateRange = calculateDateRange(state.activities);
      }),

    addSubActivity: (subActivity) =>
      set((state) => {
        const parentIndex = state.activities.findIndex(
          (activity) => activity.id === subActivity.parentId
        );

        if (parentIndex !== -1) {
          const parent = state.activities[parentIndex];

          if (!parent.subActivities) {
            parent.subActivities = [];
          }

          parent.subActivities.push(subActivity);
          state.activities[parentIndex] = recalculateParentActivity(parent);
          state.dateRange = calculateDateRange(state.activities);

          const activityId = `activity-${subActivity.parentId}`;
          if (!state.expandedItems.includes(activityId)) {
            state.expandedItems.push(activityId);
          }
        }
      }),

    updateActivity: (activity) =>
      set((state) => {
        const index = state.activities.findIndex((a) => a.id === activity.id);
        if (index !== -1) {
          state.activities[index] = {
            ...activity,
            subActivities: state.activities[index].subActivities,
          };
          state.dateRange = calculateDateRange(state.activities);
        }
      }),

    updateSubActivity: (subActivity) =>
      set((state) => {
        const parentIndex = state.activities.findIndex(
          (activity) => activity.id === subActivity.parentId
        );

        if (parentIndex !== -1) {
          const parent = state.activities[parentIndex];
          if (parent.subActivities) {
            const subIndex = parent.subActivities.findIndex(
              (sub) => sub.id === subActivity.id
            );
            if (subIndex !== -1) {
              parent.subActivities[subIndex] = subActivity;
              state.activities[parentIndex] = recalculateParentActivity(parent);
              state.dateRange = calculateDateRange(state.activities);
            }
          }
        }
      }),

    deleteActivity: (id) =>
      set((state) => {
        state.activities = state.activities.filter(
          (activity) => activity.id !== id
        );
        state.dateRange = calculateDateRange(state.activities);
      }),

    deleteSubActivity: (activityId, subActivityId) =>
      set((state) => {
        const parentIndex = state.activities.findIndex(
          (activity) => activity.id === activityId
        );

        if (parentIndex !== -1) {
          const parent = state.activities[parentIndex];
          if (parent.subActivities) {
            parent.subActivities = parent.subActivities.filter(
              (sub) => sub.id !== subActivityId
            );
            state.activities[parentIndex] = recalculateParentActivity(parent);
            state.dateRange = calculateDateRange(state.activities);
          }
        }
      }),

    openForm: (type, mode, parent, activity, subActivity) =>
      set((state) => {
        state.form.isOpen = true;
        state.form.type = type;
        state.form.mode = mode;
        state.form.parentActivity = parent || null;
        state.form.activityDetails = activity || null;
        state.form.subActivityDetails = subActivity || null;
      }),

    closeForm: () =>
      set((state) => {
        state.form.isOpen = false;
        state.form.activityDetails = null;
        state.form.subActivityDetails = null;
        state.form.parentActivity = null;
      }),

    setActivityDetails: (details) =>
      set((state) => {
        state.form.activityDetails = details;
      }),

    setSubActivityDetails: (details) =>
      set((state) => {
        state.form.subActivityDetails = details;
      }),

    setExpandedItems: (items) =>
      set((state) => {
        state.expandedItems = items;
      }),

    toggleExpanded: (id) =>
      set((state) => {
        const index = state.expandedItems.indexOf(id);
        if (index > -1) {
          state.expandedItems.splice(index, 1);
        } else {
          state.expandedItems.push(id);
        }
      }),

    getDates: () => {
      const { dateRange } = get();
      return generateDates(dateRange.start, dateRange.end);
    },

    getGroupedDates: () => {
      const dates = get().getDates();
      const grouped: Record<string, Date[]> = {};

      dates.forEach((date) => {
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }
        grouped[monthYear].push(date);
      });

      return grouped;
    },

    initializeProject: (initialData) =>
      set((state) => {
        state.activities = initialData;
        state.dateRange = calculateDateRange(initialData);
      }),

    resetProject: () =>
      set((state) => {
        Object.assign(state, initialState);
      }),
  }))
);
