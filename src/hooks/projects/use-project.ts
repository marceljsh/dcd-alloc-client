import { useProjectStore } from "@/store/project-store";
import {
  ProjectActivity,
  ProjectSubActivity,
  EntityType,
  ModeType,
  ActivityAction,
} from "@/types/projects";

export const useProject = () => {
  const store = useProjectStore();

  const handleAction = (action: ActivityAction) => {
    switch (action.type) {
      case "add-sub":
        return store.openForm("subactivity", "Add", action.parent);
      case "edit-activity":
        return store.openForm("activity", "Edit", undefined, action.activity);
      case "delete-activity":
        return store.deleteActivity(action.id);
      case "edit-sub":
        return store.openForm("subactivity", "Edit", action.parent, action.sub);
      case "delete-sub":
        return store.deleteSubActivity(action.activityId, action.subId);
    }
  };

  const handleFormSubmit = (
    entity: ProjectActivity | ProjectSubActivity,
    type: EntityType,
    mode: ModeType
  ) => {
    if (type === "activity") {
      if (mode === "Add") {
        store.addActivity(entity as ProjectActivity);
      } else {
        store.updateActivity(entity as ProjectActivity);
      }
    } else {
      if (mode === "Add") {
        store.addSubActivity(entity as ProjectSubActivity);
      } else {
        store.updateSubActivity(entity as ProjectSubActivity);
      }
    }
    store.closeForm();
  };

  const openAddActivity = () => {
    store.openForm("activity", "Add");
  };

  return {
    // State
    activities: store.activities,
    projectDetails: store.projectDetails,
    expandedItems: store.expandedItems,

    // Form state
    form: store.form,

    // Computed
    dates: store.getDates(),
    groupedDates: store.getGroupedDates(),

    // Actions
    handleAction,
    handleFormSubmit,
    openAddActivity,
    updateProjectDetails: store.updateProjectDetails,
    setExpandedItems: store.setExpandedItems,
    toggleExpanded: store.toggleExpanded,

    // Form actions
    closeForm: store.closeForm,
    setFormDetails: store.setFormDetails,

    // Utility
    initializeProject: store.initializeProject,
    resetProject: store.resetProject,
  };
};

export const useProjectDetails = () => {
  const { projectDetails, updateProjectDetails } = useProjectStore();

  return {
    projectDetails,
    updateProjectName: (name: string) => updateProjectDetails({ name }),
    updateBudget: (budget: string) => updateProjectDetails({ budget }),
    updateTeam: (team: string) => updateProjectDetails({ team }),
    updatePriority: (priority: string) => updateProjectDetails({ priority }),
    updateCategory: (category: string) => updateProjectDetails({ category }),
    updateProjectDetails,
  };
};

export const useProjectForm = () => {
  const { form, closeForm, setFormDetails } = useProjectStore();

  return {
    ...form,
    closeForm,
    setFormDetails,
  };
};

export const useProjectActivities = () => {
  const { activities, expandedItems, setExpandedItems } = useProjectStore();

  return {
    activities,
    expandedItems,
    setExpandedItems,
  };
};

export const useProjectDates = () => {
  const { getDates, getGroupedDates } = useProjectStore();

  return {
    dates: getDates(),
    groupedDates: getGroupedDates(),
  };
};
