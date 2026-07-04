import type { z } from "zod";
import { ARCHER_LIST_MAX_LIMIT } from "~~/shared/archer/archer-list.dto";
import { createPaginatedListQuerySchema } from "~~/shared/schemas/paginated-list-query.schema";

export const archerListQuerySchema = createPaginatedListQuerySchema({
  maxLimit: ARCHER_LIST_MAX_LIMIT,
});

export type ArcherListQuery = z.infer<typeof archerListQuerySchema>;
