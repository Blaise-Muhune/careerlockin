/**
 * Returns the Sunday (week_start + 6 days) as YYYY-MM-DD for use in date ranges.
 */
export function getWeekEndFromStart(weekStart: string): string {
  const d = new Date(weekStart + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the Monday of the current week in America/Detroit as YYYY-MM-DD.
 * Used as default week_start for weekly check-ins.
 */
export function getDefaultWeekStartDetroit(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Detroit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";
  const year = parseInt(get("year"), 10);
  const month = parseInt(get("month"), 10);
  const day = parseInt(get("day"), 10);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = d.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(Date.UTC(year, month - 1, day + mondayOffset));
  return monday.toISOString().slice(0, 10);
}

/**
 * Returns the Monday N weeks before the given week start (YYYY-MM-DD).
 */
export function getWeekStartOffset(weekStart: string, weeksAgo: number): string {
  const d = new Date(weekStart + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 7 * weeksAgo);
  return d.toISOString().slice(0, 10);
}
