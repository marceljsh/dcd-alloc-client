import { DateRange } from '@/types/common';
import { EmployeeUtilization } from '@/types/employee';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function backgroundByRole(role: string) {
  switch (role) {
    case 'System Analyst':    return 'bg-rose-400';
    case 'Software Engineer': return 'bg-sky-400';
    case 'Data Engineer':     return 'bg-lime-400';

    default: return 'bg-gray-500';
  }
}

export function generateWeeklyUtilization(employee: EmployeeUtilization, dateRanges: DateRange[]) {
  return dateRanges.map(() => {
    // Generate realistic utilization percentages
    const baseUtilization = employee.utilization
    const variance = (Math.random() - 0.5) * 50 // ±25% variance
    const weeklyUtilization = Math.max(0, Math.min(150, baseUtilization + variance))
    return Math.round(weeklyUtilization)
  })
}

export function getUtilizationCellColor(utilization: number) {
  if (utilization >= 125) return "bg-red-400 text-white" // Over-utilization (red)
  if (utilization >= 100) return "bg-red-300 text-red-900" // High utilization (light red)
  if (utilization >= 90) return "bg-green-400 text-green-900" // Good utilization (green)
  if (utilization >= 75) return "bg-green-300 text-green-900" // Normal utilization (light green)
  if (utilization >= 50) return "bg-yellow-300 text-yellow-900" // Medium utilization (yellow)
  if (utilization >= 25) return "bg-orange-300 text-orange-900" // Low utilization (orange)
  return "bg-gray-200 text-gray-700" // Very low utilization (gray)
}
