"use client";

import { useMemo } from "react";
import {
  format,
  parseISO,
  setHours,
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  differenceInMinutes,
} from "date-fns";
import { CalendarEvent } from "@/types";
import { CATEGORY_COLORS, formatTime } from "@/lib/utils";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeSlotClick: (date: Date) => void;
}

export function DayView({ currentDate, events, onEventClick, onTimeSlotClick }: DayViewProps) {
  const hours = useMemo(() => {
    return eachHourOfInterval({
      start: setHours(startOfDay(currentDate), 0),
      end: setHours(startOfDay(currentDate), 23),
    });
  }, [currentDate]);

  const dayEvents = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);

    return events.filter((event) => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      return start <= dayEnd && end >= dayStart;
    });
  }, [events, currentDate]);

  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay);

  const getEventsForHour = (hour: Date) => {
    return timedEvents.filter((event) => {
      const start = parseISO(event.startDate);
      return start.getHours() === hour.getHours() &&
        start.getDate() === currentDate.getDate() &&
        start.getMonth() === currentDate.getMonth();
    });
  };

  return (
    <div className="view-transition">
      {/* All day events */}
      {allDayEvents.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase mb-2">
            All Day
          </div>
          <div className="flex flex-wrap gap-2">
            {allDayEvents.map((event) => {
              const colorKey = event.category?.color || "green";
              const colors = CATEGORY_COLORS[colorKey] || CATEGORY_COLORS.green;
              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`event-pill px-3 py-1.5 rounded-lg text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                >
                  {event.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time slots */}
      <div className="border border-[var(--border)] rounded-xl overflow-hidden">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          const now = new Date();
          const isCurrentHour =
            now.getHours() === hour.getHours() &&
            now.getDate() === currentDate.getDate() &&
            now.getMonth() === currentDate.getMonth();

          return (
            <div
              key={hour.toISOString()}
              onClick={() => {
                const clickDate = new Date(currentDate);
                clickDate.setHours(hour.getHours(), 0, 0, 0);
                onTimeSlotClick(clickDate);
              }}
              className={`flex border-b border-[var(--border)] last:border-b-0 cursor-pointer hover:bg-[var(--muted)]/30 transition-colors min-h-[56px] ${
                isCurrentHour ? "bg-blue-500/5" : ""
              }`}
            >
              <div className="w-20 shrink-0 p-2 text-right">
                <span className={`text-xs font-medium ${isCurrentHour ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"}`}>
                  {format(hour, "h:mm a")}
                </span>
                {isCurrentHour && (
                  <div className="relative mt-1 ml-auto w-2 h-2 rounded-full bg-[var(--accent)] pulse-dot" />
                )}
              </div>

              <div className="flex-1 p-1 border-l border-[var(--border)]">
                {hourEvents.map((event) => {
                  const start = parseISO(event.startDate);
                  const end = parseISO(event.endDate);
                  const duration = differenceInMinutes(end, start);
                  const colorKey = event.category?.color || "blue";
                  const colors = CATEGORY_COLORS[colorKey] || CATEGORY_COLORS.blue;

                  return (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={`event-pill w-full text-left p-2.5 rounded-lg mb-1 ${colors.bg} ${colors.text} border ${colors.border}`}
                    >
                      <div className="font-semibold text-sm">{event.title}</div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {formatTime(start)} - {formatTime(end)}
                        {duration > 0 && ` (${Math.round(duration / 60)}h ${duration % 60}m)`}
                      </div>
                      {event.description && (
                        <div className="text-xs opacity-60 mt-1 truncate">
                          {event.description}
                        </div>
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
