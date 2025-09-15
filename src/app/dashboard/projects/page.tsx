"use client";

import { useState } from "react";

import { ProjectPlanner } from "@/components/project/create/add-activity";
import { RoleLevel } from "@/components/ProjectManagement";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ResultCSV } from "@/lib/storage";
import { ProjectData } from "@/types/projects";
import { StepIndicator } from "@/components/project/create/step-indicator";

export default function ProjectCreate() {
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

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

  const teams = [
    "Frontend Team",
    "Backend Team",
    "Design Team",
    "QA Team",
    "DevOps Team",
  ];

  const priorities = ["Low", "Medium", "High", "Critical"];

  return (
    <div className="mx-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Project</h1>
          <p className="text-muted-foreground">
            Estimate team size and resource allocation
          </p>
        </div>
      </div>

      {/* Steps */}
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

      {/* Main Content */}
      <div className="mb-12">
        {currentStep === 1 && (
          <div>
            <Card className="mb-6 py-6">
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Name & Budget */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      placeholder="Enter budget amount"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                </div>

                {/* Team & Priority */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="team">Team</Label>
                    <Select
                      value={selectedTeam}
                      onValueChange={setSelectedTeam}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team} value={team}>
                            {team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={selectedPriority}
                      onValueChange={setSelectedPriority}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full
                                  ${
                                    priority === "Critical"
                                      ? "bg-red-500"
                                      : priority === "High"
                                      ? "bg-orange-500"
                                      : priority === "Medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }`}
                              />
                              {priority}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ProjectPlanner />
          </div>
        )}

        {currentStep === 2 && projectData && <div />}
        {currentStep === 3 && projectData && roleLevels.length > 0 && <div />}
        {currentStep === 4 &&
          projectData &&
          roleLevels.length > 0 &&
          estimationResults.length > 0 && <div />}
      </div>
    </div>
  );
}
