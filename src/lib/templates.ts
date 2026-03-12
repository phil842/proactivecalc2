/**
 * Static activity template library.
 * Each template can be combined with a user's interests to produce
 * specific ActivityInstance suggestions.
 */

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  minDuration: number; // minutes
  maxDuration: number; // minutes
  generatorType: "static" | "llm";
  contentSource: string;
  interestTags: string[]; // which interests this applies to
  contextTags: string[];  // preferred contexts: morning, evening, focus, quick, etc.
}

export const ACTIVITY_TEMPLATES: TemplateDefinition[] = [
  // ── Learning & Reading ──────────────────────────────────────────────
  {
    id: "tpl_read_article",
    name: "Read about [interest]",
    description: "Spend 10 minutes reading one article or blog post on [interest].",
    minDuration: 10,
    maxDuration: 20,
    generatorType: "static",
    contentSource: "article_feed",
    interestTags: ["*"], // applies to any interest
    contextTags: ["morning", "afternoon", "commute", "quick"],
  },
  {
    id: "tpl_watch_video",
    name: "Watch 1 video on [interest]",
    description: "Pick one video from your [interest] playlist and take 3 notes.",
    minDuration: 15,
    maxDuration: 30,
    generatorType: "static",
    contentSource: "youtube_playlist",
    interestTags: ["*"],
    contextTags: ["afternoon", "evening", "home"],
  },
  {
    id: "tpl_deep_work",
    name: "20-minute deep work sprint on [interest]",
    description: "Close distractions and do a focused 20-minute sprint on [interest].",
    minDuration: 20,
    maxDuration: 25,
    generatorType: "static",
    contentSource: "focus",
    interestTags: ["coding", "startups", "writing", "design", "research"],
    contextTags: ["morning", "afternoon", "home", "focus"],
  },
  {
    id: "tpl_reflection",
    name: "5-minute reflection on [interest]",
    description: "Write 3 bullet points: What's one win today in [interest]? What's one question you have?",
    minDuration: 5,
    maxDuration: 10,
    generatorType: "llm",
    contentSource: "reflection",
    interestTags: ["*"],
    contextTags: ["evening", "night", "quick"],
  },
  {
    id: "tpl_flashcards",
    name: "15-minute learning session: [interest]",
    description: "Review flashcards, notes, or question prompts about [interest].",
    minDuration: 15,
    maxDuration: 20,
    generatorType: "static",
    contentSource: "flashcards",
    interestTags: ["theology", "language", "history", "science", "math", "medicine"],
    contextTags: ["morning", "afternoon", "commute"],
  },
  {
    id: "tpl_plan_week",
    name: "Review your week and plan tomorrow",
    description: "Spend 10 minutes reviewing wins, blockers, and setting intentions for tomorrow.",
    minDuration: 10,
    maxDuration: 15,
    generatorType: "static",
    contentSource: "planning",
    interestTags: ["*"],
    contextTags: ["evening", "night"],
  },
  {
    id: "tpl_physical",
    name: "Quick [interest] session",
    description: "Do a 20-minute physical or movement session for [interest].",
    minDuration: 20,
    maxDuration: 40,
    generatorType: "static",
    contentSource: "exercise",
    interestTags: ["fitness", "tricking", "yoga", "sports", "running", "gym"],
    contextTags: ["morning", "afternoon", "home"],
  },
  {
    id: "tpl_project_sprint",
    name: "Make one small step on [interest] project",
    description: "Pick the single next action on your [interest] project and do it.",
    minDuration: 25,
    maxDuration: 60,
    generatorType: "llm",
    contentSource: "project",
    interestTags: ["coding", "startups", "design", "writing", "research", "music"],
    contextTags: ["morning", "afternoon", "focus", "home"],
  },
  {
    id: "tpl_podcast",
    name: "Listen to a podcast about [interest]",
    description: "Listen to 15–20 minutes of a podcast or audio content on [interest] while you move.",
    minDuration: 15,
    maxDuration: 30,
    generatorType: "static",
    contentSource: "podcast",
    interestTags: ["*"],
    contextTags: ["commute", "morning", "evening"],
  },
  {
    id: "tpl_llm_prompts",
    name: "AI mini-exercise: [interest]",
    description: "Answer 3 AI-generated reflection or knowledge questions about [interest].",
    minDuration: 10,
    maxDuration: 20,
    generatorType: "llm",
    contentSource: "llm_prompts",
    interestTags: ["*"],
    contextTags: ["morning", "afternoon", "evening", "quick"],
  },
];

/** Return templates that match a given interest */
export function getTemplatesForInterest(interest: string): TemplateDefinition[] {
  return ACTIVITY_TEMPLATES.filter(
    (t) => t.interestTags.includes("*") || t.interestTags.includes(interest.toLowerCase())
  );
}

/** Return templates that fit a given context tag */
export function getTemplatesForContext(contextTag: string): TemplateDefinition[] {
  return ACTIVITY_TEMPLATES.filter((t) => t.contextTags.includes(contextTag));
}

/** Check if a template fits within an available time window */
export function templateFitsTime(template: TemplateDefinition, availableMinutes: number): boolean {
  return template.minDuration <= availableMinutes;
}
