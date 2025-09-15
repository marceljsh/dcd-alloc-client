"use client";
import { ProjectPlanner } from "@/components/project/create/add-activity";
import { StepIndicator } from "@/components/project/create/step-indicator";
import { RoleLevel } from "@/components/ProjectManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ResultCSV } from "@/lib/storage";
import { projectCategories, projectPriorities, teams } from "@/types/common";
import { ProjectData } from "@/types/projects";
import { useState } from "react";

export default function ProjectCreate() {
  const [activeTab, setActiveTab] = useState("Project Input");

  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [roleLevels, setRoleLevels] = useState<RoleLevel[]>([]);
  const [estimationResults, setEstimationResults] = useState<ResultCSV[]>([]);

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

    if (step === 2 && projectData) {
      setCurrentStep(step);
    } else if (step === 3 && projectData && roleLevels.length > 0) {
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
            <ProjectPlanner />
          </div>
        )}
      </div>
    </div>
  );
}
