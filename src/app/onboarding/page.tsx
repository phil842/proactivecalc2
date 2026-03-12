"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import InterestSelector from "@/components/InterestSelector";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = interests.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, interests }),
      });
      if (!res.ok) throw new Error("Failed to create profile");
      const data = await res.json() as { user: { id: string } };
      localStorage.setItem("userId", data.user.id);
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-3xl font-bold text-white mb-2">ProActive</h1>
          <p className="text-indigo-300 text-sm">
            A proactive list of what&apos;s worth doing <em>right now</em>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-slate-700">
                Your name <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                maxLength={80}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
              />
            </div>

            {/* Interest selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">
                What are you interested in?
              </span>
              <InterestSelector
                selected={interests}
                onChange={setInterests}
                minSelect={3}
                maxSelect={7}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canContinue || isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? "Setting up…" : "Build my feed →"}
            </button>

            {!canContinue && (
              <p className="text-center text-xs text-slate-400">
                Select at least 3 interests to continue
              </p>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-indigo-400 mt-4">
          No account required · Your data stays local
        </p>
      </div>
    </div>
  );
}
