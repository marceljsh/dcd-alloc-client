import { Role } from "@/types/projects";

type SalaryData = {
  [key in "Software Engineer" | "Solution Analyst" | "Data Engineer"]: {
    "Junior": number;
    "Middle": number;
    "Senior": number;
  };
};

export const salaryData: SalaryData = {
  "Solution Analyst": {
    "Junior": 6000000,
    "Middle": 9000000,
    "Senior": 12000000,
  },
  "Software Engineer": {
    "Junior": 9000000,
    "Middle": 10000000,
    "Senior": 15000000,
  },
  "Data Engineer": {
    "Junior": 8000000,
    "Middle": 11000000,
    "Senior": 14000000,
  },
};

export const getSalary = (role: Role, level: string): number => {
  const roleData = salaryData[role];
  if (!roleData) return 0;
  return roleData[level as keyof typeof roleData] || 0;
};
