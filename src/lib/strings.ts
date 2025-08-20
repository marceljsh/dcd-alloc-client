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
