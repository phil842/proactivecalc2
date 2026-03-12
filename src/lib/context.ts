/**
 * Context engine: captures current context for suggestion ranking.
 * In v1 this is deterministic (time of day + day of week).
 * Calendar integration is stubbed for future extension.
 */

export type TimeOfDay = "early_morning" | "morning" | "afternoon" | "evening" | "night";
export type EnergyLevel = "high" | "medium" | "low";
export type LocationHint = "home" | "commute" | "campus" | "unknown";

export interface AppContext {
  timeOfDay: TimeOfDay;
  hourOfDay: number;
  dayOfWeek: number; // 0=Sun, 6=Sat
  isWeekend: boolean;
  energyLevel: EnergyLevel;
  /** Minutes until next calendar event (null if unknown) */
  minutesUntilNextEvent: number | null;
  /** Estimated available time block in minutes */
  availableMinutes: number;
  location: LocationHint;
}

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 8) return "early_morning";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/** Derive implicit energy level from time of day */
export function inferEnergyLevel(timeOfDay: TimeOfDay, isWeekend: boolean): EnergyLevel {
  if (timeOfDay === "early_morning" || timeOfDay === "morning") return "high";
  if (timeOfDay === "afternoon") return isWeekend ? "high" : "medium";
  if (timeOfDay === "evening") return "medium";
  return "low"; // night
}

/** Estimate available time based on time of day and day type */
export function estimateAvailableTime(
  timeOfDay: TimeOfDay,
  isWeekend: boolean,
  minutesUntilNextEvent: number | null
): number {
  let baseMinutes: number;
  if (isWeekend) {
    baseMinutes = 120;
  } else {
    switch (timeOfDay) {
      case "early_morning": baseMinutes = 30; break;
      case "morning":       baseMinutes = 45; break;
      case "afternoon":     baseMinutes = 60; break;
      case "evening":       baseMinutes = 90; break;
      case "night":         baseMinutes = 30; break;
      default:              baseMinutes = 30;
    }
  }
  if (minutesUntilNextEvent !== null) {
    return Math.min(baseMinutes, minutesUntilNextEvent - 5);
  }
  return baseMinutes;
}

export function buildContext(
  now: Date = new Date(),
  minutesUntilNextEvent: number | null = null,
  location: LocationHint = "unknown"
): AppContext {
  const hourOfDay = now.getHours();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const timeOfDay = getTimeOfDay(hourOfDay);
  const energyLevel = inferEnergyLevel(timeOfDay, isWeekend);
  const availableMinutes = estimateAvailableTime(timeOfDay, isWeekend, minutesUntilNextEvent);

  return {
    timeOfDay,
    hourOfDay,
    dayOfWeek,
    isWeekend,
    energyLevel,
    minutesUntilNextEvent,
    availableMinutes,
    location,
  };
}
