import { scoreCandidate, rankCandidates } from "../lib/scoring";
import type { AppContext } from "../lib/context";
import type { CandidateSuggestion } from "../lib/scoring";
import { ACTIVITY_TEMPLATES } from "../lib/templates";

const morningContext: AppContext = {
  timeOfDay: "morning",
  hourOfDay: 9,
  dayOfWeek: 1,
  isWeekend: false,
  energyLevel: "high",
  minutesUntilNextEvent: null,
  availableMinutes: 45,
  location: "home",
};

const nightContext: AppContext = {
  timeOfDay: "night",
  hourOfDay: 23,
  dayOfWeek: 3,
  isWeekend: false,
  energyLevel: "low",
  minutesUntilNextEvent: null,
  availableMinutes: 30,
  location: "home",
};

const readTemplate = ACTIVITY_TEMPLATES.find((t) => t.id === "tpl_read_article")!;
const deepWorkTemplate = ACTIVITY_TEMPLATES.find((t) => t.id === "tpl_deep_work")!;
const planTemplate = ACTIVITY_TEMPLATES.find((t) => t.id === "tpl_plan_week")!;

const makeCandidate = (template: typeof readTemplate, interest = "coding"): CandidateSuggestion => ({
  templateId: template.id,
  interest,
  template,
});

describe("scoring: scoreCandidate", () => {
  it("returns a score between 0 and 100", () => {
    const result = scoreCandidate(makeCandidate(readTemplate), morningContext);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("scores morning-tagged templates higher in the morning", () => {
    // Use deepWorkTemplate which is morning/focus only (no 'quick' or 'night' tags)
    const morningScore = scoreCandidate(makeCandidate(deepWorkTemplate), morningContext);
    const nightScore = scoreCandidate(makeCandidate(deepWorkTemplate), nightContext);
    expect(morningScore.score).toBeGreaterThan(nightScore.score);
  });

  it("scores evening/night templates higher at night", () => {
    const nightPlanScore = scoreCandidate(makeCandidate(planTemplate), nightContext);
    const morningPlanScore = scoreCandidate(makeCandidate(planTemplate), morningContext);
    expect(nightPlanScore.score).toBeGreaterThan(morningPlanScore.score);
  });

  it("penalises templates that are too long for available time", () => {
    const tinyContext: AppContext = { ...morningContext, availableMinutes: 5 };
    const deepScore = scoreCandidate(makeCandidate(deepWorkTemplate), tinyContext);
    // A very short template (minDuration=5) should score better than one with minDuration=20
    const reflectionTemplate = ACTIVITY_TEMPLATES.find((t) => t.id === "tpl_reflection")!;
    const shortScore = scoreCandidate(makeCandidate(reflectionTemplate), tinyContext);
    // deep work (minDuration=20) should score lower than reflection (minDuration=5) when only 5 min available
    expect(deepScore.score).toBeLessThan(shortScore.score);
  });

  it("penalises repeated template IDs", () => {
    const freshScore = scoreCandidate(makeCandidate(readTemplate), morningContext, []);
    const repeatedScore = scoreCandidate(
      makeCandidate(readTemplate),
      morningContext,
      [readTemplate.id, readTemplate.id]
    );
    expect(freshScore.score).toBeGreaterThan(repeatedScore.score);
  });

  it("includes reasons in the output", () => {
    const result = scoreCandidate(makeCandidate(readTemplate), morningContext);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});

describe("scoring: rankCandidates", () => {
  it("returns at most topN results", () => {
    const candidates = ACTIVITY_TEMPLATES.map((t) => makeCandidate(t));
    const ranked = rankCandidates(candidates, morningContext, [], 5);
    expect(ranked.length).toBeLessThanOrEqual(5);
  });

  it("returns results in descending score order", () => {
    const candidates = ACTIVITY_TEMPLATES.map((t) => makeCandidate(t));
    const ranked = rankCandidates(candidates, morningContext);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score);
    }
  });

  it("returns empty array for empty candidates", () => {
    expect(rankCandidates([], morningContext)).toEqual([]);
  });
});
