import type { RoleEnum } from "~~/shared/db-enums";
import type { MemberRosterStatus } from "~~/shared/member/member-roster.dto";
import type { MemberRosterListQuery } from "~~/shared/member/member-roster-list.schema";

export type { MemberRosterListQuery };

export const MEMBER_ROSTER_MAX_LIMIT = 100;

export type MemberRosterRoleFilter = Extract<
  RoleEnum,
  "admin" | "manager" | "member"
>;

export type MemberRosterListQueryDto = MemberRosterListQuery & {
  status?: MemberRosterStatus;
  role?: MemberRosterRoleFilter;
};
