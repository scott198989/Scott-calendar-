"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
  parseISO,
} from "date-fns";
import { CalendarEvent } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthView({ currentDate, events, onDayClick, onEventClick }: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);

      for (const day of days) {
        const dayKey = format(day, "yyyy-MM-dd");
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        if (start <= dayEnd && end >= dayStart) {
          if (!map[dayKey]) map[dayKey] = [];
          map[dayKey].push(event);
        }
      }
    }
    return map;
  }, [events, days]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="view-transition">
      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border border-[var(--border)] rounded-xl overflow-hidden">
        {days.map((day, idx) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay[dayKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={`calendar-cell min-h-[100px] sm:min-h-[120px] p-1.5 border-b border-r border-[var(--border)] cursor-pointer ${
                isCurrentMonth
                  ? "bg-[var(--card)]"
                  : "bg-[var(--muted)]/50"
              } ${idx % 7 === 6 ? "border-r-0" : ""} ${
                idx >= days.length - 7 ? "border-b-0" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full font-medium ${
                    today
                      ? "bg-[var(--accent)] text-white font-bold"
                      : isCurrentMonth
                        ? "text-[var(--foreground)]"
                        : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {format(day, "d")}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-[var(--muted-foreground)] font-medium">
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const colorKey = event.category?.color || "blue";
                  const colors = CATEGORY_COLORS[colorKey] || CATEGORY_COLORS.blue;

                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`event-pill w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      {event.allDay ? (
                        event.title
                      ) : (
                        <>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot} mr-1`} />
                          {event.title}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
