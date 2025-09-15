import { create } from "zustand";
import { ProjectActivity } from "@/types/projects";

export type ProjectFormState = {
  name: string;
  team: string;
  budget: string;
  priority: string;
  category: string;
  activities: ProjectActivity[];
  roleLevels: any[]; // We'll type this properly later
  estimationResults: any[]; // We'll type this properly later
};

type ProjectStore = {
  currentStep: number;
  form: ProjectFormState;
  setStep: (step: number) => void;
  updateForm: (updates: Partial<ProjectFormState>) => void;
  updateActivities: (activities: ProjectActivity[]) => void;
  updateRoleLevels: (levels: any[]) => void;
  updateEstimationResults: (results: any[]) => void;
  reset: () => void;
};

const initialState: ProjectFormState = {
  name: "",
  team: "",
  budget: "",
  priority: "",
  category: "",
  activities: [],
  roleLevels: [],
  estimationResults: [],
};

export const useProjectStore = create<ProjectStore>((set) => ({
  currentStep: 1,
  form: initialState,
  setStep: (step) => set({ currentStep: step }),
  updateForm: (updates) =>
    set((state) => ({
      form: { ...state.form, ...updates },
    })),
  updateActivities: (activities) =>
    set((state) => ({
      form: { ...state.form, activities },
    })),
  updateRoleLevels: (roleLevels) =>
    set((state) => ({
      form: { ...state.form, roleLevels },
    })),
  updateEstimationResults: (estimationResults) =>
    set((state) => ({
      form: { ...state.form, estimationResults },
    })),
  reset: () => set({ currentStep: 1, form: initialState }),
}));
