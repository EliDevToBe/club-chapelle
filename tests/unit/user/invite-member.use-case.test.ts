import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ArcherRepository } from "~~/application/ports/archer-repository.port";
import type { InviteMemberPersistence } from "~~/application/ports/invite-member-persistence.port";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { InviteMember } from "~~/application/user/invite-member.use-case";
import type { User } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";

const invitedUser: User = {
  id: "u-new",
  email: "new@club.test",
  name: "Alex Archer",
  roles: ["member"],
  authenticated: false,
  createdAt: new Date("2026-09-01"),
};

const existingInvited: User = {
  id: "u-pending",
  email: "pending@club.test",
  name: "Pat Pending",
  roles: ["member"],
  authenticated: false,
  createdAt: new Date("2026-08-01"),
};

describe("InviteMember", () => {
  let users: UserRepository;
  let archers: ArcherRepository;
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
    users = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmailWithPasswordHash: vi.fn(),
      findByEmailForPasswordReset: vi.fn().mockResolvedValue(null),
      findForPasswordResetById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    archers = {
      create: vi.fn(),
      findById: vi.fn(),
      findByPublicName: vi.fn().mockResolvedValue(null),
      findMany: vi.fn(),
      findPage: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    persistence = {
      createInvitedMember: vi.fn().mockResolvedValue({
        ok: true,
        user: invitedUser,
      }),
      bindInvitedMemberToArcher: vi.fn(),
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

  it("creates a user and archer, issues a token, and sends mail", async () => {
    const handler = new InviteMember(
      users,
      archers,
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      name: "  Alex Archer  ",
      email: "New@Club.Test",
    });

    expect(result).toEqual({
      ok: true,
      user: invitedUser,
      mailSent: true,
      resent: false,
    });
    expect(persistence.createInvitedMember).toHaveBeenCalledWith({
      name: "Alex Archer",
      email: "new@club.test",
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

  it("rejects when the account is already active", async () => {
    users.findByEmailForPasswordReset = vi.fn().mockResolvedValue({
      id: "u-active",
      email: "active@club.test",
      name: "Active",
      authenticated: true,
      passwordHash: "hash",
    });

    const handler = new InviteMember(
      users,
      archers,
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      name: "Active",
      email: "active@club.test",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.invitation.account_already_active,
    });
    expect(persistence.createInvitedMember).not.toHaveBeenCalled();
    expect(tokens.issueToken).not.toHaveBeenCalled();
  });

  it("resends when the user is already invited and allowResent is true", async () => {
    users.findByEmailForPasswordReset = vi.fn().mockResolvedValue({
      id: existingInvited.id,
      email: existingInvited.email,
      name: existingInvited.name,
      authenticated: false,
      passwordHash: null,
    });
    users.findById = vi.fn().mockResolvedValue(existingInvited);

    const handler = new InviteMember(
      users,
      archers,
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      name: "Ignored Name",
      email: existingInvited.email,
      allowResent: true,
    });

    expect(result).toEqual({
      ok: true,
      user: existingInvited,
      mailSent: true,
      resent: true,
    });
    expect(persistence.createInvitedMember).not.toHaveBeenCalled();
    expect(jwt.signInvitationToken).toHaveBeenCalledWith(existingInvited.id);
  });

  it("rejects a pending invite when allowResent is false", async () => {
    users.findByEmailForPasswordReset = vi.fn().mockResolvedValue({
      id: existingInvited.id,
      email: existingInvited.email,
      name: existingInvited.name,
      authenticated: false,
      passwordHash: null,
    });

    const handler = new InviteMember(
      users,
      archers,
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      name: "Ignored Name",
      email: existingInvited.email,
      allowResent: false,
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.invitation.account_already_invited,
    });
    expect(persistence.createInvitedMember).not.toHaveBeenCalled();
    expect(tokens.issueToken).not.toHaveBeenCalled();
  });

  it("rejects when the public name is already taken", async () => {
    archers.findByPublicName = vi.fn().mockResolvedValue({
      id: "a-taken",
      publicName: "Taken Name",
      authUserId: null,
      createdAt: new Date("2026-01-01"),
      offboardedAt: null,
    });

    const handler = new InviteMember(
      users,
      archers,
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      name: "Taken Name",
      email: "free@club.test",
    });

    expect(result).toEqual({
      ok: false,
      reason: API_ERROR_REASON.invitation.public_name_taken,
    });
    expect(persistence.createInvitedMember).not.toHaveBeenCalled();
    expect(tokens.issueToken).not.toHaveBeenCalled();
  });

  it("keeps the rows when mail fails", async () => {
    mail.sendTemplateEmail = vi.fn().mockRejectedValue(new Error("smtp"));

    const handler = new InviteMember(
      users,
      archers,
      persistence,
      tokens,
      jwt,
      mail,
      options,
    );
    const result = await handler.invite({
      name: "Alex Archer",
      email: "new@club.test",
    });

    expect(result).toEqual({
      ok: true,
      user: invitedUser,
      mailSent: false,
      resent: false,
    });
    expect(tokens.issueToken).toHaveBeenCalled();
  });
});
