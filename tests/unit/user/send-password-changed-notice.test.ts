import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import { SendPasswordChangedNotice } from "~~/application/user/send-password-changed-notice";

describe("SendPasswordChangedNotice", () => {
  let mail: TransactionalMailPort;
  let jwt: JwtAuthService;
  let tokens: TokenRepository;

  const templateId = "00000000-0000-4000-8000-000000000001";
  const options = {
    fromEmail: "no-reply@club.test",
    fromName: "Arc18",
    templateId,
    siteOrigin: "https://club.test",
  };

  beforeEach(() => {
    mail = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn().mockResolvedValue(undefined),
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
    tokens = {
      issueToken: vi.fn().mockResolvedValue(undefined),
      findUnusedByUserAndType: vi.fn(),
      updateTokenValue: vi.fn(),
      markUsed: vi.fn(),
      revokeUnusedByUserAndType: vi.fn(),
    };
  });

  it("issues a recovery token and sends a template email with the reset link", async () => {
    const notice = new SendPasswordChangedNotice(mail, jwt, tokens, options);
    await notice.send({ userId: "u1", email: "a@b.c", name: "Alex" });

    expect(jwt.signForgotPasswordToken).toHaveBeenCalledWith("u1");
    expect(tokens.issueToken).toHaveBeenCalledWith({
      authUserId: "u1",
      type: "forgot_password",
      tokenValue: "recovery-jwt",
      expiresAt: expect.any(Date),
    });
    expect(mail.sendTemplateEmail).toHaveBeenCalledWith({
      templateId,
      variables: {
        user_name: "Alex",
        user_email: "a@b.c",
        recovery_link: "https://club.test/reset-password?t=recovery-jwt",
        privacy_policy_url: "https://club.test/privacy-policy",
      },
      to: [{ email: "a@b.c", name: "Alex" }],
      from: { email: "no-reply@club.test", name: "Arc18" },
    });
  });

  it("falls back to the generic display name when the name is missing", async () => {
    const notice = new SendPasswordChangedNotice(mail, jwt, tokens, options);
    await notice.send({ userId: "u1", email: "a@b.c", name: null });

    expect(mail.sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          user_name: "Archer·ère",
        }),
        to: [{ email: "a@b.c", name: "Archer·ère" }],
      }),
    );
  });

  it("still sends with empty links when the site origin is invalid", async () => {
    const notice = new SendPasswordChangedNotice(mail, jwt, tokens, {
      ...options,
      siteOrigin: "not-a-valid-origin",
    });
    await notice.send({ userId: "u1", email: "a@b.c", name: "Alex" });

    expect(mail.sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          user_name: "Alex",
          user_email: "a@b.c",
          recovery_link: "",
          privacy_policy_url: "",
        },
      }),
    );
  });

  it("swallows mail delivery failures", async () => {
    mail.sendTemplateEmail = vi.fn().mockRejectedValue(new Error("smtp"));
    const notice = new SendPasswordChangedNotice(mail, jwt, tokens, options);

    await expect(
      notice.send({ userId: "u1", email: "a@b.c", name: "Alex" }),
    ).resolves.toBeUndefined();
  });

  it("skips silently when mail is not configured", async () => {
    const notice = new SendPasswordChangedNotice(null, jwt, tokens, options);

    await expect(
      notice.send({ userId: "u1", email: "a@b.c", name: "Alex" }),
    ).resolves.toBeUndefined();
    expect(mail.sendTemplateEmail).not.toHaveBeenCalled();
    expect(tokens.issueToken).not.toHaveBeenCalled();
  });
});
