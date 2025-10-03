import { EmployeeLevel, EmployeeRole, EmploymentStatus, ProjectCategory, ProjectPriority } from "@/types/common";

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

export function formatLevel(level: EmployeeLevel): string {
  switch (level) {
    case "JR":  return "Junior";
    case "MID": return "Middle";
    case "SR":  return "Senior";
  }
}

export function formatEmploymentStatus(status: EmploymentStatus): string {
  switch (status) {
    case "CR": return "Contract";
    case "OR": return "Permanent";
  }
}

export function formatCategory(category: ProjectCategory): string {
  switch (category) {
    case "SM": return "Small";
    case "MD": return "Medium";
    case "LG": return "Large";
  }
}

export function formatPriority(priority: ProjectPriority): string {
  switch (priority) {
    case "LOW":      return "Low";
    case "MEDIUM":   return "Medium";
    case "HIGH":     return "High";
    case "CRITICAL": return "Critical";
  }
}

export function formatRole(role: EmployeeRole): string {
  switch (role) {
    case "SWE": return "Software Engineer";
    case "DTE": return "DevOps Engineer";
    case "SLA": return "Solution Architect";
  }
}
