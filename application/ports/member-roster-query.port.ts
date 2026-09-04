import type { MemberRosterStatus } from "~~/domain/user/member-roster-item";
import type { RoleEnum } from "~~/shared/db-enums";
import type { MemberRosterRoleFilter } from "~~/shared/member/member-roster-list.dto";

export type MemberRosterQueryRow = {
  archerId: string;
  publicName: string;
  authUserId: string | null;
  user: {
    id: string;
    email: string;
    authenticated: boolean;
    roles: RoleEnum[];
  } | null;
};

export type FindMemberRosterQueryInput = {
  search?: string;
  status?: MemberRosterStatus;
  role?: MemberRosterRoleFilter;
};

export type FindMemberRosterQueryResult = {
  rows: MemberRosterQueryRow[];
};

export interface MemberRosterQuery {
  findMatching: (
    input: FindMemberRosterQueryInput,
  ) => Promise<FindMemberRosterQueryResult>;
}
