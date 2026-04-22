import { describe, expect, it, vi } from "vitest";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { RequestForgotPassword } from "~~/application/user/request-forgot-password.use-case";

describe("RequestForgotPassword", () => {
  const options = {
    fromEmail: "noreply@example.com",
    fromName: "Club",
    templateId: "tpl-uuid",
    passwordResetOrigin: "https://app.example.com",
    sandbox: false,
  };

  it("does nothing when the user is unknown", async () => {
    const users: UserRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn().mockResolvedValue(null),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const tokens: TokenRepository = { issueToken: vi.fn() };
    const jwt: JwtAuthService = {
      signAccess: vi.fn(),
      signRefresh: vi.fn(),
      signForgotPasswordToken: vi.fn(),
      verifyAccess: vi.fn(),
      verifyRefresh: vi.fn(),
    };
    const mail: TransactionalMailPort = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn(),
    };

    const handler = new RequestForgotPassword(
      users,
      tokens,
      jwt,
      mail,
      options,
    );
    await handler.request({ email: "missing@example.com" });

    expect(jwt.signForgotPasswordToken).not.toHaveBeenCalled();
    expect(tokens.issueToken).not.toHaveBeenCalled();
    expect(mail.sendTemplateEmail).not.toHaveBeenCalled();
  });

  it("issues a token and sends mail when the user can log in with a password", async () => {
    const users: UserRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.c",
        name: "Alex",
        authenticated: true,
        passwordHash: "hash",
      }),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const tokens: TokenRepository = { issueToken: vi.fn() };
    const jwt: JwtAuthService = {
      signAccess: vi.fn(),
      signRefresh: vi.fn(),
      signForgotPasswordToken: vi.fn().mockReturnValue("jwt-token"),
      verifyAccess: vi.fn(),
      verifyRefresh: vi.fn(),
    };
    const mail: TransactionalMailPort = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn(),
    };

    const handler = new RequestForgotPassword(
      users,
      tokens,
      jwt,
      mail,
      options,
    );
    await handler.request({ email: "a@b.c" });

    expect(jwt.signForgotPasswordToken).toHaveBeenCalledWith("u1");
    expect(tokens.issueToken).toHaveBeenCalledWith(
      expect.objectContaining({
        authUserId: "u1",
        type: "forgot_password",
        tokenValue: "jwt-token",
        expiresAt: expect.any(Date),
      }),
    );
    expect(mail.sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: "tpl-uuid",
        variables: {
          user_name: "Alex",
          user_email: "a@b.c",
          recovery_link: "https://app.example.com/reset-password?t=jwt-token",
        },
        to: [{ email: "a@b.c", name: "Alex" }],
      }),
    );
  });

  it("skips when the account has no password", async () => {
    const users: UserRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.c",
        name: null,
        authenticated: true,
        passwordHash: null,
      }),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const tokens: TokenRepository = { issueToken: vi.fn() };
    const jwt: JwtAuthService = {
      signAccess: vi.fn(),
      signRefresh: vi.fn(),
      signForgotPasswordToken: vi.fn(),
      verifyAccess: vi.fn(),
      verifyRefresh: vi.fn(),
    };
    const mail: TransactionalMailPort = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn(),
    };

    const handler = new RequestForgotPassword(
      users,
      tokens,
      jwt,
      mail,
      options,
    );
    await handler.request({ email: "a@b.c" });

    expect(tokens.issueToken).not.toHaveBeenCalled();
    expect(mail.sendTemplateEmail).not.toHaveBeenCalled();
  });
});
