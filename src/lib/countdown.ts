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
