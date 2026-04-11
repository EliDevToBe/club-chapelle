/** Sport season: September (year Y) through August (year Y + 1); stored `season_year` is Y. */
export const seasonYearFromDate = (d: Date): number => {
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  if (month >= 8) {
    return year;
  }
  return year - 1;
};

export const addDaysUtc = (d: Date, days: number): Date => {
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

/** Date at UTC midnight for `@db.Date` fields. */
export const utcDateOnly = (d: Date): Date => {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0),
  );
};
