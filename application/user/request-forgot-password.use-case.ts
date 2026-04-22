import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { TransactionalMailPort } from "~~/application/ports/transactional-mail.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { FORGOT_PASSWORD_TOKEN_MAX_AGE_SECONDS } from "~~/shared/auth/jwt-lifetimes";

export type RequestForgotPasswordOptions = {
  fromEmail: string;
  fromName: string;
  templateId: string;
  passwordResetOrigin: string;
  sandbox: boolean;
};

/** Default Mailtrap template for forgot-password (override via runtime config). */
export const MAILTRAP_FORGOT_PASSWORD_TEMPLATE_ID_DEFAULT =
  "4c226edb-5687-4870-88b4-aea6c6a572a8";

export class RequestForgotPassword {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenRepository,
    private readonly jwt: JwtAuthService,
    private readonly mail: TransactionalMailPort,
    private readonly options: RequestForgotPasswordOptions,
  ) {}

  public request = async (input: { email: string }): Promise<void> => {
    const email = input.email.trim().toLowerCase();
    if (!email) {
      console.info("RequestForgotPassword: No email provided");
      return;
    }

    const row = await this.users.findByEmailForPasswordReset(email);
    if (!row) {
      console.info("RequestForgotPassword: User not found");
      return;
    }

    if (!row.authenticated || row.passwordHash === null) {
      console.info(
        "RequestForgotPassword: User not authenticated or no password",
      );
      return;
    }

    const tokenString = this.jwt.signForgotPasswordToken(row.id);
    const expiresAt = new Date(
      Date.now() + FORGOT_PASSWORD_TOKEN_MAX_AGE_SECONDS * 1000,
    );

    await this.tokens.issueToken({
      authUserId: row.id,
      type: "forgot_password",
      tokenValue: tokenString,
      expiresAt,
    });

    const resetUrl = new URL(
      "/reset-password",
      this.options.passwordResetOrigin,
    );
    resetUrl.searchParams.set("t", tokenString);

    const recoveryLink = resetUrl.toString();

    const displayName = row.name?.trim() || "Archer·ère";

    try {
      await this.mail.sendTemplateEmail({
        templateId: this.options.templateId,
        variables: {
          user_name: displayName,
          user_email: row.email,
          recovery_link: recoveryLink,
        },
        to: [{ email: row.email, name: displayName }],
        from: {
          email: this.options.fromEmail,
          name: this.options.fromName,
        },
      });
    } catch (error) {
      console.error("RequestForgotPassword: Error sending email");
      console.error(error);
      /* Do not reveal mail delivery failures to the client. */
    }
  };
}
