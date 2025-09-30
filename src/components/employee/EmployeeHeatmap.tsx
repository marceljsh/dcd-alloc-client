import { EmployeeUtilization } from "@/types/employee";
import { useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { startOfQuarter, endOfQuarter } from "date-fns";
import { DateRange } from "@/types/common";
import { backgroundByRole, getUtilizationCellColor } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/strings";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { startOfYear, endOfYear, eachWeekOfInterval, eachDayOfInterval, isToday, format } from 'date-fns';

const COL1_WIDTH = 192;
const COL4_WIDTH = 128;
const HEATMAP_COL_MIN = 88;

function hashStringToInt(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

//Random utilization generator, not by actual data
function generateUtilizationForRange(
  employee: EmployeeUtilization,
  dateRanges: DateRange[],
  viewMode: "week" | "day"
) {
  const base =
    typeof employee.utilization === "number" ? employee.utilization : 0;

  return dateRanges.map((range, idx) => {
    const seedStr = `${
      employee.id ?? employee.name ?? ""
    }::${range.start.toISOString()}::${idx}`;
    const seed = hashStringToInt(seedStr);
    const varianceRange = viewMode === "day" ? 20 : 30;
    const offset = (seed % varianceRange) - Math.floor(varianceRange / 2);
    let util = base + offset;
    const day = range.start.getDay();
    if (day === 0 || day === 6) util *= 0.85;
    return Math.max(0, Math.min(150, Number(util)));
  });
}

interface EmployeeHeatmapProps {
  employees: EmployeeUtilization[];
  selectedStartDate: Date | undefined;
  selectedEndDate: Date | undefined;
}

export default function EmployeeHeatmap({
  employees,
  selectedStartDate,
  selectedEndDate,
}: EmployeeHeatmapProps) {
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const dateRanges = useMemo(() => {
  const ranges: DateRange[] = [];
  const today = new Date();

  const start = selectedStartDate
    ? new Date(selectedStartDate)
    : viewMode === "week"
    ? startOfQuarter(today) 
    : today;               

  const end = selectedEndDate
    ? new Date(selectedEndDate)
    : endOfQuarter(today);   

  let current = new Date(start);
  current.setHours(0, 0, 0, 0);

  if (viewMode === "week") {
    current.setDate(current.getDate() - current.getDay());
    while (current.getTime() <= end.getTime()) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + 6);
      ranges.push({
        label: `${weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`,
        start: weekStart,
        end: weekEnd,
      });
      current.setDate(current.getDate() + 7);
    }
  } else {
    while (current.getTime() <= end.getTime()) {
      const day = new Date(current);
      ranges.push({
        label: day.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        start: day,
        end: day,
      });
      current.setDate(current.getDate() + 1);
    }
  }

  return ranges;
}, [viewMode, selectedStartDate, selectedEndDate]);

  return (
    <div className="space-y-6">
      <div className="flex text-sm text-muted-foreground mb-4">
        Resource Utilization Report - Period: {dateRanges[0]?.label} to{" "}
        {dateRanges[dateRanges.length - 1]?.label}
      </div>
      <div className="flex sticky top-0 left-0 bg-white z-50 items-center gap-2 mb-4 pb-2">
        <Button
          variant={viewMode === "week" ? "default" : "outline"}
          onClick={() => setViewMode("week")}
        >
          View by Week
        </Button>
        <Button
          variant={viewMode === "day" ? "default" : "outline"}
          onClick={() => setViewMode("day")}
        >
          View by Day
        </Button>
      </div>
      <div className="relative border overflow-auto max-h-[70vh]">
        <Table className="w-full border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead
                className="sticky left-0 top-0 z-30 bg-white border-r border-b"
                style={{ minWidth: `${COL1_WIDTH}px` }}
              >
                Person
              </TableHead>
              <TableHead
                className="sticky top-0 z-30 bg-white border-r border-b text-center"
                style={{ left: `${COL1_WIDTH}px`, minWidth: `${COL4_WIDTH}px` }}
              >
                Utilization Rate
              </TableHead>
              {dateRanges.map((range, idx) => (
                <TableHead
                  key={idx}
                  className="sticky top-0 z-20 bg-white text-center font-semibold whitespace-nowrap border-b"
                  style={{ minWidth: `${HEATMAP_COL_MIN}px` }}
                >
                  {range.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, empIdx) => {
              const utilizationData = generateUtilizationForRange(
                employee,
                dateRanges,
                viewMode
              );
              const totalCapacity =
                viewMode === "week" ? 240 : dateRanges.length * 8;
              const utilizedCapacity =
                ((Number(employee.utilization) || 0) / 100) * totalCapacity;

              return (
                <TableRow
                  key={employee.id ?? empIdx}
                  className="hover:bg-muted/30"
                >
                  <TableCell
                    className="sticky left-0 z-10 bg-white border-r"
                    style={{ minWidth: `${COL1_WIDTH}px` }}
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback
                          className={`text-xs font-mono text-background ${backgroundByRole(
                            employee.role
                          )}`}
                        >
                          {initials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    className="sticky z-10 bg-white border-r text-center"
                    style={{
                      left: `${COL1_WIDTH}px`,
                      minWidth: `${COL4_WIDTH}px`,
                    }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help font-medium">
                            {(Number(employee.utilization) || 0).toFixed(2)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm space-y-1">
                            <div>
                              <strong>Total Capacity:</strong>{" "}
                              {totalCapacity.toFixed(1)} h
                            </div>
                            <div>
                              <strong>Utilized:</strong>{" "}
                              {utilizedCapacity.toFixed(1)} h
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  {utilizationData.map((u, i) => (
                    <TableCell
                      key={i}
                      className={`text-center font-medium ${getUtilizationCellColor(
                        u
                      )}`}
                      style={{ minWidth: `${HEATMAP_COL_MIN}px` }}
                    >
                      {u.toFixed(1)}%
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
