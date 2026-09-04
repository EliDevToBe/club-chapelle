import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { ListMemberRoster } from "~~/application/user/list-member-roster.use-case";
import type { Archer } from "~~/domain/archer/archer";
import type { User } from "~~/domain/user/user";

const activeUser: User = {
  id: "u-active",
  email: "active@club.test",
  name: "Active",
  roles: ["admin", "member"],
  authenticated: true,
  createdAt: new Date("2026-01-01"),
};

const invitedUser: User = {
  id: "u-invited",
  email: "invited@club.test",
  name: "Invited",
  roles: ["member"],
  authenticated: false,
  createdAt: new Date("2026-02-01"),
};

const linkedActive: Archer = {
  id: "a-active",
  publicName: "Robin H.",
  authUserId: "u-active",
  createdAt: new Date("2026-01-01"),
  offboardedAt: null,
};

const linkedInvited: Archer = {
  id: "a-invited",
  publicName: "Pat Pending",
  authUserId: "u-invited",
  createdAt: new Date("2026-02-01"),
  offboardedAt: null,
};

const shell: Archer = {
  id: "a-shell",
  publicName: "Shell Archer",
  authUserId: null,
  createdAt: new Date("2026-03-01"),
  offboardedAt: null,
};

describe("ListMemberRoster", () => {
  let users: UserRepository;
  let archers: ArcherRepository;

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn(),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn().mockResolvedValue([activeUser, invitedUser]),
      update: vi.fn(),
      delete: vi.fn(),
    };
    archers = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi
        .fn()
        .mockResolvedValue([linkedActive, linkedInvited, shell]),
      findPage: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("returns active, invited, and shell rows sorted by status then role then name", async () => {
    const handler = new ListMemberRoster(users, archers);
    const items = await handler.findMany();

    expect(items).toEqual([
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
    archers.findMany = vi.fn().mockResolvedValue([
      {
        ...linkedActive,
        authUserId: "missing-user",
      },
    ]);
    users.findMany = vi.fn().mockResolvedValue([]);

    const handler = new ListMemberRoster(users, archers);
    const items = await handler.findMany();

    expect(items).toEqual([
      {
        status: "shell",
        userId: null,
        archerId: "a-active",
        email: null,
        publicName: "Robin H.",
        roles: [],
      },
    ]);
  });
});
