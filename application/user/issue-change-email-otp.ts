import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import { generateEmailChangeOtp } from "~~/application/user/generate-email-change-otp";
import type { User } from "~~/domain/user/user";
import { CHANGE_EMAIL_OTP_MAX_AGE_SECONDS } from "~~/shared/auth/email-change";

export type IssueChangeEmailOtpOptions = {
  fromEmail: string;
  fromName: string;
  templateId: string;
  siteOrigin: string;
};

export class IssueChangeEmailOtp {
  constructor(
    private readonly tokens: TokenRepository,
    private readonly passwords: PasswordHasher,
    private readonly mail: TransactionalMailPort,
    private readonly options: IssueChangeEmailOtpOptions,
  ) {}

  public issue = async (input: {
    user: User;
    newEmail: string;
  }): Promise<void> => {
    const otp = generateEmailChangeOtp();
    const otpHash = await this.passwords.hash(otp);
    const expiresAt = new Date(
      Date.now() + CHANGE_EMAIL_OTP_MAX_AGE_SECONDS * 1000,
    );

    await this.tokens.issueToken({
      authUserId: input.user.id,
      type: "change_email",
      tokenValue: JSON.stringify({
        new_email: input.newEmail,
        otp_hash: otpHash,
        failed_attempts: 0,
      }),
      expiresAt,
    });

    const displayName = input.user.name?.trim() || "Archer·ère";
    let privacyPolicyUrl = "";
    try {
      privacyPolicyUrl = new URL(
        "/privacy-policy",
        this.options.siteOrigin,
      ).toString();
    } catch (error) {
      console.error("IssueChangeEmailOtp: Invalid site origin");
      console.error(error);
    }

    try {
      await this.mail.sendTemplateEmail({
        templateId: this.options.templateId,
        variables: {
          user_name: displayName,
          new_email: input.newEmail,
          otp_code: otp,
          privacy_policy_url: privacyPolicyUrl,
        },
        to: [{ email: input.newEmail, name: displayName }],
        from: {
          email: this.options.fromEmail,
          name: this.options.fromName,
        },
      });
    } catch (error) {
      console.error("IssueChangeEmailOtp: Error sending email");
      console.error(error);
    }
  };
}
