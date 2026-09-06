import type { FindMemberRosterQueryInput } from "~~/application/ports/member-roster-query.port";
import type { Prisma } from "~~/generated/prisma/client";

export const excludeDeveloperFromRosterWhere = (): Prisma.archerWhereInput => {
  return {
    auth_user: {
      isNot: {
        roles: {
          some: {
            role: "developer",
          },
        },
      },
    },
  };
};

export const buildMemberRosterWhere = (
  input: FindMemberRosterQueryInput,
): Prisma.archerWhereInput => {
  const conditions: Prisma.archerWhereInput[] = [
    excludeDeveloperFromRosterWhere(),
  ];

  if (input.archivedOnly) {
    conditions.push({
      offboarded_at: { not: null },
    });
  } else {
    conditions.push({
      offboarded_at: null,
    });
  }

  const trimmedSearch = input.search?.trim();
  if (trimmedSearch) {
    conditions.push({
      OR: [
        {
          public_name: {
            contains: trimmedSearch,
            mode: "insensitive",
          },
        },
        {
          auth_user: {
            is: {
              email: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  if (input.status === "active") {
    conditions.push({
      auth_user_id: { not: null },
      auth_user: {
        is: {
          authenticated: true,
        },
      },
    });
  } else if (input.status === "invited") {
    conditions.push({
      auth_user_id: { not: null },
      auth_user: {
        is: {
          authenticated: false,
        },
      },
    });
  } else if (input.status === "shell") {
    conditions.push({
      OR: [{ auth_user_id: null }, { auth_user: { is: null } }],
      offboarded_at: null,
    });
  }

  if (input.role) {
    conditions.push({
      auth_user: {
        is: {
          roles: {
            some: {
              role: input.role,
            },
          },
        },
      },
    });
  }

  if (conditions.length === 1) {
    const archer = conditions[0];

    if (!archer) {
      throw new Error("Invalid query conditions");
    }

    return archer;
  }

  return {
    AND: conditions,
  };
};
