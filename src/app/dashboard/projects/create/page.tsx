"use client";
import { ProjectPlanner } from "@/components/project/create";
import { RoleLevel } from "@/components/ProjectManagement";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectTemplate, ResultCSV } from "@/lib/storage";
import { CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Estimator() {
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
    // Allow going to any previous step or current step
    if (step <= currentStep) {
      setCurrentStep(step);
      return;
    }

    // Allow going forward only if prerequisites are met
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

  const handleProjectSubmit = (data: ProjectData) => {
    setProjectData(data);
    setCurrentStep(2);
  };

  const handleRoleLevelSubmit = (data: RoleLevel[]) => {
    setRoleLevels(data);
    setCurrentStep(3);
  };

  const handleLoadProject = (
    loadedProjectData: ProjectData,
    loadedRoleLevels: RoleLevel[]
  ) => {
    setProjectData(loadedProjectData);
    setRoleLevels(loadedRoleLevels);
    setCurrentStep(3); // Go to results after loading
  };

  const handleLoadTemplate = (template: ProjectTemplate) => {
    const templateProjectData: ProjectData = {
      projectName: `New ${template.name}`,
      startDate: "",
      endDate: "",
      totalEffort: 400, // Default
      effortDistribution: template.effortDistribution,
      complexity: template.complexity,
      buffer: template.buffer,
    };
    setProjectData(templateProjectData);
    setRoleLevels(template.roleLevels);
    setCurrentStep(1); // Start from project input to fill in dates and effort
  };

  return (
    <div className="space-y-6 mx-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Project</h1>
          <p className="text-muted-foreground">
            Estimate team size and resource allocation
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer transition-all duration-200 ${
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : currentStep > step.id
                        ? "text-primary hover:bg-primary/10"
                        : step.id === 2 && projectData
                        ? "text-muted-foreground hover:bg-muted/50"
                        : step.id === 3 && projectData && roleLevels.length > 0
                        ? "text-muted-foreground hover:bg-muted/50"
                        : step.id === 4 &&
                          projectData &&
                          roleLevels.length > 0 &&
                          estimationResults.length > 0
                        ? "text-muted-foreground hover:bg-muted/50"
                        : "text-muted-foreground/50 cursor-not-allowed"
                    }`}
                    onClick={() => goToStep(step.id)}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          currentStep === step.id
                            ? "bg-primary-foreground border-primary-foreground"
                            : "border-current"
                        }`}
                      />
                    )}
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-muted mx-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="mb-12">
        {currentStep === 1 && (
          <ProjectPlanner
          //   // onSubmit={handleProjectSubmit}
          //   // initialData={projectData || undefined}
          />
          // <ProjectPlannerNew/>
        )}
        {currentStep === 2 && projectData && (
          <RoleLevelSelection
            projectData={projectData}
            onSubmit={handleRoleLevelSubmit}
            initialRoleLevels={roleLevels.length > 0 ? roleLevels : undefined}
          />
        )}
        {currentStep === 3 && projectData && roleLevels.length > 0 && (
          <EstimationResults
            projectData={projectData}
            roleLevels={roleLevels}
            onContinue={() => setCurrentStep(4)}
            onResultsCalculated={handleEstimationComplete}
          />
        )}
        {currentStep === 4 &&
          projectData &&
          roleLevels.length > 0 &&
          estimationResults.length > 0 && (
            <WhatIfSimulation
              projectData={projectData}
              initialRoleLevels={roleLevels}
              estimationResults={estimationResults}
            />
          )}
      </div>
    </div>
  );
}
