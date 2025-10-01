import { EmployeeLevel, EmployeeRole, EmploymentStatus } from "@/types/common";

export function initials(str: string): string {
  const words = str.split(' ');
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
}

export function toKebab(str: string): string {
  if (!str) return "";
  return str.toLowerCase()
    .replace(/'/g, '') // remove single quotes
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric characters with hyphens
    .replace(/^-|-$/g, ''); // remove leading and trailing hyphens
}

export function title(str: string): string {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatRole(role: EmployeeRole): string {
  switch (role) {
    case "SLA": return "System Analyst";
    case "DTE": return "Data Engineer";
    case "SWE": return "Software Engineer";
  }
}

export function formatLevel(level: EmployeeLevel): string {
  switch (level) {
    case "JR":  return "Junior";
    case "MID": return "Mid";
    case "SR":  return "Senior";
  }
}

export function formatEmploymentStatus(status: EmploymentStatus): string {
  switch (status) {
    case "CR": return "Contract";
    case "OR": return "Permanent";
  }
}
