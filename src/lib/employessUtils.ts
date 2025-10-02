import { EmployeeRow, EmployeeUtilization } from "@/types/employee";

export function mapToEmployeeUtilization(
  employees: EmployeeRow[]
): EmployeeUtilization[] {
  return employees
    .slice(0, 5)
    .map((emp) => {
      const status = emp.status === "Contract" ? "Contract" as const : "Permanent" as const;

      const contractStartDate = "contractStartDate" in emp ? emp.contractStartDate ?? "" : undefined;
      const contractEndDate = "contractEndDate" in emp ? emp.contractEndDate ?? "" : undefined;

      return {
        ...emp,
        status,
        utilization: Math.random() * 100,
        currentProjects: [] as string[],
        hoursThisWeek: 0,
        ...(status === "Contract" ? { contractStartDate, contractEndDate } : {}),
      } as EmployeeUtilization;
    });
}
