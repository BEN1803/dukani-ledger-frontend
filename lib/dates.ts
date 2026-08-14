import { format } from "date-fns";

export function parseDateSafe(value: unknown): Date | null {
  if (value == null || value === "") return null;

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number" || (typeof value === "string" && /^\d+(\.\d+)?$/.test(value))) {
    const num = Number(value);
    if (num === 0) return null;
    date = new Date(num < 1e11 ? num * 1000 : num);
  } else {
    date = new Date(value as string);
  }

  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatDateSafe(value: unknown, pattern: string, fallback = "—"): string {
  const date = parseDateSafe(value);
  if (!date) return fallback;
  return format(date, pattern);
}