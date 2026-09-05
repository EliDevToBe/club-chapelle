import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { SetUserRole } from "~~/application/user/set-user-role.use-case";
import type { User } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

const createdAt = new Date("2026-01-01T00:00:00.000Z");

const makeUser = (
  overrides: Partial<User> & Pick<User, "id" | "roles">,
): User => {
  return {
    email: `${overrides.id}@example.com`,
    name: overrides.id,
    authenticated: true,
    createdAt,
    ...overrides,
  };
};

describe("SetUserRole", () => {
  let users: UserRepository;

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn(),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("replaces the role set with the chosen club role", async () => {
    const target = makeUser({
      id: "u-target",
      roles: ["member", "manager"],
    });
    const updated = makeUser({
      id: "u-target",
      roles: ["manager"],
    });
    users.findById = vi.fn().mockResolvedValue(target);
    users.update = vi.fn().mockResolvedValue(updated);

    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-target",
      actorUserId: "u-admin",
      actorRoles: ["admin"],
      role: "manager",
    });

    expect(result).toEqual({ ok: true, user: updated });
    expect(users.update).toHaveBeenCalledWith("u-target", {
      roles: ["manager"],
    });
    expect(users.findMany).not.toHaveBeenCalled();
  });

  it("rejects self-change", async () => {
    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-admin",
      actorUserId: "u-admin",
      actorRoles: ["admin"],
      role: "manager",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.user_role.self_change,
    });
    expect(users.findById).not.toHaveBeenCalled();
    expect(users.update).not.toHaveBeenCalled();
  });

  it("returns not_found when the target does not exist", async () => {
    users.findById = vi.fn().mockResolvedValue(null);
    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "missing",
      actorUserId: "u-admin",
      actorRoles: ["admin"],
      role: "member",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.common.not_found,
    });
    expect(users.update).not.toHaveBeenCalled();
  });

  it("rejects changing a developer account", async () => {
    users.findById = vi.fn().mockResolvedValue(
      makeUser({
        id: "u-dev",
        roles: ["developer"],
      }),
    );
    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-dev",
      actorUserId: "u-admin",
      actorRoles: ["admin"],
      role: "member",
    });

    expect(result).toEqual({ ok: false, reason: "developer_target" });
    expect(users.update).not.toHaveBeenCalled();
  });

  it("allows an Admin actor to promote another account to Admin", async () => {
    const target = makeUser({
      id: "u-member",
      roles: ["member"],
    });
    const updated = makeUser({
      id: "u-member",
      roles: ["admin"],
    });
    users.findById = vi.fn().mockResolvedValue(target);
    users.update = vi.fn().mockResolvedValue(updated);

    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-member",
      actorUserId: "u-admin",
      actorRoles: ["admin"],
      role: "admin",
    });

    expect(result).toEqual({ ok: true, user: updated });
    expect(users.update).toHaveBeenCalledWith("u-member", {
      roles: ["admin"],
    });
    expect(users.findMany).not.toHaveBeenCalled();
  });

  it("rejects an Admin actor demoting another Admin", async () => {
    users.findById = vi.fn().mockResolvedValue(
      makeUser({
        id: "u-other-admin",
        roles: ["admin", "member"],
      }),
    );
    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-other-admin",
      actorUserId: "u-admin",
      actorRoles: ["admin"],
      role: "manager",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.user_role.admin_target,
    });
    expect(users.update).not.toHaveBeenCalled();
  });

  it("allows a developer to demote an Admin when another Admin remains", async () => {
    const target = makeUser({
      id: "u-other-admin",
      roles: ["admin"],
    });
    const updated = makeUser({
      id: "u-other-admin",
      roles: ["member"],
    });
    users.findById = vi.fn().mockResolvedValue(target);
    users.findMany = vi
      .fn()
      .mockResolvedValue([
        target,
        makeUser({ id: "u-still-admin", roles: ["admin"] }),
      ]);
    users.update = vi.fn().mockResolvedValue(updated);

    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-other-admin",
      actorUserId: "u-dev",
      actorRoles: ["developer"],
      role: "member",
    });

    expect(result).toEqual({ ok: true, user: updated });
    expect(users.update).toHaveBeenCalledWith("u-other-admin", {
      roles: ["member"],
    });
  });

  it("rejects demoting the last Admin", async () => {
    const target = makeUser({
      id: "u-only-admin",
      roles: ["admin"],
    });
    users.findById = vi.fn().mockResolvedValue(target);
    users.findMany = vi.fn().mockResolvedValue([target]);

    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-only-admin",
      actorUserId: "u-dev",
      actorRoles: ["developer"],
      role: "manager",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.user_role.last_admin,
    });
    expect(users.update).not.toHaveBeenCalled();
  });

  it("rejects developer as the new role", async () => {
    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-target",
      actorUserId: "u-admin",
      actorRoles: ["admin"],
      role: "developer",
    });

    expect(result).toEqual({ ok: false, reason: "invalid_role" });
    expect(users.findById).not.toHaveBeenCalled();
    expect(users.update).not.toHaveBeenCalled();
  });

  it("returns not_found when update finds no user", async () => {
    users.findById = vi.fn().mockResolvedValue(
      makeUser({
        id: "u-target",
        roles: ["member"],
      }),
    );
    users.update = vi.fn().mockResolvedValue(null);

    const handler = new SetUserRole(users);
    const result = await handler.setRole({
      targetUserId: "u-target",
      actorUserId: "u-admin",
      actorRoles: ["admin"],
      role: "manager",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.common.not_found,
    });
  });
});
