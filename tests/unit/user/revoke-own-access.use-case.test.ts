import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { RevokeMemberAccessPersistence } from "~~/application/ports/revoke-member-access-persistence.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { RevokeOwnAccess } from "~~/application/user/revoke-own-access.use-case";
import type { User } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("RevokeOwnAccess", () => {
  let users: UserRepository;
  let passwords: PasswordHasher;
  let persistence: RevokeMemberAccessPersistence;

  const member: User = {
    id: "u1",
    email: "a@b.c",
    name: "Alex",
    roles: ["member"],
    authenticated: true,
    createdAt: new Date("2026-01-01"),
  };

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(member),
      findByEmailWithPasswordHash: vi.fn(),
      findForPasswordResetById: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.c",
        name: "Alex",
        authenticated: true,
        passwordHash: "hash",
      }),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    passwords = {
      verify: vi.fn().mockResolvedValue(true),
      hash: vi.fn(),
    };
    persistence = {
      revokeAccess: vi.fn().mockResolvedValue(true),
    };
  });

  it("revokes after a valid password", async () => {
    const handler = new RevokeOwnAccess(users, passwords, persistence);
    const result = await handler.revoke({
      userId: "u1",
      currentPassword: "Secret1!",
    });

    expect(result).toEqual({ ok: true });
    expect(persistence.revokeAccess).toHaveBeenCalledWith("u1");
  });

  it("rejects a wrong password", async () => {
    passwords.verify = vi.fn().mockResolvedValue(false);
    const handler = new RevokeOwnAccess(users, passwords, persistence);
    const result = await handler.revoke({
      userId: "u1",
      currentPassword: "nope",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.invalid_credentials,
    });
    expect(persistence.revokeAccess).not.toHaveBeenCalled();
  });

  it("rejects the last admin", async () => {
    const admin: User = { ...member, roles: ["admin"] };
    users.findById = vi.fn().mockResolvedValue(admin);
    users.findManyForListing = vi.fn().mockResolvedValue([admin]);
    const handler = new RevokeOwnAccess(users, passwords, persistence);
    const result = await handler.revoke({
      userId: "u1",
      currentPassword: "Secret1!",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.user_role.last_admin,
    });
    expect(users.findManyForListing).toHaveBeenCalledWith({ roles: ["admin"] });
    expect(persistence.revokeAccess).not.toHaveBeenCalled();
  });
});
