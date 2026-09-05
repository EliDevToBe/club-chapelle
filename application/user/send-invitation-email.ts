import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { User } from "~~/domain/user/user";
import { INVITATION_TOKEN_MAX_AGE_SECONDS } from "~~/shared/auth/jwt-lifetimes";

export type SendInvitationEmailOptions = {
  fromEmail: string;
  fromName: string;
  templateId: string;
  inviteOrigin: string;
};

export type SendInvitationEmailResult = {
  user: User;
  mailSent: boolean;
  resent: boolean;
};

export class SendInvitationEmail {
  constructor(
    private readonly tokens: TokenRepository,
    private readonly jwt: JwtAuthService,
    private readonly mail: TransactionalMailPort,
    private readonly options: SendInvitationEmailOptions,
  ) {}

  public send = async (input: {
    user: User;
    resent: boolean;
  }): Promise<SendInvitationEmailResult> => {
    const { user, resent } = input;
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
      console.error("SendInvitationEmail: Invalid invite origin");
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
        console.error("SendInvitationEmail: Error sending email");
        console.error(error);
        mailSent = false;
      }
    }

    return { user, mailSent, resent };
  };
}
