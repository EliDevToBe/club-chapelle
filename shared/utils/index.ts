/**
 * Formats a value for Postgres `DATE` / API DTOs: calendar date in UTC as `YYYY-MM-DD`.
 * Accepts a `Date` or a parseable date string (e.g. ISO 8601).
 */
export const formatDateForDb = (value: Date | string): string => {
  const d = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(d.getTime())) {
    throw new RangeError(`Invalid date: ${String(value)}`);
  }

  return d.toISOString().slice(0, 10);
};
