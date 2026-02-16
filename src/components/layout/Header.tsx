"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Calendar, LogOut, LogIn, UserPlus, Shield, Bell } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [showNotifBanner, setShowNotifBanner] = useState(false);

  const handleSubscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported in this browser.");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        setShowNotifBanner(true);
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

      alert("Notifications enabled! You'll receive reminders for upcoming events.");
    } catch (err) {
      console.error("Notification subscription failed:", err);
      alert("Failed to enable notifications. Please check your browser settings.");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-[var(--card)]/80 glass">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Scott&apos;s Calendar
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {session?.user && (
              <>
                <button
                  onClick={handleSubscribe}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  title="Enable notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notify</span>
                </button>

                {(session.user as { role?: string }).role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-3 py-1.5">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                    {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {session.user.name || session.user.email}
                  </span>
                </div>

                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            )}

            {!session?.user && (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {showNotifBanner && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-800 dark:text-amber-200">
          Push notifications require VAPID keys. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your environment.
          <button onClick={() => setShowNotifBanner(false)} className="ml-2 underline">Dismiss</button>
        </div>
      )}
    </>
  );
}
