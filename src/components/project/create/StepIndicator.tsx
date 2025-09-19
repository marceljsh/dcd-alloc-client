import { CheckCircle } from "lucide-react";

type Step = {
  id: number;
  name: string;
  description: string;
};

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  projectData: any;
  roleLevels: any[];
  estimationResults: any[];
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  projectData,
  roleLevels,
  estimationResults,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-12">
      {steps.map((step, index) => {
        const isClickable =
          (step.id === 1 ||
            (step.id === 2 && projectData) ||
            (step.id === 3 && projectData && roleLevels.length > 0) ||
            (step.id === 4 &&
              projectData &&
              roleLevels.length > 0 &&
              estimationResults.length > 0)) ??
          false;

        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-3 rounded-full px-4 py-2 transition-all duration-200
                ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isCompleted
                    ? "text-primary hover:bg-primary/10"
                    : isClickable
                    ? "text-muted-foreground hover:bg-muted/50"
                    : "cursor-not-allowed text-muted-foreground/50"
                }`}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    isActive
                      ? "border-primary-foreground bg-primary-foreground"
                      : "border-current"
                  }`}
                />
              )}
              <span className="text-base font-medium">{step.name}</span>
            </div>

            {index < steps.length - 1 && (
              <div className="mx-4 h-px flex-1 bg-muted" />
            )}
          </div>
        );
      })}
    </div>
  );
}
