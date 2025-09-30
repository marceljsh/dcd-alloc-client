import { ProjectActivity } from "@/types/projects";

export const initialProjectData: ProjectActivity[] = [
  {
    id: "a3f5e7f1-4d23-4a8e-bf5e-8c9d6a1b7f12",
    name: "Design",
    startDate: "2025-09-01",
    endDate: "2025-09-10",
    workload: 48,
    role: "SA",
    subActivities: [
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        name: "Wireframing",
        startDate: "2025-09-01",
        endDate: "2025-09-02",
        workload: 16,
        parentId: "a3f5e7f1-4d23-4a8e-bf5e-8c9d6a1b7f12",
        fte: 1,
        minimumLevel: "junior",
      },
      {
        id: "9a9c7b1e-1d6e-4d5f-98b7-3c8d4b3c1d77",
        name: "Prototyping",
        startDate: "2025-09-03",
        endDate: "2025-09-05",
        workload: 32,
        parentId: "a3f5e7f1-4d23-4a8e-bf5e-8c9d6a1b7f12",
        fte: 1,
        minimumLevel: "junior",
      },
    ],
  },
  {
    id: "d5b7e5f4-9c3b-4b8a-9f5e-1c2d7b8a5f62",
    name: "Development",
    startDate: "2025-09-06",
    endDate: "2025-09-10",
    workload: 0,
    role: "SE",
  },
  {
    id: "e1a7c5d3-6f4b-4c2a-8d5e-3f7b9a1e2d64",
    name: "Testing",
    startDate: "2025-09-21",
    endDate: "2025-09-24",
    workload: 0,
    role: "SA",
  },
  {
    id: "b8d2f7a9-5e6c-4c3d-9a2f-7c1e5b4a6d38",
    name: "Deployment",
    startDate: "2025-09-28",
    endDate: "2025-09-30",
    workload: 0,
    role: "SE",
  },
];
