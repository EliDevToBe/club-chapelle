import { getQuery, type H3Event } from "h3";
import { ApiError } from "~~/server/utils/api-error";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import {
  type MemberRosterListQuery,
  memberRosterListQuerySchema,
  normaliseMemberRosterListRawQuery,
} from "~~/shared/member/member-roster-list.schema";

export const parseMembersRosterListRawQuery = (
  query: Record<string, unknown>,
): MemberRosterListQuery => {
  const result = memberRosterListQuerySchema.safeParse(
    normaliseMemberRosterListRawQuery(query),
  );

  if (!result.success) {
    throw ApiError(API_ERROR_REASON.common.invalid_query);
  }

  return result.data;
};

export const parseMembersRosterListQuery = (
  event: H3Event,
): MemberRosterListQuery => {
  return parseMembersRosterListRawQuery(
    getQuery(event) as Record<string, unknown>,
  );
};
