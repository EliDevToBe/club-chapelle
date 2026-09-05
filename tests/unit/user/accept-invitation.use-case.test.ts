import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AcceptInvitationPersistence } from "~~/application/ports/accept-invitation-persistence.port";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { AcceptInvitation } from "~~/application/user/accept-invitation.use-case";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("AcceptInvitation", () => {
  let users: UserRepository;
  let passwords: PasswordHasher;
  let jwt: JwtAuthService;
  let persistence: AcceptInvitationPersistence;

  const invitedRow = {
    id: "u1",
    email: "a@b.c",
    name: "Alex",
    authenticated: false,
    passwordHash: null,
  };

  const domainUser = {
    id: "u1",
    email: "a@b.c",
    name: "Alex",
    roles: ["member"] as const,
    authenticated: true,
    createdAt: new Date("2026-01-01"),
  };

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
    passwords = {
      hash: vi.fn(),
      verify: vi.fn(),
    };
    jwt = {
      signAccess: vi.fn().mockReturnValue("access-jwt"),
      signRefresh: vi.fn().mockReturnValue("refresh-jwt"),
      signForgotPasswordToken: vi.fn(),
      verifyForgotPasswordToken: vi.fn(),
      signInvitationToken: vi.fn(),
      verifyInvitationToken: vi.fn(),
      verifyAccess: vi.fn(),
      verifyRefresh: vi.fn(),
    };
    persistence = {
      completeInvitation: vi.fn(),
    };
  });

  it("fails when the invitation JWT is invalid", async () => {
    jwt.verifyInvitationToken = vi.fn().mockReturnValue(null);

    const handler = new AcceptInvitation(users, passwords, jwt, persistence);
    const result = await handler.accept({
      token: "bad",
      password: "Aa1!newpass",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.invalid_token,
    });
    expect(users.findForPasswordResetById).not.toHaveBeenCalled();
    expect(persistence.completeInvitation).not.toHaveBeenCalled();
  });

  it("fails when the account is already authenticated", async () => {
    jwt.verifyInvitationToken = vi.fn().mockReturnValue("u1");
    users.findForPasswordResetById = vi.fn().mockResolvedValue({
      ...invitedRow,
      authenticated: true,
      passwordHash: "hash",
    });

    const handler = new AcceptInvitation(users, passwords, jwt, persistence);
    const result = await handler.accept({
      token: "tok",
      password: "Aa1!newpass",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.invalid_token,
    });
    expect(passwords.hash).not.toHaveBeenCalled();
    expect(persistence.completeInvitation).not.toHaveBeenCalled();
  });

  it("returns session and tokens when accept succeeds", async () => {
    jwt.verifyInvitationToken = vi.fn().mockReturnValue("u1");
    users.findForPasswordResetById = vi.fn().mockResolvedValue(invitedRow);
    users.findById = vi.fn().mockResolvedValue(domainUser);
    passwords.hash = vi.fn().mockResolvedValue("argon-new");
    persistence.completeInvitation = vi.fn().mockResolvedValue(true);

    const handler = new AcceptInvitation(users, passwords, jwt, persistence);
    const result = await handler.accept({
      token: "jwt-string",
      password: "Aa1!newpass",
    });

    expect(result).toEqual({
      ok: true,
      accessToken: "access-jwt",
      refreshToken: "refresh-jwt",
      session: {
        id: "u1",
        name: "Alex",
        roles: ["member"],
      },
    });
    expect(persistence.completeInvitation).toHaveBeenCalledWith({
      authUserId: "u1",
      tokenValue: "jwt-string",
      passwordHash: "argon-new",
    });
  });
});
