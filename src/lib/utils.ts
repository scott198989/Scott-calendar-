import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateRange(start: Date, end: Date): string {
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${formatTime(start)} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${formatTime(end)}`;
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  blue: { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-300", border: "border-blue-500/30", dot: "bg-blue-500" },
  red: { bg: "bg-red-500/15", text: "text-red-700 dark:text-red-300", border: "border-red-500/30", dot: "bg-red-500" },
  green: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/30", dot: "bg-emerald-500" },
  purple: { bg: "bg-purple-500/15", text: "text-purple-700 dark:text-purple-300", border: "border-purple-500/30", dot: "bg-purple-500" },
  orange: { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-300", border: "border-orange-500/30", dot: "bg-orange-500" },
  pink: { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-300", border: "border-pink-500/30", dot: "bg-pink-500" },
  yellow: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/30", dot: "bg-amber-500" },
  teal: { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-300", border: "border-teal-500/30", dot: "bg-teal-500" },
  indigo: { bg: "bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-500/30", dot: "bg-indigo-500" },
  cyan: { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-500/30", dot: "bg-cyan-500" },
};

export const COLOR_OPTIONS = Object.keys(CATEGORY_COLORS);
