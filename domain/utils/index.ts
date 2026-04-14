/**
 * Sport season: September (calendar year Y) through August (year Y + 1).
 * The stored `season_year` on competitions is Y (see project specification).
 */
export const seasonYearFromDate = (d: Date): number => {
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  if (month >= 8) {
    return year;
  }
  return year - 1;
};
