export type CountdownResult = {
  type: "days" | "today" | "past";
  days: number;
};

export function getCountdown(eventDate: string): CountdownResult {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  const diffTime = event.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { type: "today", days: 0 };
  if (diffDays < 0) return { type: "past", days: diffDays };
  return { type: "days", days: diffDays };
}

export type DetailedCountdownResult = {
  type: "countdown" | "today" | "past";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

/**
 * Get detailed countdown for the animated timer.
 * If eventTime is provided (format "HH:MM"), counts down to that exact time.
 * Otherwise counts down to the start of the event day (midnight).
 */
export function getDetailedCountdown(eventDate: string, eventTime?: string | null): DetailedCountdownResult {
  const now = new Date();

  // Build target datetime
  let event: Date;
  if (eventTime) {
    const [hours, mins] = eventTime.split(":").map(Number);
    event = new Date(eventDate + "T00:00:00");
    event.setHours(hours, mins, 0, 0);
  } else {
    event = new Date(eventDate + "T00:00:00");
  }

  const diff = event.getTime() - now.getTime();

  if (diff <= 0) {
    // Check if it's still today (for "today" display vs "past")
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(event.getFullYear(), event.getMonth(), event.getDate());

    if (today.getTime() === eventDay.getTime()) {
      return { type: "today", days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }
    return { type: "past", days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { type: "countdown", days, hours, minutes, seconds, totalMs: diff };
}

/**
 * Determine if a list is closed.
 * A list is closed if:
 * 1. is_closed flag is true (manually closed), OR
 * 2. Event date+time has passed
 *    - With event_time: closed after that exact time
 *    - Without event_time: closed after the end of the event day (next day starts)
 */
export function isListClosed(list: {
  is_closed: boolean;
  event_date: string | null;
  event_time?: string | null;
}): boolean {
  if (list.is_closed) return true;
  if (!list.event_date) return false;

  const now = new Date();

  if (list.event_time) {
    // Close after the exact event time
    const [hours, mins] = list.event_time.split(":").map(Number);
    const eventDateTime = new Date(list.event_date + "T00:00:00");
    eventDateTime.setHours(hours, mins, 0, 0);
    return now.getTime() > eventDateTime.getTime();
  }

  // No time set: close after the event day ends (i.e., when next day starts)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(list.event_date + "T00:00:00");
  const eventDayNormalized = new Date(eventDay.getFullYear(), eventDay.getMonth(), eventDay.getDate());
  return eventDayNormalized.getTime() < today.getTime();
}
