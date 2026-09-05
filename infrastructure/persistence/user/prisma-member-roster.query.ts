import type {
  FindMemberRosterQueryInput,
  FindMemberRosterQueryResult,
  MemberRosterQuery,
  MemberRosterQueryRow,
} from "~~/application/ports/member-roster-query.port";
import { sortRolesByOrder } from "~~/domain/user/role";
import type {
  archer,
  auth_user,
  auth_user_role,
} from "~~/generated/prisma/client";
import { prismaClient } from "~~/infrastructure/persistence/prisma.client";
import { buildMemberRosterWhere } from "~~/infrastructure/persistence/user/member-roster-query.where";

type ArcherWithUser = archer & {
  auth_user: (auth_user & { roles: auth_user_role[] }) | null;
};

const archerInclude = {
  auth_user: {
    include: {
      roles: true,
    },
  },
} as const;

const toQueryRow = (row: ArcherWithUser): MemberRosterQueryRow => {
  return {
    archerId: row.id,
    publicName: row.public_name,
    authUserId: row.auth_user_id,
    offboardedAt: row.offboarded_at,
    user: row.auth_user
      ? {
          id: row.auth_user.id,
          email: row.auth_user.email,
          authenticated: row.auth_user.authenticated,
          roles: sortRolesByOrder(
            row.auth_user.roles.map((roleRow) => {
              return roleRow.role;
            }),
          ),
        }
      : null,
  };
};

export class PrismaMemberRosterQuery implements MemberRosterQuery {
  public findMatching = async (
    input: FindMemberRosterQueryInput,
  ): Promise<FindMemberRosterQueryResult> => {
    const rows = await prismaClient.archer.findMany({
      where: buildMemberRosterWhere(input),
      include: archerInclude,
      orderBy: {
        public_name: "asc",
      },
    });

    return {
      rows: rows.map(toQueryRow),
    };
  };
}
