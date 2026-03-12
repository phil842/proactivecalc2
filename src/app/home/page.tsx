"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SuggestionCard from "@/components/SuggestionCard";
import ContextBanner from "@/components/ContextBanner";

interface Activity {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  resourceUrl?: string | null;
  status: string;
}

interface ContextInfo {
  timeOfDay: string;
  availableMinutes: number;
  energyLevel: string;
  isWeekend: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [context, setContext] = useState<ContextInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const loadSuggestions = useCallback(async (uid: string, fresh = false) => {
    if (fresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      if (fresh) {
        // Generate fresh suggestions
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid }),
        });
        if (!res.ok) throw new Error("Failed to load suggestions");
        const data = await res.json() as { activities: Activity[]; context: ContextInfo };
        setActivities(data.activities);
        setContext(data.context);
      } else {
        // Try loading existing pending suggestions first
        const res = await fetch(`/api/suggestions?userId=${uid}`);
        if (!res.ok) throw new Error();
        const data = await res.json() as { activities: Activity[] };
        if (data.activities.length > 0) {
          setActivities(data.activities);
          // Also fetch fresh context
          const ctxRes = await fetch("/api/suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: uid }),
          });
          if (ctxRes.ok) {
            const ctxData = await ctxRes.json() as { activities: Activity[]; context: ContextInfo };
            setContext(ctxData.context);
            setActivities(ctxData.activities);
          }
        } else {
          // No existing – generate
          const genRes = await fetch("/api/suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: uid }),
          });
          if (!genRes.ok) throw new Error("Failed to generate suggestions");
          const genData = await genRes.json() as { activities: Activity[]; context: ContextInfo };
          setActivities(genData.activities);
          setContext(genData.context);
        }
      }
    } catch {
      // Ignore – empty state shown
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) {
      router.replace("/onboarding");
      return;
    }
    setUserId(uid);

    // Fetch user name
    fetch(`/api/user?id=${uid}`)
      .then((r) => r.json())
      .then((d: { user?: { name?: string | null } }) => {
        if (d.user?.name) setUserName(d.user.name);
      })
      .catch(() => {});

    loadSuggestions(uid, false);
  }, [router, loadSuggestions]);

  const handleAction = useCallback(
    async (id: string, action: "completed" | "skipped" | "later") => {
      setActionLoading(id);
      try {
        const res = await fetch(`/api/activity/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) throw new Error("Failed to update activity");
        // Remove from visible list
        setActivities((prev) => prev.filter((a) => a.id !== id));
      } catch {
        // Ignore
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const handleSignOut = () => {
    localStorage.removeItem("userId");
    router.replace("/onboarding");
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-slate-800 text-lg">ProActive</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => userId && loadSuggestions(userId, true)}
              disabled={isRefreshing}
              title="Refresh suggestions"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 flex items-center gap-1"
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Refreshing…
                </>
              ) : (
                <>↻ Refresh</>
              )}
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting()}{userName ? `, ${userName}` : ""}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here&apos;s what&apos;s worth doing right now
          </p>
        </div>

        {/* Context banner */}
        {context && (
          <ContextBanner
            timeOfDay={context.timeOfDay}
            availableMinutes={context.availableMinutes}
            energyLevel={context.energyLevel}
            isWeekend={context.isWeekend}
          />
        )}

        {/* Suggestion feed */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-40 animate-pulse border border-slate-100"
              />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <span className="text-5xl">🎉</span>
            <h2 className="text-xl font-semibold text-slate-700">
              You&apos;re all caught up!
            </h2>
            <p className="text-slate-400 text-sm max-w-xs">
              You&apos;ve actioned all your suggestions. Tap Refresh to get a new set.
            </p>
            <button
              onClick={() => userId && loadSuggestions(userId, true)}
              className="mt-2 bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              ↻ Get new suggestions
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activities.map((activity) => (
              <SuggestionCard
                key={activity.id}
                activity={activity}
                onAction={handleAction}
                isLoading={actionLoading === activity.id}
              />
            ))}
          </div>
        )}

        {/* Footer nudge */}
        {!isLoading && activities.length > 0 && (
          <p className="text-center text-xs text-slate-300 pb-4">
            Tap an action on any card · Your feed adapts to what you complete
          </p>
        )}
      </main>
    </div>
  );
}
