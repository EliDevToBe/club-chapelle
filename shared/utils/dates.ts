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

/**
 * Parses an API / DTO date string (e.g. ISO 8601) into a `Date`.
 * Throws `RangeError` when the value is not a valid date, aligned with `formatDateForDb`.
 */
export const parseDbDateString = (value: string): Date => {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    throw new RangeError(`Invalid date: ${String(value)}`);
  }

  return d;
};

/**
 * Parses a nullable optional string into `Date` or `null`.
 * Empty string is treated as `null`.
 */
export const parseDbDateStringOrNull = (
  value: string | null | undefined,
): Date | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return parseDbDateString(value);
};

/** Formats a `Date` for DTOs, or `null` when the domain value is absent. */
export const formatDateForDbOrNull = (value: Date | null): string | null => {
  if (value === null) {
    return null;
  }

  return formatDateForDb(value);
};
