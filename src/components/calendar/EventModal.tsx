"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Tag,
  MessageSquare,
  Trash2,
  Edit3,
  Send,
  AlertCircle,
} from "lucide-react";
import { CalendarEvent, CalendarCategory } from "@/types";
import { CATEGORY_COLORS, formatTime } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface EventModalProps {
  event?: CalendarEvent | null;
  categories: CalendarCategory[];
  isCreating: boolean;
  defaultDate?: Date;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    allDay: boolean;
    categoryId?: string;
    location?: string;
  }) => void;
  onDelete?: (eventId: string) => void;
  onAddComment?: (eventId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export function EventModal({
  event,
  categories,
  isCreating,
  defaultDate,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  onDeleteComment,
}: EventModalProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(isCreating);
  const [commentText, setCommentText] = useState("");

  const getDefaultStart = () => {
    if (defaultDate) {
      return format(defaultDate, "yyyy-MM-dd'T'HH:mm");
    }
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const getDefaultEnd = () => {
    if (defaultDate) {
      const end = new Date(defaultDate);
      end.setHours(end.getHours() + 1);
      return format(end, "yyyy-MM-dd'T'HH:mm");
    }
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 2);
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    startDate: event ? format(parseISO(event.startDate), "yyyy-MM-dd'T'HH:mm") : getDefaultStart(),
    endDate: event ? format(parseISO(event.endDate), "yyyy-MM-dd'T'HH:mm") : getDefaultEnd(),
    allDay: event?.allDay || false,
    categoryId: event?.categoryId || "",
    location: event?.location || "",
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      categoryId: formData.categoryId || undefined,
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !event?.id || !onAddComment) return;
    onAddComment(event.id, commentText.trim());
    setCommentText("");
  };

  const canEdit = session?.user && (
    (session.user as { role: string }).role === "ADMIN" ||
    event?.createdById === session.user.id
  );

  const categoryColor = event?.category?.color || formData.categoryId
    ? categories.find(c => c.id === (event?.categoryId || formData.categoryId))?.color || "blue"
    : "blue";
  const colors = CATEGORY_COLORS[categoryColor] || CATEGORY_COLORS.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 glass"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto view-transition">
        {/* Header accent */}
        <div className={`h-1.5 rounded-t-2xl ${colors.dot}`} />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isEditing ? (
            /* Edit / Create Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Event title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xl font-bold bg-transparent border-none outline-none placeholder:text-[var(--muted-foreground)] focus:ring-0"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type={formData.allDay ? "date" : "datetime-local"}
                      value={formData.allDay ? formData.startDate.split("T")[0] : formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      required
                    />
                    <input
                      type={formData.allDay ? "date" : "datetime-local"}
                      value={formData.allDay ? formData.endDate.split("T")[0] : formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                    type="checkbox"
                    checked={formData.allDay}
                    onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                    className="rounded border-[var(--border)]"
                  />
                  <span className="text-sm">All day event</span>
                </label>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                  <input
                    type="text"
                    placeholder="Add location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="">No category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <textarea
                    placeholder="Add description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[var(--accent)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  {isCreating ? "Create Event" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[var(--muted)] rounded-lg font-medium text-sm hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div>
                  <h2 className="text-xl font-bold">{event?.title}</h2>
                  {event?.category && (
                    <span
                      className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      {event.category.name}
                    </span>
                  )}
                </div>
                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
                      title="Edit event"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (event?.id && confirm("Delete this event?")) {
                            onDelete(event.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--destructive)] transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {event && (
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-[var(--muted-foreground)]">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {event.allDay
                        ? format(parseISO(event.startDate), "EEEE, MMMM d, yyyy")
                        : `${format(parseISO(event.startDate), "EEE, MMM d")} ${formatTime(parseISO(event.startDate))} - ${format(parseISO(event.endDate), "EEE, MMM d")} ${formatTime(parseISO(event.endDate))}`}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2.5 text-[var(--muted-foreground)]">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-[var(--muted-foreground)] mt-3 leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {event.isSystemEvent && (
                    <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>System-generated recurring event</span>
                    </div>
                  )}
                </div>
              )}

              {/* Comments Section */}
              {event && (
                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                    {event.comments && event.comments.length > 0 && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        ({event.comments.length})
                      </span>
                    )}
                  </h3>

                  {/* Comment list */}
                  <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
                    {event.comments?.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-2.5 rounded-lg bg-[var(--muted)] text-sm group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">
                            {comment.user?.name || comment.user?.email}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[var(--muted-foreground)]">
                              {format(parseISO(comment.createdAt), "MMM d, h:mm a")}
                            </span>
                            {onDeleteComment && (
                              session?.user?.id === comment.userId ||
                              (session?.user as { role: string })?.role === "ADMIN"
                            ) && (
                              <button
                                onClick={() => onDeleteComment(comment.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/10 text-[var(--destructive)] transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[var(--muted-foreground)]">{comment.text}</p>
                      </div>
                    ))}
                    {(!event.comments || event.comments.length === 0) && (
                      <p className="text-xs text-[var(--muted-foreground)] italic">No comments yet</p>
                    )}
                  </div>

                  {/* Add comment */}
                  {session?.user && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        className="p-2 rounded-lg bg-[var(--accent)] text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
