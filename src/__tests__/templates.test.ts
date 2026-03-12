import {
  ACTIVITY_TEMPLATES,
  getTemplatesForInterest,
  getTemplatesForContext,
  templateFitsTime,
} from "../lib/templates";

describe("templates: ACTIVITY_TEMPLATES", () => {
  it("has at least 5 templates", () => {
    expect(ACTIVITY_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });

  it("every template has required fields", () => {
    for (const t of ACTIVITY_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.minDuration).toBeGreaterThan(0);
      expect(t.maxDuration).toBeGreaterThanOrEqual(t.minDuration);
      expect(["static", "llm"]).toContain(t.generatorType);
      expect(Array.isArray(t.interestTags)).toBe(true);
      expect(Array.isArray(t.contextTags)).toBe(true);
    }
  });

  it("has unique IDs", () => {
    const ids = ACTIVITY_TEMPLATES.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("templates: getTemplatesForInterest", () => {
  it("returns templates for universal (*) interests", () => {
    const results = getTemplatesForInterest("theology");
    const universalTemplates = ACTIVITY_TEMPLATES.filter((t) => t.interestTags.includes("*"));
    // All universal templates should be in results
    for (const t of universalTemplates) {
      expect(results).toContainEqual(t);
    }
  });

  it("returns interest-specific templates", () => {
    const fitnessTemplates = getTemplatesForInterest("fitness");
    expect(fitnessTemplates.some((t) => t.interestTags.includes("fitness"))).toBe(true);
  });

  it("is case-insensitive", () => {
    const lower = getTemplatesForInterest("coding");
    const upper = getTemplatesForInterest("CODING");
    expect(lower.length).toEqual(upper.length);
  });
});

describe("templates: getTemplatesForContext", () => {
  it("returns templates tagged for morning", () => {
    const results = getTemplatesForContext("morning");
    expect(results.length).toBeGreaterThan(0);
    for (const t of results) {
      expect(t.contextTags).toContain("morning");
    }
  });

  it("returns templates tagged for evening", () => {
    const results = getTemplatesForContext("evening");
    expect(results.length).toBeGreaterThan(0);
    for (const t of results) {
      expect(t.contextTags).toContain("evening");
    }
  });
});

describe("templates: templateFitsTime", () => {
  it("returns true when template fits in available time", () => {
    const template = ACTIVITY_TEMPLATES.find((t) => t.id === "tpl_read_article")!;
    expect(templateFitsTime(template, 15)).toBe(true); // minDuration=10, available=15
  });

  it("returns false when template does not fit", () => {
    const template = ACTIVITY_TEMPLATES.find((t) => t.id === "tpl_deep_work")!;
    expect(templateFitsTime(template, 5)).toBe(false); // minDuration=20, available=5
  });
});
