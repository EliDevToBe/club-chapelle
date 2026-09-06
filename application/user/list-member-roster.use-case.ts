import type {
  FindMemberRosterQueryInput,
  MemberRosterQuery,
  MemberRosterQueryRow,
} from "~~/application/ports/member-roster-query.port";
import type {
  MemberRosterItem,
  MemberRosterStatus,
} from "~~/domain/user/member-roster-item";
import { highestRoleRank, sortRolesByOrder } from "~~/domain/user/role";
import type { MemberRosterListQuery } from "~~/shared/member/member-roster-list.schema";

export type FindMemberRosterPageResult = {
  items: MemberRosterItem[];
  total: number;
};

/**
 * Builds an archer-centric roster: each archer is one row (linked active/invited
 * or unlinked shell). Orphan auth users without an archer are omitted.
 */
export class ListMemberRoster {
  constructor(private readonly rosterQuery: MemberRosterQuery) {}

  public findPage = async (
    query: MemberRosterListQuery,
  ): Promise<FindMemberRosterPageResult> => {
    const filterInput: FindMemberRosterQueryInput = {
      search: query.search,
      status: query.status,
      role: query.role,
      archivedOnly: query.archived_only,
    };

    const { rows } = await this.rosterQuery.findMatching(filterInput);
    const items = rows.map(toMemberRosterItem).sort(compareRosterItems);
    const total = items.length;
    const pageItems = items.slice(query.offset, query.offset + query.limit);

    return {
      items: pageItems,
      total,
    };
  };
}

const toMemberRosterItem = (row: MemberRosterQueryRow): MemberRosterItem => {
  if (row.offboardedAt) {
    return {
      status: "archived",
      userId: null,
      archerId: row.archerId,
      email: null,
      publicName: row.publicName,
      roles: [],
      invitedAt: null,
      offboardedAt: row.offboardedAt,
    };
  }

  if (row.authUserId && row.user) {
    const isActive = row.user.authenticated;
    return {
      status: isActive ? "active" : "invited",
      userId: row.user.id,
      archerId: row.archerId,
      email: row.user.email,
      publicName: row.publicName,
      roles: sortRolesByOrder(row.user.roles),
      invitedAt: isActive ? null : row.user.latestInvitationAt,
      offboardedAt: null,
    };
  }

  return {
    status: "shell",
    userId: null,
    archerId: row.archerId,
    email: null,
    publicName: row.publicName,
    roles: [],
    invitedAt: null,
    offboardedAt: null,
  };
};

const rosterStatusOrder: Record<MemberRosterStatus, number> = {
  active: 0,
  invited: 1,
  shell: 2,
  archived: 3,
};

const compareRosterItems = (
  left: MemberRosterItem,
  right: MemberRosterItem,
): number => {
  const statusDelta =
    rosterStatusOrder[left.status] - rosterStatusOrder[right.status];
  if (statusDelta !== 0) {
    return statusDelta;
  }

  const rankDelta = highestRoleRank(right.roles) - highestRoleRank(left.roles);
  if (rankDelta !== 0) {
    return rankDelta;
  }

  return left.publicName.localeCompare(right.publicName, "fr");
};

export { compareRosterItems, toMemberRosterItem };
