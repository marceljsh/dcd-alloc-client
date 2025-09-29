import { EmployeeUtilization } from "@/types/employee";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRange } from "@/types/common";
import {
  backgroundByRole,
  generateWeeklyUtilization,
  getUtilizationCellColor,
} from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/strings";

interface EmployeeByTeamRowsProps {
  team: string;
  members: EmployeeUtilization[];
  dateRanges: DateRange[];
}

function EmployeeByTeamRows({
  team,
  members,
  dateRanges,
}: EmployeeByTeamRowsProps) {
  const utilizationAvg =
    members.reduce((sum, member) => sum + member.utilization, 0) /
    members.length;

  return (
    <>
      {/* Team Header Row */}
      <TableRow className="bg-muted/50 hover:bg-muted/70">
        <TableCell className="font-semibold text-sm">{team}</TableCell>
        <TableCell className="text-center font-medium"></TableCell>
        <TableCell className="text-center font-medium"></TableCell>
        {/* <TableCell className="text-center font-medium">{utilizationAvg.toFixed(1)}%</TableCell> */}
        <TableCell className="text-center font-medium"></TableCell>
        {dateRanges.map((_, idx) => {
          const teamWeeklyTotal = members.reduce((acc, emp) => {
            const weeklyData = generateWeeklyUtilization(emp, dateRanges);
            return acc + weeklyData[idx];
          }, 0);
          const teamWeeklyAvg = teamWeeklyTotal / members.length;

          return (
            // <TableCell
            //   key={idx}
            //   className={`text-center font-medium ${getUtilizationCellColor(teamWeeklyAvg)}`}
            // >
            //   {teamWeeklyAvg.toFixed(1)}%
            // </TableCell>
            <TableCell
              key={idx}
              className="text-center font-medium"
            ></TableCell>
          );
        })}
      </TableRow>

      {/* Individual Employee Rows */}
      {members.map((employee) => {
        const weeklyUtilization = generateWeeklyUtilization(
          employee,
          dateRanges,
        );
        const totalCapacity = 240; // 40 hours * 6 weeks
        const utilizedCapacity = (employee.utilization / 100) * totalCapacity;

        return (
          <TableRow key={employee.id} className="hover:bg-muted/30">
            <TableCell className="pl-6">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    className={`text-xs font-mono text-background ${backgroundByRole(employee.role)}`}
                  >
                    {initials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{employee.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              {totalCapacity.toFixed(1)}
            </TableCell>
            <TableCell className="text-center">
              {utilizedCapacity.toFixed(1)}
            </TableCell>
            <TableCell className="text-center">
              {employee.utilization.toFixed(2)}%
            </TableCell>
            {weeklyUtilization.map((utilization, index) => (
              <TableCell
                key={index}
                className={`text-center font-medium ${getUtilizationCellColor(utilization)}`}
              >
                {utilization.toFixed(1)}%
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </>
  );
}

export default function EmployeeHeatmap({
  employees,
}: {
  employees: EmployeeUtilization[];
}) {
  const dateRanges = useMemo(() => {
    const ranges = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 35);

    for (let i = 0; i < 6; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() - 35);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startLabel = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const endLabel = weekEnd.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      ranges.push({
        label: `${startLabel} - ${endLabel}`,
        start: weekStart,
        end: weekEnd,
      });
    }

    return ranges;
  }, []);

  const teams = [...new Set(employees.map((emp) => emp.team))];

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        Resource Utilization Report - Period: {dateRanges[0]?.label} to{" "}
        {dateRanges[dateRanges.length - 1]?.label}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span>Over-utilization (125%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded"></div>
          <span>High utilization (100-124%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span>Good utilization (90-99%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 rounded"></div>
          <span>Normal utilization (75-89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-300 rounded"></div>
          <span>Medium utilization (50-74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-300 rounded"></div>
          <span>Low utilization (25-49%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>Very low utilization (0-24%)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white">
              <TableHead className="w-48 font-semibold">
                Team / Person
              </TableHead>
              <TableHead className="text-center font-semibold">
                Total Available
                <br />
                Capacity (Hours)
              </TableHead>
              <TableHead className="text-center font-semibold">
                Utilized
                <br />
                Capacity (Hours)
              </TableHead>
              <TableHead className="text-center font-semibold">
                Utilization Rate
              </TableHead>
              {dateRanges.map((range, idx) => (
                <TableHead
                  className="text-center font-semibold min-w-24"
                  key={idx}
                >
                  {range.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team, idx) => (
              <EmployeeByTeamRows
                key={idx}
                team={team}
                members={employees.filter((emp) => emp.team === team)}
                dateRanges={dateRanges}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
