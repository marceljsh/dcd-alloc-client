"use client";
import { useEffect } from "react";
import { ProjectCreatePage } from "@/components/project/create/ProjectCreatePage";
import { StepIndicator } from "@/components/project/create/StepIndicator";
import { ProjectResults } from "@/components/project/results/ProjectResults";
import { RoleLevel } from "@/components/ProjectManagement";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from "@/hooks/projects/use-project";
import { useSidebar } from "@/components/ui/sidebar";

import { ResultCSV } from "@/lib/storage";
import { ProjectData } from "@/types/projects";
import { useState, useCallback } from "react";
import ProjectAssignment from "@/components/project/assignment/ProjectAssignment";

export default function ProjectCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [roleLevels, setRoleLevels] = useState<RoleLevel[]>([]);
  const [estimationResults, setEstimationResults] = useState<ResultCSV[]>([]);

  const { activities, projectDetails } = useProject();
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  // Debug log to track activities data
  useEffect(() => {
    console.log("Current step:", currentStep);
    console.log("Activities data:", activities);
    console.log("Project details:", projectDetails);
  }, [currentStep, activities, projectDetails]);

  const steps = [
    { id: 1, name: "Project Input", description: "Basic project information" },
    { id: 2, name: "Results", description: "Resource estimation" },
    { id: 3, name: "Project Assignment", description: "Team assignment" },
  ];

  const goToStep = useCallback(
    async (step: number) => {
      console.log(`Attempting to go to step ${step}`);

      if (step <= currentStep) {
        setCurrentStep(step);
        return;
      }

      if (step === 2) {
        if (activities.length === 0) {
          console.warn("No activities found, cannot proceed to step 2");
          return;
        }

        if (!projectDetails.name.trim()) {
          console.warn("Project name is required");
          return;
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
          console.warn("Cannot complete project without activities");
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
    [currentStep, activities, projectDetails],
  );

  return (
    <div className="space-y-6 mx-10">
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
              projectData={projectData}
              roleLevels={roleLevels}
              estimationResults={estimationResults}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        {currentStep === 1 && (
          <div>
            <ProjectCreatePage onNext={() => goToStep(2)} />
          </div>
        )}

        {currentStep === 2 && (
          <ProjectResults
            teamComposition={[]} // TODO: Generate from activities data
            activities={activities.map((activity) => ({
              id: activity.id,
              name: activity.activity,
              date_range: `${activity.startDate} - ${activity.endDate}`,
            }))}
            onNext={() => goToStep(3)}
            onPrevious={() => goToStep(1)}
          />
        )}

        {currentStep === 3 && (
          <ProjectAssignment
            onPrevious={() => goToStep(2)}
            onNext={() => goToStep(4)}
          />
        )}
      </div>
    </div>
  );
}
