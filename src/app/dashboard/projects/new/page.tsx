"use client";
import { useEffect } from "react";
import { ProjectCreatePage } from "@/components/project/create/ProjectCreatePage";
import { StepIndicator } from "@/components/project/create/StepIndicator";
import SettingRole from "@/components/project/role/SettingRole";
import { ProjectResults } from "@/components/project/results/ProjectResults";
import { RoleLevel } from "@/components/ProjectManagement";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from "@/hooks/projects/use-project";
import { useSidebar } from "@/components/ui/sidebar";

import { ResultCSV } from "@/lib/storage";
import { ProjectData } from "@/types/projects";
import { useState } from "react";

export default function ProjectCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [roleLevels, setRoleLevels] = useState<RoleLevel[]>([]);
  const [estimationResults, setEstimationResults] = useState<ResultCSV[]>([]);
  const { activities } = useProject();
  const { setOpen } = useSidebar();

  // Close sidebar when component mounts
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const steps = [
    { id: 1, name: "Project Input", description: "Basic project information" },
    { id: 2, name: "Role & Level", description: "Team configuration" },
    { id: 3, name: "Results", description: "Resource estimation" },
    { id: 4, name: "Simulation", description: "What-if analysis" },
  ];

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      return;
    }

    if (step === 2) {
      setCurrentStep(step);
    } else if (step === 3) {
      setCurrentStep(step);
    } else if (
      step === 4 &&
      projectData &&
      roleLevels.length > 0 &&
      estimationResults.length > 0
    ) {
      setCurrentStep(step);
    }
  };

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
          <SettingRole
            onNext={() => goToStep(3)}
            onPrevious={() => goToStep(1)}
          />
        )}

        {currentStep === 3 && (
          <ProjectResults
            onNext={() => goToStep(4)}
            onPrevious={() => goToStep(2)}
          />
        )}
      </div>
    </div>
  );
}
