"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  RefreshCw,
  Database,
  Calendar,
  Tag,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<{ events: number; categories: number; comments: number } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/events?start=2020-01-01&end=2030-12-31");
      if (res.ok) {
        const events = await res.json();
        const catRes = await fetch("/api/categories");
        const categories = catRes.ok ? await catRes.json() : [];

        setStats({
          events: events.length,
          categories: categories.length,
          comments: events.reduce(
            (sum: number, e: { comments?: unknown[] }) => sum + (e.comments?.length || 0),
            0
          ),
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || !isAdmin) {
      router.push("/login");
      return;
    }
    fetchStats();
  }, [session, status, isAdmin, router, fetchStats]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setSeedResult(
          `Seeded ${data.eventsCreated} events, ${data.categoriesCreated} categories`
        );
        await fetchStats();
      } else {
        setSeedResult(`Error: ${data.error}`);
      }
    } catch {
      setSeedResult("Failed to seed database");
    } finally {
      setSeeding(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-gradient">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
          <span className="text-sm text-[var(--muted-foreground)]">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen mesh-gradient">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-[var(--accent)]" />
              Admin Panel
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Manage calendar data and settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Events", value: stats?.events || 0, icon: Calendar, color: "text-blue-500" },
            { label: "Categories", value: stats?.categories || 0, icon: Tag, color: "text-purple-500" },
            { label: "Comments", value: stats?.comments || 0, icon: MessageSquare, color: "text-emerald-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Database className="w-5 h-5" />
              Database Management
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--muted)]">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">Seed / Regenerate Schedule</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Creates the admin account, default categories, and generates 6 months of
                    work shifts, school days, Gunner reminders, and pay days. Existing system
                    events will be replaced.
                  </p>
                </div>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
                >
                  {seeding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {seeding ? "Seeding..." : "Seed Database"}
                </button>
              </div>

              {seedResult && (
                <div
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                    seedResult.startsWith("Error")
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {seedResult.startsWith("Error") ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  {seedResult}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Schedule Reference</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-medium text-[var(--accent)]">Work Schedule</h3>
                <ul className="space-y-1 text-[var(--muted-foreground)]">
                  <li>Short Week: Wed, Thu, Fri nights</li>
                  <li>Long Week: Wed, Thu, Fri, Sat nights</li>
                  <li>Shifts: 8:30 PM - 10:00 AM</li>
                  <li>Pattern alternates weekly</li>
                  <li>Feb 18, 2026 starts as SHORT</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-purple-500">School Schedule</h3>
                <ul className="space-y-1 text-[var(--muted-foreground)]">
                  <li>Every Monday & Wednesday</li>
                  <li>10:30 AM - 5:00 PM</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-emerald-500">Pay Days</h3>
                <ul className="space-y-1 text-[var(--muted-foreground)]">
                  <li>ISOFlex: Wed on short weeks</li>
                  <li>VA Disability: 1st of each month</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-orange-500">Gunner</h3>
                <ul className="space-y-1 text-[var(--muted-foreground)]">
                  <li>Bathroom break before work (7:30 PM)</li>
                  <li>Bathroom break after work (10:00 AM)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
