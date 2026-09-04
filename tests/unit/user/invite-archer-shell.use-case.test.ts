import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InviteMemberPersistence } from "~~/application/ports/invite-member-persistence.port";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import { InviteArcherShell } from "~~/application/user/invite-archer-shell.use-case";
import type { User } from "~~/domain/user/user";

const boundUser: User = {
  id: "u-bound",
  email: "shell@club.test",
  name: "Shell Archer",
  roles: ["member"],
  authenticated: false,
  createdAt: new Date("2026-09-01"),
};

describe("InviteArcherShell", () => {
  let persistence: InviteMemberPersistence;
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
    persistence = {
      createInvitedMember: vi.fn(),
      bindInvitedMemberToArcher: vi.fn().mockResolvedValue({
        ok: true,
        user: boundUser,
        resent: false,
      }),
    };
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

  it("binds an archer shell, issues a token, and sends mail", async () => {
    const handler = new InviteArcherShell(
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      archerId: "  a-shell  ",
      email: "Shell@Club.Test",
      publicName: "  Shell Archer  ",
    });

    expect(result).toEqual({
      ok: true,
      user: boundUser,
      mailSent: true,
      resent: false,
    });
    expect(persistence.bindInvitedMemberToArcher).toHaveBeenCalledWith({
      archerId: "a-shell",
      email: "shell@club.test",
      name: "Shell Archer",
    });
    expect(tokens.issueToken).toHaveBeenCalledWith(
      expect.objectContaining({
        authUserId: "u-bound",
        type: "invitation",
        tokenValue: "invite-jwt",
      }),
    );
    expect(mail.sendTemplateEmail).toHaveBeenCalled();
  });

  it("maps persistence failures", async () => {
    persistence.bindInvitedMemberToArcher = vi.fn().mockResolvedValue({
      ok: false,
      reason: "archer_already_linked",
    });
    const handler = new InviteArcherShell(
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      archerId: "a-shell",
      email: "shell@club.test",
      publicName: "Shell Archer",
    });

    expect(result).toEqual({
      ok: false,
      reason: "archer_already_linked",
    });
    expect(tokens.issueToken).not.toHaveBeenCalled();
  });

  it("rejects empty input", async () => {
    const handler = new InviteArcherShell(
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      archerId: "",
      email: "shell@club.test",
      publicName: "Shell",
    });

    expect(result).toEqual({ ok: false, reason: "invalid_input" });
    expect(persistence.bindInvitedMemberToArcher).not.toHaveBeenCalled();
  });
});
