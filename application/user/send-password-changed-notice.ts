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
 * Best-effort security email sent after a settings password change only (not
 * after forgot-password reset — the user already initiated that flow). Alerts
 * the account owner when the password changed unexpectedly and includes a
 * one-click recovery link (same JWT family as forgot-password). Missing mail
 * configuration and delivery failures are logged, never thrown — the password
 * change itself must succeed regardless.
 */
export class SendPasswordChangedNotice {
  constructor(
    private readonly mail: TransactionalMailPort | null,
    private readonly jwt: JwtAuthService | null,
    private readonly tokens: TokenRepository,
    private readonly options: SendPasswordChangedNoticeOptions,
  ) {}

  public send = async (input: {
    userId: UserId;
    email: string;
    name: string | null;
  }): Promise<void> => {
    if (!this.mail) {
      console.info("SendPasswordChangedNotice: Mail not configured, skipping");
      return;
    }

    const displayName = input.name?.trim() || "Archer·ère";
    let recoveryLink = "";
    let privacyPolicyUrl = "";
    try {
      privacyPolicyUrl = new URL(
        "/privacy-policy",
        this.options.siteOrigin,
      ).toString();
    } catch (error) {
      console.error("SendPasswordChangedNotice: Invalid site origin");
      console.error(error);
    }

    if (this.jwt) {
      try {
        const tokenString = this.jwt.signForgotPasswordToken(input.userId);
        const expiresAt = new Date(
          Date.now() + FORGOT_PASSWORD_TOKEN_MAX_AGE_SECONDS * 1000,
        );
        await this.tokens.issueToken({
          authUserId: input.userId,
          type: "forgot_password",
          tokenValue: tokenString,
          expiresAt,
        });
        const resetUrl = new URL("/reset-password", this.options.siteOrigin);
        resetUrl.searchParams.set("t", tokenString);
        recoveryLink = resetUrl.toString();
      } catch (error) {
        console.error(
          "SendPasswordChangedNotice: Error issuing recovery token",
        );
        console.error(error);
      }
    }

    try {
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
    } catch (error) {
      console.error("SendPasswordChangedNotice: Error sending email");
      console.error(error);
    }
  };
}
