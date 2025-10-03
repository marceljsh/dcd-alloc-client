"use client";
import { useEffect } from "react";
import { ProjectCreatePage } from "@/components/project/create/ProjectCreatePage";
import { StepIndicator } from "@/components/project/create/StepIndicator";
import { ProjectResults } from "@/components/project/results/ProjectResults";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from "@/hooks/projects/use-project";
import { useSidebar } from "@/components/ui/sidebar";

import { useState, useCallback } from "react";
import ProjectAssignment from "@/components/project/assignment/ProjectAssignment";
import { TeamMember } from "@/types/projects";
import axios from "axios";
import { useAlert } from "@/hooks/use-alert";
import AlertContainer from "@/components/project/AlertContainer";

// Types for backend response
interface BackendSubActivity {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  workload: number;
  fte: number;
  role: string;
  minimum_level: string;
}

interface BackendGroupComposition {
  name: string;
  role: string;
  level: string[] | string;
  total_workload: number;
  total_fte: number;
  total_working_days: number;
  utilization: number;
  sub_activities: BackendSubActivity[];
}

interface BackendResponse {
  group_composition: BackendGroupComposition[];
  feedback: unknown[];
  project_duration_days: number;
}

export default function ProjectCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [teamComposition, setTeamComposition] = useState<TeamMember[]>([]);
  const [projectDurationDays, setProjectDurationDays] = useState(30);

  const { alerts, success, error, removeAlert } = useAlert();

  const { activities, projectDetails } = useProject();
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const steps = [
    { id: 1, name: "Project Input", description: "Basic project information" },
    { id: 2, name: "Results", description: "Resource estimation" },
    { id: 3, name: "Project Assignment", description: "Team assignment" },
  ];

  const goToStep = useCallback(
    async (step: number) => {
      if (step <= currentStep) {
        setCurrentStep(step);
        return;
      }

      if (step === 2) {
        if (activities.length === 0) {
          error("No activities found, cannot proceed to step 2");
          return;
        }

        if (!projectDetails.name.trim()) {
          error("Project name is required");
          return;
        }

        const transformedActivities = activities.map((activity) => ({
          id: activity.id,
          name: activity.name,
          start_date: activity.startDate,
          end_date: activity.endDate,
          sub_activities:
            activity.subActivities?.map((subActivity) => ({
              id: subActivity.id,
              name: subActivity.name,
              start_date: subActivity.startDate,
              end_date: subActivity.endDate,
              workload: subActivity.workload,
              fte: subActivity.fte,
              minimum_level:
                subActivity.minimumLevel === "junior"
                  ? "Junior"
                  : subActivity.minimumLevel === "middle"
                  ? "Middle"
                  : "Senior",
              role:
                subActivity.role === "SA"
                  ? "Solution Analyst"
                  : subActivity.role === "SE"
                  ? "Software Engineer"
                  : "Data Engineer",
            })) || [],
        }));

        try {
          const composition = await axios.post(
            "http://localhost:8000/optimize",
            {
              activities: transformedActivities,
            }
          );

          setProjectDurationDays(composition.data.project_duration_days || 30);

          // Transform backend response to frontend format
          const backendData = composition.data as BackendResponse;
          if (
            backendData &&
            backendData.group_composition &&
            Array.isArray(backendData.group_composition)
          ) {
            const transformedTeamComposition =
              backendData.group_composition.map(
                (member: BackendGroupComposition, index: number) => ({
                  name: member.name,
                  role: member.role,
                  level: Array.isArray(member.level)
                    ? member.level
                    : [member.level], // Convert single level to array
                  workload_hours: member.total_workload,
                  total_working_days: Math.ceil(member.total_workload / 8), // Assuming 8 hours per day
                  utilization_rate: `${member.utilization}%`,
                  assignee_id: `${member.role.toLowerCase()}-${index + 1}`, // Generate unique ID
                  assigned_activities:
                    member.sub_activities?.map((activity) => ({
                      id: activity.id,
                      name: activity.name,
                      start_date: activity.start_date,
                      end_date: activity.end_date,
                      workload: activity.workload,
                      fte: activity.fte,
                      role: activity.role,
                      minimum_level: activity.minimum_level,
                    })) || [],
                })
              );

            setTeamComposition(transformedTeamComposition);
            success("Team composition generated successfully!");
          } else {
            console.warn("Invalid response format:", composition.data);
            setTeamComposition([]);
          }
        } catch (err) {
          console.error("Error calling optimize API:", err);
          error("Failed to generate team composition. Please try again.");
          setTeamComposition([]);
        }

        // TODO: Save project data to backend using axios/TanStack Query
        // const projectPayload = {
        //   projectDetails,
        //   activities,
        // };
        // await saveProjectDraft(projectPayload);

        setCurrentStep(step);
      } else if (step === 3) {
        // TODO: Generate estimation results using backend API
        // const estimationPayload = {
        //   activities,
        //   projectDetails,
        // };
        // const results = await generateEstimation(estimationPayload);
        // setEstimationResults(results);

        setCurrentStep(step);
      } else if (step === 4) {
        // Final validation before completing
        if (activities.length === 0) {
          error("Cannot complete project without activities");
          return;
        }

        // TODO: Save final project using axios
        // await saveProject({
        //   projectDetails,
        //   activities,
        //   assignments: assignmentData
        // });

        setCurrentStep(step);
      }
    },
    [currentStep, activities, projectDetails, error, success]
  );

  return (
    <div className="space-y-6 mx-10">
      <AlertContainer
        alerts={alerts}
        onRemove={removeAlert}
        position="top-right"
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Project</h1>
          <p className="text-muted-foreground">
            Estimate team size and resource allocation
          </p>
        </div>
      </div>

      {/* Steps (progress bar) tetap sama */}
      <div className="mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              onStepClick={goToStep}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        {currentStep === 1 && (
          <div>
            <ProjectCreatePage
              onNext={() => {
                goToStep(2);
              }}
            />
          </div>
        )}

        {currentStep === 2 && (
          <ProjectResults
            onUpdateTeamComposition={setTeamComposition}
            teamComposition={teamComposition}
            activities={activities.map((activity, index) => ({
              id: index + 1,
              name: activity.name,
              date_range: `${new Date(activity.startDate).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              )}-${new Date(activity.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`,
            }))}
            onNext={() => goToStep(3)}
            onPrevious={() => goToStep(1)}
            projectDurationDays={projectDurationDays}
          />
        )}

        {currentStep === 3 && (
          <ProjectAssignment
            onPrevious={() => goToStep(2)}
            onNext={() => goToStep(4)}
            teamComposition={teamComposition}
          />
        )}
      </div>
    </div>
  );
}
