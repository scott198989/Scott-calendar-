"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Bell,
  BellOff,
  LogOut,
  Shield,
  Briefcase,
  BookOpen,
  Dog,
  DollarSign,
  User,
  Heart,
  Users,
  Receipt,
  Tag,
} from "lucide-react";
import { CalendarCategory } from "@/types";
import { CATEGORY_COLORS, COLOR_OPTIONS } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  book: BookOpen,
  dog: Dog,
  dollar: DollarSign,
  user: User,
  heart: Heart,
  users: Users,
  receipt: Receipt,
  tag: Tag,
};

interface SidebarProps {
  categories: CalendarCategory[];
  selectedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onCreateCategory: (name: string, color: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
}

export function Sidebar({
  categories,
  selectedCategories,
  onToggleCategory,
  onCreateCategory,
  onDeleteCategory,
  notificationsEnabled,
  onToggleNotifications,
}: SidebarProps) {
  const { data: session } = useSession();
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("blue");
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    onCreateCategory(newCatName.trim(), newCatColor);
    setNewCatName("");
    setNewCatColor("blue");
    setShowNewCategory(false);
  };

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--sidebar)] h-full overflow-y-auto hidden lg:block">
      <div className="p-4 space-y-6">
        {/* User info */}
        {session?.user && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)]/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {(session.user.name || session.user.email || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">
                {session.user.name || session.user.email}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                {isAdmin && <Shield className="w-3 h-3" />}
                {isAdmin ? "Admin" : "User"}
              </div>
            </div>
          </div>
        )}

        {/* Mini calendar current month summary */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-1">
            Quick Links
          </div>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--muted)] transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={onToggleNotifications}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-[var(--muted)] transition-colors"
          >
            {notificationsEnabled ? (
              <>
                <Bell className="w-4 h-4 text-green-500" />
                <span>Notifications On</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span>Enable Notifications</span>
              </>
            )}
          </button>
        </div>

        {/* Categories */}
        <div>
          <button
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            className="flex items-center gap-1 w-full text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-1 mb-2 hover:text-[var(--foreground)] transition-colors"
          >
            {categoriesExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            Categories
          </button>

          {categoriesExpanded && (
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const colors = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.blue;
                const isSelected = selectedCategories.has(cat.id);
                const IconComponent = cat.icon ? ICON_MAP[cat.icon] || Tag : Tag;

                return (
                  <div key={cat.id} className="flex items-center group">
                    <button
                      onClick={() => onToggleCategory(cat.id)}
                      className={`flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        isSelected
                          ? `${colors.bg} ${colors.text} font-medium`
                          : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${colors.dot} ${!isSelected ? "opacity-40" : ""}`} />
                      <IconComponent className="w-3.5 h-3.5" />
                      <span className="truncate">{cat.name}</span>
                    </button>
                    {isAdmin && !cat.name.match(/^(Work|School|Gunner|Pay Day)$/) && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete category "${cat.name}"?`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-[var(--destructive)] transition-all mr-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add new category */}
              {showNewCategory ? (
                <div className="p-2 rounded-lg bg-[var(--muted)] space-y-2 mt-2">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateCategory();
                    }}
                    className="w-full px-2 py-1.5 rounded bg-[var(--card)] border border-[var(--border)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewCatColor(color)}
                        className={`w-5 h-5 rounded-full ${CATEGORY_COLORS[color].dot} ${
                          newCatColor === color ? "ring-2 ring-offset-1 ring-[var(--ring)]" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleCreateCategory}
                      className="flex-1 px-2 py-1 bg-[var(--accent)] text-white rounded text-xs font-medium"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewCategory(false)}
                      className="px-2 py-1 rounded text-xs font-medium hover:bg-[var(--card)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewCategory(true)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </button>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider px-1">
            Schedule Legend
          </div>
          <div className="space-y-1 text-xs text-[var(--muted-foreground)] px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Work: 8:30 PM - 10:00 AM
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              School: Mon & Wed 10:30-5
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Gunner: Before/after work
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Pay: Short-week Wed & 1st
            </div>
          </div>
        </div>

        {/* Sign out */}
        {session?.user && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--destructive)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
