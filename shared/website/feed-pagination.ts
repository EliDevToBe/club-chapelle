export const FEED_PAGE_SIZE = 5;

export const getNextVisibleCount = (
  currentVisible: number,
  totalCount: number,
  pageSize: number = FEED_PAGE_SIZE,
): number => {
  return Math.min(currentVisible + pageSize, totalCount);
};
