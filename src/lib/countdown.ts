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

export function getDetailedCountdown(eventDate: string): DetailedCountdownResult {
  const now = new Date();
  const event = new Date(eventDate + "T00:00:00");

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(event.getFullYear(), event.getMonth(), event.getDate());

  if (today.getTime() === eventDay.getTime()) {
    return { type: "today", days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  if (eventDay.getTime() < today.getTime()) {
    return { type: "past", days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  // Future event — count down to start of event day
  const diff = event.getTime() - now.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { type: "countdown", days, hours, minutes, seconds, totalMs: diff };
}

export function isListClosed(list: { is_closed: boolean; event_date: string | null }): boolean {
  if (list.is_closed) return true;
  if (!list.event_date) return false;
  const today = new Date();
  const eventDay = new Date(list.event_date + "T00:00:00");
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventDate = new Date(eventDay.getFullYear(), eventDay.getMonth(), eventDay.getDate());
  return eventDate.getTime() < todayDate.getTime();
}
