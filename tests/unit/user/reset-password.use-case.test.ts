import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { PasswordResetPersistence } from "~~/application/ports/password-reset-persistence.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { ResetPassword } from "~~/application/user/reset-password.use-case";

describe("ResetPassword", () => {
  let users: UserRepository;
  let passwords: PasswordHasher;
  let jwt: JwtAuthService;
  let persistence: PasswordResetPersistence;

  const rowEligible = {
    id: "u1",
    email: "a@b.c",
    name: "Alex",
    authenticated: true,
    passwordHash: "argon-old",
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
      completeReset: vi.fn(),
    };
  });

  it("fails when the recovery JWT is invalid", async () => {
    jwt.verifyForgotPasswordToken = vi.fn().mockReturnValue(null);

    const handler = new ResetPassword(users, passwords, jwt, persistence);
    const result = await handler.reset({
      token: "bad",
      password: "Aa1!newpass",
    });

    expect(result).toEqual({ ok: false, reason: "Invalid or expired link" });
    expect(users.findForPasswordResetById).not.toHaveBeenCalled();
    expect(passwords.hash).not.toHaveBeenCalled();
    expect(persistence.completeReset).not.toHaveBeenCalled();
  });

  it("fails when the account is not eligible", async () => {
    users.findForPasswordResetById = vi.fn().mockResolvedValue({
      id: "u1",
      email: "a@b.c",
      name: null,
      authenticated: false,
      passwordHash: "hash",
    });
    jwt.verifyForgotPasswordToken = vi.fn().mockReturnValue("u1");

    const handler = new ResetPassword(users, passwords, jwt, persistence);
    const result = await handler.reset({
      token: "tok",
      password: "Aa1!newpass",
    });

    expect(result).toEqual({ ok: false, reason: "Invalid or expired link" });
    expect(passwords.hash).not.toHaveBeenCalled();
    expect(persistence.completeReset).not.toHaveBeenCalled();
  });

  it("fails when persistence does not apply both updates", async () => {
    users.findForPasswordResetById = vi.fn().mockResolvedValue(rowEligible);
    passwords.hash = vi.fn().mockResolvedValue("argon-new");
    jwt.verifyForgotPasswordToken = vi.fn().mockReturnValue("u1");
    persistence.completeReset = vi.fn().mockResolvedValue(false);

    const handler = new ResetPassword(users, passwords, jwt, persistence);
    const result = await handler.reset({
      token: "jwt-string",
      password: "Aa1!newpass",
    });

    expect(result).toEqual({ ok: false, reason: "Invalid or expired link" });
    expect(passwords.hash).toHaveBeenCalledWith("Aa1!newpass");
    expect(persistence.completeReset).toHaveBeenCalledWith({
      authUserId: "u1",
      tokenValue: "jwt-string",
      passwordHash: "argon-new",
    });
    expect(users.findById).not.toHaveBeenCalled();
  });

  it("returns session and tokens when reset succeeds", async () => {
    users.findById = vi.fn().mockResolvedValue(domainUser);
    users.findForPasswordResetById = vi.fn().mockResolvedValue(rowEligible);
    passwords.hash = vi.fn().mockResolvedValue("argon-new");
    jwt.verifyForgotPasswordToken = vi.fn().mockReturnValue("u1");
    persistence.completeReset = vi.fn().mockResolvedValue(true);

    const handler = new ResetPassword(users, passwords, jwt, persistence);
    const result = await handler.reset({
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
    expect(jwt.signAccess).toHaveBeenCalledWith("u1");
    expect(jwt.signRefresh).toHaveBeenCalledWith("u1");
    expect(users.findById).toHaveBeenCalledWith("u1");
  });
});
