import { z } from "zod";
import { MEMBER_ROSTER_MAX_LIMIT } from "~~/shared/member/member-roster-list.dto";
import { createPaginatedListQuerySchema } from "~~/shared/schemas/paginated-list-query.schema";
import {
  optionalIntQueryParam,
  trimmedOptionalQueryString,
} from "~~/shared/utils/query-params";

const memberRosterStatusSchema = z.enum(["active", "invited", "shell"]);

const memberRosterRoleFilterSchema = z.enum(["admin", "manager", "member"]);

export const memberRosterListQuerySchema = createPaginatedListQuerySchema({
  maxLimit: MEMBER_ROSTER_MAX_LIMIT,
}).extend({
  limit: z.number().int().min(1).max(MEMBER_ROSTER_MAX_LIMIT),
  status: memberRosterStatusSchema.optional(),
  role: memberRosterRoleFilterSchema.optional(),
});

export type MemberRosterListQuery = z.infer<typeof memberRosterListQuerySchema>;

export type MemberRosterListRawNormalised = {
  limit: number | undefined;
  offset: number | undefined;
  search: string | undefined;
  status: string | undefined;
  role: string | undefined;
};

export const normaliseMemberRosterListRawQuery = (
  query: Record<string, unknown>,
): MemberRosterListRawNormalised => {
  return {
    limit: optionalIntQueryParam(query.limit),
    offset: optionalIntQueryParam(query.offset),
    search: trimmedOptionalQueryString(query.search),
    status: trimmedOptionalQueryString(query.status),
    role: trimmedOptionalQueryString(query.role),
  };
};
