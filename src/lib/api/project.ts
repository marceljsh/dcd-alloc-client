export type ProjectRequest = {
  name: string;
  teamId: number;
  category: string;
  priority: string;
  budget: number;
  startDate: string;
  endDate: string;
  stages: string[];
};
