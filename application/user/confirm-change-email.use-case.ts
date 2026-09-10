import type { PasswordHasher } from "~~/application/ports/password-hasher.port";
import type { TokenRepository } from "~~/application/ports/token-repository.port";
import type { UserRepository } from "~~/application/ports/user-repository.port";
import type { UserId } from "~~/domain/user/user";
import { API_ERROR_REASON } from "~~/shared/api-error-reasons";
import {
  CHANGE_EMAIL_MAX_FAILED_ATTEMPTS,
  parseChangeEmailTokenValue,
} from "~~/shared/auth/email-change";

export type ConfirmChangeEmailResult =
  | { ok: true; email: string }
  | {
      ok: false;
      reason:
        | typeof API_ERROR_REASON.auth.otp_invalid
        | typeof API_ERROR_REASON.invitation.email_already_linked
        | typeof API_ERROR_REASON.common.not_found;
    };

export class ConfirmChangeEmail {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenRepository,
    private readonly passwords: PasswordHasher,
  ) {}

  public confirm = async (input: {
    userId: UserId;
    otp: string;
  }): Promise<ConfirmChangeEmailResult> => {
    const token = await this.tokens.findUnusedByUserAndType(
      input.userId,
      "change_email",
    );
    if (!token || token.expiresAt <= new Date()) {
      return { ok: false, reason: API_ERROR_REASON.auth.otp_invalid };
    }

    const payload = parseChangeEmailTokenValue(token.tokenValue);
    if (!payload) {
      return { ok: false, reason: API_ERROR_REASON.auth.otp_invalid };
    }

    const otpOk = await this.passwords.verify(input.otp, payload.otp_hash);
    if (!otpOk) {
      const failedAttempts = payload.failed_attempts + 1;
      if (failedAttempts >= CHANGE_EMAIL_MAX_FAILED_ATTEMPTS) {
        await this.tokens.revokeUnusedByUserAndType(
          input.userId,
          "change_email",
        );
        return { ok: false, reason: API_ERROR_REASON.auth.otp_invalid };
      }

      await this.tokens.updateTokenValue(
        token.id,
        JSON.stringify({
          ...payload,
          failed_attempts: failedAttempts,
        }),
      );
      return { ok: false, reason: API_ERROR_REASON.auth.otp_invalid };
    }

    const existing = await this.users.findByEmailWithPasswordHash(
      payload.new_email,
    );
    if (existing && existing.id !== input.userId) {
      return {
        ok: false,
        reason: API_ERROR_REASON.invitation.email_already_linked,
      };
    }

    const updated = await this.users.update(input.userId, {
      email: payload.new_email,
    });
    if (!updated) {
      return { ok: false, reason: API_ERROR_REASON.common.not_found };
    }

    await this.tokens.markUsed(token.id);
    return { ok: true, email: payload.new_email };
  };
}
