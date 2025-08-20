export function datesOverlap(_start1: string, _end1: string, _start2: string, _end2: string): boolean {
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
