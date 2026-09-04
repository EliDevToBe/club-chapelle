import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type {
  MemberRosterItem,
  MemberRosterStatus,
} from "~~/domain/user/member-roster-item";
import { highestRoleRank, sortRolesByOrder } from "~~/domain/user/role";
import type { User } from "~~/domain/user/user";

/**
 * Builds an archer-centric roster: each archer is one row (linked active/invited
 * or unlinked shell). Orphan auth users without an archer are omitted.
 */
export class ListMemberRoster {
  constructor(
    private readonly users: UserRepository,
    private readonly archers: ArcherRepository,
  ) {}

  public findMany = async (): Promise<MemberRosterItem[]> => {
    const [userRows, archerRows] = await Promise.all([
      this.users.findMany(),
      this.archers.findMany(),
    ]);

    const usersById = new Map<string, User>();
    for (const user of userRows) {
      usersById.set(user.id, user);
    }

    const items: MemberRosterItem[] = archerRows.map((archer) => {
      if (archer.authUserId) {
        const linked = usersById.get(archer.authUserId);
        if (linked) {
          return {
            status: linked.authenticated ? "active" : "invited",
            userId: linked.id,
            archerId: archer.id,
            email: linked.email,
            publicName: archer.publicName,
            roles: sortRolesByOrder(linked.roles),
          };
        }
      }

      return {
        status: "shell",
        userId: null,
        archerId: archer.id,
        email: null,
        publicName: archer.publicName,
        roles: [],
      };
    });

    return items.sort(compareRosterItems);
  };
}

const rosterStatusOrder: Record<MemberRosterStatus, number> = {
  active: 0,
  invited: 1,
  shell: 2,
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
