export const MEMBER_ROSTER_PAGE_SIZE_MOBILE = 8;
export const MEMBER_ROSTER_PAGE_SIZE_DESKTOP = 10;

export const getMemberRosterPageSlice = <T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): T[] => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const clampMemberRosterPage = (
  page: number,
  totalItems: number,
  pageSize: number,
): number => {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  return Math.min(Math.max(1, page), pageCount);
};
