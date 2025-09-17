import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Estimator from "../page";

jest.mock("@/components/project/create", () => ({
  ProjectPlanner: ({ onSubmit }: { onSubmit?: (data: any) => void }) => (
    <div data-testid="project-planner">
      <button
        onClick={() =>
          onSubmit?.({
            projectName: "Test Project",
            startDate: "2025-01-01",
            endDate: "2025-06-01",
            totalEffort: 400,
            effortDistribution: {},
            complexity: "Medium",
            buffer: 10,
          })
        }
      >
        Submit Project
      </button>
    </div>
  ),
}));

jest.mock("@/components/ProjectManagement", () => ({
  RoleLevel: jest.fn(),
  RoleLevelSelection: ({
    onSubmit,
  }: {
    onSubmit: (data: any) => void;
  }) => (
    <div data-testid="role-level-selection">
      <button
        onClick={() =>
          onSubmit([
            { role: "Software Engineer", level: "Junior", count: 2 },
            { role: "System Analyst", level: "Senior", count: 1 },
          ])
        }
      >
        Submit Role Levels
      </button>
    </div>
  ),
}));

jest.mock("@/lib/storage", () => ({
  ProjectTemplate: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  CheckCircle: () => <svg data-testid="check-icon" />,
}));

describe("Estimator Page", () => {
  it("renders correctly and shows step 1 initially", async () => {
    render(<Estimator />);
    expect(screen.getByText("Create Project")).toBeInTheDocument();
    expect(screen.getByText("Project Input")).toBeInTheDocument();
    expect(screen.getByTestId("project-planner")).toBeInTheDocument();
  });

  it("goes to step 2 after submitting project data", () => {
    render(<Estimator />);
    const submitButton = screen.getByText("Submit Project");
    fireEvent.click(submitButton);
    expect(screen.getByTestId("role-level-selection")).toBeInTheDocument();
  });

  it("goes to step 3 after submitting role levels", async () => {
    const { debug } = render(<Estimator />);
    fireEvent.click(screen.getByText("Submit Project"));
    debug();
    const submitRoleButton = await screen.findByText("Submit Role Levels");
    fireEvent.click(submitRoleButton);
    expect(screen.getByText("Results")).toBeInTheDocument();
  });

  it("does not jump to step 3 if projectData is not set", async () => {
    render(<Estimator />);
    const step3 = screen.getByText("Results");
    fireEvent.click(step3); 
    expect(screen.getByTestId("project-planner")).toBeInTheDocument();
  });

  it("allows going back to previous step", async () => {
    render(<Estimator />);
    fireEvent.click(screen.getByText("Submit Project"));
    const step1 = screen.getByText("Project Input");
    fireEvent.click(step1);
    expect(screen.getByTestId("project-planner")).toBeInTheDocument();
  });
});
