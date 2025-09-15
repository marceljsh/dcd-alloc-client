import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  ProjectActivity,
  ProjectSubActivity,
  EntityType,
  ModeType,
} from "@/types/projects";
import { generateDates } from "@/lib/dates";

interface ProjectDetails {
  name: string;
  budget: string;
  team: string;
  priority: string;
  category: string;
}

interface FormState {
  isOpen: boolean;
  type: EntityType;
  mode: ModeType;
  parentActivity: ProjectActivity | null;
  formDetails: ProjectActivity | ProjectSubActivity | null;
}

interface DateRange {
  start: Date;
  end: Date;
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
  deleteActivity: (id: number) => void;
  deleteSubActivity: (activityId: number, subActivityId: number) => void;

  // Actions for form
  openForm: (
    type: EntityType,
    mode: ModeType,
    parent?: ProjectActivity,
    details?: ProjectActivity | ProjectSubActivity
  ) => void;
  closeForm: () => void;
  setFormDetails: (
    details: ProjectActivity | ProjectSubActivity | null
  ) => void;

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
    return { start: now, end: now };
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

  return {
    start: new Date(Math.min(...allDates.map((d) => d.getTime()))),
    end: new Date(Math.max(...allDates.map((d) => d.getTime()))),
  };
};

const recalculateParentActivity = (
  activity: ProjectActivity
): ProjectActivity => {
  if (!activity.subActivities || activity.subActivities.length === 0) {
    return activity;
  }

  const earliestStart = activity.subActivities.reduce((prev, curr) =>
    new Date(curr.startDate) < new Date(prev.startDate) ? curr : prev
  );

  const latestEnd = activity.subActivities.reduce((prev, curr) =>
    new Date(curr.endDate) > new Date(prev.endDate) ? curr : prev
  );

  const totalDuration = activity.subActivities.reduce(
    (total, sub) => total + sub.duration,
    0
  );

  return {
    ...activity,
    startDate: earliestStart.startDate,
    endDate: latestEnd.endDate,
    duration: totalDuration,
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
    formDetails: null,
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

    openForm: (type, mode, parent, details) =>
      set((state) => {
        state.form.isOpen = true;
        state.form.type = type;
        state.form.mode = mode;
        state.form.parentActivity = parent || null;
        state.form.formDetails = details || null;
      }),

    closeForm: () =>
      set((state) => {
        state.form.isOpen = false;
        state.form.formDetails = null;
        state.form.parentActivity = null;
      }),

    setFormDetails: (details) =>
      set((state) => {
        state.form.formDetails = details;
      }),

    // UI actions
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

    // Computed getters
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

    // Utility actions
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
