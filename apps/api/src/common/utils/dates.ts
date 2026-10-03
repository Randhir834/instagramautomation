const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** `YYYY-MM` in UTC, used as the UsageCounter month key. */
export function monthKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * HOUR_MS);
}

/** True if `since` is less than `hours` ago (e.g. Meta's 24h messaging window). */
export function isWithinHours(since: Date, hours: number, now: Date = new Date()): boolean {
  return now.getTime() - since.getTime() < hours * HOUR_MS;
}
