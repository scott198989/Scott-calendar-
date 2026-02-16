export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
  recurring: boolean;
  recurrenceRule?: string | null;
  location?: string | null;
  categoryId?: string | null;
  category?: CalendarCategory | null;
  createdById: string;
  createdBy?: CalendarUser;
  comments?: EventComment[];
  isSystemEvent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  createdById: string;
}

export interface CalendarUser {
  id: string;
  name?: string | null;
  email: string;
  role: "ADMIN" | "USER";
  image?: string | null;
}

export interface EventComment {
  id: string;
  text: string;
  eventId: string;
  userId: string;
  user?: CalendarUser;
  createdAt: string;
}

export type ViewMode = "month" | "week" | "day";

export interface EventFormData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  categoryId?: string;
  location?: string;
}
