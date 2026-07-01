import type { ArcherDto } from "~~/shared/archer/archer.dto";
import type { ArcherListQuery } from "~~/shared/archer/archer-list.schema";

export type { ArcherListQuery };
export type ArcherListQueryDto = ArcherListQuery;

export const ARCHER_LIST_PAGE_SIZE = 10;

export const ARCHER_LIST_MAX_LIMIT = 100;

export type ArcherListResponseDto = {
  archers: ArcherDto[];
  total: number;
};
