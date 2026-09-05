import type { InviteMemberPersistence } from "~~/application/ports/invite-member-persistence.port";
import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { InviteMemberOptions } from "~~/application/user/invite-member.use-case";
import type { User } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import { INVITATION_TOKEN_MAX_AGE_SECONDS } from "~~/shared/auth/jwt-lifetimes";

export type InviteArcherShellResult =
  | { ok: true; user: User; mailSent: boolean; resent: boolean }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.common.invalid_request
        | typeof API_ERROR_REASON.common.not_found
        | typeof API_ERROR_REASON.invitation.archer_already_linked
        | typeof API_ERROR_REASON.invitation.account_already_active
        | typeof API_ERROR_REASON.invitation.email_already_linked;
    };

export class InviteArcherShell {
  constructor(
    private readonly persistence: InviteMemberPersistence,
    private readonly tokens: TokenRepository,
    private readonly jwt: JwtAuthService,
    private readonly mail: TransactionalMailPort,
    private readonly options: InviteMemberOptions,
  ) {}

  public invite = async (input: {
    archerId: string;
    email: string;
    publicName: string;
  }): Promise<InviteArcherShellResult> => {
    const email = input.email.trim().toLowerCase();
    const publicName = input.publicName.trim();
    const archerId = input.archerId.trim();
    if (!email || !publicName || !archerId) {
      return { ok: false, reason: API_ERROR_REASON.common.invalid_request };
    }

    const bound = await this.persistence.bindInvitedMemberToArcher({
      archerId,
      email,
      name: publicName,
    });

    if (!bound.ok) {
      return { ok: false, reason: bound.reason };
    }

    return this.issueAndMail(bound.user, bound.resent);
  };

  private issueAndMail = async (
    user: User,
    resent: boolean,
  ): Promise<InviteArcherShellResult> => {
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
      console.error("InviteArcherShell: Invalid invite origin");
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
        console.error("InviteArcherShell: Error sending email");
        console.error(error);
        mailSent = false;
      }
    }

    return { ok: true, user, mailSent, resent };
  };
}
