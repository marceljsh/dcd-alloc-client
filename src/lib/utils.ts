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
