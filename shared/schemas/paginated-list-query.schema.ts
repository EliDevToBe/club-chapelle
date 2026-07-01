import { z } from "zod";
import {
  optionalIntQueryParam,
  trimmedOptionalQueryString,
} from "~~/shared/utils/query-params";

/** Shape passed to Zod after HTTP query normalisation (before defaults). */
export type PaginatedListRawNormalised = {
  limit: number | undefined;
  offset: number | undefined;
  q: string | undefined;
};

export const normalisePaginatedListRawQuery = (
  query: Record<string, unknown>,
): PaginatedListRawNormalised => {
  return {
    limit: optionalIntQueryParam(query.limit),
    offset: optionalIntQueryParam(query.offset),
    q: trimmedOptionalQueryString(query.q),
  };
};

export const createPaginatedListQuerySchema = (options: {
  maxLimit: number;
}) => {
  return z.object({
    limit: z.number().int().min(1).max(options.maxLimit).optional(),
    offset: z.number().int().min(0).default(0),
    q: z.string().optional(),
  });
};

export type PaginatedListQuery = z.infer<
  ReturnType<typeof createPaginatedListQuerySchema>
>;
