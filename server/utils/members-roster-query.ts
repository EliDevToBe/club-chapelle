import { createError, getQuery, type H3Event } from "h3";
import {
  type MemberRosterListQuery,
  memberRosterListQuerySchema,
  normaliseMemberRosterListRawQuery,
} from "~~/shared/member/member-roster-list.schema";
import { formatZodValidationError } from "~~/shared/utils/format-zod-error";

export const parseMembersRosterListRawQuery = (
  query: Record<string, unknown>,
): MemberRosterListQuery => {
  const result = memberRosterListQuerySchema.safeParse(
    normaliseMemberRosterListRawQuery(query),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: formatZodValidationError(result.error, "Invalid query"),
    });
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
