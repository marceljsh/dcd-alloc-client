import { ProjectActivity, ProjectSubActivity } from "@/types/projects";
import { useState } from "react";

export const useActivities = (initialData: ProjectActivity[]) => {
  const [activities, setActivities] = useState<ProjectActivity[]>(initialData);

  const addActivity = (activity: ProjectActivity) => {
    setActivities((prev) => [...prev, activity]);
  };

  const addSubActivity = (subActivity: ProjectSubActivity) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === subActivity.parentId) {
          const updatedActivity = { ...activity };

          if (!updatedActivity.subActivities) {
            updatedActivity.subActivities = [];
            updatedActivity.startDate = subActivity.startDate;
            updatedActivity.endDate = subActivity.endDate;
          } else {
            const allSubs = [...updatedActivity.subActivities, subActivity];
            const earliestStart = allSubs.reduce((prev, curr) =>
              new Date(curr.startDate) < new Date(prev.startDate) ? curr : prev
            );
            const latestEnd = allSubs.reduce((prev, curr) =>
              new Date(curr.endDate) > new Date(prev.endDate) ? curr : prev
            );

            updatedActivity.startDate = earliestStart.startDate;
            updatedActivity.endDate = latestEnd.endDate;
          }

          updatedActivity.subActivities = [
            ...(updatedActivity.subActivities || []),
            subActivity,
          ];
          updatedActivity.duration =
            (updatedActivity.duration || 0) + subActivity.duration;

          return updatedActivity;
        }
        return activity;
      })
    );
  };

  const deleteActivity = (id: number) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const deleteSubActivity = (activityId: number, subActivityId: number) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === activityId && activity.subActivities) {
          const newSubActivities = activity.subActivities.filter(
            (sub) => sub.id !== subActivityId
          );
          const newDuration = newSubActivities.reduce(
            (total, sub) => total + sub.duration,
            0
          );

          return {
            ...activity,
            duration: newDuration,
            subActivities: newSubActivities,
          };
        }
        return activity;
      })
    );
  };

  const updateActivity = (activity: ProjectActivity) => {
    setActivities((prev) =>
      prev.map((prevActivity) => {
        if (prevActivity.id === activity.id) {
          const newActivity: ProjectActivity = {
            ...activity,
            subActivities: prevActivity.subActivities,
          };

          return newActivity;
        }

        return prevActivity;
      })
    );
  };

  const updateSubActivity = (activity: ProjectSubActivity) => {
    console.log(activity);
    setActivities((prev) =>
      prev.map((prevActivity) => {
        if (prevActivity.id === activity.parentId) {
          return {
            ...prevActivity,
            subActivities: prevActivity.subActivities?.map((prevSubActivity) =>
              prevSubActivity.id === activity.id ? activity : prevSubActivity
            ),
          };
        }

        return prevActivity;
      })
    );
  };

  return {
    activities,
    addActivity,
    addSubActivity,
    updateActivity,
    updateSubActivity,
    deleteActivity,
    deleteSubActivity,
  };
};
