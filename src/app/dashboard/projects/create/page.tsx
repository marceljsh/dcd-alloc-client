"use client";
import { ProjectPlanner } from "@/components/project/create/add-activity";
import { StepIndicator } from "@/components/project/create/step-indicator";
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
import { useState } from "react";

export default function ProjectCreate() {
  const [activeTab, setActiveTab] = useState("Project Input");
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // ⬅️ Tambahin state baru

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

  const teams = [
    "Frontend Team",
    "Backend Team",
    "Design Team",
    "QA Team",
    "DevOps Team",
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

  const priorities = ["Low", "Medium", "High", "Critical"];

  const categories = ["Small", "Medium", "Big"]; // ⬅️ Tambahin list category

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
            <Card className="mb-6 py-6">
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Row 1: Project Name, Team, Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      placeholder="Enter project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="team">Team</Label>
                    <Select
                      value={selectedTeam}
                      onValueChange={setSelectedTeam}
                    >
                      <SelectTrigger className="w-full">
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
                </div>

                {/* Row 2: Budget & Category */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="space-y-2 md:col-span-4">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      placeholder="Enter budget amount"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={selectedPriority}
                      onValueChange={setSelectedPriority}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c.toLowerCase()}>
                            {c}
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
      </div>
    </div>
  );
}
