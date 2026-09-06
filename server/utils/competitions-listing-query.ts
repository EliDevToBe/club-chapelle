import { getQuery, type H3Event } from "h3";
import { ApiError } from "~~/server/utils/api-error";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { asNonEmptyString } from "~~/shared/utils/base-string.helper";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const firstQueryString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const head = value[0];
    if (head === undefined || head === null) {
      return undefined;
    }
    return String(head);
  }
  return String(value);
};

const assertValidYmd = (raw: string): void => {
  if (!ISO_DATE.test(raw)) {
    throw ApiError(API_ERROR_REASON.common.invalid_query);
  }
  const d = new Date(`${raw}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw ApiError(API_ERROR_REASON.common.invalid_query);
  }
};

export type CompetitionsListingQueryParsed = {
  dateStartYmd: string | null;
  dateEndYmd: string | null;
  search: string | null;
  onlyMine: boolean;
};

/**
 * Parses raw query object (e.g. from `getQuery(event)`).
 * - `start` omitted or empty → no lower date bound.
 * - `end` omitted or empty → no upper date bound.
 * - `mine` only valid as absent or exactly `true`.
 */
export const parseCompetitionsListingRawQuery = (
  query: Record<string, unknown>,
): CompetitionsListingQueryParsed => {
  const startRaw = firstQueryString(query.start);
  const endRaw = firstQueryString(query.end);
  const searchRaw = firstQueryString(query.search);
  const mineRaw = query.mine;

  if (mineRaw !== undefined && mineRaw !== null && mineRaw !== "") {
    const mineStr = firstQueryString(mineRaw);
    if (mineStr !== "true") {
      throw ApiError(API_ERROR_REASON.common.invalid_query);
    }
  }

  const onlyMine = firstQueryString(mineRaw) === "true";

  let dateStartYmd: string | null = null;
  if (startRaw !== undefined && startRaw !== "") {
    assertValidYmd(startRaw);
    dateStartYmd = startRaw;
  }

  let dateEndYmd: string | null = null;
  if (endRaw !== undefined && endRaw !== "") {
    assertValidYmd(endRaw);
    dateEndYmd = endRaw;
  }

  const search = asNonEmptyString(searchRaw);

  return {
    dateStartYmd,
    dateEndYmd,
    search,
    onlyMine,
  };
};

export const parseCompetitionsListingQuery = (
  event: H3Event,
): CompetitionsListingQueryParsed => {
  return parseCompetitionsListingRawQuery(
    getQuery(event) as Record<string, unknown>,
  );
};
