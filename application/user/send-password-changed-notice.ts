import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { UserId } from "~~/domain/user/user";
import { FORGOT_PASSWORD_TOKEN_MAX_AGE_SECONDS } from "~~/shared/auth/jwt-lifetimes";

export type SendPasswordChangedNoticeOptions = {
  fromEmail: string;
  fromName: string;
  templateId: string;
  siteOrigin: string;
};

/**
 * Security email sent after a settings password change only (not after
 * forgot-password reset — the user already initiated that flow).
 */
export class SendPasswordChangedNotice {
  constructor(
    private readonly mail: TransactionalMailPort,
    private readonly jwt: JwtAuthService,
    private readonly tokens: TokenRepository,
    private readonly options: SendPasswordChangedNoticeOptions,
  ) {}

  public send = async (input: {
    userId: UserId;
    email: string;
    name: string | null;
  }): Promise<void> => {
    const displayName = input.name?.trim() || "Archer·ère";
    const tokenString = this.jwt.signForgotPasswordToken(input.userId);

    const resetUrl = new URL("/reset-password", this.options.siteOrigin);
    resetUrl.searchParams.set("t", tokenString);
    const recoveryLink = resetUrl.toString();
    const privacyPolicyUrl = new URL(
      "/privacy-policy",
      this.options.siteOrigin,
    ).toString();

    const expiresAt = new Date(
      Date.now() + FORGOT_PASSWORD_TOKEN_MAX_AGE_SECONDS * 1000,
    );
    await this.tokens.issueToken({
      authUserId: input.userId,
      type: "forgot_password",
      tokenValue: tokenString,
      expiresAt,
    });

    await this.mail.sendTemplateEmail({
      templateId: this.options.templateId,
      variables: {
        user_name: displayName,
        user_email: input.email,
        recovery_link: recoveryLink,
        privacy_policy_url: privacyPolicyUrl,
      },
      to: [{ email: input.email, name: displayName }],
      from: {
        email: this.options.fromEmail,
        name: this.options.fromName,
      },
    });
  };
}
