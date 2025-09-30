export function datesOverlap(
  _start1: string,
  _end1: string,
  _start2: string,
  _end2: string
): boolean {
  const start1 = new Date(_start1);
  const end1 = new Date(_end1);
  const start2 = new Date(_start2);
  const end2 = new Date(_end2);

  return start1 <= end2 && start2 <= end1;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

export const generateDates = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];

  const current = new Date(startDate);
  current.setDate(current.getDate() - 1);

  const last = new Date(endDate);
  last.setDate(last.getDate() + 1);

  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const getMonthAbbr = (date: Date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[date.getMonth()];
};

export const calculateWorkingDays = (
  startDate: string,
  endDate: string
): number => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) return 0;

  let workingDays = 0;
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

export const calculateDuration = (
  startDate: string,
  endDate: string,
  fte: number
): number => {
  const workingDays = calculateWorkingDays(startDate, endDate);
  const hoursPerDay = 8;
  return Math.round(workingDays * hoursPerDay * fte);
};
