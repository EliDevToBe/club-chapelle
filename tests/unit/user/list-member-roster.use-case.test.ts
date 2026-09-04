import { describe, expect, it, vi } from "vitest";
import type {
  MemberRosterQuery,
  MemberRosterQueryRow,
} from "~~/application/ports/member-roster-query.port";
import { ListMemberRoster } from "~~/application/user/list-member-roster.use-case";

const activeRow: MemberRosterQueryRow = {
  archerId: "a-active",
  publicName: "Robin H.",
  authUserId: "u-active",
  user: {
    id: "u-active",
    email: "active@club.test",
    authenticated: true,
    roles: ["admin", "member"],
  },
};

const invitedRow: MemberRosterQueryRow = {
  archerId: "a-invited",
  publicName: "Pat Pending",
  authUserId: "u-invited",
  user: {
    id: "u-invited",
    email: "invited@club.test",
    authenticated: false,
    roles: ["member"],
  },
};

const shellRow: MemberRosterQueryRow = {
  archerId: "a-shell",
  publicName: "Shell Archer",
  authUserId: null,
  user: null,
};

const brokenLinkRow: MemberRosterQueryRow = {
  archerId: "a-broken",
  publicName: "Broken Link",
  authUserId: "missing-user",
  user: null,
};

describe("ListMemberRoster", () => {
  it("returns active, invited, and shell rows sorted by status then role then name", async () => {
    const rosterQuery: MemberRosterQuery = {
      findMatching: vi.fn().mockResolvedValue({
        rows: [shellRow, invitedRow, activeRow],
      }),
    };

    const handler = new ListMemberRoster(rosterQuery);
    const page = await handler.findPage({
      limit: 10,
      offset: 0,
    });

    expect(rosterQuery.findMatching).toHaveBeenCalledWith({});
    expect(page.total).toBe(3);
    expect(page.items).toEqual([
      {
        status: "active",
        userId: "u-active",
        archerId: "a-active",
        email: "active@club.test",
        publicName: "Robin H.",
        roles: ["member", "admin"],
      },
      {
        status: "invited",
        userId: "u-invited",
        archerId: "a-invited",
        email: "invited@club.test",
        publicName: "Pat Pending",
        roles: ["member"],
      },
      {
        status: "shell",
        userId: null,
        archerId: "a-shell",
        email: null,
        publicName: "Shell Archer",
        roles: [],
      },
    ]);
  });

  it("treats a broken auth_user_id link as a shell", async () => {
    const rosterQuery: MemberRosterQuery = {
      findMatching: vi.fn().mockResolvedValue({
        rows: [brokenLinkRow],
      }),
    };

    const handler = new ListMemberRoster(rosterQuery);
    const page = await handler.findPage({
      limit: 10,
      offset: 0,
    });

    expect(page.items).toEqual([
      {
        status: "shell",
        userId: null,
        archerId: "a-broken",
        email: null,
        publicName: "Broken Link",
        roles: [],
      },
    ]);
  });

  it("passes search, status, and role filters to the query port", async () => {
    const rosterQuery: MemberRosterQuery = {
      findMatching: vi.fn().mockResolvedValue({
        rows: [activeRow],
      }),
    };

    const handler = new ListMemberRoster(rosterQuery);
    await handler.findPage({
      limit: 10,
      offset: 0,
      search: "robin",
      status: "active",
      role: "admin",
    });

    expect(rosterQuery.findMatching).toHaveBeenCalledWith({
      search: "robin",
      status: "active",
      role: "admin",
    });
  });

  it("slices the sorted roster using limit and offset", async () => {
    const rosterQuery: MemberRosterQuery = {
      findMatching: vi.fn().mockResolvedValue({
        rows: [activeRow, invitedRow, shellRow],
      }),
    };

    const handler = new ListMemberRoster(rosterQuery);
    const page = await handler.findPage({
      limit: 1,
      offset: 1,
    });

    expect(page.total).toBe(3);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.status).toBe("invited");
  });
});
