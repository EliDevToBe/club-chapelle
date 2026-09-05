import { describe, expect, it } from "vitest";
import { resolveLatestInvitationAt } from "~~/infrastructure/persistence/user/member-roster-query.invitation-at";
import {
  buildMemberRosterWhere,
  excludeDeveloperFromRosterWhere,
} from "~~/infrastructure/persistence/user/member-roster-query.where";

describe("buildMemberRosterWhere", () => {
  it("always excludes archers linked to a developer account and non-archived shells by default", () => {
    expect(buildMemberRosterWhere({})).toEqual({
      AND: [excludeDeveloperFromRosterWhere(), { offboarded_at: null }],
    });
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
        { offboarded_at: null },
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
        { offboarded_at: null },
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
        { offboarded_at: null },
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
        { offboarded_at: null },
        {
          OR: [{ auth_user_id: null }, { auth_user: { is: null } }],
          offboarded_at: null,
        },
      ],
    });
  });

  it("builds an archived-only filter", () => {
    expect(buildMemberRosterWhere({ archivedOnly: true })).toEqual({
      AND: [
        excludeDeveloperFromRosterWhere(),
        { offboarded_at: { not: null } },
      ],
    });
  });

  it("builds a role filter on linked users", () => {
    expect(buildMemberRosterWhere({ role: "manager" })).toEqual({
      AND: [
        excludeDeveloperFromRosterWhere(),
        { offboarded_at: null },
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
        { offboarded_at: null },
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

describe("resolveLatestInvitationAt", () => {
  const userCreatedAt = new Date("2026-01-10T09:00:00.000Z");
  const latestTokenAt = new Date("2026-09-05T08:00:00.000Z");

  it("uses the newest invitation token created_at", () => {
    expect(
      resolveLatestInvitationAt([{ created_at: latestTokenAt }], userCreatedAt),
    ).toBe(latestTokenAt);
  });

  it("falls back to the user created_at when no invitation token exists", () => {
    expect(resolveLatestInvitationAt([], userCreatedAt)).toBe(userCreatedAt);
  });
});
