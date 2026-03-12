"use client";

import React from "react";

const ALL_INTERESTS = [
  { id: "theology",    label: "Theology",         emoji: "✝️" },
  { id: "coding",      label: "Coding",            emoji: "💻" },
  { id: "startups",    label: "Startups",          emoji: "🚀" },
  { id: "fitness",     label: "Fitness",           emoji: "🏋️" },
  { id: "tricking",    label: "Tricking",          emoji: "🤸" },
  { id: "writing",     label: "Writing",           emoji: "✍️" },
  { id: "reading",     label: "Reading",           emoji: "📚" },
  { id: "design",      label: "Design",            emoji: "🎨" },
  { id: "music",       label: "Music",             emoji: "🎵" },
  { id: "science",     label: "Science",           emoji: "🔬" },
  { id: "philosophy",  label: "Philosophy",        emoji: "🧠" },
  { id: "history",     label: "History",           emoji: "📜" },
  { id: "language",    label: "Languages",         emoji: "🌍" },
  { id: "math",        label: "Mathematics",       emoji: "📐" },
  { id: "running",     label: "Running",           emoji: "🏃" },
  { id: "yoga",        label: "Yoga / Mindfulness",emoji: "🧘" },
  { id: "research",    label: "Research",          emoji: "🔍" },
  { id: "medicine",    label: "Medicine",          emoji: "🩺" },
];

interface InterestSelectorProps {
  selected: string[];
  onChange: (interests: string[]) => void;
  minSelect?: number;
  maxSelect?: number;
}

export default function InterestSelector({
  selected,
  onChange,
  minSelect = 3,
  maxSelect = 7,
}: InterestSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      if (selected.length < maxSelect) {
        onChange([...selected, id]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Choose {minSelect}–{maxSelect} interests.{" "}
        <span className="font-medium text-indigo-600">
          {selected.length} / {maxSelect} selected
        </span>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ALL_INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              disabled={!isSelected && selected.length >= maxSelect}
              className={[
                "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 border-2 focus:outline-none focus:ring-2 focus:ring-indigo-400",
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600",
                !isSelected && selected.length >= maxSelect
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer",
              ].join(" ")}
            >
              <span className="text-base" aria-hidden="true">
                {interest.emoji}
              </span>
              {interest.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
