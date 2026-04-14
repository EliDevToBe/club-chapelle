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
