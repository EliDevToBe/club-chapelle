export const GALLERY_GRID_ROWS = 3;

export const getGalleryPageSize = (columns: number): number => {
  return GALLERY_GRID_ROWS * columns;
};

export const getGalleryPageSlice = <T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): T[] => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const clampGalleryPage = (
  page: number,
  totalItems: number,
  pageSize: number,
): number => {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  return Math.min(Math.max(1, page), pageCount);
};
