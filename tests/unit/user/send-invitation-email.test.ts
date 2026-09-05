import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import { SendInvitationEmail } from "~~/application/user/send-invitation-email";
import type { User } from "~~/domain/user/user";

const invitedUser: User = {
  id: "u-new",
  email: "new@club.test",
  name: "Alex Archer",
  roles: ["member"],
  authenticated: false,
  createdAt: new Date("2026-09-01"),
};

describe("SendInvitationEmail", () => {
  let tokens: TokenRepository;
  let jwt: JwtAuthService;
  let mail: TransactionalMailPort;

  const options = {
    fromEmail: "noreply@example.com",
    fromName: "Club",
    templateId: "template-mail-placeholder",
    inviteOrigin: "https://app.example.com",
  };

  beforeEach(() => {
    tokens = { issueToken: vi.fn() };
    jwt = {
      signAccess: vi.fn(),
      signRefresh: vi.fn(),
      signForgotPasswordToken: vi.fn(),
      verifyForgotPasswordToken: vi.fn(),
      signInvitationToken: vi.fn().mockReturnValue("invite-jwt"),
      verifyInvitationToken: vi.fn(),
      verifyAccess: vi.fn(),
      verifyRefresh: vi.fn(),
    };
    mail = {
      sendTransactionalEmail: vi.fn(),
      sendTemplateEmail: vi.fn(),
    };
  });

  it("issues a token and sends the invitation template", async () => {
    const handler = new SendInvitationEmail(tokens, jwt, mail, options);
    const result = await handler.send({ user: invitedUser, resent: false });

    expect(result).toEqual({
      user: invitedUser,
      mailSent: true,
      resent: false,
    });
    expect(jwt.signInvitationToken).toHaveBeenCalledWith("u-new");
    expect(tokens.issueToken).toHaveBeenCalledWith(
      expect.objectContaining({
        authUserId: "u-new",
        type: "invitation",
        tokenValue: "invite-jwt",
        expiresAt: expect.any(Date),
      }),
    );
    expect(mail.sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: "template-mail-placeholder",
        variables: {
          user_name: "Alex Archer",
          user_email: "new@club.test",
          invite_link: "https://app.example.com/accept-invite?t=invite-jwt",
          privacy_policy_url: "https://app.example.com/privacy-policy",
        },
      }),
    );
  });

  it("uses the Archer·ère fallback when the user has no name", async () => {
    const handler = new SendInvitationEmail(tokens, jwt, mail, options);
    await handler.send({
      user: { ...invitedUser, name: null },
      resent: true,
    });

    expect(mail.sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [{ email: "new@club.test", name: "Archer·ère" }],
        variables: expect.objectContaining({
          user_name: "Archer·ère",
        }),
      }),
    );
  });

  it("keeps the token when mail delivery fails", async () => {
    mail.sendTemplateEmail = vi.fn().mockRejectedValue(new Error("smtp"));
    const handler = new SendInvitationEmail(tokens, jwt, mail, options);
    const result = await handler.send({ user: invitedUser, resent: false });

    expect(result).toEqual({
      user: invitedUser,
      mailSent: false,
      resent: false,
    });
    expect(tokens.issueToken).toHaveBeenCalled();
  });

  it("skips mail when the invite origin is invalid", async () => {
    const handler = new SendInvitationEmail(tokens, jwt, mail, {
      ...options,
      inviteOrigin: "not-a-valid-origin",
    });
    const result = await handler.send({ user: invitedUser, resent: false });

    expect(result).toEqual({
      user: invitedUser,
      mailSent: false,
      resent: false,
    });
    expect(tokens.issueToken).toHaveBeenCalled();
    expect(mail.sendTemplateEmail).not.toHaveBeenCalled();
  });
});
