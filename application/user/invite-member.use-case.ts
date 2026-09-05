import type { InviteMemberPersistence } from "~~/application/ports/invite-member-persistence.port";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { User } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { INVITATION_TOKEN_MAX_AGE_SECONDS } from "~~/shared/auth/jwt-lifetimes";

export type InviteMemberOptions = {
  fromEmail: string;
  fromName: string;
  templateId: string;
  inviteOrigin: string;
};

export type InviteMemberResult =
  | { ok: true; user: User; mailSent: boolean; resent: boolean }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.invitation.account_already_active
        | typeof API_ERROR_REASON.invitation.account_already_invited
        | typeof API_ERROR_REASON.invitation.public_name_taken
        | typeof API_ERROR_REASON.common.invalid_request;
    };

export class InviteMember {
  constructor(
    private readonly users: UserRepository,
    private readonly persistence: InviteMemberPersistence,
    private readonly tokens: TokenRepository,
    private readonly jwt: JwtAuthService,
    private readonly mail: TransactionalMailPort,
    private readonly options: InviteMemberOptions,
  ) {}

  public invite = async (input: {
    name: string;
    email: string;
    allowResent?: boolean;
  }): Promise<InviteMemberResult> => {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const allowResent = input.allowResent === true;
    if (!email || !name) {
      return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
    }

    const existing = await this.users.findByEmailForPasswordReset(email);
    if (existing?.authenticated) {
      return {
        ok: false,
        reason: API_ERROR_REASON.invitation.account_already_active,
      };
    }

    let user: User;
    let resent = false;

    if (existing) {
      if (!allowResent) {
        return {
          ok: false,
          reason: API_ERROR_REASON.invitation.account_already_invited,
        };
      }
      const found = await this.users.findById(existing.id);
      if (!found) {
        return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
      }
      user = found;
      resent = true;
    } else {
      const created = await this.persistence.createInvitedMember({
        name,
        email,
      });
      if (!created.ok) {
        if (
          created.reason === API_ERROR_REASON.invitation.email_already_linked
        ) {
          return this.inviteAfterEmailRace(email, allowResent);
        }
        return { ok: false, reason: created.reason };
      }
      user = created.user;
    }

    return this.issueAndMail(user, resent);
  };

  private inviteAfterEmailRace = async (
    email: string,
    allowResent: boolean,
  ): Promise<InviteMemberResult> => {
    const raced = await this.users.findByEmailForPasswordReset(email);
    if (raced?.authenticated) {
      return {
        ok: false,
        reason: API_ERROR_REASON.invitation.account_already_active,
      };
    }
    if (!raced) {
      return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
    }
    if (!allowResent) {
      return {
        ok: false,
        reason: API_ERROR_REASON.invitation.account_already_invited,
      };
    }

    const found = await this.users.findById(raced.id);
    if (!found) {
      return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
    }

    return this.issueAndMail(found, true);
  };

  private issueAndMail = async (
    user: User,
    resent: boolean,
  ): Promise<InviteMemberResult> => {
    const tokenString = this.jwt.signInvitationToken(user.id);
    const expiresAt = new Date(
      Date.now() + INVITATION_TOKEN_MAX_AGE_SECONDS * 1000,
    );

    await this.tokens.issueToken({
      authUserId: user.id,
      type: "invitation",
      tokenValue: tokenString,
      expiresAt,
    });

    const displayName = user.name?.trim() || "Archer·ère";
    let mailSent = true;
    let inviteLink = "";
    let privacyPolicyUrl = "";

    try {
      const inviteUrl = new URL("/accept-invite", this.options.inviteOrigin);
      inviteUrl.searchParams.set("t", tokenString);
      inviteLink = inviteUrl.toString();
      privacyPolicyUrl = new URL(
        "/privacy-policy",
        this.options.inviteOrigin,
      ).toString();
    } catch (error) {
      console.error("InviteMember: Invalid invite origin");
      console.error(error);
      mailSent = false;
    }

    if (inviteLink) {
      try {
        await this.mail.sendTemplateEmail({
          templateId: this.options.templateId,
          variables: {
            user_name: displayName,
            user_email: user.email,
            invite_link: inviteLink,
            privacy_policy_url: privacyPolicyUrl,
          },
          to: [{ email: user.email, name: displayName }],
          from: {
            email: this.options.fromEmail,
            name: this.options.fromName,
          },
        });
      } catch (error) {
        console.error("InviteMember: Error sending email");
        console.error(error);
        mailSent = false;
      }
    }

    return { ok: true, user, mailSent, resent };
  };
}
