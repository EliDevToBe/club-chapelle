import { describe, expect, it } from "vitest";
import {
  buildMemberRosterWhere,
  excludeDeveloperFromRosterWhere,
} from "~~/infrastructure/persistence/user/member-roster-query.where";

describe("buildMemberRosterWhere", () => {
  it("always excludes archers linked to a developer account", () => {
    expect(buildMemberRosterWhere({})).toEqual(
      excludeDeveloperFromRosterWhere(),
    );
    expect(excludeDeveloperFromRosterWhere()).toEqual({
      auth_user: {
        isNot: {
          roles: {
            some: {
              role: "developer",
            },
          },
        },
      },
    });
  });

  it("builds a case-insensitive search filter on public name and email", () => {
    expect(buildMemberRosterWhere({ search: "robin" })).toEqual({
      AND: [
        excludeDeveloperFromRosterWhere(),
        {
          OR: [
            {
              public_name: {
                contains: "robin",
                mode: "insensitive",
              },
            },
            {
              auth_user: {
                is: {
                  email: {
                    contains: "robin",
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        },
      ],
    });
  });

  it("builds an active status filter", () => {
    expect(buildMemberRosterWhere({ status: "active" })).toEqual({
      AND: [
        excludeDeveloperFromRosterWhere(),
        {
          auth_user_id: { not: null },
          auth_user: {
            is: {
              authenticated: true,
            },
          },
        },
      ],
    });
  });

  it("builds an invited status filter", () => {
    expect(buildMemberRosterWhere({ status: "invited" })).toEqual({
      AND: [
        excludeDeveloperFromRosterWhere(),
        {
          auth_user_id: { not: null },
          auth_user: {
            is: {
              authenticated: false,
            },
          },
        },
      ],
    });
  });

  it("builds a shell status filter", () => {
    expect(buildMemberRosterWhere({ status: "shell" })).toEqual({
      AND: [
        excludeDeveloperFromRosterWhere(),
        {
          OR: [{ auth_user_id: null }, { auth_user: { is: null } }],
        },
      ],
    });
  });

  it("builds a role filter on linked users", () => {
    expect(buildMemberRosterWhere({ role: "manager" })).toEqual({
      AND: [
        excludeDeveloperFromRosterWhere(),
        {
          auth_user: {
            is: {
              roles: {
                some: {
                  role: "manager",
                },
              },
            },
          },
        },
      ],
    });
  });

  it("combines multiple filters with AND", () => {
    expect(
      buildMemberRosterWhere({
        search: "alice",
        status: "active",
        role: "admin",
      }),
    ).toEqual({
      AND: [
        excludeDeveloperFromRosterWhere(),
        {
          OR: [
            {
              public_name: {
                contains: "alice",
                mode: "insensitive",
              },
            },
            {
              auth_user: {
                is: {
                  email: {
                    contains: "alice",
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        },
        {
          auth_user_id: { not: null },
          auth_user: {
            is: {
              authenticated: true,
            },
          },
        },
        {
          auth_user: {
            is: {
              roles: {
                some: {
                  role: "admin",
                },
              },
            },
          },
        },
      ],
    });
  });
});
