import { getQuery, type H3Event } from "h3";
import { ApiError } from "~~/server/utils/api-error";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import {
  type ArcherListQuery,
  archerListQuerySchema,
} from "~~/shared/archer/archer-list.schema";
import { normalisePaginatedListRawQuery } from "~~/shared/schemas/paginated-list-query.schema";

export const parseArchersListRawQuery = (
  query: Record<string, unknown>,
): ArcherListQuery => {
  const result = archerListQuerySchema.safeParse(
    normalisePaginatedListRawQuery(query),
  );

  if (!result.success) {
    throw ApiError(API_ERROR_REASON.common.invalid_query);
  }

  return result.data;
};

export const parseArchersListQuery = (event: H3Event): ArcherListQuery => {
  return parseArchersListRawQuery(getQuery(event) as Record<string, unknown>);
};
