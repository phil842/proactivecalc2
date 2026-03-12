"use client";

import React from "react";

interface Activity {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  resourceUrl?: string | null;
  status: string;
}

interface SuggestionCardProps {
  activity: Activity;
  onAction: (id: string, action: "completed" | "skipped" | "later") => void;
  isLoading?: boolean;
}

const ACTION_BUTTON_CLASS =
  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1";

export default function SuggestionCard({
  activity,
  onAction,
  isLoading = false,
}: SuggestionCardProps) {
  const timeLabel =
    activity.estimatedTime < 60
      ? `${activity.estimatedTime} min`
      : `${Math.floor(activity.estimatedTime / 60)}h ${activity.estimatedTime % 60 > 0 ? `${activity.estimatedTime % 60}m` : ""}`.trim();

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-800 leading-snug flex-1">
          {activity.title}
        </h3>
        <span className="shrink-0 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-1">
          {timeLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 leading-relaxed">{activity.description}</p>

      {/* Resource link */}
      {activity.resourceUrl && (
        <a
          href={activity.resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-500 underline underline-offset-2 hover:text-indigo-700 truncate"
        >
          {activity.resourceUrl}
        </a>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-1">
        <button
          disabled={isLoading}
          onClick={() => onAction(activity.id, "completed")}
          className={`${ACTION_BUTTON_CLASS} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50`}
        >
          ✓ Do now
        </button>
        <button
          disabled={isLoading}
          onClick={() => onAction(activity.id, "later")}
          className={`${ACTION_BUTTON_CLASS} bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 disabled:opacity-50`}
        >
          ⏱ Later
        </button>
        <button
          disabled={isLoading}
          onClick={() => onAction(activity.id, "skipped")}
          className={`${ACTION_BUTTON_CLASS} bg-rose-50 text-rose-600 hover:bg-rose-100 focus:ring-rose-400 disabled:opacity-50`}
        >
          ✕ Skip
        </button>
      </div>
    </article>
  );
}
