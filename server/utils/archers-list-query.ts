import { createError, getQuery, type H3Event } from "h3";
import {
  type ArcherListQuery,
  archerListQuerySchema,
} from "~~/shared/archer/archer-list.schema";
import { normalisePaginatedListRawQuery } from "~~/shared/schemas/paginated-list-query.schema";
import { formatZodValidationError } from "~~/shared/utils/format-zod-error";

export const parseArchersListRawQuery = (
  query: Record<string, unknown>,
): ArcherListQuery => {
  const result = archerListQuerySchema.safeParse(
    normalisePaginatedListRawQuery(query),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: formatZodValidationError(result.error, "Invalid query"),
    });
  }

  return result.data;
};

export const parseArchersListQuery = (event: H3Event): ArcherListQuery => {
  return parseArchersListRawQuery(getQuery(event) as Record<string, unknown>);
};
