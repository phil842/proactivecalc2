import {
  getTimeOfDay,
  inferEnergyLevel,
  estimateAvailableTime,
  buildContext,
} from "../lib/context";

describe("context: getTimeOfDay", () => {
  it("returns early_morning for hour 5–7", () => {
    expect(getTimeOfDay(5)).toBe("early_morning");
    expect(getTimeOfDay(7)).toBe("early_morning");
  });
  it("returns morning for hour 8–11", () => {
    expect(getTimeOfDay(8)).toBe("morning");
    expect(getTimeOfDay(11)).toBe("morning");
  });
  it("returns afternoon for hour 12–16", () => {
    expect(getTimeOfDay(12)).toBe("afternoon");
    expect(getTimeOfDay(16)).toBe("afternoon");
  });
  it("returns evening for hour 17–20", () => {
    expect(getTimeOfDay(17)).toBe("evening");
    expect(getTimeOfDay(20)).toBe("evening");
  });
  it("returns night for hour 21–23 and 0–4", () => {
    expect(getTimeOfDay(21)).toBe("night");
    expect(getTimeOfDay(0)).toBe("night");
    expect(getTimeOfDay(4)).toBe("night");
  });
});

describe("context: inferEnergyLevel", () => {
  it("returns high for morning contexts", () => {
    expect(inferEnergyLevel("early_morning", false)).toBe("high");
    expect(inferEnergyLevel("morning", false)).toBe("high");
  });
  it("returns high on weekends in afternoon", () => {
    expect(inferEnergyLevel("afternoon", true)).toBe("high");
  });
  it("returns medium on weekdays in afternoon", () => {
    expect(inferEnergyLevel("afternoon", false)).toBe("medium");
  });
  it("returns medium in the evening", () => {
    expect(inferEnergyLevel("evening", false)).toBe("medium");
  });
  it("returns low at night", () => {
    expect(inferEnergyLevel("night", false)).toBe("low");
    expect(inferEnergyLevel("night", true)).toBe("low");
  });
});

describe("context: estimateAvailableTime", () => {
  it("caps available time to minutesUntilNextEvent minus 5", () => {
    const result = estimateAvailableTime("morning", false, 20);
    expect(result).toBe(15); // min(45, 20-5)
  });
  it("returns base time when no event is upcoming", () => {
    expect(estimateAvailableTime("morning", false, null)).toBe(45);
    expect(estimateAvailableTime("evening", false, null)).toBe(90);
    expect(estimateAvailableTime("afternoon", true, null)).toBe(120);
  });
  it("returns 0 or negative when next event is imminent", () => {
    const result = estimateAvailableTime("morning", false, 3);
    expect(result).toBeLessThanOrEqual(0); // 3-5 = -2
  });
});

describe("context: buildContext", () => {
  it("builds a consistent context object", () => {
    const morning = new Date("2025-06-09T09:00:00"); // Monday
    const ctx = buildContext(morning, null);
    expect(ctx.timeOfDay).toBe("morning");
    expect(ctx.isWeekend).toBe(false);
    expect(ctx.hourOfDay).toBe(9);
    expect(ctx.dayOfWeek).toBe(1); // Monday
    expect(ctx.energyLevel).toBe("high");
    expect(ctx.availableMinutes).toBe(45);
    expect(ctx.minutesUntilNextEvent).toBeNull();
  });

  it("detects weekends", () => {
    const saturday = new Date("2025-06-07T14:00:00"); // Saturday
    const ctx = buildContext(saturday, null);
    expect(ctx.isWeekend).toBe(true);
    expect(ctx.availableMinutes).toBe(120);
  });

  it("passes location through", () => {
    const ctx = buildContext(new Date(), null, "commute");
    expect(ctx.location).toBe("commute");
  });
});
