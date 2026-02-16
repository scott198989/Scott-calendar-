"use client";

import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  format,
  isSameDay,
  isToday,
  parseISO,
  setHours,
  startOfDay,
  endOfDay,
  differenceInMinutes,
} from "date-fns";
import { CalendarEvent } from "@/types";
import { CATEGORY_COLORS } from "@/lib/utils";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date) => void;
}

export function WeekView({ currentDate, events, onEventClick, onTimeSlotClick }: WeekViewProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const hours = useMemo(() => {
    return eachHourOfInterval({
      start: setHours(startOfDay(currentDate), 6),
      end: setHours(startOfDay(currentDate), 23),
    });
  }, [currentDate]);

  const getEventsForDayAndHour = (day: Date, hour: Date) => {
    const hourStart = new Date(day);
    hourStart.setHours(hour.getHours(), 0, 0, 0);
    const hourEnd = new Date(day);
    hourEnd.setHours(hour.getHours(), 59, 59, 999);

    return events.filter((event) => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      return start <= hourEnd && end >= hourStart && isSameDay(start, day) && start.getHours() === hour.getHours();
    });
  };

  const getAllDayEvents = (day: Date) => {
    return events.filter((event) => {
      if (!event.allDay) return false;
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      return start <= endOfDay(day) && end >= startOfDay(day);
    });
  };

  return (
    <div className="view-transition">
      {/* Header with day names */}
      <div className="grid grid-cols-8 border-b border-[var(--border)]">
        <div className="p-2 text-xs text-[var(--muted-foreground)]" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`p-2 text-center border-l border-[var(--border)] ${
              isToday(day) ? "bg-blue-500/5" : ""
            }`}
          >
            <div className="text-xs text-[var(--muted-foreground)] uppercase">
              {format(day, "EEE")}
            </div>
            <div
              className={`text-lg font-bold mt-0.5 ${
                isToday(day)
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      <div className="grid grid-cols-8 border-b border-[var(--border)] min-h-[40px]">
        <div className="p-1 text-[10px] text-[var(--muted-foreground)] flex items-center justify-end pr-2">
          All Day
        </div>
        {weekDays.map((day) => {
          const allDayEvts = getAllDayEvents(day);
          return (
            <div key={day.toISOString()} className="p-1 border-l border-[var(--border)] space-y-0.5">
              {allDayEvts.map((event) => {
                const colorKey = event.category?.color || "green";
                const colors = CATEGORY_COLORS[colorKey] || CATEGORY_COLORS.green;
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`event-pill w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${colors.bg} ${colors.text}`}
                  >
                    {event.title}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="max-h-[600px] overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour.toISOString()} className="grid grid-cols-8 border-b border-[var(--border)]">
            <div className="p-1 text-[11px] text-[var(--muted-foreground)] text-right pr-2 pt-0">
              {format(hour, "h a")}
            </div>
            {weekDays.map((day) => {
              const cellEvents = getEventsForDayAndHour(day, hour);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    const clickDate = new Date(day);
                    clickDate.setHours(hour.getHours());
                    onTimeSlotClick(clickDate);
                  }}
                  className={`min-h-[48px] p-0.5 border-l border-[var(--border)] cursor-pointer hover:bg-[var(--muted)]/50 transition-colors ${
                    isToday(day) ? "bg-blue-500/5" : ""
                  }`}
                >
                  {cellEvents.map((event) => {
                    const start = parseISO(event.startDate);
                    const end = parseISO(event.endDate);
                    const duration = Math.min(differenceInMinutes(end, start), 480);
                    const heightPx = Math.max((duration / 60) * 48, 24);
                    const colorKey = event.category?.color || "blue";
                    const colors = CATEGORY_COLORS[colorKey] || CATEGORY_COLORS.blue;

                    return (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        style={{ height: `${heightPx}px` }}
                        className={`event-pill w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium overflow-hidden ${colors.bg} ${colors.text} border-l-2 border-l-current`}
                      >
                        <div className="truncate">{event.title}</div>
                        <div className="text-[9px] opacity-75">
                          {format(start, "h:mm a")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
