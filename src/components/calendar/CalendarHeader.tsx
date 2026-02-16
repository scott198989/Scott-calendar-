"use client";

import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar, LayoutGrid, List } from "lucide-react";
import { ViewMode } from "@/types";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewMode) => void;
  onAddEvent: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onDateChange,
  onViewChange,
  onAddEvent,
  onToday,
}: CalendarHeaderProps) {
  const navigate = (direction: "prev" | "next") => {
    const fn = direction === "prev"
      ? viewMode === "month" ? subMonths : viewMode === "week" ? subWeeks : subDays
      : viewMode === "month" ? addMonths : viewMode === "week" ? addWeeks : addDays;
    onDateChange(fn(currentDate, 1));
  };

  const getTitle = () => {
    switch (viewMode) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
        return `Week of ${format(currentDate, "MMM d, yyyy")}`;
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("prev")}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("next")}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {getTitle()}
        </h1>

        <button
          onClick={onToday}
          className="ml-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* View mode toggles */}
        <div className="flex items-center bg-[var(--muted)] rounded-lg p-1">
          {([
            { mode: "month" as ViewMode, icon: LayoutGrid, label: "Month" },
            { mode: "week" as ViewMode, icon: Calendar, label: "Week" },
            { mode: "day" as ViewMode, icon: List, label: "Day" },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewChange(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === mode
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onAddEvent}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Event</span>
        </button>
      </div>
    </div>
  );
}
