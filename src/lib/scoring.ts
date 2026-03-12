/**
 * Scoring & ranking engine.
 *
 * Scores candidate (template × interest) pairs against the current context
 * to produce a ranked suggestion list.
 */

import { type AppContext, type TimeOfDay, type EnergyLevel } from "./context";
import { type TemplateDefinition } from "./templates";

export interface CandidateSuggestion {
  templateId: string;
  interest: string;
  template: TemplateDefinition;
}

export interface ScoredSuggestion extends CandidateSuggestion {
  score: number;
  reasons: string[];
}

/** Map time-of-day to preferred context tags */
const TIME_CONTEXT_MAP: Record<TimeOfDay, string[]> = {
  early_morning: ["morning", "quick"],
  morning:       ["morning", "focus"],
  afternoon:     ["afternoon", "focus"],
  evening:       ["evening", "home"],
  night:         ["night", "quick"],
};

/** Map energy level to preferred template categories */
const ENERGY_CONTEXT_MAP: Record<EnergyLevel, string[]> = {
  high:   ["focus", "morning"],
  medium: ["afternoon", "home", "commute"],
  low:    ["quick", "evening", "night"],
};

/**
 * Score a single candidate against the current context.
 * Returns a numeric score (0–100) and a list of human-readable reasons.
 */
export function scoreCandidate(
  candidate: CandidateSuggestion,
  context: AppContext,
  recentTemplateIds: string[] = [] // used for diversity: penalise recent repeats
): ScoredSuggestion {
  const { template } = candidate;
  let score = 50; // base score
  const reasons: string[] = [];

  // ── Time fit ──────────────────────────────────────────────────────────
  const preferredContextTags = TIME_CONTEXT_MAP[context.timeOfDay] ?? [];
  const matchedTimeTags = template.contextTags.filter((t) => preferredContextTags.includes(t));
  if (matchedTimeTags.length > 0) {
    score += 15;
    reasons.push(`Good fit for ${context.timeOfDay.replace("_", " ")}`);
  } else {
    score -= 10;
  }

  // ── Energy fit ────────────────────────────────────────────────────────
  const energyTags = ENERGY_CONTEXT_MAP[context.energyLevel] ?? [];
  const matchedEnergyTags = template.contextTags.filter((t) => energyTags.includes(t));
  if (matchedEnergyTags.length > 0) {
    score += 10;
    reasons.push(`Matches your current energy level`);
  }

  // ── Duration fit ──────────────────────────────────────────────────────
  if (template.maxDuration <= context.availableMinutes) {
    score += 15;
    reasons.push(`Fits in your available time (${context.availableMinutes} min)`);
  } else if (template.minDuration <= context.availableMinutes) {
    score += 5;
  } else {
    score -= 40; // template can't fit at all – strong downrank
    reasons.push(`Might not fit in available time`);
  }

  // ── Weekend boost for longer / physical activities ────────────────────
  if (context.isWeekend && template.contextTags.includes("home")) {
    score += 8;
    reasons.push("Great for a weekend");
  }

  // ── Diversity penalty: don't repeat same template type ────────────────
  const recentCount = recentTemplateIds.filter((id) => id === template.id).length;
  if (recentCount > 0) {
    score -= recentCount * 15;
  }

  // ── LLM / AI novelty bonus ────────────────────────────────────────────
  if (template.generatorType === "llm") {
    score += 5;
    reasons.push("Personalised AI content");
  }

  // Clamp to 0–100
  score = Math.max(0, Math.min(100, score));

  return { ...candidate, score, reasons };
}

/**
 * Score and rank a list of candidates, returning the top N.
 */
export function rankCandidates(
  candidates: CandidateSuggestion[],
  context: AppContext,
  recentTemplateIds: string[] = [],
  topN: number = 10
): ScoredSuggestion[] {
  const scored = candidates.map((c) =>
    scoreCandidate(c, context, recentTemplateIds)
  );
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}
