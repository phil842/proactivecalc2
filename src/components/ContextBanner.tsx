"use client";

import React from "react";

interface ContextBannerProps {
  timeOfDay: string;
  availableMinutes: number;
  energyLevel: string;
  isWeekend: boolean;
}

const TIME_LABELS: Record<string, string> = {
  early_morning: "Early morning",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

const TIME_EMOJIS: Record<string, string> = {
  early_morning: "🌅",
  morning: "☀️",
  afternoon: "🌤️",
  evening: "🌆",
  night: "🌙",
};

const ENERGY_LABELS: Record<string, string> = {
  high: "High energy",
  medium: "Steady energy",
  low: "Low energy",
};

const ENERGY_COLORS: Record<string, string> = {
  high: "text-emerald-600",
  medium: "text-amber-600",
  low: "text-rose-500",
};

export default function ContextBanner({
  timeOfDay,
  availableMinutes,
  energyLevel,
  isWeekend,
}: ContextBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-4 flex flex-wrap items-center gap-4 text-sm">
      {/* Time */}
      <div className="flex items-center gap-1.5 text-slate-700">
        <span className="text-lg">{TIME_EMOJIS[timeOfDay] ?? "🕐"}</span>
        <span className="font-medium">{TIME_LABELS[timeOfDay] ?? timeOfDay}</span>
        {isWeekend && (
          <span className="text-xs text-purple-600 bg-purple-100 rounded-full px-2 py-0.5 ml-1">
            Weekend
          </span>
        )}
      </div>

      {/* Available time */}
      <div className="flex items-center gap-1.5 text-slate-700">
        <span className="text-lg">⏳</span>
        <span>
          <span className="font-medium">{availableMinutes} min</span>{" "}
          <span className="text-slate-500">available</span>
        </span>
      </div>

      {/* Energy */}
      <div className={`flex items-center gap-1.5 ${ENERGY_COLORS[energyLevel] ?? "text-slate-600"}`}>
        <span className="text-lg">⚡</span>
        <span className="font-medium">{ENERGY_LABELS[energyLevel] ?? energyLevel}</span>
      </div>
    </div>
  );
}
