"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { CalendarEvent, CalendarCategory, ViewMode } from "@/types";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { EventModal } from "./EventModal";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [categories, setCategories] = useState<CalendarCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate date range for fetching events
  const dateRange = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return {
      start: startOfWeek(monthStart).toISOString(),
      end: endOfWeek(monthEnd).toISOString(),
    };
  }, [currentDate]);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/events?start=${dateRange.start}&end=${dateRange.end}`
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        // Select all categories by default
        setSelectedCategories(new Set(data.map((c: CalendarCategory) => c.id)));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter events by selected categories
  const filteredEvents = useMemo(() => {
    if (selectedCategories.size === 0) return events;
    return events.filter(
      (e) => !e.categoryId || selectedCategories.has(e.categoryId)
    );
  }, [events, selectedCategories]);

  // Event handlers
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsCreating(true);
    setDefaultDate(undefined);
    setShowModal(true);
  };

  const handleDayClick = (date: Date) => {
    if (viewMode === "month") {
      setCurrentDate(date);
      setViewMode("day");
    } else {
      setSelectedEvent(null);
      setIsCreating(true);
      setDefaultDate(date);
      setShowModal(true);
    }
  };

  const handleTimeSlotClick = (date: Date) => {
    setSelectedEvent(null);
    setIsCreating(true);
    setDefaultDate(date);
    setShowModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsCreating(false);
    setShowModal(true);
  };

  const handleSaveEvent = async (data: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    allDay: boolean;
    categoryId?: string;
    location?: string;
  }) => {
    try {
      if (selectedEvent && !isCreating) {
        // Update
        const res = await fetch(`/api/events/${selectedEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          await fetchEvents();
          setShowModal(false);
        }
      } else {
        // Create
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          await fetchEvents();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchEvents();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleAddComment = async (eventId: string, text: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, text }),
      });
      if (res.ok) {
        await fetchEvents();
        // Refresh the selected event
        const eventRes = await fetch(`/api/events/${eventId}`);
        if (eventRes.ok) {
          setSelectedEvent(await eventRes.json());
        }
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchEvents();
        if (selectedEvent) {
          const eventRes = await fetch(`/api/events/${selectedEvent.id}`);
          if (eventRes.ok) {
            setSelectedEvent(await eventRes.json());
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleCreateCategory = async (name: string, color: string) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      if (res.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/categories?id=${categoryId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleToggleNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }

    try {
      if (notificationsEnabled) {
        setNotificationsEnabled(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission denied.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        alert("Push notifications are not configured. VAPID keys needed.");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setNotificationsEnabled(true);
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative w-64 h-full">
            <Sidebar
              categories={categories}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={handleDeleteCategory}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={handleToggleNotifications}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto mesh-gradient">
          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden mb-4 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onDateChange={setCurrentDate}
            onViewChange={setViewMode}
            onAddEvent={handleAddEvent}
            onToday={() => setCurrentDate(new Date())}
          />

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--muted-foreground)]">Loading calendar...</span>
              </div>
            </div>
          ) : (
            <>
              {viewMode === "month" && (
                <MonthView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDayClick={handleDayClick}
                  onEventClick={handleEventClick}
                />
              )}
              {viewMode === "week" && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
              {viewMode === "day" && (
                <DayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={selectedEvent}
          categories={categories}
          isCreating={isCreating}
          defaultDate={defaultDate}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </div>
  );
}
