import type { JwtAuthService } from "~~/application/ports/jwt-auth-service.port";
import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { PasswordResetPersistence } from "~~/application/ports/password-reset-persistence.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import type { SessionUser } from "~~/shared/auth/session-user";

export type ResetPasswordResult =
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      session: SessionUser;
    }
  | {
      ok: false;
      reason: typeof API_ERROR_REASON.auth.invalid_token;
    };

export class ResetPassword {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordHasher,
    private readonly jwt: JwtAuthService,
    private readonly passwordReset: PasswordResetPersistence,
  ) {}

  public reset = async (input: {
    token: string;
    password: string;
  }): Promise<ResetPasswordResult> => {
    const token = input.token.trim();
    if (!token || !input.password) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_token };
    }

    const userId = this.jwt.verifyForgotPasswordToken(token);
    if (!userId) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_token };
    }

    const row = await this.users.findForPasswordResetById(userId);
    if (!row?.authenticated || row.passwordHash === null) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_token };
    }

    const passwordHash = await this.passwords.hash(input.password);
    const persisted = await this.passwordReset.completeReset({
      authUserId: userId,
      tokenValue: token,
      passwordHash,
    });

    if (!persisted) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_token };
    }

    const user = await this.users.findById(userId);
    if (!user) {
      return { ok: false, reason: API_ERROR_REASON.auth.invalid_token };
    }

    return {
      ok: true,
      accessToken: this.jwt.signAccess(userId),
      refreshToken: this.jwt.signRefresh(userId),
      session: {
        id: user.id,
        name: user.name,
        roles: user.roles,
      },
    };
  };
}
