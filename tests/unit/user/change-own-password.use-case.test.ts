import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { ChangeOwnPassword } from "~~/application/user/change-own-password.use-case";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

describe("ChangeOwnPassword", () => {
  let users: UserRepository;
  let passwords: PasswordHasher;
  let tokens: TokenRepository;
  let jwt: JwtAuthService;
  let mail: TransactionalMailPort;

  const options = {
    fromEmail: "no-reply@club.test",
    fromName: "Arc18",
    templateId: "00000000-0000-4000-8000-000000000001",
    siteOrigin: "https://club.test",
  };

  const buildHandler = (): ChangeOwnPassword => {
    return new ChangeOwnPassword(users, passwords, tokens, jwt, mail, options);
  };

  beforeEach(() => {
    users = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findForPasswordResetById: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.c",
        name: "Alex",
        authenticated: true,
        passwordHash: "old-hash",
      }),
      findMany: vi.fn(),
      findManyForListing: vi.fn(),
      update: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.c",
        name: "Alex",
        roles: ["member"],
        authenticated: true,
        createdAt: new Date("2026-01-01"),
      }),
      delete: vi.fn(),
    };
    passwords = {
      verify: vi.fn().mockResolvedValue(true),
      hash: vi.fn().mockResolvedValue("new-hash"),
    };
    tokens = {
      issueToken: vi.fn().mockResolvedValue(undefined),
      findUnusedByUserAndType: vi.fn(),
      updateTokenValue: vi.fn(),
      markUsed: vi.fn(),
      revokeUnusedByUserAndType: vi.fn(),
    };
    jwt = {
      signForgotPasswordToken: vi.fn().mockReturnValue("recovery-jwt"),
      signAccess: vi.fn(),
      signRefresh: vi.fn(),
      signInvitationToken: vi.fn(),
      verifyForgotPasswordToken: vi.fn(),
      verifyInvitationToken: vi.fn(),
      verifyAccess: vi.fn(),
      verifyRefresh: vi.fn(),
    };
    mail = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("hashes the new password after verifying the current one", async () => {
    const handler = buildHandler();
    const result = await handler.change({
      userId: "u1",
      currentPassword: "Oldpass1!",
      newPassword: "Newpass1!",
    });

    expect(result).toEqual({ ok: true });
    expect(passwords.verify).toHaveBeenCalledWith("Oldpass1!", "old-hash");
    expect(users.update).toHaveBeenCalledWith("u1", {
      password: "new-hash",
      passwordChangedAt: expect.any(Date),
    });
  });

  it("sends the password-changed notice after a successful change", async () => {
    const handler = buildHandler();
    const result = await handler.change({
      userId: "u1",
      currentPassword: "Oldpass1!",
      newPassword: "Newpass1!",
    });

    expect(result).toEqual({ ok: true });
    expect(jwt.signForgotPasswordToken).toHaveBeenCalledWith("u1");
    expect(mail.sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [{ email: "a@b.c", name: "Alex" }],
      }),
    );
  });

  it("still succeeds when the password-changed notice fails", async () => {
    mail.sendTemplateEmail = vi.fn().mockRejectedValue(new Error("smtp"));
    const handler = buildHandler();
    const result = await handler.change({
      userId: "u1",
      currentPassword: "Oldpass1!",
      newPassword: "Newpass1!",
    });

    expect(result).toEqual({ ok: true });
    expect(users.update).toHaveBeenCalled();
  });

  it("rejects a wrong current password", async () => {
    passwords.verify = vi.fn().mockResolvedValue(false);
    const handler = buildHandler();
    const result = await handler.change({
      userId: "u1",
      currentPassword: "nope",
      newPassword: "Newpass1!",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.auth.invalid_credentials,
    });
    expect(users.update).not.toHaveBeenCalled();
    expect(mail.sendTemplateEmail).not.toHaveBeenCalled();
  });
});
